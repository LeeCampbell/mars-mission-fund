#!/usr/bin/env bash
set -euo pipefail

# Agent loop state machine for a single GitHub issue.
# Receives: ISSUE_NUMBER, ISSUE_TITLE, BRANCH, FORK_URL, UPSTREAM_REPO
# Exit codes: 0 = issue complete (PR merged-ready), 1 = needs another iteration, 2 = stuck

REPO_DIR="/workspace/repo"
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="/workspace/logs"
SCREENSHOT_DIR="/screenshots"
MAX_REMEDIATION_ATTEMPTS=3
BASE_BRANCH="main"

mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"
cd "$REPO_DIR"
mkdir -p plan/ready plan/planning

# Clear any stale .state lock from a previous crashed invocation.
# With set -e, a crash between set_state and clear_state leaves .state
# on disk, locking determine_state to the crashed state forever.
# The filesystem heuristic is authoritative — .state is only useful
# within a single invocation, not across invocations.
rm -f plan/.state

# Detect stale plan files from a previous issue's squash merge.
# When auto-merge races the plan-file cleanup commit, plan/ files (including
# .pr-number) get baked into upstream/main. New issues inherit them.
# Fix: if plan/.pr-number exists but references a different issue, nuke plan/.
if [ -f "plan/.pr-number" ] && [ -n "${ISSUE_NUMBER:-}" ]; then
  if [ -f "plan/ready/brief.md" ]; then
    if ! grep -q "#${ISSUE_NUMBER}" "plan/ready/brief.md" 2>/dev/null; then
      echo ">>> Stale plan files detected (from a previous issue) — cleaning up"
      rm -rf plan/
      mkdir -p plan/ready plan/planning
    fi
  fi
fi

TIMEOUT="${TIMEOUT_SECONDS:-1800}"

# ── Validate required env vars ───────────────────────────────
for var in ISSUE_NUMBER ISSUE_TITLE BRANCH FORK_URL UPSTREAM_REPO; do
  if [ -z "${!var:-}" ]; then
    echo "!!! Missing required env var: ${var}"
    exit 2
  fi
done

FORK_OWNER=$(echo "$FORK_URL" | sed 's|.*github.com/||;s|/.*||')
if [ -z "$FORK_OWNER" ]; then
  echo "!!! Could not extract fork owner from FORK_URL: ${FORK_URL}"
  exit 2
fi
# All PRs target upstream/main
PR_REPO="$UPSTREAM_REPO"
PR_HEAD="${FORK_OWNER}:${BRANCH}"
PR_GH_TOKEN="$GH_TOKEN_UPSTREAM"

# ── Helpers ───────────────────────────────────────────────────

# Run Claude with standard flags. Caller supplies extra args (e.g. --output-format).
# Retries up to 3 times on transient API errors with exponential backoff.
# Usage: run_claude [extra-flags...] -p "prompt text"
run_claude() {
  local max_api_retries=3
  local attempt=0
  local backoff=60

  while [ "$attempt" -lt "$max_api_retries" ]; do
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      "$@" \
      2>&1 | tee "$LOG_FILE" || true

    # Check for transient API errors in the output
    if grep -qiE 'API Error|ECONNREFUSED|ECONNRESET|ETIMEDOUT|503 Service|502 Bad Gateway|rate limit' "$LOG_FILE" 2>/dev/null; then
      attempt=$((attempt + 1))
      if [ "$attempt" -ge "$max_api_retries" ]; then
        echo "!!! API error persists after ${max_api_retries} retries"
        return 0
      fi
      echo ">>> Transient API error detected — retry ${attempt}/${max_api_retries} after ${backoff}s..."
      sleep "$backoff"
      backoff=$((backoff * 2))
    else
      return 0
    fi
  done
}

# Increment the remediation attempt counter and exit 2 (stuck) if exhausted.
# Usage: check_remediation_attempts "description"
check_remediation_attempts() {
  local description="$1"
  local attempts_file="plan/.ci-attempts"
  local attempts
  attempts=$(cat "$attempts_file" 2>/dev/null || echo 0)

  if [ "$attempts" -ge "$MAX_REMEDIATION_ATTEMPTS" ]; then
    echo "!!! ${description} after ${MAX_REMEDIATION_ATTEMPTS} attempts"
    exit 2
  fi

  echo $((attempts + 1)) > "$attempts_file"
  echo ">>> ${description} — attempt $((attempts + 1))/${MAX_REMEDIATION_ATTEMPTS}"
}

