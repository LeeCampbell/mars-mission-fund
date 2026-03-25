# Tasks: Issue #189 — Autonomous agent skips screenshots for UI-change PRs

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add visual screenshot task guideline to create-tasks.md
  - **Goal**: Ensure the task planner always generates a dedicated "Visual verification screenshots" task for any issue that touches `packages/client/src/`
  - **Details**: In `autonomous/prompts/create-tasks.md`, after the existing "E2E tests — co-locate with feature tasks" guideline block (including the `For backend-only issues…` closing line), add a new subsection titled "Visual screenshot task for frontend issues". The subsection must:
    1. State the trigger condition: when the brief's **Files to Create/Modify** table contains any path starting with `packages/client/src/`
    2. Require the planner to insert a dedicated task immediately before the final regression task using this exact template:
       ```text
       - [ ] TASK-N: Visual verification screenshots
         - **Goal**: Capture before/after screenshots of every changed UI state
         - **Details**: Start the dev server and backend if needed, use Playwright MCP to navigate to each affected page/state, take screenshots saved to `/screenshots/ISSUE-{issueId}-TASK-{NN}.png`
         - **Files**: (none — screenshots only)
         - **Verify**: At least one `.png` exists in `/screenshots/` matching `ISSUE-{issueId}-*`
         - **Brief ref**: Verification section
       ```
  - **Files**: `autonomous/prompts/create-tasks.md`
  - **Verify**: `npm run lint:md` passes; read the updated file and confirm the new subsection appears after the E2E guideline block with correct trigger condition and task template
  - **Brief ref**: `create-tasks.md` change section

- [x] TASK-02: Strengthen visual verification step in execute-tasks.md
  - **Goal**: Replace the ambiguous, skippable visual verification block in `execute-tasks.md` with a file-path-triggered, backend-startup-aware, non-skippable step
  - **Details**: Replace the current Step 4 "Visual verification" block (lines 91–100, from `**Visual verification**: If the task involves UI changes:` through `- Stop the dev server: kill the background process`) with a new version that:
    1. **Trigger condition** (file-path-based, not subjective): applies when the current task's **Files** list includes any path under `packages/client/src/`
    2. **Backend startup on failure**: if `curl -sf http://localhost:3001/health` fails, run `npm run dev:server &` and poll the health endpoint every 3 seconds for up to 30 seconds; if the backend is still not responding after 30 s, note the failure but continue (Vite dev server may still render static UI without the backend)
    3. **Non-optional**: the task is not considered complete unless at least one screenshot file exists at `/screenshots/ISSUE-{issueId}-TASK-{NN}.png`; missing screenshots must be treated as an incomplete verification step (fix and retry, do not skip)
    4. Keep the existing instructions for starting the dev server (`npm run dev &`), navigating with Playwright MCP, and stopping the dev server
  - **Files**: `autonomous/prompts/execute-tasks.md`
  - **Verify**: `npm run lint:md` passes; read the updated file and confirm: (a) trigger uses file-path check, not "If the task involves UI changes"; (b) backend startup with polling is described; (c) missing screenshots are treated as incomplete, not skippable
  - **Brief ref**: `execute-tasks.md` change section

- [ ] TASK-03: Final lint and manual review
  - **Goal**: Confirm both prompt files pass markdown lint and the updated instructions behave correctly end-to-end on a hypothetical frontend issue
  - **Details**: Run `npm run lint:md` across the whole repo. Then do a manual read-through of both modified files and verify: (1) `create-tasks.md` — a frontend issue (files under `packages/client/src/`) would now produce a dedicated screenshot task as the penultimate task; (2) `execute-tasks.md` — the visual verification step is triggered by file path, attempts backend startup on failure, and treats missing screenshots as incomplete. No code changes expected; fix any lint issues found.
  - **Files**: (none expected — lint fixes only if needed)
  - **Verify**: `npm run lint:md` exits 0 with no warnings on either file
  - **Brief ref**: Verification section
