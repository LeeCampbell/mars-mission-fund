#!/usr/bin/env node
//
/**
 * Claude Code Verbose Log Parser
 * Created in https://chatgpt.com/c/69aa7061-c7a8-839c-bd16-542340fd34ba
 *
 * Modes:
 *    Screen only:
 *      docker logs -f autonomous-agent-1 2>&1 | node ./scripts/claude_stream_watch.cjs --hide AGENT --max-line-length 1000
 *
 *   [pwsh]Screen and file (simultaneous):
 *      $ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
 *      docker logs -f autonomous-agent-1 2>&1 |
 *        node .\claude_stream_watch.js --hide AGENT --max-line-length 1000 |
 *        Tee-Object -FilePath ".\diagnostics_$ts.txt"
 *
 *   No time prefix:
 *      docker logs -f autonomous-agent-1 2>&1 | node ./scripts/claude_stream_watch.cjs --hide AGENT --max-line-length 1000 --no-time
 *
 *   Only new lines:
 *     docker logs -f --tail 0 autonomous-agent-1 2>&1 | node ./scripts/claude_stream_watch.cjs --hide AGENT --max-line-length 1000
 *
 * The verbose log format is newline-delimited JSON objects.
 * Each line is a self-contained event envelope.
 */
'use strict'

const { spawn } = require('node:child_process')
const readline = require('node:readline')

const args = parseArgs(process.argv.slice(2))
const now = () => new Date()

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR && !args.noColor
const KIND_WIDTH = 7

function colorize(code, text) {
  if (!USE_COLOR) return text
  return `${code}${text}${COLORS.reset}`
}

