# Tasks: Issue #54 — Move backend into packages/server

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Scaffold `packages/server/package.json`
  - **Goal**: Create `packages/server/` with a correctly named and configured `package.json`
  - **Details**: Create the directory `packages/server/`. Write `packages/server/package.json` with `"name": "@mmf/server"`, `"version": "0.0.1"`, `"type": "module"`, all scripts unchanged from `server/package.json`, all existing `dependencies` and `devDependencies` preserved, and `"@mmf/shared": "*"` added to `dependencies`. Do NOT copy `server/package-lock.json`.
  - **Files**: `packages/server/package.json` (create)
  - **Verify**: `cat packages/server/package.json` shows `"name": "@mmf/server"` and `"@mmf/shared": "*"` in dependencies
  - **Brief ref**: Step 1 — Scaffold `packages/server/`

- [x] TASK-02: Copy config files verbatim
  - **Goal**: Copy `tsconfig.json` and `vitest.config.ts` from `server/` to `packages/server/` with no content changes
  - **Details**: Read `server/tsconfig.json` and `server/vitest.config.ts` and write identical copies to `packages/server/tsconfig.json` and `packages/server/vitest.config.ts`. All relative path references (`src/**/*`, `dist/`) remain valid in the new location.
  - **Files**: `packages/server/tsconfig.json` (create), `packages/server/vitest.config.ts` (create)
  - **Verify**: `diff server/tsconfig.json packages/server/tsconfig.json` and `diff server/vitest.config.ts packages/server/vitest.config.ts` both produce no output
  - **Brief ref**: Step 2 — Move config files

- [x] TASK-03: Move source files (excluding `campaigns/types.ts`)
  - **Goal**: Copy all `server/src/` files except `campaigns/types.ts` to `packages/server/src/`, and copy `server/db/` to `packages/server/db/`
  - **Details**: Copy the following files verbatim:
    - `server/src/index.ts` → `packages/server/src/index.ts`
    - `server/src/app.ts` → `packages/server/src/app.ts`
    - `server/src/db/pool.ts` → `packages/server/src/db/pool.ts`
    - `server/src/campaigns/queries.ts` → `packages/server/src/campaigns/queries.ts`
    - `server/src/campaigns/routes.ts` → `packages/server/src/campaigns/routes.ts`
    - `server/src/middleware/correlationId.ts` → `packages/server/src/middleware/correlationId.ts`
    - `server/src/middleware/errorHandler.ts` → `packages/server/src/middleware/errorHandler.ts`
    - `server/src/middleware/requestLogger.ts` → `packages/server/src/middleware/requestLogger.ts`
    - `server/src/__tests__/campaigns.test.ts` → `packages/server/src/__tests__/campaigns.test.ts`
    - All 6 SQL files from `server/db/migrations/` → `packages/server/db/migrations/`
    All internal imports use relative `.js` extension paths and remain valid after the move.
  - **Files**: All files listed above (create)
  - **Verify**: `find packages/server/src packages/server/db -type f | sort` lists all expected files
  - **Brief ref**: Step 3 — Move source files

- [x] TASK-04: Update `packages/server/src/campaigns/types.ts` to import from `@mmf/shared`
  - **Goal**: Replace locally-defined shared types with imports from `@mmf/shared`; keep server-only schemas local
  - **Details**: Create `packages/server/src/campaigns/types.ts` (do NOT copy verbatim from `server/`). The new file should:
    1. Import `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema` from `'@mmf/shared'`
    1. Re-export the corresponding TypeScript types via `export type { CampaignStatus, CampaignCategory, CampaignSummary, Campaign } from '@mmf/shared'`
    1. Keep `RouteParamsSchema` and `ListQuerySchema` defined locally using `zod` (these are server-only)
    1. Keep `RouteParams` and `ListQuery` type exports inferred locally from those schemas
    1. Remove the local definitions of `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, and `CampaignSchema`
  - **Files**: `packages/server/src/campaigns/types.ts` (create)
  - **Verify**: File contains `from '@mmf/shared'` import and no local definition of `CampaignStatusSchema`; `RouteParamsSchema` and `ListQuerySchema` are still defined in the file
  - **Brief ref**: Step 4 — Update `packages/server/src/campaigns/types.ts`

- [x] TASK-05: Update root `package.json` scripts
  - **Goal**: Change `dev:server` and `test:server` to use npm workspaces syntax
  - **Details**: Edit root `package.json` to replace:
    - `"dev:server": "npm run dev --prefix server"` → `"dev:server": "npm run dev -w @mmf/server"`
    - `"test:server": "npm run test --prefix server"` → `"test:server": "npm run test -w @mmf/server"`
  - **Files**: `package.json` (root, modify)
  - **Verify**: `grep -E "dev:server|test:server" package.json` shows `-w @mmf/server` in both lines
  - **Brief ref**: Step 5 — Update root `package.json` scripts

- [x] TASK-06: Delete the old `server/` directory
  - **Goal**: Remove the entire `server/` directory from the repo root
  - **Details**: After confirming all files are present in `packages/server/`, delete `server/` and all its contents. Verify with `ls server/` returning "no such file or directory".
  - **Files**: `server/` (delete entire directory)
  - **Verify**: `ls server/` returns an error; `find packages/server -type f | wc -l` shows the expected file count (16 source + config files + 6 SQL migrations)
  - **Brief ref**: Step 6 — Delete `server/`
