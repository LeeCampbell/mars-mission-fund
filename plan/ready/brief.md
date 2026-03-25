# Brief: Issue #189 — Autonomous agent skips screenshots for UI-change PRs

## Goal

Harden the autonomous agent pipeline so that visual screenshots are reliably produced for every PR that touches frontend files. Currently, two prompt files allow agents to skip visual verification: `create-tasks.md` generates coarse task plans that omit a dedicated screenshot step, and `execute-tasks.md` makes visual verification conditional on both a subjective "UI changes" judgement and a backend health check that almost always fails (since `run-e2e.sh` tears the backend down after each run). This issue implements Option C — both a dedicated screenshot task in task generation and mandatory visual verification in task execution.

## Scope

**In scope:**

- Add explicit guidance to `autonomous/prompts/create-tasks.md` so that when an issue touches `packages/client/src/` a dedicated "Visual verification" task is always generated as the penultimate task (before the final regression task)
- Strengthen `autonomous/prompts/execute-tasks.md` visual verification step:
  - Remove the ambiguous "If the task involves UI changes" qualifier; replace with a file-path-based rule: any task that modifies files under `packages/client/src/` **must** attempt visual verification
  - Fix the health-check-fails path: instead of silently skipping, the agent must start the backend (`npm run dev:server &` + wait) before proceeding; only skip if startup itself fails after a reasonable wait
- No changes to `agent-loop.sh`, Playwright infrastructure, or CI scripts — the upload machinery already works correctly

**Out of scope:**

- Changing the screenshot storage location or upload mechanism
- Adding visual regression / diff tooling
- Modifying E2E test scripts or CI pipeline
- Any product/application feature changes

## Approach

Both files are plain Markdown prompts consumed by the Claude agent. Changes are purely editorial — no code compilation or tests required, but the CI markdown-lint check must still pass.

**`create-tasks.md` change:** After the existing E2E co-location guideline, add a new subsection titled "Visual screenshot task for frontend issues". When the brief's **Files to Create/Modify** table contains any path starting with `packages/client/src/`, the planner must insert a dedicated task immediately before the final regression task:

```text
- [ ] TASK-N: Visual verification screenshots
  - **Goal**: Capture before/after screenshots of every changed UI state
  - **Details**: Start the dev server and backend if needed, use Playwright MCP to navigate to each affected page/state, take screenshots saved to `/screenshots/ISSUE-{issueId}-TASK-{NN}.png`
  - **Files**: (none — screenshots only)
  - **Verify**: At least one `.png` exists in `/screenshots/` matching `ISSUE-{issueId}-*`
  - **Brief ref**: Verification section
```

**`execute-tasks.md` change:** Replace the current Step 4 "Visual verification" block (lines 91–99) with a stronger version:

1. Trigger condition: any task whose **Files** list includes a path under `packages/client/src/` (not a subjective judgement)
2. Backend startup: if `curl -sf http://localhost:3001/health` fails, run `npm run dev:server &` and poll the health endpoint for up to 30 seconds before proceeding; if still failing after 30 s, note the failure but continue with frontend-only screenshots (Vite dev server may still render static UI)
3. Make the screenshot step non-optional: the task is not complete unless at least one screenshot file exists at the expected path

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `autonomous/prompts/create-tasks.md` | modify | Add "Visual screenshot task for frontend issues" subsection with template task and trigger condition |
| `autonomous/prompts/execute-tasks.md` | modify | Replace soft visual-verification block with file-path-triggered, backend-startup-aware, non-skippable screenshot step |

## Dependencies

None. Pure Markdown edits; no npm packages or external services required.

## Verification

- **Build**: `npm run build` succeeds (Markdown files are not part of the build, but `npm run lint:md` must pass)
- **Lint**: `npm run lint:md` passes on both modified files
- **Visual**: N/A — these are prompt files, not UI code
- **Manual review**: Read the updated prompts and confirm:
  1. `create-tasks.md` — a frontend issue would now produce a dedicated screenshot task
  2. `execute-tasks.md` — the visual verification step is triggered by file path, attempts backend startup on failure, and treats missing screenshots as incomplete
- **E2E**: No Playwright E2E tests needed (no application UI changed)
