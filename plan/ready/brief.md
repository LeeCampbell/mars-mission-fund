# Brief: Issue #115 — Reviewer and admin campaign management UI

## Goal

Extend the Mars Mission Fund frontend with a reviewer queue page at `/review`, a dedicated reviewer campaign detail page at `/review/:id`, admin campaign management UI (milestone verification and cancellation approval) at `/admin/campaigns`, a notification bell in the header with unread count, a notifications page at `/notifications` with mark-as-read, and role-based navigation links in the header. One backend endpoint (`PATCH /v1/notifications/:id/read`) and one schema field (`cancellationRequestedAt`) are missing and must be added; all other required backend endpoints already exist.

## Scope

**In scope:**

- Rename/move the reviewer queue route from `/review-queue` to `/review` (update App.tsx, update Header nav link target)
- Reviewer detail page (`/review/:id`) — Reviewer-only view of a claimed campaign with full proposal content plus approve/reject forms; after claim, navigate here instead of `/campaigns/:id`
- Admin campaigns page (`/admin/campaigns`) with two sections:
  - Milestone verification: list campaigns in Settlement status; for each, show submitted-evidence milestones with Verify / Return-with-feedback actions
  - Cancellation approval: list campaigns with a pending cancellation request; show Approve button per campaign
- Notification bell icon in `Header` with unread count badge (authenticated only)
- Notifications page (`/notifications`) — authenticated, shows notification list, mark-as-read per item
- `PATCH /v1/notifications/:id/read` backend endpoint (the only missing backend piece)
- `markNotificationAsRead(pool, id, userId)` DB query in `campaigns/queries.ts`
- Add `cancellationRequestedAt: z.coerce.date().nullable().optional()` to `CampaignDetailSchema` in `@mmf/shared`; update backend SQL SELECT clauses to expose this field
- New client API functions: `markNotificationAsRead()`, `verifyMilestone()`, `returnMilestone()`, `approveCancellation()`
- New `useNotifications` TanStack Query hook with 30-second polling refetch
- Use `Notification` type from `@mmf/shared` in the client (remove the duplicate inline interface from `api/notifications.ts`)
- Role-based navigation: "Review" link for Reviewers; "Users" and "Campaigns" admin links for Admins in both desktop nav and mobile menu
- Component tests for all new pages and components

**Out of scope:**

- Reviewer recusal or reviewer reassignment UI
- Review SLA warnings and auto-escalation
- Deadline extension or milestone change request approval UI
- Cancellation denial (no backend endpoint exists)
- Admin aggregate dashboard or statistics
- Multi-approval disbursement workflow
- Real-time WebSocket notifications (polling is sufficient)

## Approach

### Backend — new endpoint

Add `PATCH /:id/read` to `packages/server/src/notifications/routes.ts`:
- Require `authenticate` middleware
- Call `markNotificationAsRead(pool, params.id, user.id)` — UPDATE with both `id` and `user_id` to prevent cross-user access
- Return 204 No Content

Add `markNotificationAsRead(pool, id, userId)` to `packages/server/src/campaigns/queries.ts`:
```sql
UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2
```

### Backend — schema extension

In `packages/shared/src/campaign.ts`, extend `CampaignDetailSchema` to add:
```ts
cancellationRequestedAt: z.coerce.date().nullable().optional()
```

In `packages/server/src/campaigns/queries.ts`, in the `getCampaignById` SELECT, add:
```sql
c.cancellation_requested_at AS "cancellationRequestedAt"
```

### Frontend — API layer

**`packages/client/src/api/notifications.ts`:**
- Import `Notification` type from `@mmf/shared` (remove inline interface)
- Add `markNotificationAsRead(id: string): Promise<void>` — `PATCH /v1/notifications/:id/read`

**`packages/client/src/api/campaigns.ts`:**
- `verifyMilestone(campaignId: string, milestoneId: string): Promise<void>` — `POST /v1/campaigns/:id/milestones/:mid/verify`
- `returnMilestone(campaignId: string, milestoneId: string, feedback: string): Promise<void>` — `POST /v1/campaigns/:id/milestones/:mid/return`
- `approveCancellation(campaignId: string): Promise<void>` — `POST /v1/campaigns/:id/approve-cancel`

### Frontend — hooks

**`packages/client/src/hooks/useNotifications.ts`** — wraps `fetchNotifications()` with:
```ts
queryKey: ['notifications'],
queryFn: fetchNotifications,
refetchInterval: 30_000,
```

