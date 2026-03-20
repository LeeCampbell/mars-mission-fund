# Brief: Issue #115 — Reviewer and Admin Campaign Management UI

## Goal

Build the reviewer and admin campaign management UI: a dedicated review detail page (`/review/:id`),
admin milestone verification and cancellation approval panels embedded in the campaign detail page,
a notification bell in the header with unread-count badge and mark-as-read support,
and role-based navigation links for Reviewer and Admin roles.
A `PATCH /v1/notifications/:id/read` backend endpoint must also be added.
Two missing data fields must also be exposed in the campaign detail API: `cancellationRequestedAt`
and milestone evidence columns (`evidenceDescription`, `evidenceUrl`, `evidenceSubmittedAt`, `feedback`).

## Scope

**In scope:**

- `/review/:id` page — full campaign proposal view with approve/reject action forms (Reviewer role,
  `Under Review` status, reviewer assigned to this user)
- Update claim action in `ReviewQueuePage` to navigate to `/review/:id` instead of `/campaigns/:id`
- Rename queue route from `/review-queue` to `/review` to match the issue spec; keep route protected
  by `requireReviewer`
- Admin milestone verification panel on campaign detail page — for each milestone with `status ===
  'Submitted'`, show evidence details with Verify / Return (with feedback textarea) actions
  (`Settlement` status, Admin role)
- Admin cancellation approval panel on campaign detail page — show pending cancellation when
  `cancellationRequestedAt` is non-null, with Approve action (`Live` status, Admin role)
- Expose missing fields in campaign detail API: `cancellationRequestedAt` in main campaign SQL
  select; `evidenceDescription`, `evidenceUrl`, `evidenceSubmittedAt`, `feedback` in milestones
  SQL select
- Add `cancellationRequestedAt` to `CampaignDetailSchema` in `@mmf/shared`
- Notification bell icon in `Header` showing unread count badge; clicking toggles inline dropdown
  listing recent notifications (max 10) with mark-as-read per item; "View all" link to
  `/notifications`
- `GET /v1/notifications` already exists — add `PATCH /v1/notifications/:id/read` endpoint
- `/notifications` page listing all notifications newest first with mark-as-read per item
- Role-based nav: add "Review" link (`/review`) in Header for Reviewer role
- Component tests for: review detail page, notification bell, admin actions panel

**Out of scope:**

- Creator deadline extension requests or milestone change request flows
- Appeal process UI
- Admin user management (already exists at `/admin/users`)
- Payment processing or escrow UI
- Email notification delivery
- Real-time (WebSocket) notification updates — polling or manual refresh only

## Approach

### Backend: Expose missing campaign detail fields

In `packages/server/src/campaigns/queries.ts`, `getCampaignById`:

1. Add `cancellation_requested_at AS "cancellationRequestedAt"` to the main campaign SQL SELECT
2. Add `evidence_description AS "evidenceDescription"`, `evidence_url AS "evidenceUrl"`,
   `evidence_submitted_at AS "evidenceSubmittedAt"`, `feedback` to the milestones SQL SELECT

In `packages/shared/src/campaign.ts`:

1. Add `cancellationRequestedAt: z.coerce.date().nullable()` to `CampaignDetailSchema`
   (note: already present as nullable optional on Milestone)

### Backend: PATCH /v1/notifications/:id/read

Add `markNotificationRead(pool, notificationId, userId)` to
`packages/server/src/campaigns/queries.ts` — updates `read = true WHERE id = $1 AND user_id = $2`.
Add route to `packages/server/src/notifications/routes.ts`:
`PATCH /:id/read` — authenticate, call `markNotificationRead`, return 204.

### Frontend: Notification API client

Create `packages/client/src/api/notifications.ts` with `fetchNotifications()` and
`markNotificationRead(id)`.
`Notification` type is already exported from `@mmf/shared`.

### Frontend: NotificationBell component

`packages/client/src/components/NotificationBell.tsx` — a button in the Header showing a bell SVG
icon with an unread-count badge (using existing `Badge` component).
Uses `useQuery` to poll `GET /v1/notifications` (30s refetch interval).
On click, toggles an inline dropdown listing up to 10 notifications with a "Mark as read" button
per unread item (using `useMutation` → `PATCH`), and a "View all" link to `/notifications`.
Renders nothing when not authenticated.

### Frontend: Header update

Add `NotificationBell` to `Header.tsx` in the authenticated section.
Add "Review" nav link (`/review`) visible when `user.role === 'Reviewer'`.
Update `/review-queue` references to `/review`.

### Frontend: ReviewDetailPage (`/review/:id`)

`packages/client/src/pages/ReviewDetailPage.tsx` — fetches campaign via `useCampaign(id)` hook,
renders full proposal using existing section components (`MilestonesSection`, `StretchGoalsSection`,
`TeamSection`, `FundingProgressSection`, `CampaignUpdatesSection`), and embeds `ReviewActionsPanel`.
Redirects to `/review` if user is not the assigned reviewer for this campaign.
Register route in `App.tsx` inside `<ProtectedRoute requireReviewer>`:
`<Route path="/review/:id" element={<ReviewDetailPage />} />`.
Also add `<Route path="/review" element={<ReviewQueuePage />} />` (rename from `/review-queue`),
keeping the old path or removing it (prefer clean rename since this is issue-defined).
Update `ReviewQueuePage` claim `onSuccess` navigate to `/review/${campaign.id}`.

