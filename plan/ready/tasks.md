# Tasks: Issue #53 — Move frontend into packages/client

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Update root package.json for workspaces
  - **Goal**: Add `workspaces` field, strip frontend-only deps/devDeps, and update scripts to delegate to `@mmf/client`
  - **Details**:
    - Add `"workspaces": ["packages/*"]` to root `package.json`
    - Update root scripts: `"build": "npm run build -w @mmf/client"`, `"dev": "npm run dev -w @mmf/client"`, `"test": "npm run test -w @mmf/client"`, `"preview": "npm run preview -w @mmf/client"`, `"lint": "npm run lint -w @mmf/client"`
    - Move all frontend-specific `dependencies` (react, react-dom, react-router, @tanstack/react-query, @mmf/shared) and `devDependencies` (vite, tailwindcss, typescript, vitest, @testing-library/*, @vitejs/plugin-react, postcss, autoprefixer) out of root; keep only repo-wide tools (eslint, prettier, markdownlint-cli2, etc.)
  - **Files**: `package.json`
  - **Verify**: Root `package.json` has `workspaces` field, scripts delegate via `-w @mmf/client`, and frontend-specific packages are removed from root deps
  - **Brief ref**: Step 1 — Root workspace setup

- [x] TASK-02: Create packages/client/package.json
  - **Goal**: Establish the `@mmf/client` package manifest with all frontend dependencies
  - **Details**:
    - Create `packages/client/package.json` with `"name": "@mmf/client"`, `"private": true`, `"version": "0.0.1"`, `"type": "module"`
    - Include scripts: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`, `"test": "vitest"`, `"lint": "eslint ."`
    - Include all frontend `dependencies`: react, react-dom, react-router-dom (or react-router), @tanstack/react-query, @mmf/shared — with the exact versions from current root `package.json`
    - Include all frontend `devDependencies`: vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @types/react, @types/react-dom — with exact versions from current root `package.json`
  - **Files**: `packages/client/package.json` (create)
  - **Verify**: File exists and contains correct name, all required deps with correct versions
  - **Brief ref**: Step 2 — Create packages/client

- [x] TASK-03: Move src/, index.html, and vite.config.ts into packages/client
  - **Goal**: Physically relocate all frontend source files using `git mv` to preserve history
  - **Details**:
    - `git mv src packages/client/src`
    - `git mv index.html packages/client/index.html`
    - `git mv vite.config.ts packages/client/vite.config.ts`
    - Verify `vite.config.ts` after move — all paths inside it (e.g. `root`, `test.include` globs) should still resolve correctly relative to `packages/client/`; update any absolute or root-relative paths if needed
    - Check `index.html` for any script `src` paths that may need adjustment
  - **Files**: `packages/client/src/` (moved from `src/`), `packages/client/index.html` (moved), `packages/client/vite.config.ts` (moved); possibly minor edits to `vite.config.ts`
  - **Verify**: `src/`, `index.html`, `vite.config.ts` no longer exist at repo root; `packages/client/src/`, `packages/client/index.html`, `packages/client/vite.config.ts` all exist
  - **Brief ref**: Step 3 — Move files

- [ ] TASK-04: Wire tsconfig files
  - **Goal**: Move `tsconfig.app.json` to `packages/client/tsconfig.json`, delete `tsconfig.node.json`, and update root `tsconfig.json` to use project references
  - **Details**:
    - `git mv tsconfig.app.json packages/client/tsconfig.json`
    - In `packages/client/tsconfig.json`, confirm `"baseUrl": "."`, `"paths": { "@/*": ["src/*"] }`, and `"include": ["src"]` remain correct (they should since paths are relative to the file's location)
    - Add `"composite": true` to `packages/client/tsconfig.json` compilerOptions if not already present (required for project references)
    - Delete `tsconfig.node.json` from root (`git rm tsconfig.node.json`)
    - Rewrite root `tsconfig.json` to: `{ "files": [], "references": [{ "path": "./packages/client" }] }`
  - **Files**: `packages/client/tsconfig.json` (moved from `tsconfig.app.json`), `tsconfig.json` (modify), `tsconfig.node.json` (delete)
  - **Verify**: `tsconfig.app.json` and `tsconfig.node.json` no longer exist at root; `packages/client/tsconfig.json` exists; root `tsconfig.json` references `./packages/client`
  - **Brief ref**: Step 4 — tsconfig wiring

- [ ] TASK-05: Update Campaign type imports in campaigns.ts
  - **Goal**: Replace inline type definitions with imports from `@mmf/shared`
  - **Details**:
    - In `packages/client/src/api/campaigns.ts`, remove the inline `interface` definitions for `Campaign`, `Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`
    - Add: `import type { Campaign, Milestone, StretchGoal, TeamMember, CampaignUpdate } from '@mmf/shared'`
    - Keep `fetchCampaigns`, `fetchCampaign` functions and all mock data unchanged
    - Verify `@mmf/shared` exists at `packages/shared` and exports these types (prerequisite from issue #50)
  - **Files**: `packages/client/src/api/campaigns.ts`
  - **Verify**: File has no inline `Campaign`/`Milestone`/etc. interface definitions; imports them from `@mmf/shared`
  - **Brief ref**: Step 5 — Update Campaign type imports

- [ ] TASK-06: Install dependencies and verify build, tests, and type check
  - **Goal**: Confirm the restructured workspace builds, tests pass, and tsc reports no errors
  - **Details**:
    - Run `npm install` from repo root to link workspace packages
    - Run `npm run build` — must succeed (delegates to `packages/client`, runs `tsc -b && vite build`)
    - Run `npm run test` — all existing frontend tests must pass
    - Run `npx tsc -b` at root — no type errors
    - Fix any path resolution issues, missing `composite` flags, or import errors surfaced by these checks
  - **Files**: Any files requiring minor fixes discovered during verification
  - **Verify**: All three commands (`npm install`, `npm run build`, `npm run test`) complete without errors; no orphan files remain at root (`src/`, `index.html`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json` are absent)
  - **Brief ref**: Step 6 — Verification
