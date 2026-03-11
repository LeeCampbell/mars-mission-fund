# Tasks: Issue #115 — Reviewer and Admin Campaign Management UI

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: DB migrations — schema additions (003–005)
  - **Goal**: Add all new columns and tables required by the review/admin/notification feature
  - **Details**:
    - `20260311000003_add_campaign_owner_and_review_fields.sql`: add `creator_id UUID REFERENCES accounts(id)`, `reviewer_id UUID REFERENCES accounts(id)`, `review_notes TEXT`, `rejection_rationale TEXT`, `rejection_guidance TEXT`, `reviewed_at TIMESTAMPTZ`, `cancellation_requested_at TIMESTAMPTZ`, `cancellation_reason TEXT` to `campaigns` (all nullable)
    - `20260311000004_add_evidence_fields_to_milestones.sql`: add `evidence_url TEXT`, `evidence_notes TEXT`, `admin_feedback TEXT`, `verified_at TIMESTAMPTZ`, `returned_at TIMESTAMPTZ` to `campaign_milestones`
    - `20260311000005_create_notifications.sql`: create `notifications` table with `id UUID PK`, `user_id UUID NOT NULL REFERENCES accounts(id)`, `type TEXT NOT NULL`, `title TEXT NOT NULL`, `body TEXT NOT NULL`, `campaign_id UUID REFERENCES campaigns(id)`, `is_read BOOLEAN NOT NULL DEFAULT false`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - **Files**:
    - `packages/server/db/migrations/20260311000003_add_campaign_owner_and_review_fields.sql` (create)
    - `packages/server/db/migrations/20260311000004_add_evidence_fields_to_milestones.sql` (create)
    - `packages/server/db/migrations/20260311000005_create_notifications.sql` (create)
  - **Verify**: Files exist and contain valid SQL with correct column definitions; review `packages/server/db/schema.sql` patterns for consistency
  - **Brief ref**: Database layer — migrations 1–3

- [x] TASK-02: DB migrations — seed data (006–008)
  - **Goal**: Seed reviewer demo account, Submitted campaigns, milestone evidence, cancellation request, and demo notifications
  - **Details**:
    - `20260311000006_seed_reviewer.sql`: insert reviewer account with id `44444444-4444-4444-4444-444444444444`, email `reviewer@example.com`, role `Reviewer`; generate bcrypt hash for `reviewer-demo-pass` with `node -e "require('bcryptjs').hash('reviewer-demo-pass',10).then(console.log)"` and embed the result
    - `20260311000007_seed_review_data.sql`: insert 2 campaigns in `Submitted` status with `creator_id = '22222222-2222-2222-2222-222222222222'`; update one existing live campaign to set `cancellation_requested_at = now()`, `cancellation_reason`, and `creator_id`; update the two already-Submitted milestones (in campaigns 2 and 10) with `evidence_notes` and `evidence_url`
    - `20260311000008_seed_notifications.sql`: seed 4–6 demo notifications with `is_read = false`; reviewer gets "new campaign submission" notifications; admin gets "milestone submitted" notifications; creator gets a "your campaign was submitted" notification
  - **Files**:
    - `packages/server/db/migrations/20260311000006_seed_reviewer.sql` (create)
    - `packages/server/db/migrations/20260311000007_seed_review_data.sql` (create)
    - `packages/server/db/migrations/20260311000008_seed_notifications.sql` (create)
  - **Verify**: All three files created; migration 006 contains a valid bcrypt hash (60-char `$2b$` string); migration 007 references known UUIDs from existing seed data
  - **Brief ref**: Database layer — migrations 4–6

