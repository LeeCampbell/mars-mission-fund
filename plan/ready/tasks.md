# Tasks: Issue #55 — Unify ESLint, CI, and root config

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Update root `eslint.config.js` to multi-block flat config
  - **Goal**: Replace the single-block ESLint config (which ignores `server/`) with a multi-block flat config covering both `packages/client` and `packages/server`
  - **Details**: Replace current config with `tseslint.config(...)` using three blocks: (1) ignores block for `**/dist/` and `**/node_modules/`; (2) base TS rules for all `**/*.{ts,tsx}` files using `js.configs.recommended` and `tseslint.configs.recommended`; (3) client-only block scoped to `packages/client/**/*.{ts,tsx}` with `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `react/react-in-jsx-scope: 'off'`. Remove any stale `server/` ignore entry. All required plugins are already in root `devDependencies`.
  - **Files**: `eslint.config.js`
  - **Verify**: `npm run lint` from repo root exits 0 with no errors for files in both `packages/client` and `packages/server`
  - **Brief ref**: Section "1. `eslint.config.js` (root)"

- [ ] TASK-02: Update root `package.json` scripts
  - **Goal**: Make root npm scripts drive all workspaces and remove redundant delegation scripts
  - **Details**: Update scripts as follows — `build`: `"npm run build --workspaces --if-present"`; `test`: `"npm run test --workspaces --if-present"`; `test:coverage`: `"npm run test:coverage --workspaces --if-present"`; `lint`: `"eslint ."`; `lint:fix`: `"eslint . --fix"`. Remove `test:server` (subsumed by `--workspaces`). Remove any per-workspace delegation script such as `lint: "npm run lint -w @mmf/client"`. Keep `dev`, `dev:server`, `format`, `format:check`, and `lint:md` unchanged.
  - **Files**: `package.json`
  - **Verify**: `npm run build`, `npm run test`, and `npm run lint` all exit 0; `package.json` no longer contains `test:server`
  - **Brief ref**: Section "2. `package.json` (root)"

- [ ] TASK-03: Update CI workflow to type-check `packages/server`
  - **Goal**: Extend the `Type-check` step in CI to also validate `packages/server`
  - **Details**: In `.github/workflows/ci.yml`, find the `Type-check` step and change its `run` command to: `npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json`. No other YAML changes are needed — the build and test:coverage steps automatically expand via the updated root scripts from TASK-02.
  - **Files**: `.github/workflows/ci.yml`
  - **Verify**: The `Type-check` step YAML contains both `npx tsc -b --noEmit` and `npx tsc --noEmit -p packages/server/tsconfig.json`; running `npx tsc --noEmit -p packages/server/tsconfig.json` locally exits 0
  - **Brief ref**: Section "3. `.github/workflows/ci.yml`"

- [ ] TASK-04: Verify Prettier coverage and run full integration check
  - **Goal**: Confirm `.prettierrc` and `.prettierignore` are adequate for all packages, then do a final end-to-end verification of all updated tooling
  - **Details**: Read `.prettierrc` and `.prettierignore` to confirm they apply repo-wide (no source changes expected). Then run the full suite from repo root: `npm run build`, `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run format:check`, `npx tsc -b --noEmit`, `npx tsc --noEmit -p packages/server/tsconfig.json`. Fix any issues discovered (lint errors, type errors, test failures) without adding rules or plugins beyond what the brief specifies.
  - **Files**: Read-only: `.prettierrc`, `.prettierignore` (no changes expected)
  - **Verify**: All commands above exit 0; no unintended files modified
  - **Brief ref**: Section "4. Prettier verification" and "Verification"
