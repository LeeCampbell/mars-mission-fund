# Tasks: Issue #115 — Reviewer and admin campaign management UI

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Backend — shared schema + server queries + PATCH notification endpoint
  - **Goal**: Add `cancellationRequestedAt` to the shared Zod schema, expose it in the `getCampaignById` SQL, add `markNotificationAsRead` DB query, and wire up `PATCH /v1/notifications/:id/read`
  - **Details**:
    1. In `packages/shared/src/campaign.ts`, add `cancellationRequestedAt: z.coerce.date().nullable().optional()` to `CampaignDetailSchema`
    2. In `packages/server/src/campaigns/queries.ts`, add `c.cancellation_requested_at AS "cancellationRequestedAt"` to the `getCampaignById` SELECT clause
    3. In `packages/server/src/campaigns/queries.ts`, add `markNotificationAsRead(pool, id, userId)` — `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`
    4. In `packages/server/src/notifications/routes.ts`, add `PATCH /:id/read` route: require `authenticate` middleware, call `markNotificationAsRead`, return 204
  - **Files**:
    - `packages/shared/src/campaign.ts`
    - `packages/server/src/campaigns/queries.ts`
    - `packages/server/src/notifications/routes.ts`
  - **Verify**: `npm run build -w @mmf/shared` and `npx tsc --noEmit -p packages/server/tsconfig.json` pass with no errors
  - **Brief ref**: Backend — new endpoint; Backend — schema extension

- [x] TASK-02: Client API layer — update notifications.ts and campaigns.ts
  - **Goal**: Wire up all new client-side API calls and remove the duplicate `Notification` inline interface
  - **Details**:
    1. In `packages/client/src/api/notifications.ts`: import `Notification` from `@mmf/shared`; remove the local inline `Notification` interface; add `markNotificationAsRead(id: string): Promise<void>` calling `PATCH /v1/notifications/:id/read`
    2. In `packages/client/src/api/campaigns.ts`: add `verifyMilestone(campaignId, milestoneId)` → `POST /v1/campaigns/:id/milestones/:mid/verify`; `returnMilestone(campaignId, milestoneId, feedback)` → `POST /v1/campaigns/:id/milestones/:mid/return`; `approveCancellation(campaignId)` → `POST /v1/campaigns/:id/approve-cancel`; `fetchCampaignsByStatus(status: CampaignStatus): Promise<CampaignSummary[]>` using status query param
  - **Files**:
    - `packages/client/src/api/notifications.ts`
    - `packages/client/src/api/campaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; no TypeScript errors in client
  - **Brief ref**: Frontend — API layer; fetchCampaigns API

- [x] TASK-03: Client hook — useNotifications with 30-second polling
  - **Goal**: Create a TanStack Query hook wrapping `fetchNotifications` with a 30-second polling interval
  - **Details**: Create `packages/client/src/hooks/useNotifications.ts` exporting `useNotifications()` that uses `useQuery` with `queryKey: ['notifications']`, `queryFn: fetchNotifications`, `refetchInterval: 30_000`
  - **Files**:
    - `packages/client/src/hooks/useNotifications.ts`
  - **Verify**: `npx tsc -b --noEmit` passes
  - **Brief ref**: Frontend — hooks

- [x] TASK-04: NotificationBell component + tests
  - **Goal**: Create the `NotificationBell` component and its component tests
  - **Details**:
    1. Create `packages/client/src/components/NotificationBell.tsx`: authenticated-only, uses `useNotifications()`, renders a `<button>` with inline SVG bell icon, absolute-positioned red badge with unread count (hidden when 0), clicking navigates to `/notifications` via `useNavigate`
    2. Create `packages/client/src/components/NotificationBell.test.tsx`: test that bell renders, badge shows unread count, badge hidden when 0, click navigates to `/notifications`; mock `useNotifications` and `useNavigate`
  - **Files**:
    - `packages/client/src/components/NotificationBell.tsx`
    - `packages/client/src/components/NotificationBell.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/components/NotificationBell.test.tsx` — all tests pass
  - **Brief ref**: Frontend — components

- [x] TASK-05: ReviewDetailPage + tests
  - **Goal**: Create the reviewer campaign detail page that shows full proposal content plus `ReviewActionsPanel`
  - **Details**:
    1. Create `packages/client/src/pages/ReviewDetailPage.tsx`: protected `requireReviewer`; uses `useParams` for campaign ID; fetches via `useCampaign(id)`; renders full proposal (description, team, milestones read-only, stretch goals, alignment statement); renders `ReviewActionsPanel`; renders loading/error states consistent with other pages
    2. Create `packages/client/src/pages/ReviewDetailPage.test.tsx`: test loading state, error state, full proposal renders, `ReviewActionsPanel` present; mock `useCampaign` and `ReviewActionsPanel`
  - **Files**:
    - `packages/client/src/pages/ReviewDetailPage.tsx`
    - `packages/client/src/pages/ReviewDetailPage.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/ReviewDetailPage.test.tsx` — all tests pass
  - **Brief ref**: Frontend — pages (ReviewDetailPage)

- [x] TASK-06: NotificationsPage + tests
  - **Goal**: Create the notifications page with mark-as-read functionality
  - **Details**:
    1. Create `packages/client/src/pages/NotificationsPage.tsx`: authenticated; uses `useNotifications()`; renders a list with type badge, title, message, created date; unread rows visually distinguished (e.g. `font-semibold` or bg tint); "Mark as read" button per row calling `useMutation` → `markNotificationAsRead(id)`, on success `invalidateQueries(['notifications'])`; empty state "No notifications."
    2. Create `packages/client/src/pages/NotificationsPage.test.tsx`: test loading state, empty state, notification list renders, unread styling, "Mark as read" mutation called; mock `useNotifications` and `markNotificationAsRead`
  - **Files**:
    - `packages/client/src/pages/NotificationsPage.tsx`
    - `packages/client/src/pages/NotificationsPage.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/NotificationsPage.test.tsx` — all tests pass
  - **Brief ref**: Frontend — pages (NotificationsPage)

- [x] TASK-07: AdminCampaignsPage + CampaignDetailPage cancellation panel + tests
  - **Goal**: Create the admin campaigns page (milestone verification only) and add the cancellation approval panel to `CampaignDetailPage`
  - **Details**:
    1. Create `packages/client/src/pages/AdminCampaignsPage.tsx`: protected `requireAdmin`; fetches Settlement campaigns via `fetchCampaignsByStatus('Settlement')`; for each campaign shows title, link to `/campaigns/:id`, list of milestones with `status === 'Submitted'`; per submitted milestone: evidence description, evidence URL, Verify button (`useMutation` → `verifyMilestone`), Return-with-feedback form (textarea + Return button, `useMutation` → `returnMilestone(campaignId, milestoneId, feedback)`); on success `invalidateQueries(['admin-settlement-campaigns'])`; loading/error states
    2. In `packages/client/src/pages/CampaignDetailPage.tsx`: add admin-only "Approve Cancellation" panel when `user.role === 'Administrator'` and `campaign.cancellationRequestedAt != null`; shows requested date and Approve button; `useMutation` → `approveCancellation(campaignId)`; on success `invalidateQueries(['campaign', campaignId])`
    3. Create `packages/client/src/pages/AdminCampaignsPage.test.tsx`: test loading, error, settlement campaign list with submitted milestones, Verify mutation, Return mutation with feedback
    4. (Tests for cancellation panel can be added to existing `CampaignDetailPage.test.tsx` if it exists, otherwise create focused tests)
  - **Files**:
    - `packages/client/src/pages/AdminCampaignsPage.tsx`
    - `packages/client/src/pages/AdminCampaignsPage.test.tsx`
    - `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/AdminCampaignsPage.test.tsx` — all tests pass; `npx tsc -b --noEmit` clean
  - **Brief ref**: Frontend — pages (AdminCampaignsPage); Cancellation Approval section

- [x] TASK-08: Header.tsx — role-based nav links + NotificationBell
  - **Goal**: Add reviewer/admin nav links and the `NotificationBell` to `Header.tsx` (desktop + mobile)
  - **Details**:
    1. Add `isReviewer` check (`user?.role === 'Reviewer'`); when true add "Review" NavLink (`/review`) in desktop nav and mobile menu
    2. When `isAdmin`: add "Campaigns" NavLink (`/admin/campaigns`) and "Users" NavLink (`/admin/users`) in desktop nav and mobile menu
    3. Add `<NotificationBell />` inside the authenticated block (before logout button) in both desktop nav and mobile menu
    4. Follow existing NavLink pattern with `isActive` style function
    5. Update any hardcoded `/review-queue` link to `/review`
  - **Files**:
    - `packages/client/src/components/Header.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; inspect Header renders in test or build
  - **Brief ref**: Frontend — Header.tsx

