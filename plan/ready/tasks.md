# Tasks: Issue #113 — Milestone verification and settlement workflow

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add database migrations for evidence fields and audit log
  - **Goal**: Create the two SQL migrations that extend `campaign_milestones` and add the `audit_log` table
  - **Details**: Create `20260311000003_add_milestone_evidence_fields.sql` adding `evidence_description`, `evidence_url`, `evidence_submitted_at`, and `feedback` columns to `campaign_milestones`. Create `20260311000004_create_audit_log.sql` creating the `audit_log` table with `id`, `event_type`, `campaign_id`, `milestone_id`, `actor_id`, `payload`, `created_at`. Update `packages/server/db/schema.sql` to reflect all new columns and the new table.
  - **Files**: `packages/server/db/migrations/20260311000003_add_milestone_evidence_fields.sql`, `packages/server/db/migrations/20260311000004_create_audit_log.sql`, `packages/server/db/schema.sql`
  - **Verify**: Migration files exist with correct SQL. Schema file updated to match.
  - **Brief ref**: Database — two new migrations

- [x] TASK-02: Update shared types for milestone status and evidence fields
  - **Goal**: Extend `MilestoneStatusSchema` with `'Returned'` and add evidence/feedback fields to `MilestoneSchema`
  - **Details**: In `packages/shared/src/campaign.ts`, add `'Returned'` to the `MilestoneStatusSchema` enum. Add optional fields to `MilestoneSchema`: `evidenceDescription`, `evidenceUrl`, `evidenceSubmittedAt` (ISO datetime string or null), `feedback`. Run `npm run build -w @mmf/shared` to verify.
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: `npm run build -w @mmf/shared` passes with no errors.
  - **Brief ref**: Shared types

- [x] TASK-03: Extend requireRole middleware to accept an array of roles
  - **Goal**: Allow admin routes to accept both `'Administrator'` and `'SuperAdministrator'`
  - **Details**: In `packages/server/src/middleware/requireRole.ts`, change the signature to `requireRole(role: Role | Role[])`. Inside the function, normalise to an array and check if `req.user.role` is included. All existing single-role usages must continue to work unchanged.
  - **Files**: `packages/server/src/middleware/requireRole.ts`
  - **Verify**: TypeScript compiles (`npx tsc --noEmit -p packages/server/tsconfig.json`). Existing tests still pass (`npm run test`).
  - **Brief ref**: Middleware

- [x] TASK-04: Add Zod schemas for new route params and request bodies
  - **Goal**: Add `MilestoneRouteParamsSchema`, `SubmitEvidenceBodySchema`, and `ReturnMilestoneBodySchema` to the server types file
  - **Details**: In `packages/server/src/campaigns/types.ts`, add: `MilestoneRouteParamsSchema` validating `{ id: uuid, mid: uuid }`; `SubmitEvidenceBodySchema` with `evidenceDescription: z.string().min(1)` and `evidenceUrl: z.string().url().optional()`; `ReturnMilestoneBodySchema` with `feedback: z.string().min(1)`. Export all three.
  - **Files**: `packages/server/src/campaigns/types.ts`
  - **Verify**: TypeScript compiles without errors.
  - **Brief ref**: Server types

- [x] TASK-05: Add query functions for settlement workflow
  - **Goal**: Implement the 6 new database query functions needed by the settlement routes
  - **Details**: In `packages/server/src/campaigns/queries.ts`, add: `settleCampaign(pool, campaignId)` — UPDATE campaigns SET status='Settlement'; `submitMilestoneEvidence(pool, campaignId, milestoneId, body)` — UPDATE campaign_milestones with evidence fields and status='Submitted'; `verifyMilestone(pool, campaignId, milestoneId)` — run in a DB transaction: set milestone to 'Verified', check if all milestones for this campaign are 'Verified', if so update campaign to 'Complete'; return `{ allVerified: boolean }`; `returnMilestone(pool, campaignId, milestoneId, feedback)` — set milestone status='Returned' and store feedback; `cancelSettlement(pool, campaignId)` — UPDATE campaigns SET status='Cancelled'; `insertAuditLog(pool, entry: { eventType, campaignId, milestoneId?, actorId, payload })` — INSERT into audit_log. Follow existing parameterised-query patterns.
  - **Files**: `packages/server/src/campaigns/queries.ts`
  - **Verify**: TypeScript compiles without errors. Functions are exported and importable.
  - **Brief ref**: Server queries