### Frontend: AdminActionsPanel component

`packages/client/src/components/campaigns/AdminActionsPanel.tsx` — rendered on `CampaignDetailPage`
when `user.role` is `'Administrator'` or `'SuperAdministrator'`.

Two sub-sections:

1. **Milestone Verification** — shown when `campaign.status === 'Settlement'`.
   Iterates `campaign.milestones` filtering to those with `status === 'Submitted'`.
   Each shows: title, `evidenceDescription`, `evidenceUrl` (as link), `evidenceSubmittedAt`.
   "Verify" button → `POST /v1/campaigns/:id/milestones/:mid/verify` (no body required).
   "Return" link → expands a feedback textarea + submit button →
   `POST /v1/campaigns/:id/milestones/:mid/return` with `{ feedback }`.
   Both invalidate `['campaign', id]` on success.

2. **Cancellation Approval** — shown when `campaign.status === 'Live'` and
   `campaign.cancellationRequestedAt` is non-null.
   Shows date of request and "Approve Cancellation" button →
   `POST /v1/campaigns/:id/approve-cancel` (no body).
   Invalidates `['campaign', id]` on success.

Add `verifyMilestone(campaignId, milestoneId)`, `returnMilestone(campaignId, milestoneId, feedback)`,
and `approveCancel(id)` to `packages/client/src/api/campaigns.ts`.

### Frontend: NotificationsPage (`/notifications`)

`packages/client/src/pages/NotificationsPage.tsx` — lists all notifications newest first.
Each row: title, message, campaign link (if `campaignId`), timestamp, "Mark as read" button for
unread. Shares the same React Query key as `NotificationBell` so marking read is reflected
immediately across both.
Register route in `App.tsx` under `<ProtectedRoute>`:
`<Route path="/notifications" element={<NotificationsPage />} />`.

### Frontend: CampaignDetailPage update

Import and render `AdminActionsPanel` below `ReviewActionsPanel` in the sidebar/actions area.
Pass `campaign` and `user` props.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/shared/src/campaign.ts` | modify | Add `cancellationRequestedAt` to `CampaignDetailSchema` |
| `packages/server/src/campaigns/queries.ts` | modify | Add missing columns to `getCampaignById`; add `markNotificationRead` |
| `packages/server/src/notifications/routes.ts` | modify | Add `PATCH /:id/read` route |
| `packages/client/src/api/notifications.ts` | create | `fetchNotifications`, `markNotificationRead` |
| `packages/client/src/api/campaigns.ts` | modify | Add `verifyMilestone`, `returnMilestone`, `approveCancel` |
| `packages/client/src/components/NotificationBell.tsx` | create | Bell icon + unread badge + dropdown |
| `packages/client/src/components/campaigns/AdminActionsPanel.tsx` | create | Admin milestone verify + cancellation approve UI |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | Dedicated `/review/:id` page for reviewers |
| `packages/client/src/pages/NotificationsPage.tsx` | create | Notifications list at `/notifications` |
| `packages/client/src/pages/ReviewQueuePage.tsx` | modify | Update navigate target to `/review/:id` |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Render `AdminActionsPanel` |
| `packages/client/src/components/Header.tsx` | modify | Add `NotificationBell`, Reviewer "Review" nav link |
| `packages/client/src/App.tsx` | modify | Register `/review`, `/review/:id`, `/notifications` routes |
| `packages/client/src/components/NotificationBell.test.tsx` | create | Unit tests |
| `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` | create | Unit tests |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | Unit tests |

## Dependencies

No new npm packages required.
All patterns (React Query, inline styles with CSS vars, authedFetch, useMutation/useQuery) are
already established in the codebase.
Backend API routes for verify/return milestone and approve-cancel already exist and are functional.

## Verification

- **Build**: `npm run build` succeeds; `npx tsc -b --noEmit` and server typecheck pass
- **Lint**: `npm run lint` and `npm run lint:md` pass
- **Tests**: `npm run test:coverage` passes (≥80% threshold)
- **Visual — reviewer flow**:
  1. Log in as a Reviewer demo user
  2. Header shows "Review" nav link
  3. Navigate to `/review` — reviewer queue loads
  4. Claim a submitted campaign — navigates to `/review/:id`
  5. `/review/:id` shows full proposal + Approve/Reject forms
  6. Approve or reject with required text — campaign status updates, redirects/refreshes
- **Visual — admin milestone verification**:
  1. Log in as an Admin demo user
  2. Navigate to a `Settlement`-status campaign with a milestone in `Submitted` status
  3. `AdminActionsPanel` shows evidence details with Verify and Return buttons
  4. Click Verify — milestone transitions to Verified
  5. Click Return — feedback textarea appears; submit returns milestone to creator
- **Visual — admin cancellation approval**:
  1. Navigate to a `Live` campaign with a pending cancellation request
  2. `AdminActionsPanel` shows cancellation approval section
  3. Click "Approve Cancellation" — campaign transitions to Cancelled
- **Visual — notification flow**:
  1. Log in as any authenticated user with notifications
  2. Bell icon appears in header with unread badge
  3. Click bell — dropdown shows recent notifications
  4. Click "Mark as read" — badge count decrements
  5. Navigate to `/notifications` — full list
- **E2E**: Playwright test covering claim → review detail → approve flow
