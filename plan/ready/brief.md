# Brief: Issue #53 — Move frontend into packages/client

## Goal

Restructure the repository into an npm workspaces monorepo by moving all
frontend source files from the root `src/` directory into a new
`packages/client/` package named `@mmf/client`.
The root-level `index.html`, `vite.config.ts`, `tsconfig.app.json`, and
`tsconfig.node.json` move into `packages/client/` as well.
The root `package.json` gains a `workspaces` field, root `tsconfig.json`
switches to project references pointing at `packages/client`, and
Campaign-type imports are updated to consume `@mmf/shared` (from issue #50).

## Scope

**In scope:**

- Add `"workspaces": ["packages/*"]` to root `package.json`
- Create `packages/client/package.json` (`name: "@mmf/client"`, private, with
  all current frontend `dependencies` and `devDependencies`)
- Move `src/` → `packages/client/src/`
- Move `index.html` → `packages/client/index.html`
- Move `vite.config.ts` → `packages/client/vite.config.ts`
  (update coverage paths `src/**` → `packages/client/src/**` if needed,
  though relative paths inside the package stay the same)
- Move `tsconfig.app.json` → `packages/client/tsconfig.json`
  (rename; update `baseUrl` and `paths` to be relative to
  `packages/client/`, keep `@/*` alias pointing at `src/*`)
- Move `tsconfig.node.json` → removed (its only job was covering root
  `vite.config.ts`; the config now lives inside `packages/client/`)
- Update root `tsconfig.json` references from
  `[tsconfig.app.json, tsconfig.node.json]` to `[packages/client]`
- Update `src/api/campaigns.ts` (now `packages/client/src/api/campaigns.ts`)
  to import Campaign types from `@mmf/shared` instead of defining them inline
  (assumes `packages/shared` exists from issue #50)
- Update root `package.json` scripts that reference root-level `vite` /
  `tsc -b` to delegate to the client package (e.g. `npm run build -w @mmf/client`)
- Update `eslint.config.js` if it has hard-coded `server/` or root-only ignores
  that need expanding for the new `packages/` tree (currently it ignores
  `dist/`, `node_modules/`, `server/` — likely fine as-is)

**Out of scope:**

- Creating `packages/shared` — that is issue #50 and must be completed first
- Moving or modifying the `server/` package
- Any UI or feature changes
- Adding new tests beyond what is required for the structural move
- CI / Docker changes

## Approach

This is a pure file-move and configuration-wiring task.
No application logic changes; all imports that use the `@/*` alias continue
to resolve correctly because the alias is re-declared in
`packages/client/tsconfig.json` relative to `packages/client/`.

**Step 1 — Root workspace setup**
Add `"workspaces": ["packages/*"]` to root `package.json`.
Remove the frontend `dependencies` / `devDependencies` from the root (they
move to `packages/client/package.json`).
Keep root-level `devDependencies` that apply to the whole repo
(eslint, prettier, markdownlint-cli2).
Update root scripts to delegate: `"build": "npm run build -w @mmf/client"`,
`"dev": "npm run dev -w @mmf/client"`, `"test": "npm run test -w @mmf/client"`.

**Step 2 — Create packages/client**
`packages/client/package.json`:

```json
{
  "name": "@mmf/client",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": { /* same as current root frontend scripts */ },
  "dependencies": { /* react, react-dom, react-router, @tanstack/react-query, @mmf/shared */ },
  "devDependencies": { /* vite, tailwindcss, typescript, vitest, testing-library, etc. */ }
}
```

**Step 3 — Move files**
`git mv src packages/client/src`
`git mv index.html packages/client/index.html`
`git mv vite.config.ts packages/client/vite.config.ts`

### Step 4 — tsconfig wiring

- Rename/move `tsconfig.app.json` → `packages/client/tsconfig.json`.
  Change `"baseUrl": "."` → stays `.` (relative to `packages/client/`),
  `"paths": { "@/*": ["src/*"] }` stays correct.
  Change `"include": ["src"]` stays correct.
- Delete `tsconfig.node.json` from root.
- Update root `tsconfig.json`:

  ```json
  { "files": [], "references": [{ "path": "./packages/client" }] }
  ```

**Step 5 — Update Campaign type imports**
In `packages/client/src/api/campaigns.ts`, replace the inline interface
definitions (`Campaign`, `Milestone`, `StretchGoal`, `TeamMember`,
`CampaignUpdate`) with:

```ts
import type { Campaign, Milestone, StretchGoal, TeamMember, CampaignUpdate } from '@mmf/shared'
```

Keep `fetchCampaigns` and `fetchCampaign` functions and the mock data
unchanged.

**Step 6 — Verification**
Run `npm install` from root (npm workspaces links packages).
Run `npm run build` from root → delegates to `packages/client`, must succeed.
Run `npm run test` from root → all frontend tests pass.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `package.json` | modify | Add `workspaces: ["packages/*"]`; move frontend deps to client package; update scripts to delegate via `-w @mmf/client` |
| `packages/client/package.json` | create | New package manifest `@mmf/client`; all frontend deps |
| `packages/client/src/` | create (move) | All of `src/` moved here |
| `packages/client/index.html` | create (move) | Root `index.html` moved here |
| `packages/client/vite.config.ts` | create (move) | Root `vite.config.ts` moved here; paths stay relative |
| `packages/client/tsconfig.json` | create (from move) | `tsconfig.app.json` renamed/moved; baseUrl and paths stay correct |
| `tsconfig.json` | modify | References updated: remove `tsconfig.app.json`/`tsconfig.node.json`, add `./packages/client` |
| `tsconfig.app.json` | delete | Superseded by `packages/client/tsconfig.json` |
| `tsconfig.node.json` | delete | No longer needed; vite config lives inside client package |
| `packages/client/src/api/campaigns.ts` | modify | Replace inline type definitions with `import type` from `@mmf/shared` |

## Dependencies

- **Issue #50 must be merged first**: `packages/shared` (`@mmf/shared`) must
  exist and export `Campaign`, `Milestone`, `StretchGoal`, `TeamMember`,
  `CampaignUpdate` types before step 5 can be completed.
- No new npm packages required beyond what is already installed.

## Verification

- **Build**: `npm run build` from repo root succeeds (tsc + vite build via
  workspace delegation)
- **Dev server**: `npm run dev` starts Vite at `http://localhost:5173`;
  campaign listing and detail pages render correctly
- **Tests**: `npm run test` from root passes all existing frontend tests
  (currently in `packages/client/src/pages/*.test.tsx`)
- **Type check**: `tsc -b` at root resolves project references and reports
  no errors
- **No orphan files**: `src/`, `index.html`, `vite.config.ts`,
  `tsconfig.app.json`, `tsconfig.node.json` no longer exist at the repo root
