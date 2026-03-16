# Tasks: Issue #115 — Reviewer and admin campaign management UI

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Server — markNotificationRead query + PATCH /:id/read endpoint
  - **Goal**: Add the server-side notification read endpoint and its backing query
  - **Details**:
    - In `packages/server/src/campaigns/queries.ts`, add `markNotificationRead(pool: Pool, id: string, userId: string): Promise<void>` — runs `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`
    - In `packages/server/src/notifications/routes.ts`, add `router.patch('/:id/read', authenticate, async (req, res) => ...)` — calls `markNotificationRead`, returns 204 on success; 404 if no row updated
  - **Files**: `packages/server/src/campaigns/queries.ts`, `packages/server/src/notifications/routes.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; manual curl or unit test confirms 204 response
  - **Brief ref**: Server — Add `PATCH /v1/notifications/:id/read`

- [x] TASK-02: Server — POST /:id/deny-cancellation route
  - **Goal**: Add the deny-cancellation endpoint that Admin can use to reject a creator's cancellation request
  - **Details**:
    - In `packages/server/src/campaigns/routes.ts`, add `POST /:id/deny-cancellation` following the same pattern as `approve-cancel`
    - Middleware: `authenticate`, `requireRole('Administrator')`
    - Sets `cancellation_requested_at = NULL` via a new `denyCancellation(pool, id)` query in `queries.ts`
    - Writes an audit event (pattern: `writeAuditEvent` / `insertAuditLog`) and optionally a notification to the creator
    - Returns 200 with updated campaign; 404 if not found; 400 if no cancellation was pending
  - **Files**: `packages/server/src/campaigns/queries.ts`, `packages/server/src/campaigns/routes.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes
  - **Brief ref**: Server — Add `POST /v1/campaigns/:id/deny-cancellation`

- [ ] TASK-03: Client API layer — campaign and notification functions
  - **Goal**: Expose all new server endpoints to the frontend through typed API helpers
  - **Details**:
    - In `packages/client/src/api/campaigns.ts`, add:
      - `verifyMilestone(campaignId: string, milestoneId: string)` → `POST /v1/campaigns/:id/milestones/:mid/verify`
      - `returnMilestone(campaignId: string, milestoneId: string, feedback: string)` → `POST /v1/campaigns/:id/milestones/:mid/return` with body `{ feedback }`
      - `approveCancellation(campaignId: string)` → `POST /v1/campaigns/:id/approve-cancellation`
      - `denyCancellation(campaignId: string)` → `POST /v1/campaigns/:id/deny-cancellation`
    - In `packages/client/src/api/notifications.ts`, add:
      - `markNotificationRead(id: string)` → `PATCH /v1/notifications/:id/read`
    - All functions use the existing `authedFetch()` helper; return parsed or void as appropriate
  - **Files**: `packages/client/src/api/campaigns.ts`, `packages/client/src/api/notifications.ts`
  - **Verify**: `npx tsc -b --noEmit` passes with no type errors
  - **Brief ref**: Client API layer