- [x] TASK-03: Shared notification types + update requireRole middleware
  - **Goal**: Add `NotificationSchema`/`NotificationType` to `@mmf/shared`; update `requireRole` to accept `Role | Role[]`
  - **Details**:
    - Create `packages/shared/src/notification.ts` with `NotificationType` union (`'CAMPAIGN_SUBMITTED' | 'CAMPAIGN_APPROVED' | 'CAMPAIGN_REJECTED' | 'MILESTONE_SUBMITTED' | 'MILESTONE_VERIFIED' | 'MILESTONE_RETURNED' | 'CAMPAIGN_CANCELLED'`) and `NotificationSchema` (zod) with fields: `id`, `userId`, `type`, `title`, `body`, `campaignId`, `isRead`, `createdAt`; export `Notification` inferred type
    - Export from `packages/shared/src/index.ts`
    - Modify `packages/server/src/middleware/requireRole.ts`: change parameter type to `Role | Role[]`; wrap single value in array; check with `Array.isArray` + `.includes`
  - **Files**:
    - `packages/shared/src/notification.ts` (create)
    - `packages/shared/src/index.ts` (modify)
    - `packages/server/src/middleware/requireRole.ts` (modify)
  - **Verify**: `npm run build -w @mmf/shared` passes; TypeScript does not error on `requireRole(['Administrator', 'SuperAdministrator'])`
  - **Brief ref**: Shared types section; Server layer — requireRole update

- [x] TASK-04: Review server module
  - **Goal**: Implement `/v1/review` endpoints (list, claim, approve, reject) with notification side-effects
  - **Details**:
    - `review/types.ts`: Zod schemas — `ApproveBody` (`{ notes: string }`), `RejectBody` (`{ rationale: string; guidance: string }`), `ReviewRouteParams` (`{ id: uuid }`)
    - `review/queries.ts`: `listSubmittedCampaigns(pool)` — SELECT campaigns WHERE status = 'Submitted' ORDER BY created_at ASC; `claimCampaign(pool, id, reviewerId)` — UPDATE status to 'Under Review', set `reviewer_id`, also INSERT notification for creator; `approveCampaign(pool, id, notes, reviewerId)` — UPDATE status to 'Approved', set `review_notes`, `reviewed_at`, INSERT notification; `rejectCampaign(pool, id, rationale, guidance, reviewerId)` — UPDATE status to 'Rejected', set fields, INSERT notification
    - `review/routes.ts`: `createReviewRouter(pool)` — `GET /` → listSubmittedCampaigns; `POST /:id/claim` → claimCampaign; `POST /:id/approve` → approveCampaign; `POST /:id/reject` → rejectCampaign; all routes use `authenticate + requireRole('Reviewer')`
    - Register `createReviewRouter` at `/v1/review` in `app.ts`
  - **Files**:
    - `packages/server/src/review/types.ts` (create)
    - `packages/server/src/review/queries.ts` (create)
    - `packages/server/src/review/routes.ts` (create)
    - `packages/server/src/app.ts` (modify — add `/v1/review`)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; routes file exports `createReviewRouter`
  - **Brief ref**: Server layer — review module

- [x] TASK-05: Notifications server module
  - **Goal**: Implement `/v1/notifications` endpoints (list own, mark read)
  - **Details**:
    - `notifications/types.ts`: Zod schema for `NotificationRouteParams` (`{ id: uuid }`)
    - `notifications/queries.ts`: `listNotifications(pool, userId)` — SELECT WHERE user_id = userId ORDER BY created_at DESC; `markNotificationRead(pool, id, userId)` — UPDATE is_read = true WHERE id = id AND user_id = userId (user-scoped for safety)
    - `notifications/routes.ts`: `createNotificationsRouter(pool)` — `GET /` → listNotifications(pool, req.user.id); `PATCH /:id/read` → markNotificationRead; all routes use `authenticate`
    - Register at `/v1/notifications` in `app.ts`
  - **Files**:
    - `packages/server/src/notifications/types.ts` (create)
    - `packages/server/src/notifications/queries.ts` (create)
    - `packages/server/src/notifications/routes.ts` (create)
    - `packages/server/src/app.ts` (modify — add `/v1/notifications`)
  - **Verify**: TypeScript passes; `createNotificationsRouter` exported
  - **Brief ref**: Server layer — notifications module

