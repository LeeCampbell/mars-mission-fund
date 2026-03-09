# Brief: Issue #54 — Move backend into packages/server

## Goal

Move the existing `server/` backend package into `packages/server/` as `@mmf/server`,
a proper npm workspace package that declares `@mmf/shared` as a dependency and imports
the shared Campaign types/schemas from it rather than re-defining them locally.
Root scripts and any path references are updated accordingly; the old `server/` directory
is deleted once the move is complete.

## Scope

**In scope:**

- Create `packages/server/` with all files moved from `server/`
- Rename package from `mars-mission-fund-server` to `@mmf/server` in `packages/server/package.json`
- Add `@mmf/shared` as a workspace dependency in `packages/server/package.json`
- Update `packages/server/src/campaigns/types.ts` to import shared Campaign types/schemas
  from `@mmf/shared` instead of defining them locally; keep server-specific schemas
  (`RouteParamsSchema`, `ListQuerySchema`) in place
- Update root `package.json` scripts (`dev:server`, `test:server`) from `--prefix server`
  to npm workspaces syntax (`-w @mmf/server`)
- Delete the old `server/` directory

**Out of scope:**

- Creating `packages/shared/` (`@mmf/shared`) — that is issue #52 and must be complete first
- Adding the `"workspaces"` field to the root `package.json` — that is part of issue #52
- Moving the frontend (`src/`) — that is issue #53
- Any changes to `docker-compose.dev.yml` (it has no server source-path references)
- Any changes to ESLint, CI, or root tooling config — that is issue #55
- Changes to `src/api/campaigns.ts` (frontend API layer uses its own types)

## Approach

**Pre-condition:** Issue #52 (`packages/shared/`) must be merged so that `@mmf/shared`
exists in the workspace and exports the shared Campaign types.

**Step 1 — Scaffold `packages/server/`**
Create the directory and write `packages/server/package.json`:

- `"name": "@mmf/server"`, keep all existing `dependencies` and `devDependencies`
- Add `"@mmf/shared": "*"` to `dependencies` (workspace resolution picks up the local package)
- Retain `"type": "module"` and all scripts unchanged

**Step 2 — Move config files**
Copy `server/tsconfig.json` and `server/vitest.config.ts` verbatim to `packages/server/`.
No content changes required; the configs reference relative paths (`src/**/*`, `dist/`) that
remain valid.

**Step 3 — Move source files**
Move the entire `server/src/` tree to `packages/server/src/` and `server/db/` to
`packages/server/db/`.
All internal imports already use `.js` extensions (NodeNext requirement) and relative paths
that stay valid after the flat directory move.

**Step 4 — Update `packages/server/src/campaigns/types.ts`**
Replace the locally-defined shared types with imports from `@mmf/shared`:

```ts
// Replace local definitions of these with imports:
import {
  CampaignStatusSchema,
  CampaignCategorySchema,
  CampaignSummarySchema,
  CampaignSchema,
} from '@mmf/shared'
export type { CampaignStatus, CampaignCategory, CampaignSummary, Campaign } from '@mmf/shared'
```

Keep `RouteParamsSchema`, `ListQuerySchema`, and their inferred types (`RouteParams`,
`ListQuery`) defined locally — these are server-only validation schemas.

**Step 5 — Update root `package.json` scripts**

```json
"dev:server":  "npm run dev  -w @mmf/server",
"test:server": "npm run test -w @mmf/server"
```

**Step 6 — Delete `server/`**
Remove the old `server/` directory in its entirety once all files are confirmed moved.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/server/package.json` | create | `@mmf/server` with `@mmf/shared` dep; all other deps preserved |
| `packages/server/tsconfig.json` | create | Verbatim copy of `server/tsconfig.json` |
| `packages/server/vitest.config.ts` | create | Verbatim copy of `server/vitest.config.ts` |
| `packages/server/src/index.ts` | create | Move from `server/src/index.ts` |
| `packages/server/src/app.ts` | create | Move from `server/src/app.ts` |
| `packages/server/src/db/pool.ts` | create | Move from `server/src/db/pool.ts` |
| `packages/server/src/campaigns/types.ts` | create | Move + replace shared type defs with `@mmf/shared` imports |
| `packages/server/src/campaigns/queries.ts` | create | Move from `server/src/campaigns/queries.ts` |
| `packages/server/src/campaigns/routes.ts` | create | Move from `server/src/campaigns/routes.ts` |
| `packages/server/src/middleware/correlationId.ts` | create | Move |
| `packages/server/src/middleware/errorHandler.ts` | create | Move |
| `packages/server/src/middleware/requestLogger.ts` | create | Move |
| `packages/server/src/__tests__/campaigns.test.ts` | create | Move |
| `packages/server/db/migrations/*.sql` (6 files) | create | Move SQL migration files |
| `package.json` (root) | modify | Update `dev:server` and `test:server` scripts |
| `server/` | delete | Remove entire directory after move |

> **Note:** Do NOT copy `server/package-lock.json` to `packages/server/`.
> With npm workspaces the root `package-lock.json` manages all workspace packages;
> individual lock files inside workspace packages are ignored and cause confusion.

## Dependencies

- **Issue #52** (Create shared types package) must be merged before this issue can be
  implemented. `@mmf/shared` must exist and export `CampaignStatusSchema`,
  `CampaignCategorySchema`, `CampaignSummarySchema`, `CampaignSchema`, and the
  corresponding TypeScript types.
- No new npm packages required — all existing deps in `server/package.json` carry over.

## Verification

- **Build:** `npm run build -w @mmf/server` (or `tsc` inside `packages/server/`) succeeds
  with no TypeScript errors.
- **Tests:** `npm run test:server` from the repo root passes all 7 existing test cases in
  `packages/server/src/__tests__/campaigns.test.ts`.
- **Dev server:** `npm run dev:server` starts Express on port 3000 without error.
- **Old path gone:** Running `ls server/` from repo root returns "no such file or directory".
- **No root breakage:** `npm run build` and `npm test` (frontend) still succeed.