- [ ] TASK-09: App.tsx routing + ReviewQueuePage post-claim nav
  - **Goal**: Rename `/review-queue` to `/review`, add all new routes, and fix post-claim navigation
  - **Details**:
    1. In `packages/client/src/App.tsx`: rename `/review-queue` → `/review` for `ReviewQueuePage`; add reviewer-protected route `/review/:id` → `ReviewDetailPage`; add admin-protected route `/admin/campaigns` → `AdminCampaignsPage`; add authenticated route `/notifications` → `NotificationsPage`; import all new pages
    2. In `packages/client/src/pages/ReviewQueuePage.tsx`: in `CampaignRow.onSuccess`, change `navigate('/campaigns/${campaign.id}')` → `navigate('/review/${campaign.id}')`
  - **Files**:
    - `packages/client/src/App.tsx`
    - `packages/client/src/pages/ReviewQueuePage.tsx`
  - **Verify**: `npm run build` succeeds; `npx tsc -b --noEmit` clean; `npm run lint` passes
  - **Brief ref**: Frontend — routing (App.tsx); Frontend — ReviewQueuePage.tsx

- [ ] TASK-10: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the three core user flows described in the brief
  - **Details**: Create `e2e/reviewer-admin.spec.ts` with three test groups:
    1. Reviewer flow: log in as reviewer → click "Review" in header → review queue loads → click Claim on a submitted campaign → land on `/review/:id` → submit approve form → campaign status shows Approved
    2. Admin flow: log in as admin → navigate to `/admin/campaigns` → see Settlement campaign milestones → click Verify → milestone status updates
    3. Notification flow: log in as any user → notification bell shows badge → click bell → `/notifications` loads → click "Mark as read" → badge count decrements
    Follow patterns in `e2e/auth.spec.ts` and `e2e/campaigns.spec.ts`. Use Playwright Test API. Tests must pass against the running local stack.
  - **Files**: `e2e/reviewer-admin.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Verification — E2E flows

- [ ] TASK-11: Final CI verification
  - **Goal**: Ensure the full CI pipeline passes with all changes integrated
  - **Details**: Run the complete CI check suite: type-check all packages, lint, format check, markdown lint, full build, and test coverage (80% threshold). Fix any issues found.
  - **Files**: (no new files; fixes only if needed)
  - **Verify**: `./scripts/ci-check.sh` exits 0; `npm run test:coverage` passes coverage thresholds
  - **Brief ref**: Verification — Build; Verification — CI checks