- [x] TASK-06: Admin server module
  - **Goal**: Implement `/v1/admin` endpoints for milestone verification and cancellation approval
  - **Details**:
    - `admin/types.ts`: Zod schemas — `VerifyBody` (`{ notes: string }`), `ReturnBody` (`{ feedback: string }`), `CancellationRouteParams` (`{ id: uuid }`), `MilestoneRouteParams` (`{ id: uuid }`)
    - `admin/queries.ts`: `listSubmittedMilestones(pool)` — join milestones + campaigns WHERE milestones.status = 'Submitted'; `verifyMilestone(pool, id, notes)` — UPDATE status to 'Verified', set `admin_notes`/`verified_at`, INSERT notification; `returnMilestone(pool, id, feedback)` — UPDATE status to 'Pending', set `admin_feedback`/`returned_at`, INSERT notification; `listCancellationRequests(pool)` — SELECT campaigns WHERE cancellation_requested_at IS NOT NULL; `approveCancellation(pool, id)` — UPDATE status to 'Cancelled', INSERT notification; `denyCancellation(pool, id)` — clear `cancellation_requested_at` and `cancellation_reason`, INSERT notification
    - `admin/routes.ts`: `createAdminRouter(pool)` — `GET /milestones`, `POST /milestones/:id/verify`, `POST /milestones/:id/return`, `GET /campaigns/cancellations`, `POST /campaigns/:id/approve-cancellation`, `POST /campaigns/:id/deny-cancellation`; all use `authenticate + requireRole(['Administrator', 'SuperAdministrator'])`
    - Register at `/v1/admin` in `app.ts`
  - **Files**:
    - `packages/server/src/admin/types.ts` (create)
    - `packages/server/src/admin/queries.ts` (create)
    - `packages/server/src/admin/routes.ts` (create)
    - `packages/server/src/app.ts` (modify — add `/v1/admin`)
  - **Verify**: TypeScript passes; all six route handlers present
  - **Brief ref**: Server layer — admin module

- [x] TASK-07: Frontend API clients
  - **Goal**: Create the three API client modules for review, notifications, and admin
  - **Details**:
    - `api/review.ts`: `fetchReviewQueue()` → GET `/v1/review`; `claimCampaign(id)` → POST `/v1/review/:id/claim`; `approveCampaign(id, notes)` → POST `/v1/review/:id/approve` `{ notes }`; `rejectCampaign(id, rationale, guidance)` → POST `/v1/review/:id/reject` `{ rationale, guidance }`; use `authedFetch` (copy pattern from existing `api/` files)
    - `api/notifications.ts`: `fetchNotifications()` → GET `/v1/notifications`; `markNotificationRead(id)` → PATCH `/v1/notifications/:id/read`
    - `api/adminCampaigns.ts`: `fetchSubmittedMilestones()` → GET `/v1/admin/milestones`; `verifyMilestone(id, notes)` → POST `/v1/admin/milestones/:id/verify`; `returnMilestone(id, feedback)` → POST `/v1/admin/milestones/:id/return`; `fetchCancellationRequests()` → GET `/v1/admin/campaigns/cancellations`; `approveCancellation(id)` → POST `/v1/admin/campaigns/:id/approve-cancellation`; `denyCancellation(id)` → POST `/v1/admin/campaigns/:id/deny-cancellation`
  - **Files**:
    - `packages/client/src/api/review.ts` (create)
    - `packages/client/src/api/notifications.ts` (create)
    - `packages/client/src/api/adminCampaigns.ts` (create)
  - **Verify**: `npx tsc -b --noEmit` passes for client
  - **Brief ref**: Frontend layer — API clients

- [x] TASK-08: Frontend hooks
  - **Goal**: Create TanStack Query hooks for review, notifications, and admin operations
  - **Details**:
    - `hooks/useReview.ts`: `useReviewQueue()` — `useQuery` on `['reviewQueue']`; `useClaimCampaign()` — `useMutation` + invalidate `reviewQueue`; `useApproveCampaign()` — `useMutation` + invalidate; `useRejectCampaign()` — `useMutation` + invalidate; follow patterns from `useCampaigns.ts`
    - `hooks/useNotifications.ts`: `useNotifications()` — `useQuery` on `['notifications']`; `useMarkNotificationRead()` — `useMutation` + invalidate `notifications`
    - `hooks/useAdmin.ts`: hooks for all six admin operations — `useSubmittedMilestones()`, `useVerifyMilestone()`, `useReturnMilestone()`, `useCancellationRequests()`, `useApproveCancellation()`, `useDenyCancellation()`; mutations invalidate relevant queries
  - **Files**:
    - `packages/client/src/hooks/useReview.ts` (create)
    - `packages/client/src/hooks/useNotifications.ts` (create)
    - `packages/client/src/hooks/useAdmin.ts` (create)
  - **Verify**: TypeScript passes; hooks export matches what pages will import
  - **Brief ref**: Frontend layer — hooks

