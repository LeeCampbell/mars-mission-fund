# Tasks: Issue #67 — Milestone housekeeping: client-server-integration

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create plan/client-server-integration/tasks/03-close.tasks.md
  - **Goal**: Establish the task file that documents this housekeeping work in the milestone's task history.
  - **Details**: Create directory `plan/client-server-integration/tasks/` if it doesn't exist. Write `03-close.tasks.md` listing individual TASK entries (one per spec change) that mirror the work done in TASK-02 through TASK-06 of this checklist. Follow the task-file format used in earlier milestone task files (TASK-XX header, Goal, Files, Notes).
  - **Files**: `plan/client-server-integration/tasks/03-close.tasks.md` (create)
  - **Verify**: File exists at the correct path and contains at least five TASK entries corresponding to each spec/code change.
  - **Brief ref**: Approach §1

- [x] TASK-02: Update specs/tech/architecture.md — success envelope and camelCase convention
  - **Goal**: Document the `{ "data": ... }` success response envelope and the camelCase API field naming convention in Section 6.1 (Synchronous Communication).
  - **Details**:
    - In Section 6.1, immediately before the existing `#### Error Response Format` subsection, add a new `#### Success Response Envelope` subsection with the JSON example showing both single-resource (`{ "data": { ... } }`) and collection (`{ "data": [ ... ] }`) forms, and a note that this is implemented in `packages/server/src/campaigns/routes.ts`.
    - After the success envelope subsection, add a `#### Field Naming Convention` subsection explaining that DB columns use `snake_case`, all API JSON responses use `camelCase`, and the server query layer is responsible for aliasing column names.
    - Bump the spec version from `0.5` to `0.6`.
    - Append a change-log entry (date: today, author: Claude) describing the additions.
  - **Files**: `specs/tech/architecture.md` (modify)
  - **Verify**: Section 6.1 contains both new subsections; front-matter version reads `0.6`; change-log has a new entry.
  - **Brief ref**: Approach §2

- [x] TASK-03: Update packages/shared/src/campaign.ts — camelCase fields and nested schemas
  - **Goal**: Align shared Zod schemas with the camelCase field names emitted by the implemented server API, and add nested entity schemas needed for the campaign detail endpoint.
  - **Details**:
    - In `CampaignSummarySchema`: rename `goal_amount` → `goalAmount`, `raised_amount` → `raisedAmount`, `created_at` → `createdAt`.
    - In `CampaignSchema`: rename all snake_case fields to camelCase equivalents: `alignment_statement` → `alignmentStatement`, `hero_image_url` → `heroImageUrl`, `min_funding_target_usd` → `minFundingTargetUsd`, `max_funding_cap_usd` → `maxFundingCapUsd`, `current_amount_usd` → `currentAmountUsd`, `contributor_count` → `contributorCount`, `launched_at` → `launchedAt`, `created_at` → `createdAt`, `updated_at` → `updatedAt`.
    - Add new Zod schemas: `MilestoneSchema`, `StretchGoalSchema`, `TeamMemberSchema`, `CampaignUpdateSchema`, each with camelCase field names matching the client's current inline interfaces in `packages/client/src/api/campaigns.ts`.
    - Add `CampaignDetailSchema` that extends `CampaignSchema` with arrays: `milestones`, `stretchGoals`, `teamMembers`, `updates`.
    - Export TypeScript types for every new schema (`Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`, `CampaignDetail`).
    - Update existing type exports (`CampaignSummary`, `Campaign`) to remain in sync.
  - **Files**: `packages/shared/src/campaign.ts` (modify)
  - **Verify**: `npm run typecheck` passes; all exported type names are intact; new schemas are exported from `packages/shared/src/index.ts` (add exports there if missing).
  - **Brief ref**: Approach §3