### Frontend — pages

**`ReviewDetailPage`** (`packages/client/src/pages/ReviewDetailPage.tsx`):
- Protected by `requireReviewer`
- Uses `useParams()` for campaign ID; fetches via `useCampaign(id)`
- Renders full proposal: description, team, milestones (read-only), stretch goals, alignment statement
- Renders `ReviewActionsPanel` — already supports approve/reject for assigned reviewers (reuse as-is)
- Renders loading/error states with same patterns as other pages

**`NotificationsPage`** (`packages/client/src/pages/NotificationsPage.tsx`):
- Protected (any authenticated user)
- Uses `useNotifications()` hook
- Renders table/list: type badge, title, message, created date
- Unread rows visually distinguished (e.g. font-weight or background tint using `--color-bg-card`)
- "Mark as read" button per row — `useMutation` calling `markNotificationAsRead(id)`; on success `invalidateQueries(['notifications'])`
- Empty state: "No notifications."

**`AdminCampaignsPage`** (`packages/client/src/pages/AdminCampaignsPage.tsx`):
- Protected by `requireAdmin`
- Two sections, each with heading, table, loading/error state

  *Milestone Verification section:*
  - Fetch campaigns with `fetchCampaigns()` using `status=Settlement` query param (backend `ListQuerySchema` supports `status` filter)
  - For each campaign, display title, link to `/campaigns/:id`, and a list of milestones with `status === 'Submitted'`
  - Per submitted milestone: evidence description, evidence URL, Verify button and Return-with-feedback form (textarea + Return button)
  - Verify: `useMutation` → `verifyMilestone(campaignId, milestoneId)`; Return: `useMutation` → `returnMilestone(campaignId, milestoneId, feedback)`
  - On success: `invalidateQueries(['admin-settlement-campaigns'])`

  *Cancellation Approval:*
  - Implemented on `CampaignDetailPage` (not as a separate list on `AdminCampaignsPage`) — add an admin-only "Approve Cancellation" panel when `user.role === 'Administrator'` and `campaign.cancellationRequestedAt != null`
  - Shows the requested date and an Approve button
  - Approve: `useMutation` → `approveCancellation(campaignId)`; on success `invalidateQueries(['campaign', campaignId])`
  - This avoids N+1 fetching of campaign details from a list view, since `cancellationRequestedAt` is not in `CampaignSummarySchema`
  - `AdminCampaignsPage` contains only the Milestone Verification section

### Frontend — components

**`NotificationBell`** (`packages/client/src/components/NotificationBell.tsx`):
- Only rendered when `isAuthenticated`
- Uses `useNotifications()` hook
- Renders a button with inline SVG bell icon and unread count badge (absolute-positioned red circle)
- Clicking navigates to `/notifications`
- Zero unread → no badge (or badge with "0" hidden)

### Frontend — routing (App.tsx)

Rename existing route:
```
/review-queue → /review   (ReviewQueuePage, protected requireReviewer)
```

Add new routes:
```tsx
<Route element={<ProtectedRoute requireReviewer />}>
  <Route path="/review/:id" element={<ReviewDetailPage />} />
</Route>
<Route element={<ProtectedRoute requireAdmin />}>
  <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
</Route>
<Route element={<ProtectedRoute />}>
  <Route path="/notifications" element={<NotificationsPage />} />
</Route>
```

### Frontend — Header.tsx

- Add `isReviewer` check: `user?.role === 'Reviewer'`
- When `isReviewer`: add "Review" nav link (`/review`) in desktop nav and mobile menu
- When `isAdmin`: add "Campaigns" nav link (`/admin/campaigns`) and "Users" nav link (`/admin/users`) in desktop nav and mobile menu; keep existing Admin badge or remove it
- Add `<NotificationBell />` in the authenticated block (before logout), both desktop nav and mobile menu
- Follow existing NavLink pattern (style function with `isActive`)

### Frontend — ReviewQueuePage.tsx

In `CampaignRow.onSuccess`, change:
```ts
void navigate(`/campaigns/${campaign.id}`)
// →
void navigate(`/review/${campaign.id}`)
```

Also update the header link from `/review-queue` to `/review` if hardcoded anywhere.

### fetchCampaigns API