- [x] TASK-09: ReviewQueuePage + tests
  - **Goal**: Implement the reviewer queue page and its component tests
  - **Details**:
    - `ReviewQueuePage.tsx`: uses `useReviewQueue()`; renders a table of CampaignSummary rows (title, status, created_at); each row has a "Claim" button that calls `useClaimCampaign()` mutation; on success, navigate to `/review/:id`; show loading/error states
    - `ReviewQueuePage.test.tsx`: mock `useReviewQueue` returning 2 campaigns; mock `useClaimCampaign`; assert campaign titles render in table; assert "Claim" button present per row; assert mutation called on click
  - **Files**:
    - `packages/client/src/pages/ReviewQueuePage.tsx` (create)
    - `packages/client/src/pages/ReviewQueuePage.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client/src/pages/ReviewQueuePage.test.tsx` passes
  - **Brief ref**: Frontend layer — ReviewQueuePage

- [ ] TASK-10: ReviewDetailPage + tests
  - **Goal**: Implement the campaign review detail page (approve/reject forms) and tests
  - **Details**:
    - `ReviewDetailPage.tsx`: uses existing `useCampaign(id)` hook; displays full campaign detail; Approve panel: textarea for notes + submit button calling `useApproveCampaign()`; Reject panel: textarea for rationale + textarea for guidance + submit calling `useRejectCampaign()`; redirect to `/review` if not Reviewer role (use `useAuth`)
    - `ReviewDetailPage.test.tsx`: mock `useCampaign`, `useApproveCampaign`, `useRejectCampaign`; assert campaign title renders; assert approve/reject form fields present; assert mutation called on form submit
  - **Files**:
    - `packages/client/src/pages/ReviewDetailPage.tsx` (create)
    - `packages/client/src/pages/ReviewDetailPage.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client/src/pages/ReviewDetailPage.test.tsx` passes
  - **Brief ref**: Frontend layer — ReviewDetailPage

- [ ] TASK-11: AdminMilestonesPage + tests
  - **Goal**: Implement the admin milestone verification page and tests
  - **Details**:
    - `AdminMilestonesPage.tsx`: uses `useSubmittedMilestones()`; renders table with columns: campaign title, milestone title, evidence URL (clickable link), evidence notes; each row has inline text input for admin notes and "Verify" button (calls `useVerifyMilestone`) and "Return" button with feedback input (calls `useReturnMilestone`); show loading/empty states
    - `AdminMilestonesPage.test.tsx`: mock `useSubmittedMilestones` returning 2 rows; mock mutation hooks; assert rows render with campaign title and evidence info; assert buttons present
  - **Files**:
    - `packages/client/src/pages/AdminMilestonesPage.tsx` (create)
    - `packages/client/src/pages/AdminMilestonesPage.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client/src/pages/AdminMilestonesPage.test.tsx` passes
  - **Brief ref**: Frontend layer — AdminMilestonesPage

- [ ] TASK-12: AdminCancellationsPage + NotificationsPage
  - **Goal**: Implement the admin cancellations page and the notifications listing page
  - **Details**:
    - `AdminCancellationsPage.tsx`: uses `useCancellationRequests()`; renders table with campaign title, cancellation reason, requested date; each row has "Approve" button (calls `useApproveCancellation`) and "Deny" button (calls `useDenyCancellation`); show loading/empty states
    - `NotificationsPage.tsx`: uses `useNotifications()`; renders a list of notifications each showing title, body, timestamp, and "Mark as read" button (disabled/grayed if `is_read = true`); "Mark as read" calls `useMarkNotificationRead(id)`
  - **Files**:
    - `packages/client/src/pages/AdminCancellationsPage.tsx` (create)
    - `packages/client/src/pages/NotificationsPage.tsx` (create)
  - **Verify**: TypeScript passes; pages render without errors; components import from correct hooks
  - **Brief ref**: Frontend layer — AdminCancellationsPage, NotificationsPage

