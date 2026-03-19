# Tasks: Issue #115 — Reviewer and Admin Campaign Management UI

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add server queries for notifications and admin campaign lists
  - **Goal**: Add the three new DB query functions needed by the new server routes
  - **Details**: In `packages/server/src/campaigns/queries.ts` add: (1) `markNotificationRead(pool, notificationId, userId)` — UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2; (2) `getCampaignsWithPendingMilestones(pool)` — JOIN campaigns with campaign_milestones WHERE campaign_milestones.status = 'Submitted', deduplicated by campaign id, returning CampaignSummary[]; (3) `getCampaignsWithPendingCancellations(pool)` — SELECT campaigns WHERE cancellation_requested_at IS NOT NULL AND status = 'Live', returning CampaignSummary[].
  - **Files**: `packages/server/src/campaigns/queries.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes with no new errors
  - **Brief ref**: §1 Server changes — queries

- [x] TASK-02: Add server routes for notification read and admin campaign endpoints
  - **Goal**: Expose the new queries via HTTP endpoints
  - **Details**: (1) In `packages/server/src/notifications/routes.ts` add `PATCH /:id/read` — calls `markNotificationRead(pool, req.params.id, user.id)`, requires `authenticate` middleware, returns 204. (2) In `packages/server/src/campaigns/routes.ts` add `GET /admin/campaigns/pending-milestones` and `GET /admin/campaigns/pending-cancellations` — both require `authenticate` + `requireRole('Administrator')` middleware and call the corresponding new query functions, returning JSON arrays.
  - **Files**: `packages/server/src/notifications/routes.ts`, `packages/server/src/campaigns/routes.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; routes mounted at correct paths
  - **Brief ref**: §1 Server changes — routes; §2 dedicated admin endpoints

- [x] TASK-03: Extend client API modules
  - **Goal**: Add all new API call functions to the client
  - **Details**: (1) In `packages/client/src/api/notifications.ts` add `markNotificationRead(id: string): Promise<void>` — PATCH /v1/notifications/:id/read. (2) In `packages/client/src/api/campaigns.ts` add: `verifyMilestone(id, mid, notes)` — POST /v1/campaigns/:id/milestones/:mid/verify; `returnMilestone(id, mid, feedback)` — POST /v1/campaigns/:id/milestones/:mid/return; `approveCancellation(id)` — POST /v1/campaigns/:id/approve-cancellation; `fetchCampaignsWithPendingMilestones()` — GET /v1/admin/campaigns/pending-milestones; `fetchCampaignsWithPendingCancellations()` — GET /v1/admin/campaigns/pending-cancellations. All return typed promises consistent with existing patterns in the file.
  - **Files**: `packages/client/src/api/notifications.ts`, `packages/client/src/api/campaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; all new functions exported
  - **Brief ref**: §2 Client API layer

- [ ] TASK-04: Update App.tsx routing
  - **Goal**: Wire all new and renamed routes into the router
  - **Details**: In `packages/client/src/App.tsx`: (1) Rename the existing `/review-queue` route to `/review` (keep `ReviewQueuePage` component unchanged for now). (2) Add a lazy-loaded `ReviewDetailPage` under a `ProtectedRoute` requiring Reviewer role at `/review/:id`. (3) Add a lazy-loaded `NotificationsPage` under `ProtectedRoute` (any auth) at `/notifications`. (4) Add a lazy-loaded `AdminMilestoneVerificationPage` under `ProtectedRoute` requiring Admin role at `/admin/milestones`. (5) Add a lazy-loaded `AdminCancellationApprovalPage` under `ProtectedRoute` requiring Admin role at `/admin/cancellations`. Use `React.lazy(() => import('./pages/PageName'))` with a `<Suspense>` fallback consistent with other routes.
  - **Files**: `packages/client/src/App.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; no TS errors for missing page modules (pages created in subsequent tasks)
  - **Brief ref**: §3 Routing

