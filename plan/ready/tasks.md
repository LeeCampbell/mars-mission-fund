# Tasks: Issue #115 — Reviewer and Admin Campaign Management UI

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Update server campaign queries
  - **Goal**: Expose missing DB columns and add `markNotificationRead` query
  - **Details**:
    - In `getCampaignById` SELECT: add `cancellation_requested_at AS "cancellationRequestedAt"` to the campaign columns
    - In `getCampaignById` milestones SELECT: add `evidence_description AS "evidenceDescription"`, `evidence_url AS "evidenceUrl"`, `evidence_submitted_at AS "evidenceSubmittedAt"` (columns exist per migration `20260311000015_add_milestone_evidence_fields.sql`)
    - Add `markNotificationRead(pool, id, userId)` function that executes `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id` — return null if no row found
  - **Files**: `packages/server/src/campaigns/queries.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; grep confirms new columns and function in the file
  - **Brief ref**: Server → step 1

- [ ] TASK-02: Update shared CampaignDetailSchema
  - **Goal**: Add `cancellationRequestedAt` to the shared campaign schema so client and server share the type
  - **Details**: In `CampaignDetailSchema`, add `cancellationRequestedAt: z.coerce.date().nullable().optional()`. `MilestoneSchema` already has evidence fields as optional — confirm they are present and add them if missing.
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: `npm run build -w @mmf/shared` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Server → step 2

- [ ] TASK-03: Add PATCH /v1/notifications/:id/read endpoint
  - **Goal**: Expose the mark-as-read action via REST so the client can call it
  - **Details**:
    - Import and call `markNotificationRead` (from TASK-01) inside the handler
    - Route: `PATCH /:id/read`, authenticated middleware required
    - Call `markNotificationRead(pool, req.params.id, req.user.id)`
    - If result is null (not found / not owned), respond `404 { error: 'Notification not found' }`
    - Otherwise respond `200 { success: true }`
  - **Files**: `packages/server/src/notifications/routes.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; route is visible in the file
  - **Brief ref**: Server → step 3

- [ ] TASK-04: Add client API functions
  - **Goal**: Give the React layer typed wrappers for the new and existing endpoints
  - **Details**:
    - In `packages/client/src/api/notifications.ts`: add `markNotificationRead(id: string)` → `PATCH /v1/notifications/${id}/read`
    - In `packages/client/src/api/campaigns.ts`:
      - `verifyMilestone(campaignId: string, milestoneId: string)` → `POST /v1/campaigns/${campaignId}/milestones/${milestoneId}/verify`
      - `returnMilestone(campaignId: string, milestoneId: string, feedback: string)` → `POST /v1/campaigns/${campaignId}/milestones/${milestoneId}/return` with `{ feedback }` body
      - `approveCancellation(campaignId: string)` → `POST /v1/campaigns/${campaignId}/approve-cancellation`
    - All functions should throw on non-2xx responses (follow existing error-handling patterns in those files)
  - **Files**: `packages/client/src/api/notifications.ts`, `packages/client/src/api/campaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; functions are exported and importable
  - **Brief ref**: Client API section

- [ ] TASK-05: Create ReviewDetailPage
  - **Goal**: Reviewer-scoped campaign detail page at `/review/:id` with approve/reject panel
  - **Details**:
    - Create `packages/client/src/pages/ReviewDetailPage.tsx`
    - Use `useParams()` to get `id`; fetch campaign via `useCampaign(id)` hook (or equivalent data hook already used in `CampaignDetailPage`)
    - Display: campaign title, description, team info, milestones list, stretch goals
    - Embed the existing `ReviewActionsPanel` component prominently (it already handles approve/reject for the assigned reviewer)
    - Show a loading skeleton while fetching; show an error state on failure
    - Create `packages/client/src/pages/ReviewDetailPage.test.tsx` with tests:
      - Renders campaign title and description when data loads
      - Renders `ReviewActionsPanel` for the assigned reviewer
      - Shows loading state
  - **Files**: `packages/client/src/pages/ReviewDetailPage.tsx`, `packages/client/src/pages/ReviewDetailPage.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/ReviewDetailPage.test.tsx` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Client Pages & Components → step 5

- [ ] TASK-06: Create AdminActionsPanel
  - **Goal**: Admin-only panel on campaign detail showing milestone evidence review and cancellation approval
  - **Details**:
    - Create `packages/client/src/components/campaigns/AdminActionsPanel.tsx`
    - Props: `campaign: CampaignDetail`, `onActionComplete: () => void` (to refetch after mutation)
    - Only render when `user.role === 'Administrator' || user.role === 'SuperAdministrator'`
    - **Milestone Verification sub-panel**: filter milestones where `status === 'Submitted'`; for each, show `evidenceDescription`, `evidenceUrl` link (if set), and two buttons — "Verify" (calls `verifyMilestone`) and "Return" (shows a feedback `<textarea>` then calls `returnMilestone`). After success, call `onActionComplete`.
    - **Cancellation Approval sub-panel**: shown when `campaign.cancellationRequestedAt !== null`. Shows the pending request date and an "Approve Cancellation" button that calls `approveCancellation`. After success, call `onActionComplete`. No Deny endpoint exists — just show an informational note.
    - Use `useMutation`-style state (or plain `useState` + async handler) for loading/error feedback on buttons.
    - Create `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx`:
      - Renders milestone verify/return UI when milestones are in Submitted state
      - Does not render milestone panel when no milestones are Submitted
      - Renders cancellation approval UI when `cancellationRequestedAt` is set
      - Does not render cancellation panel when `cancellationRequestedAt` is null/undefined
  - **Files**: `packages/client/src/components/campaigns/AdminActionsPanel.tsx`, `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Client Pages & Components → step 6

