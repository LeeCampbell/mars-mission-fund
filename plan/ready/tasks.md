# Tasks: Issue #52 — Create shared types package

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add workspaces config to root package.json
  - **Goal**: Enable npm workspaces so `packages/*` are recognized as workspace members
  - **Details**: Add `"workspaces": ["packages/*"]` field to the root `package.json`
  - **Files**: `package.json`
  - **Verify**: `cat package.json` shows the workspaces field; `npm install` at repo root succeeds without errors
  - **Brief ref**: "Add `"workspaces": ["packages/*"]` to root `package.json`"

- [x] TASK-02: Create packages/shared/package.json
  - **Goal**: Define the `@mmf/shared` package manifest with correct metadata, exports map, and dependencies
  - **Details**:
    - `"name": "@mmf/shared"`, `"version": "0.1.0"`, `"private": true`, `"type": "module"`
    - `"main": "./dist/index.js"`
    - `"exports"` map: `".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }`
    - `"scripts"`: `"build": "tsc"`, `"typecheck": "tsc --noEmit"`
    - `"dependencies"`: `"zod": "^3"`
    - `"devDependencies"`: `"typescript": "^5"`
  - **Files**: `packages/shared/package.json`
  - **Verify**: File exists and is valid JSON; `"name"` is `@mmf/shared`
  - **Brief ref**: "Create `packages/shared/package.json` with name `@mmf/shared`"

- [x] TASK-03: Create packages/shared/tsconfig.json
  - **Goal**: TypeScript configuration that compiles shared package to ESM with declarations
  - **Details**:
    - `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`
    - `"target": "ES2022"`, `"lib": ["ES2022"]`
    - `"outDir": "./dist"`, `"rootDir": "./src"`
    - `"declaration": true`, `"declarationMap": true`
    - `"strict": true`, `"esModuleInterop": true`
    - `"include": ["src"]`
  - **Files**: `packages/shared/tsconfig.json`
  - **Verify**: File exists and is valid JSON
  - **Brief ref**: "Create `packages/shared/tsconfig.json` targeting ESM output"

- [x] TASK-04: Create packages/shared/src/campaign.ts
  - **Goal**: Define the canonical Campaign domain Zod schemas and inferred types in the shared package
  - **Details**:
    - Copy `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema` from `server/src/campaigns/types.ts` (exclude `RouteParamsSchema` and `ListQuerySchema` — server-only)
    - Export inferred types: `CampaignStatus`, `CampaignCategory`, `CampaignSummary`, `Campaign`
    - Import from `'zod'` (not a relative path)
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: File exists; TypeScript types are exported
  - **Brief ref**: "Create `packages/shared/src/campaign.ts`"

- [x] TASK-05: Create packages/shared/src/api.ts
  - **Goal**: Define the `ApiResponse<T>` generic envelope type matching the server's response shape
  - **Details**:
    - Export `type ApiResponse<T> = { data: T }` — matches the `{ data: T }` pattern in `server/src/campaigns/routes.ts`
  - **Files**: `packages/shared/src/api.ts`
  - **Verify**: File exists; `ApiResponse` is exported as a generic type
  - **Brief ref**: "Create `packages/shared/src/api.ts`"

- [x] TASK-06: Create packages/shared/src/index.ts barrel export
  - **Goal**: Single entry point re-exporting all public symbols from the shared package
  - **Details**:
    - `export * from './campaign.js'` (`.js` extension required for NodeNext module resolution)
    - `export * from './api.js'`
  - **Files**: `packages/shared/src/index.ts`
  - **Verify**: File exists; re-exports from both `campaign.js` and `api.js`
  - **Brief ref**: "Create `packages/shared/src/index.ts` as a barrel"

- [x] TASK-07: Run npm install and verify workspace linking
  - **Goal**: Confirm that `npm install` at the repo root succeeds and links the workspace package
  - **Details**:
    - Run `npm install` at the repo root
    - Confirm `node_modules/@mmf/shared` symlink is created pointing to `packages/shared`
    - Run `cd packages/shared && npx tsc --noEmit` to type-check
    - Run `cd packages/shared && npx tsc` to compile and verify `dist/index.js` and `dist/index.d.ts` are produced
  - **Files**: No file changes — verification only
  - **Verify**: `node_modules/@mmf/shared` exists as a symlink; `dist/index.js` and `dist/index.d.ts` exist after compilation
  - **Brief ref**: "Run `npm install` at the repo root to link the workspace package" / Verification section

- [x] TASK-08: Verify no regressions in frontend build and server tests
  - **Goal**: Confirm that adding workspaces to root `package.json` and installing does not break existing workflows
  - **Details**:
    - Run `npm run build` (frontend Vite build) and confirm it succeeds
    - Run `npm test --prefix server` and confirm server tests still pass
  - **Files**: No file changes — verification only
  - **Verify**: Both commands exit with code 0
  - **Brief ref**: "No regressions: `npm run build` and `npm test --prefix server` still pass"