- [ ] TASK-05: Update ReviewQueuePage post-claim navigation
  - **Goal**: After claiming a campaign, navigate to the review detail page instead of the public campaign page
  - **Details**: In `packages/client/src/pages/ReviewQueuePage.tsx`, find the `onSuccess` callback in `CampaignRow` (or wherever `useClaimCampaign` / claim mutation resolves) and change the navigate call from `/campaigns/${campaign.id}` to `/review/${campaign.id}`.
  - **Files**: `packages/client/src/pages/ReviewQueuePage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; navigate target reads `/review/${id}` in the source
  - **Brief ref**: §6 ReviewQueuePage tweak

- [ ] TASK-06: Create ReviewDetailPage
  - **Goal**: Build the reviewer's campaign detail page with approve/reject actions
  - **Details**: Create `packages/client/src/pages/ReviewDetailPage.tsx`. Use `useParams` to get `id`. Fetch campaign with `useQuery(['campaign', id], () => fetchCampaign(id))`. Render the full campaign proposal (title, summary, description, milestones, team, stretch goals) reusing existing campaign detail sub-components (`MilestonesSection`, `TeamSection`, etc. — check what `CampaignDetailPage` uses and mirror it). Embed the existing `ReviewActionsPanel` component. Omit funding progress bar and contributor widget. Show a loading skeleton and error state. Pattern mirrors `CampaignDetailPage` layout.
  - **Files**: `packages/client/src/pages/ReviewDetailPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders in browser at `/review/:id`
  - **Brief ref**: §4 ReviewDetailPage

- [ ] TASK-07: Create NotificationsPage
  - **Goal**: Build the notifications list page with mark-as-read functionality
  - **Details**: Create `packages/client/src/pages/NotificationsPage.tsx`. Fetch with `useQuery(['notifications'], fetchNotifications)`. List notifications newest-first showing title, message, relative timestamp, and read/unread indicator. Unread items have a "Mark as read" button that calls `useMutation` → `markNotificationRead(id)` then invalidates `['notifications']`. Add a "Mark all as read" header button that iterates unread items and fires mutations for each. Empty state: "No notifications yet." Use semantic color tokens consistent with existing pages.
  - **Files**: `packages/client/src/pages/NotificationsPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders at `/notifications`
  - **Brief ref**: §4 NotificationsPage

- [ ] TASK-08: Create AdminMilestoneVerificationPage
  - **Goal**: Build the admin page for verifying or returning submitted milestone evidence
  - **Details**: Create `packages/client/src/pages/AdminMilestoneVerificationPage.tsx`. Fetch with `useQuery(['admin', 'pending-milestones'], fetchCampaignsWithPendingMilestones)`. Display a table with columns: campaign title, milestone title, evidence URL, submitted date, and action buttons. Verify action: show an inline notes text input; on submit call `verifyMilestone(campaignId, milestoneId, notes)` via `useMutation`, then refetch. Return action: show an inline feedback text input; on submit call `returnMilestone(campaignId, milestoneId, feedback)` via `useMutation`, then refetch. Handle loading and empty states. Note: the server returns campaigns with pending milestones — you may need to display each pending milestone as a separate row, so map over the campaigns and their milestones filtered to `status === 'Submitted'`.
  - **Files**: `packages/client/src/pages/AdminMilestoneVerificationPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders at `/admin/milestones`
  - **Brief ref**: §4 AdminMilestoneVerificationPage

- [ ] TASK-09: Create AdminCancellationApprovalPage
  - **Goal**: Build the admin page for approving pending cancellation requests
  - **Details**: Create `packages/client/src/pages/AdminCancellationApprovalPage.tsx`. Fetch with `useQuery(['admin', 'pending-cancellations'], fetchCampaignsWithPendingCancellations)`. Display a table with columns: campaign title, creator, requested date, and an Approve button. Approve action calls `approveCancellation(campaignId)` via `useMutation`, then refetch. Handle loading and empty states. Use semantic tokens consistent with other admin pages.
  - **Files**: `packages/client/src/pages/AdminCancellationApprovalPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders at `/admin/cancellations`
  - **Brief ref**: §4 AdminCancellationApprovalPage

- [ ] TASK-10: Enhance Header with notification bell and role-based nav links
  - **Goal**: Show contextual nav links and a live notification bell to authenticated users
  - **Details**: Modify `packages/client/src/components/Header.tsx`: (1) Add `isReviewer` detection: `user?.role === 'Reviewer'`. (2) Render "Review Queue" nav link → `/review` when `isReviewer`. (3) Render "Milestones" → `/admin/milestones` and "Cancellations" → `/admin/cancellations` nav links when `isAdmin`. (4) Add a `NotificationBell` inline sub-component: fetches notifications with `useQuery(['notifications'], fetchNotifications, { refetchInterval: 30000 })`; shows a bell icon (unicode 🔔 or inline SVG) with a badge displaying the unread count; the bell is a `<Link to="/notifications">` with `aria-label="Notifications (N unread)"`; badge uses `--color-status-error` background and `--color-text-on-accent` text; no badge rendered when count is 0. Apply all new links and bell to both desktop and mobile nav sections.
  - **Files**: `packages/client/src/components/Header.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; Reviewer login shows Review Queue link; Admin login shows Milestones + Cancellations; bell appears when authenticated
  - **Brief ref**: §5 Header enhancements

