# Brief: Issue #115 — Reviewer and admin campaign management UI

## Goal

Implement the reviewer and admin campaign management UI for the MMF review pipeline. This adds a dedicated review detail page for reviewers (claim → review → approve/reject), an admin campaigns management page (milestone evidence verification and cancellation approval/denial), a notification bell with unread count in the header, a notifications page with mark-as-read, and role-based navigation links for Reviewer and Admin roles. All new UI connects to already-existing server endpoints (plus one new PATCH endpoint for marking notifications read).

## Scope

**In scope:**

- Move reviewer queue route from `/review-queue` → `/review` (rename path in `App.tsx`, update post-claim navigation in `ReviewQueuePage`)
- New page `/review/:id` — Review Detail: full campaign proposal + `ReviewActionsPanel` (approve/reject actions for assigned reviewer)
- New page `/admin/campaigns` — Admin Campaigns: lists campaigns with pending milestone evidence (any milestone.status = "Submitted") and campaigns with pending cancellation requests (`cancellation_requested_at` set); actions inline or via detail view
- New page `/notifications` — Notifications list with mark-as-read per item
- Notification bell icon in `Header` with unread count badge (desktop + mobile nav)
- `PATCH /v1/notifications/:id/read` server endpoint
- Client API functions: `markNotificationRead`, `verifyMilestone`, `returnMilestone`, `approveCancellation`, `denyCancellation`
- `useNotifications` TanStack Query hook
- Role-based nav: "Review Queue" link shown for Reviewer role; "Admin Campaigns" link shown for Administrator/SuperAdministrator
- Component tests for all new pages and the notification bell
- E2E test coverage for reviewer and admin flows
- All CI checks pass

**Out of scope:**