# Commit any uncommitted changes (safety net — Claude should commit, but if
# it timed out or crashed mid-task, we capture partial work).
safety_commit() {
  local msg="${1:-chore: save progress for #${ISSUE_NUMBER}}"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo ">>> Safety commit: uncommitted changes detected"
    git add -A
    git commit -m "$msg" || true
  fi
}

# Push the feature branch to the fork. Logs and warns on failure.
# Returns 0 on success, 1 on failure. Always logs outcome to stdout.
push_branch() {
  local push_output
  push_output=$(git push origin "$BRANCH" --force-with-lease 2>&1) || {
    echo "!!! Push FAILED:"
    echo "$push_output"
    echo "$push_output" >> "$LOG_FILE"
    return 1
  }
  echo ">>> Push OK"
  echo "$push_output" >> "$LOG_FILE"
}

# Check if a PR has already been merged (e.g. by auto-merge).
check_pr_merged() {
  local pr_number="$1"
  local state
  state=$(GH_TOKEN="$PR_GH_TOKEN" gh pr view "$pr_number" \
    --repo "$PR_REPO" --json state --jq '.state' 2>/dev/null || true)
  [ "$state" = "MERGED" ]
}

# Create a draft PR targeting main on the upstream repo.
# Writes plan/.pr-number on success. Returns PR number or empty string.
# Logs outcome to BOTH stdout and stderr so docker-compose captures it.
create_draft_pr() {
  local pr_url gh_stderr
  gh_stderr=$(mktemp)
  pr_url=$(GH_TOKEN="$PR_GH_TOKEN" gh pr create \
    --repo "$PR_REPO" \
    --base "$BASE_BRANCH" \
    --head "$PR_HEAD" \
    --title "feat: ${ISSUE_TITLE}" \
    --body "Work in progress for #${ISSUE_NUMBER}" \
    --draft 2>"$gh_stderr") || true

  local pr_number
  pr_number=$(echo "$pr_url" | grep -oE '/pull/[0-9]+' | grep -oE '[0-9]+' | tail -1 || true)

  if [ -n "$pr_number" ]; then
    echo "$pr_number" > plan/.pr-number
    echo ">>> Draft PR #${pr_number} created on ${PR_REPO}"
  else
    local stderr_msg
    stderr_msg=$(cat "$gh_stderr" 2>/dev/null || true)
    echo "!!! Draft PR creation FAILED: ${stderr_msg} ${pr_url}"
  fi
  rm -f "$gh_stderr"
  echo "$pr_number"
}

# Ensure a draft PR exists. Creates one if missing. Prints PR number.
ensure_draft_pr() {
  local pr_number
  pr_number=$(resolve_pr_number)
  if [ -z "$pr_number" ]; then
    echo ">>> No PR found — creating draft PR"
    pr_number=$(create_draft_pr)
  fi
  echo "$pr_number"
}

# Classify CI status for a PR into: pending, passing, failing, or conflicting.
poll_ci_status() {
  local pr_number="$1"

  # Check for merge conflicts first (separate from CI checks)
  local mergeable
  mergeable=$(GH_TOKEN="$PR_GH_TOKEN" gh pr view "$pr_number" \
    --repo "$PR_REPO" --json mergeable --jq '.mergeable' 2>/dev/null) || true

  if [ "$mergeable" = "CONFLICTING" ]; then
    echo "conflicting"
    return
  fi

  local ci_raw
  ci_raw=$(GH_TOKEN="$PR_GH_TOKEN" gh pr checks "$pr_number" \
    --repo "$PR_REPO" --json state --jq '.[].state' 2>&1) || true

  if echo "$ci_raw" | grep -qiE 'IN_PROGRESS|QUEUED|PENDING'; then
    echo "pending"
  elif echo "$ci_raw" | grep -qiE 'FAILURE|ERROR|CANCELLED|ACTION_REQUIRED|TIMED_OUT|STARTUP_FAILURE'; then
    echo "failing"
  elif echo "$ci_raw" | grep -qiE 'SUCCESS|SKIPPED|NEUTRAL'; then
    echo "passing"
  else
    echo ">>> CI status unclear (raw: ${ci_raw}), treating as pending" >&2
    echo "pending"
  fi
}