- [ ] TASK-06: Implement the 5 new settlement route handlers
  - **Goal**: Wire up all 5 new POST endpoints in the campaigns router with correct auth guards, validation, business logic, audit logging, and stub notifications/disbursements
  - **Details**: In `packages/server/src/campaigns/routes.ts`, add: `POST /:id/settle` (Admin guard) — validate campaign is `Funded` (409 if not, 404 if not found), call `settleCampaign`, call `insertAuditLog`; `POST /:id/milestones/:mid/submit-evidence` (Creator guard) — validate campaign is `Settlement`, milestone status is `Pending` or `Returned` (409 if not), parse body with `SubmitEvidenceBodySchema` (422 if invalid), call `submitMilestoneEvidence`, call `insertAuditLog`, `console.log` admin notification stub; `POST /:id/milestones/:mid/verify` (Admin guard) — validate campaign is `Settlement`, milestone is `Submitted` (409), call `verifyMilestone`, call `insertAuditLog`, `console.log` disbursement stub, if `allVerified` call `insertAuditLog` for campaign complete + `console.log` creator notification stub; `POST /:id/milestones/:mid/return` (Admin guard) — validate campaign is `Settlement`, milestone is `Submitted` (409), parse body with `ReturnMilestoneBodySchema` (422), call `returnMilestone`, call `insertAuditLog`, `console.log` creator notification stub; `POST /:id/cancel` (Admin guard) — validate campaign is `Settlement` (409), call `cancelSettlement`, call `insertAuditLog`, `console.log` refund stub. All responses return `{ data: { ... } }`. Use `authenticate` + `requireRole` on all routes.
  - **Files**: `packages/server/src/campaigns/routes.ts`
  - **Verify**: TypeScript compiles. Server starts without errors.
  - **Brief ref**: Server routes

- [ ] TASK-07: Write integration tests for all 5 new endpoints
  - **Goal**: Full test coverage for the settlement workflow endpoints covering happy path, auth, role, state, and validation errors
  - **Details**: In `packages/server/src/__tests__/campaigns.test.ts`, add test suites for each of the 5 endpoints. For each endpoint test: happy path (correct role, valid state → 200); 401 Unauthorized (no token); 403 Forbidden (wrong role); 404 Campaign not found; 409 Conflict (campaign in wrong state). For endpoints with a request body (`submit-evidence`, `return`) also test 422 for invalid/missing body. Use existing test helpers for auth tokens and DB setup. Ensure all 5 acceptance criteria are covered: AC-CAMP-013 through AC-CAMP-016.
  - **Files**: `packages/server/src/__tests__/campaigns.test.ts`
  - **Verify**: `npm run test:coverage` passes with ≥80% overall coverage. All new tests pass.
  - **Brief ref**: Verification — Unit/integration tests

- [ ] TASK-08: Final CI verification
  - **Goal**: Confirm all CI checks pass end-to-end
  - **Details**: Run the full CI check suite: `npm run build -w @mmf/shared`, `npx tsc -b --noEmit`, `npx tsc --noEmit -p packages/server/tsconfig.json`, `npm run build`, `npm run lint`, `npm run format:check`, `npm run test:coverage`. Fix any type errors, lint violations, or formatting issues that arise.
  - **Files**: Any files needing formatting or lint fixes
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors.
  - **Brief ref**: Verification — Build, Lint/format, Unit/integration tests