- [x] TASK-04: Update packages/client/src/api/campaigns.ts — import from @mmf/shared, remove mock fallbacks
  - **Goal**: Replace the client's duplicate inline type definitions with imports from `@mmf/shared`, and remove the mock-data fallback that masks real server errors.
  - **Details**:
    - Remove the inline `Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`, and `Campaign` interface declarations.
    - Add `import type { CampaignSummary, CampaignDetail, Milestone, StretchGoal, TeamMember, CampaignUpdate } from '@mmf/shared'` (adjust names to match what `@mmf/shared` exports after TASK-03).
    - Update `fetchCampaigns` to unwrap the `{ data: [...] }` envelope: `const json = await response.json(); return json.data as CampaignSummary[]`.
    - Update `fetchCampaign` to unwrap the `{ data: { ... } }` envelope: `const json = await response.json(); return json.data as CampaignDetail`.
    - Remove the `mockCampaign` and `mockCampaigns` constants and the catch-block fallbacks; replace with a `throw` so callers see real errors.
    - Re-export types that downstream components may import from this module to preserve backward compatibility: `export type { Milestone, StretchGoal, TeamMember, CampaignUpdate } from '@mmf/shared'`.
  - **Files**: `packages/client/src/api/campaigns.ts` (modify)
  - **Verify**: `npm run typecheck` passes; `npm run lint` passes; no inline interface declarations remain; fetch functions unwrap `data` envelope.
  - **Brief ref**: Approach §3

- [x] TASK-05: Update specs/learnings.md — add four learnings from issues #65 and #66
  - **Goal**: Capture the gotchas discovered during issues #65 and #66 so future agents avoid repeating them.
  - **Details**: Append four new `##` sections to `specs/learnings.md`:
    1. **Port mismatch** — Vite proxy target port must match `PORT` in `packages/server/.env`; they drifted (3001 vs 3000); always keep in sync.
    1. **camelCase transformation** — Server aliases snake_case DB columns to camelCase in SQL `SELECT` (e.g. `min_funding_target_usd AS minFundingTargetUsd`); shared Zod schemas must use camelCase to match API responses.
    1. **Nested entity queries** — Campaign detail endpoint fetches milestones, stretch goals, team members, and updates via separate SQL queries, assembles in application code, and returns a single `CampaignDetail`; this avoids complex joins.
    1. **Mock data removal** — Client API layer previously fell back to inline mock data on any error; after integration this fallback is removed and the UI renders loading/error states instead; required for E2E tests to reliably detect server-error states.
  - **Files**: `specs/learnings.md` (modify)
  - **Verify**: File contains all four new `##` sections; `npm run lint` (markdownlint) passes.
  - **Brief ref**: Approach §4

- [ ] TASK-06: Update specs/tech/tech-stack.md — Playwright CI requirements, bump to 0.4.0
  - **Goal**: Document the CI infrastructure requirements added by issue #66 so future contributors know what the test environment needs.
  - **Details**:
    - Locate the existing Playwright row/paragraph in the Testing section.
    - Add a sub-note (indented bullet list or paragraph) under the Playwright entry listing: `postgres:16-alpine` CI service required; DBMate migrations run before suite; seed SQL script applied before E2E tests; Playwright config at `e2e/playwright.config.ts`, tests at `e2e/*.spec.ts`.
    - Bump spec version from `0.3.0` to `0.4.0` in the front-matter.
    - Append a change-log entry (date: today, author: Claude) describing the Playwright CI note addition.
  - **Files**: `specs/tech/tech-stack.md` (modify)
  - **Verify**: Front-matter version reads `0.4.0`; Testing section contains the new CI requirements note; change-log has a new entry; `npm run lint` passes.
  - **Brief ref**: Approach §5

- [ ] TASK-07: Verify full build, typecheck, lint, and tests
  - **Goal**: Confirm all workspace packages build and pass quality gates after the schema and type changes.
  - **Details**:
    - Run `npm run build` from the repo root; confirm zero errors.
    - Run `npm run typecheck` from the repo root; confirm zero type errors.
    - Run `npm run lint` from the repo root; confirm zero new lint violations.
    - Run `npm test` from the repo root; confirm all unit/integration tests pass.
    - If any failures arise, fix the root cause in the affected file before marking this task done.
  - **Files**: No new files; fixes only if verification reveals issues.
  - **Verify**: All four commands exit with code 0.
  - **Brief ref**: Verification section