# Upload screenshots for an issue as a PR comment.
upload_screenshots() {
  local pr_number="$1"
  local gh_token_fork="$2"

  if ! ls "${SCREENSHOT_DIR}/ISSUE-${ISSUE_NUMBER}-"*.png 1>/dev/null 2>&1; then
    return
  fi

  local comment_body="## Screenshots\n\n"
  local fork_repo
  fork_repo=$(echo "$FORK_URL" | sed 's|.*github.com/||;s|\.git$||')

  # Ensure screenshots branch exists on fork
  if ! GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/ref/heads/screenshots" &>/dev/null; then
    local default_sha
    default_sha=$(GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/ref/heads/main" --jq '.object.sha')
    GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/refs" \
      -X POST -f ref="refs/heads/screenshots" -f sha="$default_sha" 2>/dev/null || true
  fi

  for img in "${SCREENSHOT_DIR}/ISSUE-${ISSUE_NUMBER}-"*.png; do
    local fname
    fname=$(basename "$img")
    # Upload via contents API. Pipe base64 through jq to avoid Linux MAX_ARG_STRLEN limit.
    (base64 -w0 "$img" 2>/dev/null || base64 "$img") \
    | tr -d '\n' \
    | jq -Rs \
      --arg msg "chore: add screenshot ${fname}" \
      --arg branch "screenshots" \
      '{message: $msg, content: ., branch: $branch}' \
    | GH_TOKEN="$gh_token_fork" gh api \
      "repos/${fork_repo}/contents/screenshots/PR-${pr_number}/${fname}" \
      -X PUT --input - \
    || echo "!!! Failed to upload screenshot: ${fname}"

    local raw_url="https://raw.githubusercontent.com/${fork_repo}/screenshots/screenshots/PR-${pr_number}/${fname}"
    comment_body="${comment_body}### ${fname}\n![${fname}](${raw_url})\n\n"
  done

  echo -e "$comment_body" | GH_TOKEN="$PR_GH_TOKEN" gh pr comment "$pr_number" \
    --repo "$PR_REPO" --body-file - || true
}

# ── State detection ──────────────────────────────────────────
# Uses plan/.state lock file as the primary indicator when present,
# falling back to filesystem inference for recovery.
#
# State graph (each state → next on success):
#   create-brief → create-tasks → execute-tasks → finalize-pr → await-ci → done
#   create-brief → apply-review → create-tasks  (if review needed)
determine_state() {
  if [ -f "plan/.state" ]; then
    cat "plan/.state"
    return
  fi

  if [ -d "plan/done" ]; then
    echo "done"
  elif [ -f "plan/.plan-archived" ]; then
    echo "await-ci"
  elif [ -f "plan/ready/tasks.md" ]; then
    if grep -q '^\- \[ \]' "plan/ready/tasks.md"; then
      echo "execute-tasks"
    elif [ -f "plan/.finalized" ]; then
      echo "await-ci"
    else
      echo "finalize-pr"
    fi
  elif [ -f "plan/ready/brief.md" ]; then
    echo "create-tasks"
  elif [ -f "plan/planning/brief.md" ]; then
    # Brief exists in planning — check if it needs review or can be promoted
    if [ -f "plan/planning/brief-review.md" ]; then
      echo "apply-review"
    else
      # No review comments → brief is implicitly approved but wasn't moved.
      # Promote it and advance to create-tasks.
      echo "create-tasks"
    fi
  elif [ -f "plan/planning/brief-review.md" ]; then
    echo "apply-review"
  else
    echo "create-brief"
  fi
}

set_state() {
  mkdir -p plan
  echo "$1" > plan/.state
}

clear_state() {
  rm -f plan/.state
}

# Guard against any state looping without forward progress.
# Tracks consecutive entries into the same state. Resets when state changes.
# Planning states (create-brief, apply-review, create-tasks) get 3 attempts.
# Execution states (execute-tasks) use their own stuck detection.
# Polling states (await-ci) get a generous limit.
check_state_repeat() {
  local state="$1"
  local count_file="plan/.state-repeat-count"
  local last_file="plan/.last-state"
  local max_repeats

  case "$state" in
    execute-tasks) return ;;  # has its own stuck detection
    await-ci)      max_repeats=20 ;;
    *)             max_repeats=3 ;;
  esac

  local last_state
  last_state=$(cat "$last_file" 2>/dev/null || echo "")

  if [ "$state" = "$last_state" ]; then
    local count
    count=$(cat "$count_file" 2>/dev/null || echo 0)
    count=$((count + 1))
    echo "$count" > "$count_file"

    if [ "$count" -ge "$max_repeats" ]; then
      echo "!!! State '${state}' repeated ${count} times without progress — stuck"
      rm -f "$count_file" "$last_file"
      exit 2
    fi
  else
    echo "$state" > "$last_file"
    echo "1" > "$count_file"
  fi
}

