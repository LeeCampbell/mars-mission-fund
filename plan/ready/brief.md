# Brief: Issue #67 — Milestone housekeeping: client-server-integration

## Goal

Close out the "Client-Server Integration" milestone by reconciling specs with implemented code.
Issues #65 (Fix client-server integration) and #66 (Add Playwright E2E tests) introduce three new patterns not yet documented in the specs: a `{ "data": ... }` success response envelope, server-side camelCase transformation of snake_case DB columns, and nested entity queries on the campaign detail endpoint.
This issue updates `specs/tech/architecture.md`, `packages/shared/src/campaign.ts`, `specs/tech/tech-stack.md`, and `specs/learnings.md` to reflect these patterns, and creates the task file `plan/client-server-integration/tasks/03-close.tasks.md`.

## Scope

**In scope:**

- Create `plan/client-server-integration/tasks/03-close.tasks.md` with TASK entries covering each spec update
- Update `specs/tech/architecture.md` (L3-001) to document the success response envelope and camelCase API naming convention
- Update `packages/shared/src/campaign.ts` to use camelCase field names matching the implemented API responses, and add nested entity schemas (Milestone, StretchGoal, TeamMember, CampaignUpdate, CampaignDetail)
- Update `packages/shared/src/api.ts` if the `ApiResponse<T>` type needs annotation adjustments after the schema changes
- Update `specs/learnings.md` to capture gotchas discovered during issues #65 and #66
- Update `specs/tech/tech-stack.md` (L3-008) to document Playwright CI requirements (PostgreSQL service, migrations, seed data) if not already present
- Bump version numbers and change-log entries in every modified spec

**Out of scope:**

- Implementing issue #65 (Fix client-server integration) — prerequisite
- Implementing issue #66 (Playwright E2E tests) — prerequisite
- Changes to `packages/server/` query or route code (already implemented by #65)
- Changes to `packages/client/` component or hook code (already implemented by #65)
- New domain specs (L4) or security/reliability spec updates
- Any new features beyond reconciling specs with implemented code

## Approach

### 1. Create the task file

Create directory `plan/client-server-integration/tasks/` and write `03-close.tasks.md` with individual TASK entries for each spec change listed below.
Follow the same task file format used in previous milestones.

### 2. Update `specs/tech/architecture.md` (L3-001)

Section 6.1 (Synchronous Communication) currently documents only the **error** response format.
Add a **Success Response Envelope** subsection immediately before the error format:

```json
{
  "data": "<resource or array of resources>"
}
```

- Single-resource endpoints return `{ "data": { ... } }`.
- Collection endpoints return `{ "data": [ ... ] }`.
- This envelope is already implemented by `packages/server/src/campaigns/routes.ts` (`res.json({ data: ... })`).

Add a **Field Naming Convention** note in the same section:

- DB columns use `snake_case` (PostgreSQL convention).
- All API JSON responses use `camelCase` field names.
- The server query layer is responsible for aliasing or transforming column names before returning data to routes.

Bump version from `0.5` to `0.6` and add a change-log entry.

### 3. Update `packages/shared/src/campaign.ts`

This file currently defines Zod schemas with **snake_case** field names
(`goal_amount`, `raised_amount`, `hero_image_url`, `min_funding_target_usd`, etc.)
matching raw DB column names, not the implemented API responses.
After issue #65 the server emits camelCase; the shared types must match.

Changes:

- Rename `CampaignSummarySchema` fields: `goal_amount` → `goalAmount`, `raised_amount` → `raisedAmount`.
- Rename `CampaignSchema` fields: all snake_case column names → camelCase equivalents
  (`heroImageUrl`, `minFundingTargetUsd`, `maxFundingCapUsd`, `currentAmountUsd`, `contributorCount`, `launchedAt`, `createdAt`, `updatedAt`, `alignmentStatement`).
- Add nested entity schemas: `MilestoneSchema`, `StretchGoalSchema`, `TeamMemberSchema`, `CampaignUpdateSchema`.
- Add `CampaignDetailSchema` extending `CampaignSchema` with the four nested arrays.
- Export corresponding TypeScript types.

The client's `packages/client/src/api/campaigns.ts` currently defines its own inline interfaces
(`Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`, `Campaign`).
After this change, those types come from `@mmf/shared`; the client file should re-export or import from `@mmf/shared`.
This is a code reconciliation — update the client file to import from `@mmf/shared` and remove the duplicate inline type definitions.

### 4. Update `specs/learnings.md`

Add entries for:

- **Port mismatch**: Vite proxy must target the same port as `packages/server/.env` (or root `.env`) `PORT` variable.
  They drifted to 3001 vs 3000; always keep them in sync.
- **camelCase transformation**: The server aliases snake_case DB columns to camelCase in SQL `SELECT` statements
  (e.g. `min_funding_target_usd AS minFundingTargetUsd`).
  Shared Zod schemas in `@mmf/shared` must use camelCase to match API responses, not snake_case DB columns.
- **Nested entity queries**: The campaign detail endpoint fetches milestones, stretch goals, team members,
  and updates via separate SQL queries in the same request handler,
  assembles the result in application code, and returns a single `CampaignDetail` object.
  This avoids complex joins while keeping the DB access layer simple.
- **Mock data removal**: The client API layer (`packages/client/src/api/campaigns.ts`) previously fell back
  to inline mock data on any error.
  After integration, this fallback is removed; the UI renders loading/error states instead.
  This is required for E2E tests to reliably detect server-error states.

### 5. Update `specs/tech/tech-stack.md` (L3-008)

Playwright was already listed in the Testing section.
Add a note under that section specifying the CI requirements added by issue #66:

- Requires a `postgres:16-alpine` service in CI.
- Migrations run via DBMate before the test suite.
- Seed data is applied via a dedicated seed SQL script before E2E tests.
- Playwright config lives at `e2e/playwright.config.ts`; tests live at `e2e/*.spec.ts`.

Bump version from `0.3.0` to `0.4.0` and add a change-log entry.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `plan/client-server-integration/tasks/03-close.tasks.md` | create | Task breakdown for this housekeeping issue |
| `specs/tech/architecture.md` | modify | Add success response envelope and camelCase field naming convention in Section 6.1; bump version to 0.6 |
| `packages/shared/src/campaign.ts` | modify | Rename all schema fields to camelCase; add nested entity schemas (Milestone, StretchGoal, TeamMember, CampaignUpdate, CampaignDetail) |
| `packages/client/src/api/campaigns.ts` | modify | Replace inline type definitions with imports from `@mmf/shared`; remove duplicate interfaces |
| `specs/learnings.md` | modify | Add four new learnings from issues #65 and #66 |
| `specs/tech/tech-stack.md` | modify | Add CI requirements note for Playwright; bump version to 0.4.0 |

## Dependencies

- Issues #65 (Fix client-server integration) and #66 (Playwright E2E tests) must be merged first;
  this issue reconciles specs against the patterns they introduce.
- No new npm packages are required.
- No external services are needed beyond what the milestone has already established.

## Verification

- **Build**: `npm run build` succeeds from the repo root (all workspaces).
- **Type-check**: `npm run typecheck` succeeds (shared types are camelCase; client and server import them correctly).
- **Linting**: `npm run lint` passes with no new violations.
- **Tests**: `npm test` passes (unit and integration tests in client and server still green after type rename).
- **Spec consistency**: Every modified spec file has an updated version number and change-log entry.
- **Visual**: No runtime change — this issue is purely spec and type reconciliation;
  the running application at `http://localhost:5173` should behave identically to after #65 and #66 land.