function parseArgs(argv) {
  const out = {
    container: null,
    since: null,
    timestamps: false,
    noColor: false,
    rawUnknown: false,
    repeatWindowSec: 120,
    oscillationWindowSec: 180,
    permissionWindowSec: 180,
    maxLineLength: 500,
    hideKinds: new Set(),
    noTimePrefix: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--container' || a === '-c') out.container = argv[++i]
    else if (a === '--since') out.since = argv[++i]
    else if (a === '--timestamps' || a === '-t') out.timestamps = true
    else if (a === '--no-color') out.noColor = true
    else if (a === '--raw-unknown') out.rawUnknown = true
    else if (a === '--repeat-window-sec')
      out.repeatWindowSec = parseInt(argv[++i], 10) || out.repeatWindowSec
    else if (a === '--oscillation-window-sec')
      out.oscillationWindowSec = parseInt(argv[++i], 10) || out.oscillationWindowSec
    else if (a === '--permission-window-sec')
      out.permissionWindowSec = parseInt(argv[++i], 10) || out.permissionWindowSec
    else if (a === '--max-line-length' || a === '--max-len')
      out.maxLineLength = parseInt(argv[++i], 10) || out.maxLineLength
    else if (a === '--no-time-prefix' || a === '--no-time') out.noTimePrefix = true
    else if (a === '--hide') {
      const raw = String(argv[++i] || '')
      for (const kind of raw.split(',')) {
        const value = kind.trim().toUpperCase()
        if (value) out.hideKinds.add(value)
      }
    } else if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return out
}

function printHelp() {
  console.log(`claude_stream_watch_v5.js
Usage:
  node .\\claude_stream_watch_v5.js --container <name> [--since 10m]
  docker logs -f <name> 2>&1 | node .\\claude_stream_watch_v5.js
Options:
  --container, -c           Docker container name/id to tail directly
  --since                   Pass-through to docker logs --since (e.g. 10m, 1h)
  --timestamps, -t          Include docker log timestamps when tailing directly
  --no-color                Disable ANSI colors
  --raw-unknown             Show unknown JSON event lines
  --hide                    Comma-separated event kinds to suppress (e.g. AGENT,STATUS)
  --no-time-prefix          Hide the leading HH:MM:SS timestamp prefix
  --max-line-length         Max rendered output line length (default 500)
  --repeat-window-sec       Window for repeated-action thrash detection (default 120)
  --oscillation-window-sec  Window for A/B/A/B thrash detection (default 180)
  --permission-window-sec   Window for permission-loop detection (default 180)
Event kinds:
  INIT, STATUS, DECIDE, TOOL, AGENT, PERM, ERROR, THRASH, RESULT
Recommended Claude flags:
  --print --output-format stream-json --verbose --include-partial-messages
`)
}

function ts(d = now()) {
  return d.toTimeString().slice(0, 8)
}

function compactText(value) {
  if (value == null) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function truncateText(value, max = args.maxLineLength) {
  const text = compactText(value)
  if (!text) return ''
  if (!Number.isFinite(max) || max <= 0) return text
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

function truncateRenderedLine(value, max = args.maxLineLength) {
  const text = value == null ? '' : String(value)
  if (!text) return ''
  if (!Number.isFinite(max) || max <= 0) return text
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

function safeJsonParse(line) {
  const trimmed = line.trim()
  if (!trimmed) return null
  const start = trimmed.indexOf('{')
  if (start < 0) return null
  const maybeJson = trimmed.slice(start)
  try {
    return JSON.parse(maybeJson)
  } catch {
    return null
  }
}

function shouldPrint(kind) {
  return !args.hideKinds.has(String(kind || '').toUpperCase())
}

function print(kind, message) {
  const normalizedKind = String(kind || 'STATUS').toUpperCase()
  if (!shouldPrint(normalizedKind)) return

  const label = String(normalizedKind).padEnd(KIND_WIDTH, ' ')
  const kindWithGap = `${label} `
  const normalizedMessage = compactText(message)
  const plainLine = args.noTimePrefix
    ? `${kindWithGap}${normalizedMessage}`
    : `${ts()} ${kindWithGap}${normalizedMessage}`

  let color = COLORS.gray
  if (normalizedKind === 'ERROR') color = COLORS.red
  else if (normalizedKind === 'PERM') color = COLORS.yellow
  else if (normalizedKind === 'THRASH') color = COLORS.magenta
  else if (normalizedKind === 'STATUS') color = COLORS.cyan
  else if (normalizedKind === 'DECIDE') color = COLORS.blue
  else if (normalizedKind === 'TOOL') color = COLORS.green
  else if (normalizedKind === 'AGENT') color = COLORS.magenta
  else if (normalizedKind === 'RESULT') color = COLORS.green
  else if (normalizedKind === 'INIT') color = COLORS.blue

  const truncatedLine = truncateRenderedLine(plainLine, args.maxLineLength)

  if (args.noTimePrefix) {
    const kindText = truncatedLine.slice(0, KIND_WIDTH + 1)
    const body = truncatedLine.slice(KIND_WIDTH + 1)
    console.log(`${colorize(color, kindText)}${body}`)
    return
  }

  const prefixWidth = 9 // HH:MM:SS + space
  const kindWidth = KIND_WIDTH + 1 // padded kind + trailing gap
  const prefix = truncatedLine.slice(0, prefixWidth)
  const kindText = truncatedLine.slice(prefixWidth, prefixWidth + kindWidth)
  const body = truncatedLine.slice(prefixWidth + kindWidth)

  console.log(`${colorize(COLORS.dim, prefix)}${colorize(color, kindText)}${body}`)
}

function makeState() {
  return {
    sessionId: null,
    currentAssistantText: new Map(),
    currentToolJson: new Map(),
    actions: [],
    permissionEvents: [],
    lastActionSig: null,
    lastThrashSigAt: new Map(),
  }
}

function addAction(state, sig, meta) {
  const t = Date.now()
  state.actions.push({ t, sig, meta })
  if (state.actions.length > 200) state.actions.shift()
}

function addPermissionEvent(state, detail) {
  const t = Date.now()
  state.permissionEvents.push({ t, detail })
  if (state.permissionEvents.length > 100) state.permissionEvents.shift()
}

function emitThrashIfNeeded(state) {
  const nowMs = Date.now()
  const repeatWindow = args.repeatWindowSec * 1000
  const oscillationWindow = args.oscillationWindowSec * 1000
  const permissionWindow = args.permissionWindowSec * 1000

  state.actions = state.actions.filter(
    (x) => nowMs - x.t <= Math.max(repeatWindow, oscillationWindow)
  )
  state.permissionEvents = state.permissionEvents.filter((x) => nowMs - x.t <= permissionWindow)

  if (state.actions.length) {
    const counts = new Map()
    for (const a of state.actions) {
      if (nowMs - a.t <= repeatWindow) counts.set(a.sig, (counts.get(a.sig) || 0) + 1)
    }
    for (const [sig, count] of counts.entries()) {
      if (count >= 3) {
        const lastShown = state.lastThrashSigAt.get(`repeat:${sig}`) || 0
        if (nowMs - lastShown > 30000) {
          print('THRASH', `repeat x${count} in ${args.repeatWindowSec}s: ${sig}`)
          state.lastThrashSigAt.set(`repeat:${sig}`, nowMs)
        }
      }
    }
  }

  if (state.actions.length >= 4) {
    const recent = state.actions.filter((x) => nowMs - x.t <= oscillationWindow).slice(-6)
    if (recent.length >= 4) {
      const s = recent.map((x) => x.sig)
      const n = s.length
      const abba = s[n - 4] === s[n - 2] && s[n - 3] === s[n - 1] && s[n - 4] !== s[n - 3]
      if (abba) {
        const sig = `osc:${s[n - 4]} <-> ${s[n - 3]}`
        const lastShown = state.lastThrashSigAt.get(sig) || 0
        if (nowMs - lastShown > 45000) {
          print('THRASH', `oscillation detected: ${s[n - 4]} <-> ${s[n - 3]}`)
          state.lastThrashSigAt.set(sig, nowMs)
        }
      }
    }
  }

  const recentPerms = state.permissionEvents.filter((x) => nowMs - x.t <= permissionWindow)
  if (recentPerms.length >= 3) {
    const joined = recentPerms
      .map((x) => x.detail)
      .slice(-3)
      .join(' | ')
    const sig = `perm:${joined}`
    const lastShown = state.lastThrashSigAt.get('perm-loop') || 0
    if (nowMs - lastShown > 45000) {
      print('THRASH', `permission loop x${recentPerms.length} in ${args.permissionWindowSec}s`)
      state.lastThrashSigAt.set('perm-loop', nowMs)
    }
  }
}

function normalizeAction(kind, detail) {
  return `${kind} ${truncateText(detail, 160)}`
}

function maybeClassifyDecision(text) {
  const s = compactText(text).toLowerCase()
  const decisionHints = [
    'i will',
    'i’ll',
    'next i',
    'my plan',
    'i am going to',
    'i’m going to',
    'i should',
    'i need to',
    'let me',
    'first,',
    'first ',
    'then ',
    'to fix this',
    'the issue is',
    'root cause',
    'workaround',
    'trying a different',
    'switching to',
  ]
  return decisionHints.some((h) => s.includes(h))
}

function maybeClassifyStatus(text) {
  const s = compactText(text).toLowerCase()
  const statusHints = [
    'checking',
    'investigating',
    'running',
    'reading',
    'searching',
    'updating',
    'testing',
    'validating',
    'reproducing',
    'inspecting',
    'reviewing',
    'comparing',
  ]
  return statusHints.some((h) => s.includes(h))
}

function extractTextFromContent(content) {
  if (!Array.isArray(content)) return []
  const parts = []
  for (const item of content) {
    if (!item || typeof item !== 'object') continue
    if (item.type === 'text' && item.text) parts.push({ kind: 'text', text: item.text })
    if (item.type === 'tool_use')
      parts.push({ kind: 'tool_use', tool: item.name, input: item.input, id: item.id })
    if (item.type === 'thinking' && item.thinking)
      parts.push({ kind: 'thinking', text: item.thinking })
  }
  return parts
}

function tryParsePermissionMessage(text) {
  if (!text) return null
  const s = compactText(text)
  if (
    /permission/i.test(s) ||
    /haven't granted/i.test(s) ||
    /not allowed/i.test(s) ||
    /denied/i.test(s)
  ) {
    return s
  }
  return null
}

function handleAssistantText(state, rawText) {
  const text = compactText(rawText)
  if (!text) return
  if (maybeClassifyDecision(text)) print('DECIDE', text)
  else if (maybeClassifyStatus(text)) print('STATUS', text)
  else print('STATUS', text)
  addAction(state, normalizeAction('assistant', text), { text })
  emitThrashIfNeeded(state)
}

function handleToolUse(state, toolName, input, toolId, parentToolUseId) {
  const inputText = input && typeof input === 'object' ? JSON.stringify(input) : String(input || '')
  const summary = `${toolName || 'unknown'} ${compactText(inputText)}`.trim()

  if (/^(task|agent)$/i.test(toolName || '')) {
    print('AGENT', `spawn ${summary}`)
  } else if (parentToolUseId) {
    print('AGENT', `subtask tool=${toolName} parent=${parentToolUseId} ${inputText}`)
  } else {
    print('TOOL', summary)
  }

  addAction(state, normalizeAction(toolName || 'tool', inputText), {
    toolName,
    input,
    toolId,
    parentToolUseId,
  })
  emitThrashIfNeeded(state)
}

function handleToolResult(state, toolUseId, content, isError, parentToolUseId) {
  let text = ''
  if (typeof content === 'string') text = content
  else if (Array.isArray(content)) {
    text = content
      .map((x) => {
        if (typeof x === 'string') return x
        if (x && typeof x === 'object' && typeof x.text === 'string') return x.text
        return JSON.stringify(x)
      })
      .join(' ')
  } else if (content && typeof content === 'object') {
    text = JSON.stringify(content)
  }

  const perm = tryParsePermissionMessage(text)
  if (perm) {
    print('PERM', `${toolUseId || ''} ${perm}`.trim())
    addPermissionEvent(state, perm)
    emitThrashIfNeeded(state)
    return
  }

  if (isError) {
    print('ERROR', `${toolUseId || ''} ${text}`.trim())
  } else if (parentToolUseId) {
    print('AGENT', `reply parent=${parentToolUseId} ${text}`)
  } else {
    print('STATUS', `tool_result ${toolUseId || ''} ${text}`.trim())
  }

  addAction(state, normalizeAction(isError ? 'tool_error' : 'tool_result', text), {
    toolUseId,
    text,
    isError,
    parentToolUseId,
  })
  emitThrashIfNeeded(state)
}

function flushBufferedAssistant(state, key, force = false) {
  const buf = state.currentAssistantText.get(key)
  if (!buf) return
  const trimmed = buf.trim()
  if (!trimmed) return
  if (!force) {
    if (trimmed.length < 80 && !/[.!?\n:]$/.test(trimmed)) return
  }
  state.currentAssistantText.set(key, '')
  handleAssistantText(state, trimmed)
}

function appendAssistantDelta(state, key, delta) {
  const current = state.currentAssistantText.get(key) || ''
  const next = current + delta
  state.currentAssistantText.set(key, next)
  if (next.length >= 140 || /[.!?\n:]\s*$/.test(next)) flushBufferedAssistant(state, key, false)
}

function handleRecord(state, record, rawLine) {
  if (!record || typeof record !== 'object') return

  if (record.type === 'system' && record.subtype === 'init') {
    state.sessionId = record.session_id || record.sessionId || state.sessionId
    const cwd = record.cwd || record.working_directory || record.path || ''
    const tools = Array.isArray(record.tools)
      ? record.tools.length
      : record.mcp_servers
        ? Object.keys(record.mcp_servers).length
        : ''
    print('INIT', `session=${state.sessionId || '?'} cwd=${cwd || '?'} tools=${tools || '?'}`)
    return
  }

  if (record.type === 'assistant') {
    const parentToolUseId = record.parent_tool_use_id || record.parentToolUseId
    const parts = extractTextFromContent(record.message && record.message.content)
    for (const p of parts) {
      if (p.kind === 'text' || p.kind === 'thinking') handleAssistantText(state, p.text)
      if (p.kind === 'tool_use') handleToolUse(state, p.tool, p.input, p.id, parentToolUseId)
    }
    return
  }

  if (record.type === 'user') {
    const content = record.message && record.message.content
    if (Array.isArray(content)) {
      for (const item of content) {
        if (item && item.type === 'tool_result') {
          handleToolResult(
            state,
            item.tool_use_id || item.toolUseId,
            item.content,
            !!item.is_error,
            record.parent_tool_use_id || record.parentToolUseId
          )
        }
      }
    }
    return
  }

  if (record.type === 'result') {
    const subtype = record.subtype || 'done'
    const durationMs = record.duration_ms || record.durationMs
    const turns = record.num_turns || record.turns
    const resultText = record.result || record.summary || record.message || ''
    const costUsd = record.total_cost_usd || record.cost_usd || record.costUsd
    const parts = [subtype]
    if (turns != null) parts.push(`turns=${turns}`)
    if (durationMs != null) parts.push(`duration_ms=${durationMs}`)
    if (costUsd != null) parts.push(`cost=$${Number(costUsd).toFixed(4)}`)
    if (resultText) parts.push(resultText)
    print('RESULT', parts.join(' '))
    return
  }

  if (record.type === 'stream_event') {
    const ev = record.event || {}
    const evType = ev.type
    const messageId =
      (ev.message && (ev.message.id || ev.message.message_id)) || record.message_id || 'stream'
    const index =
      ev.index != null
        ? ev.index
        : ev.content_block && ev.content_block.index != null
          ? ev.content_block.index
          : 0
    const key = `${messageId}:${index}`

    if (evType === 'content_block_delta') {
      const delta = ev.delta || {}
      if (typeof delta.text === 'string') appendAssistantDelta(state, key, delta.text)
      if (typeof delta.partial_json === 'string') {
        const current = state.currentToolJson.get(key) || ''
        state.currentToolJson.set(key, current + delta.partial_json)
      }
      if (typeof delta.thinking === 'string') appendAssistantDelta(state, key, delta.thinking)
      return
    }

    if (evType === 'content_block_start') {
      const cb = ev.content_block || {}
      if (cb.type === 'tool_use') {
        const input = cb.input || {}
        handleToolUse(
          state,
          cb.name,
          input,
          cb.id,
          record.parent_tool_use_id || record.parentToolUseId
        )
      }
      return
    }

    if (evType === 'content_block_stop') {
      flushBufferedAssistant(state, key, true)
      const partialToolJson = state.currentToolJson.get(key)
      if (partialToolJson) state.currentToolJson.delete(key)
      return
    }

    if (evType === 'message_stop') {
      flushBufferedAssistant(state, key, true)
      return
    }

    if (evType === 'error') {
      const msg = (ev.error && (ev.error.message || JSON.stringify(ev.error))) || JSON.stringify(ev)
      print('ERROR', msg)
      addAction(state, normalizeAction('error', msg), { msg })
      emitThrashIfNeeded(state)
      return
    }

    return
  }

  const fallbackText = [record.type, record.subtype, record.message, record.error]
    .filter(Boolean)
    .map(String)
    .join(' ')
  const perm = tryParsePermissionMessage(fallbackText || rawLine)
  if (perm) {
    print('PERM', perm)
    addPermissionEvent(state, perm)
    emitThrashIfNeeded(state)
    return
  }

  if (args.rawUnknown) {
    print('STATUS', rawLine)
  }
}

function attachReader(stream, onLine) {
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })
  rl.on('line', onLine)
  return rl
}

function main() {
  const state = makeState()

  if (args.container) {
    const dockerArgs = ['logs', '-f']
    if (args.since) dockerArgs.push('--since', args.since)
    if (args.timestamps) dockerArgs.push('--timestamps')
    dockerArgs.push(args.container)

    const child = spawn('docker', dockerArgs, { stdio: ['ignore', 'pipe', 'pipe'] })

    attachReader(child.stdout, (line) => {
      const obj = safeJsonParse(line)
      if (obj) handleRecord(state, obj, line)
      else if (args.rawUnknown && line.trim()) print('STATUS', line)
    })

    attachReader(child.stderr, (line) => {
      const obj = safeJsonParse(line)
      if (obj) handleRecord(state, obj, line)
      else if (line.trim()) {
        const perm = tryParsePermissionMessage(line)
        if (perm) {
          print('PERM', perm)
          addPermissionEvent(state, perm)
          emitThrashIfNeeded(state)
        } else {
          print('ERROR', line)
        }
      }
    })

    child.on('exit', (code) => {
      if (code !== 0) process.exit(code || 1)
    })

    process.on('SIGINT', () => child.kill('SIGINT'))
    process.on('SIGTERM', () => child.kill('SIGTERM'))
    return
  }

  if (process.stdin.isTTY) {
    printHelp()
    process.exit(1)
  }

  attachReader(process.stdin, (line) => {
    const obj = safeJsonParse(line)
    if (obj) handleRecord(state, obj, line)
    else if (args.rawUnknown && line.trim()) print('STATUS', line)
  })
}

main()
