# Tasks: Issue #111 — Review pipeline: claim, approve, reject

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Database migrations — columns, audit, notifications, seed
  - **Goal**: Create all four migration files to extend the schema and seed demo data
  - **Details**:
    - `20260311000003_add_creator_reviewer_to_campaigns.sql`: add `creator_id` and `reviewer_id` (nullable UUID FKs to accounts) to `campaigns`; backfill `creator_id` for existing rows to `22222222-2222-2222-2222-222222222222`
    - `20260311000004_create_campaign_audit_events.sql`: create append-only `campaign_audit_events` table with fields: `id` UUID PK, `campaign_id` FK, `actor_id` FK, `action` TEXT, `previous_status` TEXT, `new_status` TEXT, `rationale` TEXT nullable, `correlation_id` UUID nullable, `occurred_at` TIMESTAMPTZ DEFAULT now()
    - `20260311000005_create_notifications.sql`: create `notifications` table with fields: `id` UUID PK, `account_id` FK, `campaign_id` FK nullable, `type` TEXT, `message` TEXT, `read_at` TIMESTAMPTZ nullable, `created_at` TIMESTAMPTZ DEFAULT now()
    - `20260311000006_seed_reviewer_account.sql`: insert reviewer account (`id=44444444-...`, `email=reviewer@example.com`, `role=Reviewer`, bcrypt hash of `reviewer-demo-pass` cost 10); insert one `Submitted` campaign with `creator_id=22222222-...`; insert one `Rejected` campaign with `creator_id=22222222-...` and `reviewer_id=44444444-...`
  - **Files**:
    - `packages/server/db/migrations/20260311000003_add_creator_reviewer_to_campaigns.sql` (create)
    - `packages/server/db/migrations/20260311000004_create_campaign_audit_events.sql` (create)
    - `packages/server/db/migrations/20260311000005_create_notifications.sql` (create)
    - `packages/server/db/migrations/20260311000006_seed_reviewer_account.sql` (create)
  - **Verify**: Run `dbmate up` against a local DB and confirm `\d campaigns` shows new columns, all three new tables exist, and seed rows are present
  - **Brief ref**: §1 Database migrations

- [x] TASK-02: Shared types — extend CampaignDetailSchema
  - **Goal**: Add `reviewerId` and `creatorId` nullable fields to the shared `CampaignDetailSchema`
  - **Details**: In `packages/shared/src/campaign.ts`, add `reviewerId: z.string().uuid().nullable()` and `creatorId: z.string().uuid().nullable()` to `CampaignDetailSchema`. Export the updated inferred TypeScript type.
  - **Files**:
    - `packages/shared/src/campaign.ts` (modify)
  - **Verify**: `npm run build -w @mmf/shared` succeeds with no type errors
  - **Brief ref**: §8 Shared types

- [x] TASK-03: Server middleware — requireRole accepts Role | Role[]
  - **Goal**: Update `requireRole` to accept a single role or an array of roles
  - **Details**: In `packages/server/src/middleware/requireRole.ts`, change the parameter type from `role: Role` to `role: Role | Role[]`. Internally convert to an array and use `roles.includes(user.role)`. All existing single-string callers remain backward-compatible.
  - **Files**:
    - `packages/server/src/middleware/requireRole.ts` (modify)
  - **Verify**: TypeScript compiles; existing routes using `requireRole('Admin')` still work; a new test or manual inspection confirms array form works
  - **Brief ref**: §2 Server middleware