- [ ] TASK-04: Client hook — useNotifications
  - **Goal**: Create a TanStack Query hook that fetches notifications and exposes a mark-read mutation
  - **Details**:
    - Create `packages/client/src/hooks/useNotifications.ts`
    - `useNotifications()` returns `{ notifications, unreadCount, markRead, isLoading, error }`
    - Query: `useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })`
    - Mutation: `useMutation({ mutationFn: markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) })`
    - `unreadCount` derived as `notifications.filter(n => !n.read).length`
  - **Files**: `packages/client/src/hooks/useNotifications.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; hook can be imported without errors
  - **Brief ref**: Client hooks — useNotifications

- [ ] TASK-05: App.tsx routes + ReviewQueuePage navigation + Layout titles
  - **Goal**: Wire up all new routes and fix the post-claim navigation redirect
  - **Details**:
    - In `packages/client/src/App.tsx`:
      - Rename `path="/review-queue"` → `path="/review"` (keep `requireReviewer` guard)
      - Add lazy import for `ReviewDetailPage`, `AdminCampaignsPage`, `NotificationsPage`
      - Add `path="/review/:id"` under `requireReviewer` guard → `<ReviewDetailPage />`
      - Add `path="/admin/campaigns"` under `requireAdmin` guard → `<AdminCampaignsPage />`
      - Add `path="/notifications"` under authenticated `ProtectedRoute` → `<NotificationsPage />`
      - Use `React.lazy(() => import(...))` with a `<Suspense fallback={...}>` wrapper for each new lazy page
    - In `packages/client/src/pages/ReviewQueuePage.tsx`, change post-claim `navigate` from `` `/campaigns/${campaign.id}` `` → `` `/review/${campaign.id}` ``
    - In `packages/client/src/components/Layout.tsx`, add route title entries:
      - `'/review': 'Review Queue'`
      - `'/notifications': 'Notifications'`
      - `'/admin/campaigns': 'Campaign Management'`
  - **Files**: `packages/client/src/App.tsx`, `packages/client/src/pages/ReviewQueuePage.tsx`, `packages/client/src/components/Layout.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; existing ReviewQueuePage tests still pass
  - **Brief ref**: App.tsx routes, ReviewQueuePage.tsx, Layout.tsx

- [ ] TASK-06: Create ReviewDetailPage
  - **Goal**: Implement the `/review/:id` page showing full campaign proposal and review actions panel
  - **Details**:
    - Create `packages/client/src/pages/ReviewDetailPage.tsx`
    - Use `useParams()` to get `id`; fetch with existing `useCampaign(id)` hook
    - Show: campaign title, description, goal amount, milestones list, team members, media links
    - Render existing `ReviewActionsPanel` component (handles approve/reject for assigned reviewer + creator resubmit for rejected)
    - Include accessible back link (`← Back to Review Queue`) that navigates to `/review`
    - Set document title via `useEffect(() => { document.title = \`Review: \${campaign.title} — MMF\` }, [campaign])`
    - Follow existing page styling patterns (inline CSS custom properties, loading/error/empty states)
  - **Files**: `packages/client/src/pages/ReviewDetailPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; navigating to `/review/:id` renders the page without errors
  - **Brief ref**: Client pages — ReviewDetailPage

- [ ] TASK-07: Create AdminCampaignsPage
  - **Goal**: Implement the `/admin/campaigns` page for milestone verification and cancellation approval
  - **Details**:
    - Create `packages/client/src/pages/AdminCampaignsPage.tsx`
    - Fetch campaigns using existing `useCampaigns()` or a filtered query
    - Two sections:
      1. **"Pending Milestone Verifications"** — campaigns with any `milestone.status === 'Submitted'`; for each: show campaign title, milestone title, evidence text/URL; "Verify" button calls `verifyMilestone` mutation; "Return" button opens inline feedback input and calls `returnMilestone(campaignId, milestoneId, feedback)` mutation
      2. **"Pending Cancellation Requests"** — campaigns with `cancellationRequestedAt` set; for each: show campaign title, requested date; "Approve" button calls `approveCancellation`; "Deny" button calls `denyCancellation`
    - All mutations use `useMutation`, invalidate relevant query keys on success, show loading/success/error feedback
    - Follow existing page styling patterns
  - **Files**: `packages/client/src/pages/AdminCampaignsPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders two sections without runtime errors
  - **Brief ref**: Client pages — AdminCampaignsPage

