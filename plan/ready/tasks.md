# Tasks: Issue #56 — Update autonomous agent references

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Replace `npm install` with `npm ci` in `autonomous/entrypoint.sh`
  - **Goal**: Switch the warm-cache dependency install step to use `npm ci` for reproducible, lockfile-driven workspace installs.
  - **Details**: On line 85 of `autonomous/entrypoint.sh`, inside the `if [ -f package.json ]` block, change `npm install` to `npm ci`. No other logic changes needed.
  - **Files**: `autonomous/entrypoint.sh`
  - **Verify**: `grep -n 'npm ci' autonomous/entrypoint.sh` shows the change on line 85; `grep 'npm install' autonomous/entrypoint.sh` returns no matches (other than global install in Dockerfile, which is separate).
  - **Brief ref**: Approach step 1

- [x] TASK-02: Update `.claude/settings.json` permissions — swap `npm install` for `npm ci`
  - **Goal**: Ensure local Claude Code sessions are allowed to run `npm ci` (the standard install command) and no longer list the deprecated `npm install` permission.
  - **Details**: In `.claude/settings.json`, in the `allow` array, replace `"Bash(npm install:*)"` with `"Bash(npm ci:*)"` (swap in place to preserve list order).
  - **Files**: `.claude/settings.json`
  - **Verify**: `grep 'npm ci' .claude/settings.json` shows the new entry; `grep 'npm install' .claude/settings.json` returns no matches.
  - **Brief ref**: Approach step 2

- [x] TASK-03: Add workspace-support comment to `autonomous/Dockerfile`
  - **Goal**: Document that the base image ships npm 10 (Node 20), which fully supports npm workspaces, so future agents don't second-guess the install strategy.
  - **Details**: In `autonomous/Dockerfile`, add a brief inline comment near the `FROM` line or the `npm install -g` line confirming that the Playwright base image ships Node 20 + npm 10, and that `npm ci` with workspaces is fully supported. Keep the comment concise (one line).
  - **Files**: `autonomous/Dockerfile`
  - **Verify**: `grep -n 'workspace' autonomous/Dockerfile` shows the new comment.
  - **Brief ref**: Approach step 4

- [x] TASK-04: Audit and confirm `autonomous/prompts/*.md` — no stale paths
  - **Goal**: Confirm all prompt files are already workspace-aware (no pre-monorepo `server/` or `client/` path references); record the audit result.
  - **Details**: Read each prompt file (`create-brief.md`, `create-tasks.md`, `execute-tasks.md`, `apply-review.md`, `remediate-ci.md`, `finalize-pr.md`). If any stale paths are found (bare `server/` or `client/` without `packages/` prefix), update them. If all are clean, add a one-line comment at the top of this task confirming the audit. (Pre-audit indicates all prompts are already clean — no code changes expected.)
  - **Files**: `autonomous/prompts/*.md` (modify only if stale refs found)
  - **Verify**: `grep -rn '\bserver/' autonomous/prompts/ autonomous/prompts/ | grep -v 'packages/server'` and equivalent for `client/` return no matches.
  - **Brief ref**: Approach step 3

- [x] TASK-05: Audit and confirm `scripts/` directory — no stale paths
  - **Goal**: Confirm all scripts are already workspace-aware; record the audit result.
  - **Details**: Review `scripts/ci-check.sh`, `scripts/run-local.sh`, and `scripts/implement-milestone.sh` for stale pre-monorepo path references. If any are found, update them. (Pre-audit confirms all scripts are already clean — no code changes expected.)
  - **Files**: `scripts/*.sh` (modify only if stale refs found)
  - **Verify**: `grep -rn '\bserver/\|\bclient/' scripts/` returns no matches (or only legitimate `packages/` prefixed ones).
  - **Brief ref**: Approach step 5

- [ ] TASK-06: Final verification — build and permissions check
  - **Goal**: Confirm all changes are coherent and the repo is in a valid state.
  - **Details**: Run `npm run build` from the repo root to verify workspace resolution. Check that `.claude/settings.json` has `npm ci` and not `npm install`. Confirm `autonomous/entrypoint.sh` line 85 reads `npm ci`. Confirm the Dockerfile comment is present. No Docker build required in CI (Docker build is a manual verification step).
  - **Files**: None (verification only)
  - **Verify**: `npm run build` exits 0; `grep 'npm ci' autonomous/entrypoint.sh` and `grep 'npm ci' .claude/settings.json` both match; `grep 'npm install' .claude/settings.json` returns no matches.
  - **Brief ref**: Verification section