- [ ] TASK-07: Create NotificationBell
  - **Goal**: Header bell icon with unread count badge, navigates to `/notifications` on click
  - **Details**:
    - Create `packages/client/src/components/NotificationBell.tsx`
    - On mount, fetch `GET /v1/notifications` (use existing `getNotifications` API function or call directly)
    - Compute unread count from returned list (`filter(n => !n.read).length`)
    - Render a bell icon (use an SVG or a Unicode bell character `🔔` — prefer an accessible SVG); show a red badge with the count when > 0; show no badge when count is 0
    - On click, navigate to `/notifications` via `useNavigate`
    - Create `packages/client/src/components/NotificationBell.test.tsx`:
      - Renders red badge with correct unread count when notifications exist
      - Renders no badge when all notifications are read (or list is empty)
      - Clicking the bell navigates to `/notifications`
  - **Files**: `packages/client/src/components/NotificationBell.tsx`, `packages/client/src/components/NotificationBell.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/components/NotificationBell.test.tsx` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Client Pages & Components → step 7

- [ ] TASK-08: Create NotificationsPage
  - **Goal**: `/notifications` page listing all notifications with per-item mark-as-read
  - **Details**:
    - Create `packages/client/src/pages/NotificationsPage.tsx`
    - Fetch `GET /v1/notifications` on mount; display newest-first
    - Each row shows: notification message/title, timestamp (formatted), read/unread indicator, "Mark as read" button (hidden or disabled when already read)
    - "Mark as read" calls `markNotificationRead(id)` then refetches (or optimistically updates) the list
    - Show an empty state (`"No notifications"`) when list is empty
    - Protected route — no role restriction, just authenticated
    - Create `packages/client/src/pages/NotificationsPage.test.tsx`:
      - Renders notification list with messages
      - "Mark as read" button is present for unread notifications
      - Shows empty state when list is empty
      - Clicking "Mark as read" calls `markNotificationRead` with the correct id
  - **Files**: `packages/client/src/pages/NotificationsPage.tsx`, `packages/client/src/pages/NotificationsPage.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/NotificationsPage.test.tsx` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Client Pages & Components → step 8

- [ ] TASK-09: Wire up routes, navigation, and page integrations
  - **Goal**: Connect all new pages/components into the app shell; update existing pages
  - **Details**:
    - **`App.tsx`**:
      - Rename `path="/review-queue"` → `path="/review"` (element stays `ReviewQueuePage`)
      - Add `path="/review/:id"` under `requireReviewer` guard, element `ReviewDetailPage`
      - Add `path="/notifications"` under `ProtectedRoute` (no role restriction), element `NotificationsPage`
    - **`Header.tsx`**:
      - Add "Review" nav link visible when `user.role === 'Reviewer'` pointing to `/review`
      - Add "Admin" nav link visible when `user.role === 'Administrator' || 'SuperAdministrator'` pointing to `/admin/users` (replace static "Admin" badge if present)
      - Embed `<NotificationBell />` next to the profile link when user is authenticated
    - **`ReviewQueuePage.tsx`**: Update claim success redirect from `/campaigns/${campaign.id}` → `/review/${campaign.id}`
    - **`CampaignDetailPage.tsx`**: Import `AdminActionsPanel` and render it below `ReviewActionsPanel`; pass `campaign` and a `refetch` callback; only renders for admin roles (the component itself enforces this, but the import is needed here)
  - **Files**: `packages/client/src/App.tsx`, `packages/client/src/components/Header.tsx`, `packages/client/src/pages/ReviewQueuePage.tsx`, `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npm run build` passes; `npx tsc -b --noEmit` passes; `npm run lint` passes
  - **Brief ref**: Routing & Navigation section

- [ ] TASK-10: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the reviewer, admin, and notification flows
  - **Details**: Create or update files in `e2e/`. Follow patterns in existing tests (`e2e/auth.spec.ts`, `e2e/campaigns.spec.ts`, `e2e/review-pipeline.spec.ts`). Use Playwright Test API.
    - **Update `e2e/review-pipeline.spec.ts`**: Replace all `/review-queue` URL references with `/review`; update any step that previously expected redirect to `/campaigns/:id` after claim to now expect `/review/:id`
    - **Create `e2e/admin-campaign-management.spec.ts`**:
      - `admin can verify milestone evidence`: log in as admin, navigate to a campaign in Settlement state that has a milestone with `Submitted` evidence, confirm `AdminActionsPanel` is visible, click "Verify", assert success feedback
      - `admin can approve a cancellation request`: log in as admin, navigate to a campaign with a pending cancellation, confirm approval panel is visible, click "Approve Cancellation", assert success feedback
    - **Create `e2e/notifications.spec.ts`**:
      - `notification bell shows unread count`: log in as a user who has unread notifications, confirm bell badge is visible with a count > 0
      - `user can mark notification as read`: navigate to `/notifications`, click "Mark as read" on an unread item, assert the item is now marked read and unread count decreases
    - Tests must pass against the running local stack
  - **Files**: `e2e/review-pipeline.spec.ts`, `e2e/admin-campaign-management.spec.ts`, `e2e/notifications.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Tests section + Verification section
