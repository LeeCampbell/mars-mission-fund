# Brief: Issue #56 — Update autonomous agent references

## Goal

With the move to an npm workspaces monorepo (`packages/client`, `packages/server`,
`packages/shared`), the autonomous agent scripts need three targeted updates:
the project dependency installation in `autonomous/entrypoint.sh` must switch from
`npm install` (non-deterministic) to `npm ci` (lockfile-based, workspace-aware);
`.claude/settings.json` must permit `npm ci` so local Claude Code sessions can run the
same commands the CI pipeline uses; and the remaining `autonomous/` scripts and prompts
should be audited and updated for any stale path references from the pre-monorepo layout.

## Scope

**In scope:**

- `autonomous/entrypoint.sh`: replace `npm install` with `npm ci` at the warm-cache step
- `.claude/settings.json`: add `Bash(npm ci:*)` to the `allow` list; remove
  `Bash(npm install:*)` (no longer the preferred install command)
- `autonomous/prompts/*.md`: audit for stale `server/`, `client/`, or other pre-`packages/`
  path references and update where found
- `autonomous/Dockerfile`: confirm the container's npm version supports workspaces
  (npm 7+); add a comment documenting the workspace-aware install strategy
- `scripts/` directory: audit for stale path references (confirm already up-to-date)

**Out of scope:**

- Changing the Docker build context or adding build-time `npm ci` caching layers
  (the runtime-clone pattern means pre-cached deps would be in the wrong directory)
- Updating CI workflow files (covered by issue #55)
- Updating root `package.json` workspace scripts (covered by issue #55)
- Changes to `packages/` source code
- Any issue #55 deliverables that have not yet landed

## Approach

The changes are small and surgical. Work through each file in order:

1. **`autonomous/entrypoint.sh`** — On line 85, inside the `if [ -f package.json ]` block,
   change `npm install` to `npm ci`. `npm ci` is the correct command for a lockfile-driven
   workspace install: it is reproducible, faster, and errors if `package-lock.json` is
   out of sync. The block already guards on the presence of `package.json`, so no other
   logic changes are needed.

2. **`.claude/settings.json`** — The `allow` array grants permissions for local Claude Code
   sessions. Currently `Bash(npm install:*)` is listed but `Bash(npm ci:*)` is not.
   Add `Bash(npm ci:*)` and remove `Bash(npm install:*)` (swap in place to keep the list
   tidy). `npm ci` is the standard install in both `scripts/ci-check.sh` and
   `scripts/run-local.sh`, so local Claude sessions need it.

3. **`autonomous/prompts/*.md`** — Read each prompt for hardcoded pre-monorepo paths
   (`server/`, `client/`, etc.). The `execute-tasks.md` prompt is the most likely
   candidate (it references `npm run dev` and `localhost:5173`, which are unchanged).
   Update any stale paths found; no changes expected if paths are already workspace-aware.

4. **`autonomous/Dockerfile`** — The Dockerfile uses `FROM mcr.microsoft.com/playwright:v1.52.0-noble`
   which ships Node 20 + npm 10; npm workspaces are fully supported without any code
   change. Add a brief inline comment confirming workspace support so future agents do
   not second-guess it.

5. **`scripts/` audit** — `ci-check.sh` already uses `npm ci`; `run-local.sh` already
   uses `npm ci` and `packages/server/db`; `implement-milestone.sh` has no project-path
   references. No code changes expected — just confirm and record in the brief.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `autonomous/entrypoint.sh` | modify | `npm install` → `npm ci` on line 85 |
| `.claude/settings.json` | modify | Add `Bash(npm ci:*)`, remove `Bash(npm install:*)` |
| `autonomous/Dockerfile` | modify | Add inline comment confirming npm workspace support |
| `autonomous/prompts/*.md` | modify (if stale refs found) | Update any pre-monorepo paths |

## Dependencies

- Depends on issue #55 (Unify ESLint, CI, and root config) being merged before this
  branch is rebased into main — the root `package.json` workspace scripts that #55
  introduces are what `npm ci` installs.
- No new npm packages required.
- No external services required.

## Verification

- **Build**: `npm run build` succeeds from repo root (exercises workspace resolution).
- **CI check**: `./scripts/ci-check.sh` passes — this runs `npm ci` as its first step,
  which verifies the lockfile is consistent across all workspaces.
- **Docker build**: `cd autonomous && docker compose build` completes without error.
- **Permissions**: Open `.claude/settings.json` and confirm `npm ci` is allowed and
  `npm install` is removed.
- **Entrypoint**: Confirm `autonomous/entrypoint.sh` line 85 reads `npm ci`.
- **No visual check needed** — these are tooling-only changes with no UI impact.