Update `fetchCampaigns` (or create a new `fetchCampaignsByStatus`) to accept an optional status param:
```ts
export async function fetchCampaignsByStatus(status: CampaignStatus): Promise<CampaignSummary[]>
```
Used by `AdminCampaignsPage` to fetch Settlement campaigns.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/shared/src/campaign.ts` | modify | Add `cancellationRequestedAt` to `CampaignDetailSchema` |
| `packages/server/src/notifications/routes.ts` | modify | Add `PATCH /:id/read` endpoint |
| `packages/server/src/campaigns/queries.ts` | modify | Add `markNotificationAsRead()` query; add `cancellationRequestedAt` to campaign SELECT |
| `packages/client/src/api/notifications.ts` | modify | Use shared `Notification` type; add `markNotificationAsRead()` |
| `packages/client/src/api/campaigns.ts` | modify | Add `verifyMilestone()`, `returnMilestone()`, `approveCancellation()`, `fetchCampaignsByStatus()` |
| `packages/client/src/hooks/useNotifications.ts` | create | TanStack Query hook for notifications with 30s polling |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | Reviewer campaign detail + approve/reject panel |
| `packages/client/src/pages/NotificationsPage.tsx` | create | Notification list with mark-as-read |
| `packages/client/src/pages/AdminCampaignsPage.tsx` | create | Milestone verification + cancellation approval |
| `packages/client/src/components/NotificationBell.tsx` | create | Bell icon button with unread count badge |
| `packages/client/src/components/Header.tsx` | modify | Add reviewer/admin nav links, NotificationBell, mobile parity |
| `packages/client/src/App.tsx` | modify | Rename `/review-queue` → `/review`; add new routes |
| `packages/client/src/pages/ReviewQueuePage.tsx` | modify | Navigate to `/review/:id` after claim |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Add admin "Approve Cancellation" button when `cancellationRequestedAt` non-null |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | Component tests |
| `packages/client/src/pages/NotificationsPage.test.tsx` | create | Component tests |
| `packages/client/src/pages/AdminCampaignsPage.test.tsx` | create | Component tests |
| `packages/client/src/components/NotificationBell.test.tsx` | create | Component tests |

## Dependencies

No new npm packages required. All libraries are already installed:
- `@tanstack/react-query` — polling hook via `refetchInterval`
- `react-router` — new routes and `useParams`
- Existing UI components (`Badge`, `Button`, `Card`) — reused in new pages

## Verification

### Build
```bash
npm run build -w @mmf/shared
npx tsc -b --noEmit
npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
```
All must succeed with no TypeScript errors.

### CI checks
```bash
./scripts/ci-check.sh
```

### Visual (at `http://localhost:5173`)

**As Reviewer:**
- Header shows "Review" navigation link (not "Review Queue")
- Header shows notification bell with unread count badge
- `/review` shows submitted campaigns table with Claim button
- Click Claim → redirected to `/review/:id`
- `/review/:id` shows full proposal + ReviewActionsPanel with approve/reject forms
- Submitting approve form → campaign transitions to Approved

**As Admin:**
- Header shows "Users" and "Campaigns" admin navigation links
- `/admin/campaigns` shows milestone verification section (Settlement campaigns with Submitted milestones)
- Clicking Verify → milestone status becomes Verified
- Clicking Return with feedback → milestone status becomes Returned
- CampaignDetailPage for a campaign with pending cancellation → shows "Approve Cancellation" button → click → campaign transitions to Cancelled

**Any authenticated user:**
- Bell icon in header shows unread count
- Clicking bell navigates to `/notifications`
- `/notifications` shows notification list with badges, timestamps
- "Mark as read" button updates row; unread count in bell decreases

### Tests
```bash
npx vitest run packages/client/src/pages/ReviewDetailPage.test.tsx
npx vitest run packages/client/src/pages/NotificationsPage.test.tsx
npx vitest run packages/client/src/pages/AdminCampaignsPage.test.tsx
npx vitest run packages/client/src/components/NotificationBell.test.tsx
npm run test:coverage
```

### E2E flows (Playwright)
- Reviewer logs in → clicks "Review" in header → review queue loads → clicks Claim on a submitted campaign → lands on `/review/:id` → submits approve form → campaign status shows Approved
- Admin logs in → navigates to `/admin/campaigns` → sees Settlement campaign milestones → clicks Verify → milestone status updates
- User logs in → notification bell shows badge → clicks bell → `/notifications` loads → clicks "Mark as read" → badge count decrements
