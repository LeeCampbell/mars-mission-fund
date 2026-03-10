# Tasks: Issue #67 — Milestone housekeeping: client-server-integration

Housekeeping tasks to close out the client-server-integration milestone by reconciling
specs with the patterns introduced by issues #65 and #66.

---

## TASK-01: Create this task file

- **Goal**: Establish the task file that documents this housekeeping work in the milestone's task history.
- **Files**: `plan/client-server-integration/tasks/03-close.tasks.md` (create)
- **Notes**: Directory `plan/client-server-integration/tasks/` created as part of this task.

---

## TASK-02: Update specs/tech/architecture.md — success envelope and camelCase convention

- **Goal**: Document the `{ "data": ... }` success response envelope and the camelCase API field naming convention in Section 6.1 (Synchronous Communication).
- **Files**: `specs/tech/architecture.md` (modify)
- **Notes**:
  - Add `#### Success Response Envelope` subsection immediately before `#### Error Response Format`.
  - Add `#### Field Naming Convention` subsection after the success envelope.
  - Bump spec version from `0.5` to `0.6`.
  - Append change-log entry (date: 2026-03-10, author: Claude).

---

## TASK-03: Update packages/shared/src/campaign.ts — camelCase fields and nested schemas

- **Goal**: Align shared Zod schemas with the camelCase field names emitted by the implemented server API, and add nested entity schemas needed for the campaign detail endpoint.
- **Files**: `packages/shared/src/campaign.ts` (modify), `packages/shared/src/index.ts` (modify if needed)
- **Notes**:
  - Rename `CampaignSummarySchema` fields: `goal_amount` → `goalAmount`, `raised_amount` → `raisedAmount`, `created_at` → `createdAt`.
  - Rename all `CampaignSchema` snake_case fields to camelCase equivalents.
  - Add `MilestoneSchema`, `StretchGoalSchema`, `TeamMemberSchema`, `CampaignUpdateSchema`.
  - Add `CampaignDetailSchema` extending `CampaignSchema` with nested arrays.
  - Export TypeScript types for all new and updated schemas.

---

## TASK-04: Update packages/client/src/api/campaigns.ts — import from @mmf/shared, remove mock fallbacks

- **Goal**: Replace the client's duplicate inline type definitions with imports from `@mmf/shared`, and remove the mock-data fallback that masks real server errors.
- **Files**: `packages/client/src/api/campaigns.ts` (modify)
- **Notes**:
  - Remove inline `Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`, and `Campaign` interface declarations.
  - Import types from `@mmf/shared`.
  - Update `fetchCampaigns` and `fetchCampaign` to unwrap `{ data: ... }` envelope.
  - Remove `mockCampaign`/`mockCampaigns` constants and catch-block fallbacks; throw on error.
  - Re-export types from `@mmf/shared` for backward compatibility.

---

## TASK-05: Update specs/learnings.md — add four learnings from issues #65 and #66

- **Goal**: Capture the gotchas discovered during issues #65 and #66 so future agents avoid repeating them.
- **Files**: `specs/learnings.md` (modify)
- **Notes**:
  - Add entry: Port mismatch — Vite proxy target port must match `PORT` in server `.env`.
  - Add entry: camelCase transformation — server aliases snake_case DB columns to camelCase in SQL `SELECT`.
  - Add entry: Nested entity queries — campaign detail fetches related data via separate SQL queries assembled in application code.
  - Add entry: Mock data removal — client API fallback removed; UI now renders loading/error states for reliable E2E testing.

---

## TASK-06: Update specs/tech/tech-stack.md — Playwright CI requirements, bump to 0.4.0

- **Goal**: Document the CI infrastructure requirements added by issue #66 so future contributors know what the test environment needs.
- **Files**: `specs/tech/tech-stack.md` (modify)
- **Notes**:
  - Add sub-note under Playwright entry: `postgres:16-alpine` CI service, DBMate migrations, seed SQL script, config at `e2e/playwright.config.ts`, tests at `e2e/*.spec.ts`.
  - Bump spec version from `0.3.0` to `0.4.0`.
  - Append change-log entry (date: 2026-03-10, author: Claude).

---

## TASK-07: Verify full build, typecheck, lint, and tests

- **Goal**: Confirm all workspace packages build and pass quality gates after the schema and type changes.
- **Files**: No new files; fixes only if verification reveals issues.
- **Notes**:
  - Run `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` from repo root.
  - All four commands must exit with code 0.