- [ ] TASK-08: Create NotificationsPage
  - **Goal**: Implement the `/notifications` page listing all notifications with per-item mark-as-read
  - **Details**:
    - Create `packages/client/src/pages/NotificationsPage.tsx`
    - Use `useNotifications()` hook
    - List notifications newest-first (sorted by `createdAt` descending)
    - Unread items visually distinct (e.g., bold title or highlighted background using CSS custom properties)
    - Each notification shows: title, message, timestamp (formatted), campaign link if `campaignId` set
    - "Mark as read" button per unread notification — calls `markRead(id)` mutation from hook
    - Empty state when no notifications
    - Follow existing page styling patterns
  - **Files**: `packages/client/src/pages/NotificationsPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; page renders without errors with empty and populated states
  - **Brief ref**: Client pages — NotificationsPage

- [ ] TASK-09: Update Header — notification bell + role-based nav links
  - **Goal**: Add the notification bell with unread badge and role-based nav links for Reviewer and Admin
  - **Details**:
    - In `packages/client/src/components/Header.tsx`:
      - Add `isReviewer` check: `user?.role === 'Reviewer'`
      - Add "Review Queue" `NavLink` to `/review` in both `mmf-desktop-nav` and `mmf-mobile-nav` when `isReviewer`
      - Add "Admin Campaigns" `NavLink` to `/admin/campaigns` in both nav sections when `isAdmin`
      - Add notification bell: inline SVG bell icon with `aria-label="Notifications"`; visible when authenticated; shows unread count badge (e.g., red circle with number) when `unreadCount > 0`; clicking navigates to `/notifications`
      - Import `useNotifications` hook; only call it when `user` is authenticated to avoid unauthenticated query
      - Replicate bell in both desktop and mobile nav sections
    - Use the existing `NavLink` active-style pattern
  - **Files**: `packages/client/src/components/Header.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; header renders reviewer/admin links and bell based on role
  - **Brief ref**: Header — notification bell + role-based nav

- [ ] TASK-10: Component tests for new pages and Header bell
  - **Goal**: Write Vitest + Testing Library component tests for all new UI
  - **Details**:
    - `packages/client/src/pages/ReviewDetailPage.test.tsx`:
      - Mock `useCampaign` hook; test loading state, error state, campaign info display, back link
      - Test `ReviewActionsPanel` renders for assigned reviewer
    - `packages/client/src/pages/AdminCampaignsPage.test.tsx`:
      - Mock `useCampaigns` / query; test two sections render with pending items
      - Test verify button calls `verifyMilestone`; return flow shows feedback input; approve/deny cancellation buttons call correct mutations
    - `packages/client/src/pages/NotificationsPage.test.tsx`:
      - Mock `useNotifications`; test list renders, unread items visually distinct, "Mark as read" triggers mutation, empty state renders
    - `packages/client/src/components/Header.test.tsx` (or extend existing):
      - Test notification bell visible when authenticated; badge shows correct unread count; hidden when unauthenticated
      - Test "Review Queue" link visible only for Reviewer role; "Admin Campaigns" link visible only for Admin roles
    - Follow existing test patterns (see `ReviewQueuePage.test.tsx`, `Header.test.tsx`)
  - **Files**: `packages/client/src/pages/ReviewDetailPage.test.tsx`, `packages/client/src/pages/AdminCampaignsPage.test.tsx`, `packages/client/src/pages/NotificationsPage.test.tsx`, (extend) `packages/client/src/components/Header.test.tsx`
  - **Verify**: `npm run test:coverage` passes with ≥80% threshold; all new tests green
  - **Brief ref**: Brief — Component tests for all new pages and the notification bell

- [ ] TASK-11: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the reviewer and admin flows described in the brief
  - **Details**: Create or update files in `e2e/`. Follow patterns in existing tests (`e2e/auth.spec.ts`, `e2e/campaigns.spec.ts`). Use Playwright Test API. Tests must pass against the running local stack.
    - In `e2e/review-pipeline.spec.ts` (modify or create):
      - Reviewer logs in → sees "Review Queue" nav → navigates to `/review`
      - Claims a campaign → redirected to `/review/:id` → sees full proposal + actions panel
      - Approves campaign with notes → confirm status update
      - Rejects campaign with rationale and guidance → confirm status update
    - In `e2e/admin-campaigns.spec.ts` (create):
      - Admin logs in → sees "Admin Campaigns" nav → navigates to `/admin/campaigns`
      - Verifies submitted milestone evidence → confirm success feedback
      - Returns milestone with feedback → confirm success feedback
      - Approves cancellation request → confirm status update
      - Denies cancellation request → confirm status update
      - Authenticated user navigates to `/notifications`, marks a notification as read → badge count decreases
  - **Files**: `e2e/review-pipeline.spec.ts`, `e2e/admin-campaigns.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Verification — E2E flows
