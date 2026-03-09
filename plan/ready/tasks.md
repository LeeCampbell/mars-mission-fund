# Tasks: Issue #52 — Create shared types package

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Enable npm workspaces at repo root
  - **Goal**: Configure the root `package.json` to declare npm workspaces so `packages/*` are discovered.
  - **Details**: Add `"workspaces": ["packages/*"]` to `package.json`. The root already has `"private": true`, which is required. Do not change any other fields.
  - **Files**: `package.json`
  - **Verify**: `cat package.json | grep workspaces` shows `"workspaces": ["packages/*"]`
  - **Brief ref**: Implementation step 1 / Files table row 1

- [x] TASK-02: Create `packages/shared/package.json`
  - **Goal**: Declare the `@mmf/shared` package manifest so npm workspaces and module resolvers can locate it.
  - **Details**: Create `packages/shared/package.json` with:
    - `"name": "@mmf/shared"`, `"version": "0.0.1"`, `"private": true`, `"type": "module"`
    - `"exports": { ".": "./src/index.ts" }`
    - `"dependencies": { "zod": "^3" }`
  - **Files**: `packages/shared/package.json`
  - **Verify**: `cat packages/shared/package.json` shows all required fields including exports and zod dependency
  - **Brief ref**: Implementation step 2 / Files table row 2

- [x] TASK-03: Create `packages/shared/tsconfig.json`
  - **Goal**: Provide a TypeScript config for type-checking the shared package source in isolation.
  - **Details**: Create `packages/shared/tsconfig.json` with:
    - `"compilerOptions"`: `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"strict": true`, `"noEmit": true`
    - `"include": ["src"]`
  - **Files**: `packages/shared/tsconfig.json`
  - **Verify**: `cat packages/shared/tsconfig.json` shows all required compiler options
  - **Brief ref**: Implementation step 3 / Files table row 3

- [x] TASK-04: Create `packages/shared/src/campaigns.ts` with Zod schemas
  - **Goal**: Define the shared Campaign domain Zod schemas and inferred TypeScript types.
  - **Details**: Read `server/src/campaigns/types.ts` to get the exact schema definitions, then create `packages/shared/src/campaigns.ts` containing only:
    - `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema`
    - Inferred type exports: `CampaignStatus`, `CampaignCategory`, `CampaignSummary`, `Campaign`
    - Do NOT include `RouteParamsSchema` or `ListQuerySchema` (server-specific)
    - Import zod as `import { z } from 'zod'`
  - **Files**: `packages/shared/src/campaigns.ts`
  - **Verify**: File exports all four schemas and four inferred types; no server-specific schemas present
  - **Brief ref**: Implementation step 4 / Files table row 4

- [x] TASK-05: Create `packages/shared/src/api.ts` with `ApiResponse<T>`
  - **Goal**: Define the generic API response envelope type matching the server's existing HTTP response shape.
  - **Details**: Create `packages/shared/src/api.ts` containing:

    ```ts
    export interface ApiResponse<T> {
      data: T
    }
    ```

  - **Files**: `packages/shared/src/api.ts`
  - **Verify**: File exports `ApiResponse` interface with a single `data: T` property
  - **Brief ref**: Implementation step 5 / Files table row 5

- [x] TASK-06: Create `packages/shared/src/index.ts` barrel export
  - **Goal**: Provide a single entry point that re-exports everything from both modules.
  - **Details**: Create `packages/shared/src/index.ts` with `.js` extensions in specifiers (required for NodeNext compatibility):

    ```ts
    export * from './campaigns.js'
    export * from './api.js'
    ```

  - **Files**: `packages/shared/src/index.ts`
  - **Verify**: File contains exactly two export-star statements with `.js` extensions
  - **Brief ref**: Implementation step 6 / Files table row 6

- [ ] TASK-07: Run `npm install` to wire workspace symlinks and verify
  - **Goal**: Create the `node_modules/@mmf/shared` symlink and confirm the full setup is valid.
  - **Details**:
    1. Run `npm install` from repo root
    1. Confirm `node_modules/@mmf/shared` is a symlink pointing to `packages/shared/`
    1. Run `cd packages/shared && npx tsc --noEmit` — must complete without errors
    1. Run `npm test` from repo root — must still pass
    1. Run `cd server && npm test` — must still pass
    1. Run `npm run build` from repo root — Vite build must succeed
  - **Files**: none (verification only)
  - **Verify**: All five commands above exit with code 0; symlink exists at `node_modules/@mmf/shared`
  - **Brief ref**: Implementation step 7 / Verification section