# Resolve PR number from plan file or by querying the PR repo.
resolve_pr_number() {
  local pr_number=""
  if [ -f "plan/.pr-number" ]; then
    pr_number=$(cat plan/.pr-number)
  fi
  if [ -z "$pr_number" ]; then
    pr_number=$(GH_TOKEN="$PR_GH_TOKEN" gh pr list --repo "$PR_REPO" \
      --head "$PR_HEAD" --json number --jq '.[0].number' 2>/dev/null || true)
  fi
  echo "$pr_number"
}

# ── Main ─────────────────────────────────────────────────────

STATE=$(determine_state)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUMBER}-${STATE}-${TIMESTAMP}.log"

echo ">>> State: ${STATE} for issue #${ISSUE_NUMBER}"
echo ">>> Log: ${LOG_FILE}"

# Detect state-level loops (guards against FSM gaps)
check_state_repeat "$STATE"

case "$STATE" in

  # ── State: create-brief ──────────────────────────────────────
  create-brief)
    set_state "create-brief"
    run_claude \
      -p "$(cat "${PROMPTS_DIR}/create-brief.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}"

    # If Claude wrote to planning but failed to move to ready, promote it
    if [ ! -f "plan/ready/brief.md" ] && [ -f "plan/planning/brief.md" ]; then
      cp plan/planning/brief.md plan/ready/brief.md
      echo ">>> Promoted planning brief to ready (Claude failed to move it)"
    fi

    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Brief approved, ready for task creation"
      clear_state
    else
      echo "!!! No brief produced"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  # ── State: apply-review ──────────────────────────────────────
  apply-review)
    set_state "apply-review"
    run_claude -p "$(cat "${PROMPTS_DIR}/apply-review.md")"

    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Review applied, brief approved"
      clear_state
    else
      echo "!!! Review not applied"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  # ── State: create-tasks ──────────────────────────────────────
  create-tasks)
    set_state "create-tasks"

    # Ensure brief is in the ready location (may have been detected in planning/)
    if [ ! -f "plan/ready/brief.md" ] && [ -f "plan/planning/brief.md" ]; then
      cp plan/planning/brief.md plan/ready/brief.md
      echo ">>> Promoted planning brief to ready"
    fi

    run_claude -p "$(cat "${PROMPTS_DIR}/create-tasks.md")"

    if [ -f "plan/ready/tasks.md" ]; then
      echo ">>> Tasks created"

      # Advance state before side-effects (push/PR) so a failure doesn't
      # leave us stuck in create-tasks.
      clear_state

      # Side-effects (commit/push/PR) are non-critical — protect from set -e.
      # A failure here means no draft PR yet, but execute-tasks will retry.
      set +e
      git add plan/
      git commit -m "chore: add plan for #${ISSUE_NUMBER}"
      if push_branch; then
        PR_NUMBER=$(create_draft_pr)
        if [ -z "$PR_NUMBER" ]; then
          echo "!!! Draft PR creation failed (will retry in execute-tasks)"
        fi
      else
        echo "!!! Push failed (will retry in execute-tasks)"
      fi
      set -e
    else
      echo "!!! No tasks produced"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  # ── State: execute-tasks ─────────────────────────────────────
  execute-tasks)
    set_state "execute-tasks"
    # Count unchecked before
    BEFORE=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || true)
    BEFORE=${BEFORE:-0}

    run_claude --output-format stream-json \
      -p "$(cat "${PROMPTS_DIR}/execute-tasks.md")"

    # Count unchecked after
    AFTER=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || true)
    AFTER=${AFTER:-0}
    echo ">>> Tasks remaining: ${BEFORE} → ${AFTER}"

    # All tasks complete — transition to finalize-pr
    if [ "$AFTER" -eq 0 ]; then
      echo ">>> All tasks complete"
      clear_state
      exit 1
    fi

    # Stuck detection — no progress and tasks remain
    if [ "$BEFORE" -eq "$AFTER" ]; then
      STUCK_FILE="plan/.stuck-count"
      STUCK_COUNT=$(cat "$STUCK_FILE" 2>/dev/null || echo 0)
      MAX_STUCK_RETRIES=3

      if [ "$STUCK_COUNT" -ge "$MAX_STUCK_RETRIES" ]; then
        echo "!!! No progress after ${MAX_STUCK_RETRIES} retries — agent is stuck"
        rm -f "$STUCK_FILE"
        clear_state
        exit 2
      fi

      echo $((STUCK_COUNT + 1)) > "$STUCK_FILE"
      echo "!!! No progress made — retry $((STUCK_COUNT + 1))/${MAX_STUCK_RETRIES}"
      clear_state
      exit 1
    fi

    # Progress was made — reset stuck counter
    rm -f plan/.stuck-count

    # Commit any uncommitted changes (Claude should commit, but this catches
    # timeouts or partial completions)
    safety_commit "chore: save progress on #${ISSUE_NUMBER}"

    # Push progress and ensure draft PR exists for visibility
    set +e
    if push_branch; then
      ensure_draft_pr > /dev/null
    fi
    set -e

    clear_state

    # More tasks or all done — either way, iterate again
    exit 1
    ;;

  # ── State: finalize-pr ───────────────────────────────────────
  finalize-pr)
    set_state "finalize-pr"

    # Commit any leftover changes and push
    safety_commit "chore: save progress on #${ISSUE_NUMBER}"
    push_branch || echo "!!! Push failed in finalize-pr — will retry after PR creation"

    PR_NUMBER=$(resolve_pr_number)
    if [ -z "$PR_NUMBER" ]; then
      echo ">>> No draft PR found — creating one now"
      PR_NUMBER=$(create_draft_pr)
      if [ -z "$PR_NUMBER" ]; then
        echo "!!! Failed to create PR in finalize-pr"
        clear_state
        exit 2
      fi
    fi

    echo ">>> Finalizing PR #${PR_NUMBER}"

    # Save fork token before overriding for PR operations
    GH_TOKEN_FORK="$GH_TOKEN"

    # Claude will run `gh pr edit` which needs the PR repo token
    export GH_TOKEN="$PR_GH_TOKEN"

    run_claude \
      -p "$(cat "${PROMPTS_DIR}/finalize-pr.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
