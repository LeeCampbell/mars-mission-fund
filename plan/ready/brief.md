# Brief: Issue #57 — Milestone housekeeping: npm-workspaces

## Goal

Update the project specifications to reflect the completed npm workspaces monorepo restructuring.
The code migration has already been implemented (`packages/client`, `packages/server`, and `packages/shared` all exist; the root `package.json` declares `"workspaces": ["packages/*"]`), but the specs still reference the legacy `server/` path and lack an ADR capturing the architectural decisions made during migration.
This housekeeping task corrects those spec references and records the decision rationale.

## Scope

**In scope:**

- Update L3-001 (`specs/tech/architecture.md`) local demo scope note: change `server/` → `packages/server/`
- Update L3-008 (`specs/tech/tech-stack.md`) Local Development section: update DBMate migration path, Express server run command, and directory layout from `server/` to `packages/server/`
- Create `specs/adrs/0001-npm-workspaces-monorepo.md` capturing the decision rationale for npm workspaces vs Turborepo/Nx and `packages/` vs `src/` directory structure
- Update `specs/README.md` to reference the new `specs/adrs/` directory in the File System Layout and the Tooling table

**Out of scope:**

- Any source code changes (monorepo migration is already complete)
- Changes to L4 domain specs (they contain no `server/` path references)
- Changes to CI workflow, ESLint config, or any `package.json` files

## Approach

All changes are documentation-only within `specs/`.
Work in this order:

1. Create `specs/adrs/` directory and write `0001-npm-workspaces-monorepo.md` using the ADR template defined in L3-001 Section 7.2.
   The ADR must explain why npm workspaces was chosen over Turborepo/Nx, and why `packages/` was chosen over `src/`.
2. Update `specs/tech/architecture.md` — change the local demo scope note in Section 1 from `server/` to `packages/server/`, update the run command to use the workspace script (`npm run dev:server` from the repo root or `npm run dev` inside `packages/server/`), and bump the version and change log.
3. Update `specs/tech/tech-stack.md` — in the Local Development section:
   - DBMate invocation: `server/db/migrations/` → `packages/server/db/migrations/` and Docker volume `-v "$(pwd)/server/db:/db"` → `-v "$(pwd)/packages/server/db:/db"`
   - Express server run command: `cd server && npm run dev` → `npm run dev:server` (from repo root) — this matches the root `package.json` `dev:server` script
   - Server Directory Layout code block: `server/` → `packages/server/`
   - Bump version and change log
4. Update `specs/README.md` to add the `specs/adrs/` entry to the File System Layout diagram and add a Tooling table row for ADRs.

All edits must comply with L3-007 (one sentence per line, no trailing whitespace, proper heading levels, no bare URLs).

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `specs/adrs/0001-npm-workspaces-monorepo.md` | create | ADR: npm workspaces vs Turborepo/Nx; `packages/` vs `src/` |
| `specs/tech/architecture.md` | modify | Section 1 local demo scope: `server/` → `packages/server/`; bump version + change log |
| `specs/tech/tech-stack.md` | modify | Local Development section: update DBMate path, Express run command, directory layout; bump version + change log |
| `specs/README.md` | modify | Add `specs/adrs/` to File System Layout; add ADR row to Tooling table |

## Dependencies

None.
No npm packages or external services are required.
All changes are documentation files only.

## Verification

- **Build**: `npm run build` succeeds (no code changes; confirms no regressions)
- **Markdown lint**: `npm run lint:md` passes on all modified `.md` files
- **Manual review**:
  - No occurrence of `server/` (without `packages/`) remains in modified spec files
  - `specs/adrs/0001-npm-workspaces-monorepo.md` exists and follows the ADR template from L3-001 Section 7.2
  - `specs/README.md` File System Layout includes `specs/adrs/`
  - ADR status is `Accepted` (the decision is already implemented)
