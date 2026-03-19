# Brief: Issue #115 — Reviewer and Admin Campaign Management UI

## Goal

Add the reviewer workflow UI and admin campaign management pages so that Reviewers can claim and action campaigns via a dedicated review queue and detail page, Admins can verify milestone evidence and approve cancellation requests, and all authenticated users can see and dismiss notifications via a bell icon and notifications page.

## Scope

**In scope:**
- Rename the existing `/review-queue` route to `/review` (queue page already implemented as `ReviewQueuePage.tsx`)
- Update `ReviewQueuePage` post-claim navigation from `/campaigns/:id` → `/review/:id`
- New `ReviewDetailPage` at `/review/:id` — full campaign proposal view + approve/reject actions (reuses `ReviewActionsPanel`)
- New `AdminMilestoneVerificationPage` at `/admin/milestones` — lists campaigns with at least one milestone in "Submitted" status; lets Admin verify or return with feedback
- New `AdminCancellationApprovalPage` at `/admin/cancellations` — lists campaigns with a pending cancellation request (`cancellationRequestedAt != null`); lets Admin approve or deny
- Header: role-based nav links (Review Queue for Reviewers; Milestones, Cancellations links for Admins) and notification bell with unread count badge
- New `NotificationsPage` at `/notifications` — lists all notifications newest-first, mark-as-read per item and mark-all-read
- Server: `PATCH /v1/notifications/:id/read` endpoint
- Server: `markNotificationRead(pool, id, userId)` query in `campaigns/queries.ts`
- Server: `getCampaignsWithPendingMilestones(pool)` query — campaigns with a milestone in status `'Submitted'`
- Server: `getCampaignsWithPendingCancellations(pool)` query — campaigns with `cancellation_requested_at IS NOT NULL`
- Client API: `markNotificationRead(id)` in `notifications.ts`
- Client API: `verifyMilestone(id, mid, notes)`, `returnMilestone(id, mid, feedback)`, `approveCancellation(id)` in `campaigns.ts`
- Component tests for `ReviewDetailPage`, `NotificationsPage`, `AdminMilestoneVerificationPage`, `AdminCancellationApprovalPage`, and the notification bell behaviour in `Header`

**Out of scope:**
- Notification delivery (email, push) — data layer already creates DB rows
- Reviewer recusal / manual reassignment by Admin
- SLA escalation alerts (3-day / 5-day timers)
- Request-clarification flow (campaign stays Under Review)
- Donor/contribution flows
- Payment/escrow logic
- Any mobile-app or non-web surfaces

## Approach

### 1. Server changes (minimal)

**`packages/server/src/campaigns/queries.ts`**
- Add `markNotificationRead(pool, notificationId, userId)` — `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`; guard with `userId` prevents cross-user writes.
- Add `getCampaignsWithPendingMilestones(pool)` — JOIN `campaigns` with `campaign_milestones` WHERE `campaign_milestones.status = 'Submitted'`, return `CampaignSummary[]` (deduplicated by campaign id).
- Add `getCampaignsWithPendingCancellations(pool)` — SELECT campaigns WHERE `cancellation_requested_at IS NOT NULL` and `status = 'Live'`.

**`packages/server/src/notifications/routes.ts`**
- Add `PATCH /:id/read` — calls `markNotificationRead(pool, req.params.id, user.id)`, returns 204. Requires `authenticate` middleware.

### 2. Client API layer

**`packages/client/src/api/notifications.ts`**
- Add `markNotificationRead(id: string): Promise<void>` — `PATCH /v1/notifications/:id/read`.

**`packages/client/src/api/campaigns.ts`**
- Add `verifyMilestone(id: string, mid: string, notes: string): Promise<void>` — `POST /v1/campaigns/:id/milestones/:mid/verify`
- Add `returnMilestone(id: string, mid: string, feedback: string): Promise<void>` — `POST /v1/campaigns/:id/milestones/:mid/return`
- Add `approveCancellation(id: string): Promise<void>` — `POST /v1/campaigns/:id/approve-cancellation`
- Add `fetchCampaignsWithPendingMilestones(): Promise<CampaignSummary[]>` — `GET /v1/campaigns?hasPendingMilestones=true` (see server route change below)
- Add `fetchCampaignsWithPendingCancellations(): Promise<CampaignSummary[]>` — `GET /v1/campaigns?hasPendingCancellations=true`