- [ ] TASK-13: NotificationBell component + tests
  - **Goal**: Implement the notification bell header component and its tests
  - **Details**:
    - `NotificationBell.tsx`: calls `useNotifications()` on mount; renders a bell icon (SVG or unicode `🔔`) wrapped in a `<Link to="/notifications">`; overlays a red badge showing unread count (filter `notifications.filter(n => !n.isRead).length`); hide badge if count is 0; handle loading state gracefully
    - `NotificationBell.test.tsx`: mock `useNotifications` returning 3 notifications (2 unread); assert badge renders with "2"; mock returning 0 unread; assert no badge
  - **Files**:
    - `packages/client/src/components/NotificationBell.tsx` (create)
    - `packages/client/src/components/NotificationBell.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client/src/components/NotificationBell.test.tsx` passes
  - **Brief ref**: Frontend layer — NotificationBell component

- [ ] TASK-14: Update Header, ProtectedRoute, App.tsx, and LoginPage
  - **Goal**: Wire up new pages into routing, add role-based nav links, and add reviewer to demo selector
  - **Details**:
    - `Header.tsx`: import and render `<NotificationBell />` when authenticated (next to existing nav); add `<NavLink to="/review">Review Queue</NavLink>` when `user.role === 'Reviewer'`; add `<NavLink to="/admin/milestones">Milestones</NavLink>` and `<NavLink to="/admin/cancellations">Cancellations</NavLink>` when `isAdmin` (both desktop and mobile nav sections)
    - `ProtectedRoute.tsx`: add `requireReviewer?: boolean` prop; if truthy and `user.role !== 'Reviewer'`, redirect to `/` (mirror the existing `requireAdmin` pattern)
    - `App.tsx`: add lazy-loaded routes: `/review` → `ReviewQueuePage` (requireReviewer), `/review/:id` → `ReviewDetailPage` (requireReviewer), `/admin/milestones` → `AdminMilestonesPage` (requireAdmin), `/admin/cancellations` → `AdminCancellationsPage` (requireAdmin), `/notifications` → `NotificationsPage` (ProtectedRoute only)
    - `LoginPage.tsx`: add reviewer demo option with label "Reviewer" / email `reviewer@example.com` / password `reviewer-demo-pass` to the demo user selector (follow exact pattern of existing backer/creator/admin entries)
  - **Files**:
    - `packages/client/src/components/Header.tsx` (modify)
    - `packages/client/src/components/ProtectedRoute.tsx` (modify)
    - `packages/client/src/App.tsx` (modify)
    - `packages/client/src/pages/LoginPage.tsx` (modify)
  - **Verify**: `npx tsc -b --noEmit` passes; `npm run lint` passes; `npm run build` succeeds
  - **Brief ref**: Frontend layer — modified files

- [ ] TASK-15: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the reviewer and admin flows described in the brief
  - **Details**: Create `e2e/review.spec.ts`. Required flows:
    1. Reviewer logs in as `reviewer@example.com`, navigates to `/review`, asserts Submitted campaign rows visible
    2. Reviewer clicks "Claim" on first campaign, asserts redirect to `/review/:id` with campaign detail visible
    3. Reviewer fills approval notes, clicks Approve, asserts campaign removed from queue (navigates back to `/review`)
    4. Admin logs in, navigates to `/admin/milestones`, asserts Submitted milestone rows visible
    5. Notification bell shows unread count badge; navigating to `/notifications` lists notifications
    Follow patterns in existing `e2e/auth.spec.ts` and `e2e/campaigns.spec.ts`. Use `page.getByRole`, `page.getByText`, `expect(page).toHaveURL` etc.
  - **Files**: `e2e/review.spec.ts` (create)
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: E2E section; Verification section