- [x] TASK-04: Server types — add review body schemas
  - **Goal**: Add Zod schemas for the four new request bodies
  - **Details**: In `packages/server/src/campaigns/types.ts`, add and export:
    - `ClaimBodySchema` — `z.object({})`
    - `ApproveBodySchema` — `z.object({ notes: z.string().min(1) })`
    - `RejectBodySchema` — `z.object({ rationale: z.string().min(1), guidance: z.string().min(1) })`
    - `ResubmitBodySchema` — `z.object({})`
    - Inferred TypeScript types for each
  - **Files**:
    - `packages/server/src/campaigns/types.ts` (modify)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` succeeds
  - **Brief ref**: §3 Server types

- [x] TASK-05: Server queries — review queue, state transitions, audit, notifications
  - **Goal**: Add all new DB query functions to `queries.ts`
  - **Details**: In `packages/server/src/campaigns/queries.ts`, add parameterised query functions:
    - `getReviewQueue(pool)` — SELECT campaigns WHERE status = 'Submitted' ORDER BY created_at ASC
    - `claimCampaign(pool, id, reviewerId)` — SELECT FOR UPDATE current row then UPDATE status='Under Review' + reviewer_id; return updated row
    - `approveCampaign(pool, id, reviewerId, notes)` — SELECT FOR UPDATE then UPDATE status='Approved'; return row
    - `rejectCampaign(pool, id, reviewerId, rationale, guidance)` — SELECT FOR UPDATE then UPDATE status='Rejected'; return row
    - `resubmitCampaign(pool, id, creatorId)` — SELECT FOR UPDATE then UPDATE status='Draft', clear reviewer_id; return row
    - `createAuditEvent(pool, event)` — INSERT into campaign_audit_events
    - `createNotification(pool, notification)` — INSERT into notifications
    - `getNotificationsForUser(pool, accountId)` — SELECT from notifications WHERE account_id=$1 ORDER BY created_at DESC
    - Also update `getCampaignById` SELECT to include `creator_id` and `reviewer_id` columns
  - **Files**:
    - `packages/server/src/campaigns/queries.ts` (modify)
  - **Verify**: TypeScript compiles; functions are importable
  - **Brief ref**: §4 Server queries

- [x] TASK-06: Server routes — campaign review endpoints
  - **Goal**: Wire up the five new campaign action endpoints in the campaigns router
  - **Details**: In `packages/server/src/campaigns/routes.ts`:
    - Register `GET /review-queue` **before** `GET /:id` to avoid UUID param collision
    - Add `POST /:id/claim` — authenticate → requireRole('Reviewer') → validate UUID → handler
    - Add `POST /:id/approve` — authenticate → requireRole('Reviewer') → validate UUID + body → handler
    - Add `POST /:id/reject` — authenticate → requireRole('Reviewer') → validate UUID + body → handler
    - Add `POST /:id/resubmit` — authenticate → validate UUID → handler
    - Each handler: validate → fetch campaign (404 if missing) → validate status transition (409 INVALID_CAMPAIGN_STATUS) → ownership check (403) → execute query → write audit event → create notification → respond 200 `{ data: campaign }`
  - **Files**:
    - `packages/server/src/campaigns/routes.ts` (modify)
  - **Verify**: TypeScript compiles; manual curl against running server returns correct status codes
  - **Brief ref**: §5 Server routes

- [x] TASK-07: Notifications router and app registration
  - **Goal**: Create the notifications router and register it in the Express app
  - **Details**:
    - Create `packages/server/src/notifications/routes.ts` with `GET /` → authenticate → `getNotificationsForUser(pool, req.user.id)` → respond 200 `{ data: notifications }`
    - In `packages/server/src/app.ts`, import and mount the notifications router at `/v1/notifications`
  - **Files**:
    - `packages/server/src/notifications/routes.ts` (create)
    - `packages/server/src/app.ts` (modify)
  - **Verify**: TypeScript compiles; `GET /v1/notifications` with a valid JWT returns 200
  - **Brief ref**: §5 Server routes (notifications sub-section)

- [x] TASK-08: Server integration tests for review endpoints
  - **Goal**: Full integration-test coverage for all five review action endpoints and the notifications endpoint
  - **Details**: Create `packages/server/src/__tests__/campaigns.review.test.ts` following patterns in `campaigns.test.ts` (createApp + supertest + mockQuery). Cover:
    - `GET /review-queue`: 200 list; 401; 403 wrong role
    - `POST /:id/claim`: 200; 401; 403 wrong role; 404; 409 wrong status
    - `POST /:id/approve`: 200; 401; 403 not assigned reviewer; 404; 409; 400 missing notes
    - `POST /:id/reject`: 200; 401; 403; 404; 409; 400 missing rationale or guidance
    - `POST /:id/resubmit`: 200; 401; 403 not creator; 404; 409 wrong status
    - `GET /v1/notifications`: 200 list; 401
    - Use `mockResolvedValueOnce` chains for multi-query handlers
  - **Files**:
    - `packages/server/src/__tests__/campaigns.review.test.ts` (create)
  - **Verify**: `npm run test:coverage` passes with ≥80% overall (new business logic at 90%+, API endpoints 100%)
  - **Brief ref**: §9 Server integration tests

- [x] TASK-09: Client API — campaign review functions and notifications
  - **Goal**: Add client-side API functions for all review actions and notifications
  - **Details**:
    - In `packages/client/src/api/campaigns.ts`, add: `fetchReviewQueue()`, `claimCampaign(id)`, `approveCampaign(id, notes)`, `rejectCampaign(id, rationale, guidance)`, `resubmitCampaign(id)`
    - Create `packages/client/src/api/notifications.ts` with `fetchNotifications()`
  - **Files**:
    - `packages/client/src/api/campaigns.ts` (modify)
    - `packages/client/src/api/notifications.ts` (create)
  - **Verify**: TypeScript compiles (`npx tsc -b --noEmit`)
  - **Brief ref**: §6 Client API

- [x] TASK-10: Client UI — ProtectedRoute, App routing, LoginPage
  - **Goal**: Add reviewer-role support to routing and update the login demo selector
  - **Details**:
    - In `packages/client/src/components/ProtectedRoute.tsx`, add `requireReviewer?: boolean` prop; redirect if `user.role !== 'Reviewer'` when prop is true
    - In `packages/client/src/App.tsx`, add lazy-loaded `ReviewQueuePage` route at `/review-queue` wrapped in a Reviewer-protected `ProtectedRoute`
    - In `packages/client/src/pages/LoginPage.tsx`, add `{ email: 'reviewer@example.com', password: 'reviewer-demo-pass', label: 'Demo Reviewer' }` (or similar) to the demo user selector array
  - **Files**:
    - `packages/client/src/components/ProtectedRoute.tsx` (modify)
    - `packages/client/src/App.tsx` (modify)
    - `packages/client/src/pages/LoginPage.tsx` (modify)
  - **Verify**: TypeScript compiles; `/review-queue` redirects non-Reviewer users; Reviewer demo entry appears on LoginPage
  - **Brief ref**: §7 Client UI (ProtectedRoute, App.tsx, LoginPage)

- [x] TASK-11: ReviewQueuePage component
  - **Goal**: Create the review queue page that lists Submitted campaigns and allows claiming
  - **Details**: Create `packages/client/src/pages/ReviewQueuePage.tsx`. Use React Query to fetch `fetchReviewQueue()`. Render a table/list showing campaign title and submission date. Each row has a "Claim" button that calls `claimCampaign(id)` then navigates to `/campaigns/:id`.
  - **Files**:
    - `packages/client/src/pages/ReviewQueuePage.tsx` (create)
  - **Verify**: TypeScript compiles; page renders the list and Claim button in the browser when logged in as reviewer
  - **Brief ref**: §7 Client UI (ReviewQueuePage)

- [x] TASK-12: ReviewActionsPanel component and CampaignDetailPage integration
  - **Goal**: Create the Approve/Reject/Resubmit panel and render it on the campaign detail page
  - **Details**:
    - Create `packages/client/src/components/campaigns/ReviewActionsPanel.tsx`. Accepts campaign data and current user as props.
      - Reviewer + status `Under Review` + `reviewer_id == user.id`: show Approve form (notes textarea + submit) and Reject form (rationale + guidance textareas + submit)
      - Creator + status `Rejected` + `creator_id == user.id`: show Resubmit button
      - Each action calls the corresponding API function and invalidates the campaign React Query cache
    - In `packages/client/src/pages/CampaignDetailPage.tsx`, import and render `<ReviewActionsPanel />` after existing content, passing campaign and user
  - **Files**:
    - `packages/client/src/components/campaigns/ReviewActionsPanel.tsx` (create)
    - `packages/client/src/pages/CampaignDetailPage.tsx` (modify)
  - **Verify**: TypeScript compiles; Approve/Reject panel visible for reviewer on Under Review campaign; Resubmit button visible for creator on Rejected campaign
  - **Brief ref**: §7 Client UI (ReviewActionsPanel, CampaignDetailPage)

- [x] TASK-13: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the reviewer and creator flows described in the brief
  - **Details**: Create `e2e/review-pipeline.spec.ts` following patterns in `e2e/auth.spec.ts` and `e2e/campaigns.spec.ts`.
    - **Reviewer flow**: login as `reviewer@example.com`; navigate to `/review-queue`; assert seeded Submitted campaign appears; click Claim; verify campaign detail shows Under Review status; submit Approve with notes; verify status changes to Approved
    - **Creator flow**: login as `creator@example.com`; navigate to the seeded Rejected campaign; assert Resubmit button visible in ReviewActionsPanel; click Resubmit; verify status changes to Draft
  - **Files**:
    - `e2e/review-pipeline.spec.ts` (create)
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: §10 E2E tests, Verification section

- [ ] TASK-14: Final CI verification
  - **Goal**: Confirm the full CI pipeline passes with all new code
  - **Details**: Run the complete CI check script to verify type-checking, lint, formatting, build, and unit/integration test coverage all pass. Fix any remaining issues.
    - `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json`
    - `npm run lint && npm run format:check`
    - `npm run test:coverage`
    - `npm run build`
  - **Files**: Any files needing lint/format/type fixes
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors
  - **Brief ref**: Verification section