- Push/WebSocket notifications
- Email notifications
- Notification preferences
- Bulk mark-as-read
- Admin reassigning reviewers (covered in issue #3 / L4-001)
- Any new DB migrations (schema already has all needed columns)

## Approach

### Server

**1. Add `PATCH /v1/notifications/:id/read`** in `packages/server/src/notifications/routes.ts`. Requires `authenticate` middleware. Add a `markNotificationRead(pool, id, userId)` query function in `packages/server/src/campaigns/queries.ts` that does `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`. Scope by `user_id` to prevent unauthorized reads.

**2. Add `POST /v1/campaigns/:id/deny-cancellation`** in the existing campaign routes (follows the same pattern as `approve-cancellation`). Sets `cancellation_requested_at = NULL` and optionally logs a note. Requires `requireRole('Administrator')` middleware.

### Client API layer (`packages/client/src/api/`)

Add to `campaigns.ts`:
- `verifyMilestone(campaignId, milestoneId)` → `POST /v1/campaigns/:id/milestones/:mid/verify`
- `returnMilestone(campaignId, milestoneId, feedback: string)` → `POST /v1/campaigns/:id/milestones/:mid/return`
- `approveCancellation(campaignId)` → `POST /v1/campaigns/:id/approve-cancellation`
- `denyCancellation(campaignId)` → `POST /v1/campaigns/:id/deny-cancellation`

Add to `notifications.ts`:
- `markNotificationRead(id)` → `PATCH /v1/notifications/:id/read`

### Client hooks (`packages/client/src/hooks/`)

Create `useNotifications.ts` — wraps `fetchNotifications()` with `useQuery({ queryKey: ['notifications'] })` and exposes a `markRead` mutation that calls `markNotificationRead(id)` then invalidates `['notifications']`.

### Client pages (`packages/client/src/pages/`)

**`ReviewDetailPage.tsx`** (`/review/:id`):
- Fetches campaign detail via existing `useCampaign(id)` hook
- Shows full campaign info (title, description, goal, milestones, team, media)
- Renders `ReviewActionsPanel` (already handles approve/reject for assigned reviewer + creator resubmit for rejected)
- Accessible back link to `/review`

**`AdminCampaignsPage.tsx`** (`/admin/campaigns`):
- Fetches campaigns list via existing `useCampaigns()` or a new `useAdminCampaigns` hook filtering for `status === 'Submitted'` milestones or `cancellationRequestedAt` set
- Two sections: "Pending Milestone Verifications" and "Pending Cancellation Requests"
- For milestone verifications: fetch campaign detail inline or link to `/admin/campaigns/:id`; show evidence text/URL, verify/return buttons
- For cancellation requests: show campaign title, requested date, approve/deny buttons
- All actions use useMutation, invalidate on success

**`NotificationsPage.tsx`** (`/notifications`):
- Uses `useNotifications()` hook
- Lists notifications newest-first; unread items visually distinct
- "Mark as read" button per notification

### Header (`packages/client/src/components/Header.tsx`)

- Add `isReviewer` check: `user?.role === 'Reviewer'`
- Add "Review Queue" `NavLink` to `/review` when `isReviewer`
- Add "Admin Campaigns" `NavLink` to `/admin/campaigns` when `isAdmin`
- Add notification bell icon (inline SVG, `aria-label="Notifications"`) visible when authenticated; shows unread count badge using `useNotifications()` hook; clicking navigates to `/notifications`
- Replicate all additions in mobile nav (both `mmf-desktop-nav` and `mmf-mobile-nav`)

### App.tsx routes

- Change `path="/review-queue"` → `path="/review"` (keep `requireReviewer` guard)
- Add `path="/review/:id"` under `requireReviewer` guard, lazy `ReviewDetailPage`
- Add `path="/admin/campaigns"` under `requireAdmin` guard, lazy `AdminCampaignsPage`
- Add `path="/notifications"` under authenticated `ProtectedRoute`, lazy `NotificationsPage`

### ReviewQueuePage.tsx

- Update post-claim `navigate` from `/campaigns/${id}` → `/review/${id}`

### Layout.tsx

- Add route titles: `'/review': 'Review Queue'`, `'/notifications': 'Notifications'`, `'/admin/campaigns': 'Campaign Management'`
- Dynamic title in `ReviewDetailPage` via `useEffect` (pattern already used elsewhere)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/server/src/notifications/routes.ts` | modify | Add `PATCH /:id/read` endpoint with `authenticate` middleware |
| `packages/server/src/campaigns/queries.ts` | modify | Add `markNotificationRead(pool, id, userId)` query |
| `packages/server/src/campaigns/routes.ts` | modify | Add `POST /:id/deny-cancellation` route |
| `packages/client/src/api/campaigns.ts` | modify | Add `verifyMilestone`, `returnMilestone`, `approveCancellation`, `denyCancellation` |
| `packages/client/src/api/notifications.ts` | modify | Add `markNotificationRead` |
| `packages/client/src/hooks/useNotifications.ts` | create | TanStack Query hook for notifications + mark-read mutation |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | `/review/:id` page with campaign detail + ReviewActionsPanel |
| `packages/client/src/pages/AdminCampaignsPage.tsx` | create | `/admin/campaigns` page with milestone verification + cancellation approval |
| `packages/client/src/pages/NotificationsPage.tsx` | create | `/notifications` page with mark-as-read |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | Component tests |
| `packages/client/src/pages/AdminCampaignsPage.test.tsx` | create | Component tests |
| `packages/client/src/pages/NotificationsPage.test.tsx` | create | Component tests |
| `packages/client/src/components/Header.tsx` | modify | Add notification bell, Reviewer nav link, Admin Campaigns nav link (desktop + mobile) |
| `packages/client/src/App.tsx` | modify | Rename `/review-queue` → `/review`, add `/review/:id`, `/admin/campaigns`, `/notifications` routes |
| `packages/client/src/pages/ReviewQueuePage.tsx` | modify | Update post-claim navigate to `/review/:id` |
| `packages/client/src/components/Layout.tsx` | modify | Add route titles for new pages |
| `e2e/review-pipeline.spec.ts` | modify | Add E2E tests for reviewer claim → review detail → approve/reject flows |
| `e2e/admin-campaigns.spec.ts` | create | E2E tests for milestone verification and cancellation approval flows |

## Dependencies

No new npm packages needed. All server endpoints are built on existing Express + pg patterns. All client patterns (TanStack Query, React Router lazy routes, inline CSS custom properties, ProtectedRoute) are already established.

**Prerequisite**: Issue #3 (Review pipeline API) — confirmed complete; all review/admin server endpoints already exist in `app.ts`.

## Verification

**Build:**
```bash
npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
```

**Unit tests:**
```bash
npm run test:coverage  # 80% threshold must pass
```

**Visual (browser at `http://localhost:5173`):**
- Log in as Reviewer → see "Review Queue" nav link → click → `/review` shows submitted campaigns
- Claim a campaign → redirected to `/review/:id` → see full proposal + approve/reject panel
- Approve with notes → campaign status changes; reject with rationale + guidance → status changes
- Log in as Admin → see "Admin Campaigns" nav link → `/admin/campaigns` shows pending milestones + cancellation requests
- Verify a milestone → confirm success; Return a milestone with feedback → confirm success
- Approve/deny a cancellation request → confirm status updates
- Notification bell in header shows unread count; clicking opens `/notifications`
- Mark a notification as read → badge count decreases; item changes visual state

**E2E flows:**
- Reviewer claims campaign from `/review`, reviews from `/review/:id`, approves with notes
- Reviewer rejects campaign with rationale and guidance
- Admin verifies submitted milestone evidence
- Admin returns milestone with feedback
- Admin approves cancellation request
- Authenticated user views notifications, marks one as read
