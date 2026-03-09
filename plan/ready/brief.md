# Brief: Issue #52 — Create shared types package

## Goal

Create `packages/shared/` as the first step in converting the repository to an npm workspaces monorepo.
The package (`@mmf/shared`) becomes the single source of truth for Campaign domain types and Zod schemas
shared between the Express server and the React frontend, and introduces the `ApiResponse<T>` envelope
that the server already uses at the HTTP layer.

## Scope

**In scope:**

- Add `"workspaces": ["packages/*"]` to root `package.json`
- Create `packages/shared/` with `package.json`, `tsconfig.json`, and source files
- Migrate the core Campaign Zod schemas from `server/src/campaigns/types.ts` into the shared package:
  `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema`
  (and their inferred TypeScript types)
- Add `ApiResponse<T>` generic envelope type matching the server's existing response shape `{ data: T }`
- Barrel-export everything from `packages/shared/src/index.ts`
- Run `npm install` from the repo root to wire up the workspace symlinks

**Out of scope:**

- Updating `server/src/campaigns/types.ts` to import from `@mmf/shared` (a later task)
- Updating `src/api/campaigns.ts` to import from `@mmf/shared` (a later task)
- Deleting or deprecating the now-duplicate server types (a later task)
- Frontend camelCase → snake_case type alignment (a later task)
- Production build pipeline for the shared package (CI concern, not this milestone)
- Publishing the package to any npm registry

## Approach

The repository uses two distinct TypeScript environments with different module resolution settings:

- **Frontend** (`tsconfig.app.json`): `"moduleResolution": "bundler"` — Vite handles transpilation
- **Server** (`server/tsconfig.json`): `"moduleResolution": "NodeNext"` — tsx handles transpilation in dev

For workspace packages, both resolvers follow the `package.json` `exports` field.
Pointing `exports` at raw `.ts` source works with both Vite and tsx, so no compiled `dist/` is needed
for this milestone (the shared package ships TypeScript source).

**Implementation steps:**

1. **Root `package.json`** — add `"workspaces": ["packages/*"]` alongside existing fields.
   The root already has `"private": true` (confirmed), which is required for npm workspaces.

1. **`packages/shared/package.json`** — declare `@mmf/shared` with:
   - `"name": "@mmf/shared"`, `"version": "0.0.1"`, `"private": true`, `"type": "module"`
   - `"exports": { ".": "./src/index.ts" }` — points resolvers at TypeScript source
   - `"dependencies": { "zod": "^3" }` — Zod is consumed directly in the schemas

1. **`packages/shared/tsconfig.json`** — minimal config for type-checking the shared source:
   - `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"strict": true`, `"noEmit": true`
   - `"include": ["src"]`

1. **`packages/shared/src/campaigns.ts`** — copy and adapt from `server/src/campaigns/types.ts`:
   - Keep `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema`
   - Keep their inferred type exports (`CampaignStatus`, `CampaignCategory`, `CampaignSummary`, `Campaign`)
   - **Do not include** `RouteParamsSchema` or `ListQuerySchema` — those are server-specific Express helpers

1. **`packages/shared/src/api.ts`** — define the response envelope:

   ```ts
   export interface ApiResponse<T> {
     data: T
   }
   ```

1. **`packages/shared/src/index.ts`** — barrel re-export from both modules:

   ```ts
   export * from './campaigns.js'
   export * from './api.js'
   ```

   Use `.js` extensions in re-exports so the barrel also works under NodeNext resolution when
   the server eventually imports from `@mmf/shared` (NodeNext requires extensioned specifiers even
   for `.ts` source files in packages).

1. **`npm install`** from repo root — creates the `node_modules/@mmf/shared` symlink.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `package.json` | modify | Add `"workspaces": ["packages/*"]` |
| `packages/shared/package.json` | create | `@mmf/shared` package manifest; `"type": "module"`, zod dep, exports pointing to `./src/index.ts` |
| `packages/shared/tsconfig.json` | create | TypeScript config for type-checking the shared package source |
| `packages/shared/src/campaigns.ts` | create | `CampaignStatusSchema`, `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema` (Zod) + inferred types |
| `packages/shared/src/api.ts` | create | `ApiResponse<T>` generic envelope interface |
| `packages/shared/src/index.ts` | create | Barrel: `export * from './campaigns.js'` and `export * from './api.js'` |

## Dependencies

- **Zod** — already in `server/package.json`; must also be declared in `packages/shared/package.json`
  so the shared package is self-contained.
  No new npm packages are required.

## Verification

- **Workspace link**: after `npm install`, `node_modules/@mmf/shared` is a symlink to `packages/shared/`
- **TypeScript**: `cd packages/shared && npx tsc --noEmit` completes without errors
- **Frontend build**: `npm run build` from repo root succeeds (Vite resolves `@mmf/shared` via the symlink)
- **Server tests**: `cd server && npm test` still passes (server types are unchanged in this issue)
- **Root tests**: `npm test` from repo root still passes