PR repo: ${PR_REPO}
PR number: ${PR_NUMBER}
Branch: ${BRANCH}"

    upload_screenshots "$PR_NUMBER" "$GH_TOKEN_FORK"

    # Remove plan files from git BEFORE marking ready. This prevents them
    # from being included in the squash merge if auto-merge fires quickly.
    # Keep .pr-number and .finalized as local-only (untracked) state.
    if git ls-files --error-unmatch plan/ &>/dev/null 2>&1; then
      git rm -r plan/ || true
      git commit -m "chore: remove plan files before PR ready" || true
      push_branch || echo "!!! Push failed after plan cleanup"
    fi

    # Recreate local-only state files (not tracked by git)
    mkdir -p plan
    echo "$PR_NUMBER" > plan/.pr-number
    touch plan/.finalized

    # Mark PR as ready for review (deterministic — not delegated to Claude)
    GH_TOKEN="$PR_GH_TOKEN" gh pr ready "$PR_NUMBER" \
      --repo "$PR_REPO" 2>&1 | tee -a "$LOG_FILE" || true
    echo ">>> PR #${PR_NUMBER} marked ready for review"

    # Restore fork token so subsequent states use the correct token
    export GH_TOKEN="$GH_TOKEN_FORK"

    clear_state
    echo ">>> PR #${PR_NUMBER} finalized for issue #${ISSUE_NUMBER}, transitioning to await-ci"
    exit 1  # iterate again into await-ci
    ;;

  # ── State: await-ci ──────────────────────────────────────────
  await-ci)
    set_state "await-ci"

    # Read PR number — prefer .pr-number, fall back to .plan-archived (phase 2)
    if [ -f "plan/.pr-number" ]; then
      PR_NUMBER=$(cat plan/.pr-number)
    elif [ -f "plan/.plan-archived" ]; then
      PR_NUMBER=$(cat plan/.plan-archived)
    else
      PR_NUMBER=$(resolve_pr_number)
    fi
    if [ -z "$PR_NUMBER" ]; then
      echo "!!! No PR number found — cannot monitor CI"
      exit 2
    fi
    echo ">>> Monitoring CI for PR #${PR_NUMBER}"

    CI_STATUS=$(poll_ci_status "$PR_NUMBER")
    echo ">>> CI status: ${CI_STATUS}"

    case "$CI_STATUS" in
      pending)
        echo ">>> CI still running, will retry after cooldown"
        exit 1
        ;;
      passing)
        if [ ! -f "plan/.plan-archived" ]; then
          # Safety net: remove any plan files that survived to git (e.g., from
          # CI remediation re-adding them). finalize-pr already cleaned them,
          # but this catches stragglers.
          if git ls-files --error-unmatch plan/ &>/dev/null 2>&1; then
            echo ">>> Removing residual plan files from git"
            git rm -r plan/ || true
            git commit -m "chore: remove plan files before merge" || true
            push_branch || echo "!!! Push failed after plan cleanup"
          fi
          mkdir -p plan
          echo "$PR_NUMBER" > plan/.plan-archived
          clear_state
          GH_TOKEN="$PR_GH_TOKEN" gh pr merge "$PR_NUMBER" \
            --repo "$PR_REPO" --squash --auto 2>&1 | tee -a "$LOG_FILE" || true
          echo ">>> Auto-merge enabled, GitHub will merge when CI passes"
          exit 1
        fi

        # Phase 2: CI green — merge (fallback if auto-merge didn't fire)
        if check_pr_merged "$PR_NUMBER"; then
          rm -rf plan/
          echo ">>> Issue #${ISSUE_NUMBER} complete — PR already merged (auto-merge)"
          exit 0
        fi
        echo ">>> CI passed! Merging PR #${PR_NUMBER}"
        if ! GH_TOKEN="$PR_GH_TOKEN" gh pr merge "$PR_NUMBER" \
          --repo "$PR_REPO" --squash 2>&1 | tee -a "$LOG_FILE"; then
          # Merge failed — but auto-merge may have raced us. Re-check before giving up.
          if check_pr_merged "$PR_NUMBER"; then
            rm -rf plan/
            echo ">>> Issue #${ISSUE_NUMBER} complete — PR already merged (auto-merge)"
            exit 0
          fi
          echo "!!! Merge failed for PR #${PR_NUMBER}"
          exit 2
        fi
        rm -rf plan/
        echo ">>> Issue #${ISSUE_NUMBER} complete — PR merged"
        exit 0
        ;;
      conflicting)
        check_remediation_attempts "Merge conflict remediation failed"

        git fetch upstream "$BASE_BRANCH" 2>&1 | tee -a "$LOG_FILE" || true

        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        run_claude \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}