- [ ] TASK-11: Write component tests for all new/modified UI
  - **Goal**: Achieve 80%+ coverage on all new pages and the updated Header
  - **Details**: Following the pattern in `CampaignFormPage.test.tsx` / `DashboardPage.test.tsx` — mock API functions with `vi.mock('../api/...')`, use `renderWithProviders` (or inline `QueryClientProvider` + `MemoryRouter`), assert with `@testing-library/user-event`. Create: (1) `ReviewQueuePage.test.tsx` — renders queue rows, Claim button disabled while pending, post-claim navigates to `/review/:id`. (2) `ReviewDetailPage.test.tsx` — renders campaign title/description, shows `ReviewActionsPanel` for a Reviewer role. (3) `NotificationsPage.test.tsx` — renders notification list, clicking "Mark as read" calls `markNotificationRead`, empty state message renders. (4) `AdminMilestoneVerificationPage.test.tsx` — renders table rows, clicking Verify submits `verifyMilestone`, clicking Return submits `returnMilestone`. (5) `AdminCancellationApprovalPage.test.tsx` — renders table rows, clicking Approve submits `approveCancellation`. (6) `Header.test.tsx` — notification bell shows unread count badge; bell link has correct aria-label; "Review Queue" link visible for Reviewer but not Backer; "Milestones"/"Cancellations" links visible for Admin but not Reviewer.
  - **Files**: `packages/client/src/pages/ReviewQueuePage.test.tsx`, `packages/client/src/pages/ReviewDetailPage.test.tsx`, `packages/client/src/pages/NotificationsPage.test.tsx`, `packages/client/src/pages/AdminMilestoneVerificationPage.test.tsx`, `packages/client/src/pages/AdminCancellationApprovalPage.test.tsx`, `packages/client/src/components/Header.test.tsx`
  - **Verify**: `npm run test:coverage` — all new tests pass; overall coverage stays ≥ 80%
  - **Brief ref**: §7 Tests

- [ ] TASK-12: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the key reviewer and admin user flows
  - **Details**: Create or update files in `e2e/`. Follow patterns in existing tests (`e2e/auth.spec.ts`, `e2e/campaigns.spec.ts`). Use Playwright Test API. Cover: (1) Reviewer claims a campaign from `/review` queue → lands on `/review/:id` → approves with notes → campaign no longer in queue. (2) Reviewer claims a campaign → rejects with rationale → creator notification appears in bell + `/notifications` page. (3) Admin navigates to `/admin/milestones` → verifies evidence for a milestone → row disappears. (4) Admin navigates to `/admin/cancellations` → approves a cancellation → row disappears. (5) Authenticated user sees notification bell → clicks → lands on `/notifications` → marks notification as read → badge count decreases.
  - **Files**: `e2e/reviewer.spec.ts`, `e2e/admin-campaigns.spec.ts`, `e2e/notifications.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Verification — E2E flows

- [ ] TASK-13: Final build and CI verification
  - **Goal**: Confirm all changes pass the full CI pipeline before pushing
  - **Details**: Run the complete CI check suite: type-check shared, client, and server; lint; format check; markdown lint; full build; unit test coverage. Fix any remaining issues found.
  - **Files**: (no new files; fix any issues across the codebase)
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors
  - **Brief ref**: Verification — Build and Tests