> **Server route update**: extend the `GET /v1/campaigns` handler (or add dedicated admin endpoints `GET /v1/admin/campaigns/pending-milestones` and `GET /v1/admin/campaigns/pending-cancellations`) that call the new queries. Dedicated endpoints are cleaner and keep RBAC explicit — use `requireRole('Administrator')` middleware on them.

### 3. Routing (`App.tsx`)

- Rename `/review-queue` → `/review` (keep `ReviewQueuePage` component unchanged except post-claim navigate target)
- Add lazy-loaded `ReviewDetailPage` under `ProtectedRoute requireReviewer` at `/review/:id`
- Add lazy-loaded `NotificationsPage` under `ProtectedRoute` (any auth) at `/notifications`
- Add lazy-loaded `AdminMilestoneVerificationPage` under `ProtectedRoute requireAdmin` at `/admin/milestones`
- Add lazy-loaded `AdminCancellationApprovalPage` under `ProtectedRoute requireAdmin` at `/admin/cancellations`

### 4. New pages

**`ReviewDetailPage.tsx`** (`/review/:id`)
- Fetches campaign detail via `fetchCampaign(id)` (existing `useQuery`).
- Renders the full campaign proposal (title, summary, description, milestones, team, stretch goals) using existing campaign detail components (`MilestonesSection`, `TeamSection`, etc.)
- Embeds the existing `ReviewActionsPanel` component (already handles approve/reject with notes).
- Pattern: mirrors `CampaignDetailPage` layout but simplified — no funding progress bar, no contributor widget.

**`NotificationsPage.tsx`** (`/notifications`)
- Fetches via `useQuery(['notifications'], fetchNotifications)`.
- Lists notifications newest-first, showing title, message, relative timestamp, and a read/unread indicator.
- "Mark as read" button per unread item calls `useMutation` → `markNotificationRead(id)` then invalidates `['notifications']`.
- "Mark all as read" button iterates and fires mutations.
- Empty state: "No notifications yet."

**`AdminMilestoneVerificationPage.tsx`** (`/admin/milestones`)
- Fetches campaigns with pending milestone evidence (`GET /v1/admin/campaigns/pending-milestones`).
- Table: campaign title, milestone title, evidence URL, submitted date, Verify / Return actions.
- Verify: `verifyMilestone(campaignId, milestoneId, notes)` with a short notes text input.
- Return: `returnMilestone(campaignId, milestoneId, feedback)` with a feedback text input.
- On success, refetch the list.

**`AdminCancellationApprovalPage.tsx`** (`/admin/cancellations`)
- Fetches campaigns with pending cancellations (`GET /v1/admin/campaigns/pending-cancellations`).
- Table: campaign title, creator, requested date, Approve button.
- Approve: `approveCancellation(campaignId)`.
- On success, refetch the list.

### 5. Header enhancements (`Header.tsx`)

- Add `isReviewer` detection: `user?.role === 'Reviewer'`
- Add nav link "Review Queue" → `/review` when `isReviewer`
- Add nav links "Milestones" → `/admin/milestones` and "Cancellations" → `/admin/cancellations` when `isAdmin`
- Add `NotificationBell` sub-component (inline in Header is fine — no need for a separate file):
  - Fetches notifications using `useQuery(['notifications'], fetchNotifications, { refetchInterval: 30000 })`.
  - Shows bell icon (unicode `🔔` or SVG) with badge showing count of unread notifications.
  - Bell is a `<Link to="/notifications">` with `aria-label="Notifications (N unread)"`.
  - Uses semantic tokens only (`--color-status-error` for badge background, `--color-text-on-accent` for badge text).
- Both desktop and mobile navs must include the new links and bell.

### 6. ReviewQueuePage tweak

- In `CampaignRow`, change `onSuccess` navigate from `/campaigns/${campaign.id}` → `/review/${campaign.id}`.

### 7. Tests

Follow the existing pattern in `CampaignFormPage.test.tsx` / `DashboardPage.test.tsx`:
- Mock API functions with `vi.mock('../api/...')`
- Use `renderWithProviders` helper (or inline `QueryClientProvider` + `MemoryRouter`)
- Assert rendered content and user interactions with `@testing-library/user-event`