Base branch: ${BASE_BRANCH}

Failure type: MERGE_CONFLICT
The PR has merge conflicts with the base branch (${BASE_BRANCH}). The base branch has already been fetched. Rebase onto upstream/${BASE_BRANCH} and resolve all conflicts."

        safety_commit "fix: resolve merge conflicts for #${ISSUE_NUMBER}"
        push_branch || echo "!!! Push failed after conflict resolution"

        clear_state
        echo ">>> Conflict resolution pushed, will re-check after cooldown"
        exit 1
        ;;
      failing)
        check_remediation_attempts "CI remediation failed"

        # Get the failed run ID
        RUN_ID=$(GH_TOKEN="$PR_GH_TOKEN" gh pr checks "$PR_NUMBER" \
          --repo "$PR_REPO" --json state,link \
          --jq '.[] | select(.state == "FAILURE") | .link' \
          | head -1 | grep -oE '[0-9]+$') || true

        FAILED_LOG=""
        if [ -n "$RUN_ID" ]; then
          FAILED_LOG=$(GH_TOKEN="$PR_GH_TOKEN" gh run view "$RUN_ID" \
            --repo "$PR_REPO" --log-failed 2>&1 | tail -200) || true
        fi

        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        run_claude \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}

Failure type: CI_FAILURE
CI failure logs:
\`\`\`
${FAILED_LOG}
\`\`\`"

        safety_commit "fix: CI remediation for #${ISSUE_NUMBER}"
        push_branch || echo "!!! Push failed after CI remediation"

        clear_state
        echo ">>> Remediation pushed, will re-check CI after cooldown"
        exit 1
        ;;
    esac
    ;;

  # ── State: done ──────────────────────────────────────────────
  done)
    echo ">>> Issue #${ISSUE_NUMBER} already completed"
    exit 0
    ;;

esac
