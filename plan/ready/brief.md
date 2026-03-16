# Brief: Issue #115 — Reviewer and Admin Campaign Management UI

## Goal

Build the reviewer and admin campaign management UI for Mars Mission Fund. This includes a dedicated
reviewer workflow (queue page at `/review` + review detail page at `/review/:id`), an admin campaign
management section (milestone verification and cancellation approval), a notification bell with unread
count in the header, a notifications page at `/notifications` with mark-as-read, role-based navigation
links for reviewers and admins, and the backend `PATCH /v1/notifications/:id/read` endpoint.

## Scope

**In scope:**

- Rename reviewer queue route from `/review-queue` to `/review` (rename `ReviewQueuePage.tsx` stays
  but route path changes)
- New review detail page at `/review/:id` with full proposal view and approve/reject actions
- Admin campaign management section: milestone verification page and cancellation approval page (or
  combined `AdminCampaignsPage`)
- `AdminActionsPanel` component for milestone verify/return and cancellation approve/deny, integrated
  into `CampaignDetailPage`
- Notification bell component in header with unread count badge and dropdown
- Notifications page at `/notifications` with mark-as-read per-notification
- Backend `PATCH /v1/notifications/:id/read` endpoint
- `markNotificationRead` query in server
- `markNotificationAsRead` function in client API
- `useNotifications` React Query hook
- Role-based navigation: Review link for Reviewers, Admin campaign management link for Admins
- Component and hook tests for all new components

**Out of scope:**

- Changes to the review/approval server API (already implemented — claim, approve, reject)
- Real-time notifications (WebSocket/SSE)
- Email notifications
- Campaign suspension/resolution workflows
- Milestone evidence submission UI changes (already built on creator side in `CampaignDetailPage`)
- Changes to `GET /v1/notifications` (already exists and works)

## Approach

### 1. Backend — `PATCH /v1/notifications/:id/read`

Add to `packages/server/src/notifications/routes.ts`:

```
PATCH /:id/read — authenticated, marks own notification as read
  - Validate :id is UUID
  - Check notification belongs to authenticated user (403 otherwise)
  - Update read=true, return 200 with updated notification
```

Add `markNotificationRead(pool, notificationId, userId)` to
`packages/server/src/campaigns/queries.ts` (following existing `createNotification` /
`getNotificationsForUser` patterns).

### 2. Reviewer Queue Route Rename (`/review-queue` → `/review`)

In `App.tsx`, change the reviewer route path from `/review-queue` to `/review`. The component
`ReviewQueuePage.tsx` stays but is updated to navigate to `/review/:id` after claiming (currently
navigates to `/campaigns/:id`).

### 3. Review Detail Page (`/review/:id`)

Create `packages/client/src/pages/ReviewDetailPage.tsx`. Protected with `requireReviewer`. Displays:

- Campaign header (title, category, status, hero image)
- Full description and alignment statement
- Milestones section with verification criteria (key for reviewers)
- Team section and stretch goals
- `ReviewActionsPanel` for approve/reject actions
- Back navigation link to `/review`

Uses existing `useCampaign(id)` hook (same as `CampaignDetailPage`). The key difference from
`CampaignDetailPage` is reviewer-focused layout and no creator/donor UI elements.

### 4. Admin Campaign Management

Create `packages/client/src/pages/AdminCampaignsPage.tsx` at `/admin/campaigns`. Protected with
`requireAdmin`. Lists:

- Campaigns in `Settlement` state (have submitted milestone evidence needing admin verification)
- Campaigns with pending cancellation requests (`Live` status where `cancellationRequestedAt` is set)

> **Note**: `cancellationRequestedAt` may only be on `CampaignDetail` (not `CampaignSummary`). If
> so, fetch campaigns with `status=Live` and filter by `cancellationRequestedAt !== null` after
> fetching full details, or extend `CampaignSummary` to include this field. Verify during
> implementation before deciding approach.

Create `packages/client/src/components/campaigns/AdminActionsPanel.tsx`. Conditionally renders:

- **Milestone verification panel** (when `campaign.status === 'Settlement'` and user is Admin): shows
  each milestone with `status === 'Submitted'`, its evidence description/URL, with Verify button and
  Return (with feedback textarea) button
- **Cancellation approval panel** (when `campaign.cancellationRequestedAt` is set and user is Admin):
  approve and deny buttons

Integrate `AdminActionsPanel` into `CampaignDetailPage` following the same conditional-rendering
pattern as `ReviewActionsPanel`.

Add to `packages/client/src/api/campaigns.ts`:

- `verifyMilestone(campaignId, milestoneId)` → `POST /v1/campaigns/:id/milestones/:mid/verify`
- `returnMilestone(campaignId, milestoneId, feedback)` →
  `POST /v1/campaigns/:id/milestones/:mid/return`
- `approveCancellation(campaignId)` → `POST /v1/campaigns/:id/approve-cancel`

> **Note**: Verify whether a `POST /v1/campaigns/:id/deny-cancel` endpoint exists on the server for
> rejecting cancellation requests. If not, the deny action may need a server-side addition or can be
> deferred if not required by the spec.

### 5. Notification System UI

Create `packages/client/src/hooks/useNotifications.ts` — wraps `fetchNotifications()` with React
Query `useQuery`, returns `{ notifications, unreadCount, markAsRead }`.

Create `packages/client/src/components/NotificationBell.tsx`:

- Bell SVG icon with absolute-positioned badge showing unread count (hidden when 0)
- On click: toggles a dropdown showing last ~10 notifications (title, message, relative time)
- Each notification row navigates to the relevant campaign on click
- Calls `markNotificationAsRead(id)` when a notification is clicked
- "View all" link to `/notifications`
- Shown only for authenticated users

Add `markNotificationAsRead(id)` to `packages/client/src/api/notifications.ts` — calls
`PATCH /v1/notifications/:id/read`.

Create `packages/client/src/pages/NotificationsPage.tsx` at `/notifications` (protected, any
authenticated user):

- Full list of all notifications, newest first
- Per-notification mark-as-read button (or auto-mark on view)
- Unread/read visual distinction
- Empty state when no notifications

### 6. Role-Based Navigation

Update `packages/client/src/components/Header.tsx`:

- For users with `Reviewer` role: add "Review" nav link to `/review` (desktop + mobile)
- For Admin/SuperAdmin users: add "Admin" nav link to `/admin/users` or a new `/admin` landing
  (currently the badge exists but there's no nav link)
- For all authenticated users: add `NotificationBell` component

### 7. Tests

Add component tests:

- `packages/client/src/pages/ReviewDetailPage.test.tsx` — mock `useCampaign`, renders proposal view
  and `ReviewActionsPanel`
- `packages/client/src/components/NotificationBell.test.tsx` — renders bell, shows unread badge,
  opens dropdown
- `packages/client/src/pages/NotificationsPage.test.tsx` — renders notification list, mark as read
  interaction
- `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` — renders verify/return
  milestone and approve-cancel panels conditionally

## Files to Create/Modify

| File                                                                       | Action | Description                                        |
| -------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `packages/client/src/pages/ReviewDetailPage.tsx`                           | Create | Review detail at `/review/:id`                     |
| `packages/client/src/pages/AdminCampaignsPage.tsx`                         | Create | Admin campaign management list at `/admin/campaigns` |
| `packages/client/src/components/campaigns/AdminActionsPanel.tsx`           | Create | Admin milestone verify + cancellation approve UI   |
| `packages/client/src/components/NotificationBell.tsx`                      | Create | Bell icon with unread badge + dropdown             |
| `packages/client/src/pages/NotificationsPage.tsx`                          | Create | Full notifications list at `/notifications`        |
| `packages/client/src/hooks/useNotifications.ts`                            | Create | React Query hook for notifications                 |
| `packages/client/src/pages/ReviewDetailPage.test.tsx`                      | Create | Tests for review detail page                       |
| `packages/client/src/components/NotificationBell.test.tsx`                 | Create | Tests for notification bell                        |
| `packages/client/src/pages/NotificationsPage.test.tsx`                     | Create | Tests for notifications page                       |
| `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx`      | Create | Tests for admin actions panel                      |
| `packages/client/src/App.tsx`                                              | Modify | Add `/review`, `/review/:id`, `/admin/campaigns`, `/notifications` routes; rename `/review-queue` to `/review` |
| `packages/client/src/components/Header.tsx`                                | Modify | Add `NotificationBell`, Reviewer nav link, Admin nav link |
| `packages/client/src/api/campaigns.ts`                                     | Modify | Add `verifyMilestone`, `returnMilestone`, `approveCancellation` |
| `packages/client/src/api/notifications.ts`                                 | Modify | Add `markNotificationAsRead`                       |
| `packages/client/src/pages/ReviewQueuePage.tsx`                            | Modify | Navigate to `/review/:id` after claiming (was `/campaigns/:id`) |
| `packages/client/src/pages/CampaignDetailPage.tsx`                         | Modify | Integrate `AdminActionsPanel` (conditional render) |
| `packages/server/src/notifications/routes.ts`                              | Modify | Add `PATCH /:id/read` endpoint                     |
| `packages/server/src/campaigns/queries.ts`                                 | Modify | Add `markNotificationRead` query                   |

## Dependencies

No new npm packages required. All features use:

- Existing React Query (`@tanstack/react-query`) patterns already in the codebase
- Existing `useCampaign` hook, `ReviewActionsPanel` component, Badge/Button UI components
- Existing server infrastructure (JWT middleware, role middleware, pool pattern)
- Existing `CampaignStatus`, `Notification` types from `@mmf/shared`

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors
- **Tests**: `npm run test:coverage` passes (≥80% coverage threshold)
- **Visual checks at `http://localhost:5173`**:
  - Log in as reviewer → see "Review" nav link → `/review` shows Submitted campaigns in FIFO table
  - Claim a campaign → navigate to `/review/:id` with full proposal + approve/reject panel
  - Log in as admin → see "Admin" nav link → `/admin/campaigns` shows milestone and cancellation items
  - Navigate to a Settlement campaign → `AdminActionsPanel` shows submitted milestone evidence with
    verify/return buttons
  - All authenticated users see notification bell in header; badge shows unread count
  - Click bell → dropdown shows notifications; click one → navigates to campaign
  - `/notifications` lists all notifications with mark-as-read
- **E2E flows for Playwright tests**:
  - Reviewer logs in, navigates to `/review`, claims a campaign, lands on `/review/:id`, approves it
  - Admin logs in, views `/admin/campaigns`, sees campaigns needing attention
  - Authenticated user sees notification bell, opens dropdown, marks notification as read
  - Navigate to `/notifications` and verify full list renders