Files to create:
- `ReviewQueuePage.test.tsx` — renders queue, disables Claim while pending
- `ReviewDetailPage.test.tsx` — renders proposal, shows ReviewActionsPanel for Reviewer
- `NotificationsPage.test.tsx` — renders list, mark-as-read interaction
- `AdminMilestoneVerificationPage.test.tsx` — renders table, verify/return interactions
- `AdminCancellationApprovalPage.test.tsx` — renders table, approve interaction
- `Header.test.tsx` (or extend existing) — notification bell shows unread count; Review Queue link visible for Reviewer; Admin links visible for Admin

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/src/campaigns/queries.ts` | modify | Add `markNotificationRead`, `getCampaignsWithPendingMilestones`, `getCampaignsWithPendingCancellations` |
| `packages/server/src/notifications/routes.ts` | modify | Add `PATCH /:id/read` endpoint |
| `packages/server/src/campaigns/routes.ts` | modify | Add `GET /v1/admin/campaigns/pending-milestones` and `GET /v1/admin/campaigns/pending-cancellations` (Admin only) |
| `packages/client/src/api/notifications.ts` | modify | Add `markNotificationRead(id)` |
| `packages/client/src/api/campaigns.ts` | modify | Add `verifyMilestone`, `returnMilestone`, `approveCancellation`, `fetchCampaignsWithPendingMilestones`, `fetchCampaignsWithPendingCancellations` |
| `packages/client/src/App.tsx` | modify | Rename `/review-queue` → `/review`; add `/review/:id`, `/notifications`, `/admin/milestones`, `/admin/cancellations` routes |
| `packages/client/src/components/Header.tsx` | modify | Add notification bell, Review Queue link (Reviewer), admin nav links |
| `packages/client/src/pages/ReviewQueuePage.tsx` | modify | Update post-claim navigate target to `/review/:id` |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | Review detail page for Reviewer |
| `packages/client/src/pages/NotificationsPage.tsx` | create | Notifications list with mark-as-read |
| `packages/client/src/pages/AdminMilestoneVerificationPage.tsx` | create | Admin: verify/return submitted milestone evidence |
| `packages/client/src/pages/AdminCancellationApprovalPage.tsx` | create | Admin: approve pending campaign cancellations |
| `packages/client/src/pages/ReviewQueuePage.test.tsx` | create | Component tests for reviewer queue |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | Component tests for review detail page |
| `packages/client/src/pages/NotificationsPage.test.tsx` | create | Component tests for notifications page |
| `packages/client/src/pages/AdminMilestoneVerificationPage.test.tsx` | create | Component tests for admin milestone page |
| `packages/client/src/pages/AdminCancellationApprovalPage.test.tsx` | create | Component tests for admin cancellations page |
| `packages/client/src/components/Header.test.tsx` | create | Tests for notification bell, Reviewer nav link, Admin nav links |

## Dependencies

No new npm packages required. All needed libraries are already installed:
- `@tanstack/react-query` v5 — state management
- `react-router` — routing
- `pg` — PostgreSQL on server
- `vitest` + `@testing-library/react` + `@testing-library/user-event` — testing

## Verification

**Build:**
```bash
npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
```

**Visual (browser at `http://localhost:5173`):**
- Log in as a Reviewer → header shows "Review Queue" nav link
- Log in as an Admin → header shows "Milestones" and "Cancellations" nav links
- Notification bell visible when authenticated; badge shows unread count (or no badge if zero)
- Navigate to `/review` → queue of Submitted campaigns
- Click Claim on a campaign → redirected to `/review/:id` (not `/campaigns/:id`)
- `/review/:id` shows full proposal + approve/reject panel
- Approve a campaign with notes → campaign disappears from queue, notification sent to creator
- Reject a campaign with rationale → similar
- Navigate to `/notifications` → list of notifications; "Mark as read" button on each unread item works
- Log in as Admin, navigate to `/admin/milestones` → campaigns with submitted evidence listed
- Verify a milestone → item disappears from list
- Navigate to `/admin/cancellations` → campaigns with pending cancellations listed
- Approve cancellation → item disappears from list

**Tests:**
```bash
npm run test:coverage
```
All new component tests pass; 80% coverage threshold met.

**E2E flows for Playwright:**
1. Reviewer claims a campaign from queue → lands on `/review/:id` → approves with notes → campaign no longer in queue
2. Reviewer claims a campaign → rejects with rationale → creator (or own) notification appears in bell + `/notifications` page
3. Admin navigates to `/admin/milestones` → verifies evidence for a milestone
4. Admin navigates to `/admin/cancellations` → approves a cancellation request
5. Authenticated user sees notification bell → clicks → lands on `/notifications` → marks notification as read → badge count decreases
