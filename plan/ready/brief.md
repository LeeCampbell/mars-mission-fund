# Brief: Issue #115 — Reviewer and Admin Campaign Management UI

## Goal

Add the reviewer and admin campaign management UI surfaces: rename the review queue
route to `/review`, create a dedicated review detail page at `/review/:id`, add an
admin actions panel on the campaign detail page for milestone verification and
cancellation approval, implement a notification bell icon with unread count in the
header plus a `/notifications` page with mark-as-read, add the missing
`PATCH /v1/notifications/:id/read` server endpoint, and add role-specific navigation
links to the header.

## Scope

**In scope:**

- Rename `/review-queue` → `/review` (update route, Header nav, E2E tests, ReviewQueuePage claim redirect)
- New `ReviewDetailPage` at `/review/:id` — full campaign proposal view with approve/reject
  panels for the assigned reviewer; claim in ReviewQueuePage navigates here instead of `/campaigns/:id`
- `AdminActionsPanel` component — shown on campaign detail page for Admin users:
  - Milestone evidence verification: list milestones with `Submitted` evidence, Verify / Return buttons
  - Cancellation approval: shown when `campaign.cancellationRequestedAt` is set, Approve / Deny buttons
- Notification bell icon in `Header` showing unread count badge, polling or on-mount fetch
- `/notifications` page listing all notifications with mark-as-read per item
- `PATCH /v1/notifications/:id/read` server endpoint + `markNotificationRead` query
- Client API additions: `verifyMilestone()`, `returnMilestone()`, `approveCancellation()`, `markNotificationRead()`
- Role-based Header nav: "Review" link for Reviewer role, "Admin" link for Administrator/SuperAdministrator
- Component tests for `ReviewDetailPage`, `AdminActionsPanel`, `NotificationBell`, `NotificationsPage`
- E2E tests for admin milestone verification, cancellation approval, notification bell, mark-as-read flows

**Out of scope:**

- Real-time push notifications (server-sent events, WebSockets) — polling on mount is sufficient
- Email notification delivery — server already stubs this
- Appeal flow (AC-CAMP-007) — not listed in this issue's deliverables
- Milestone change request approval — not in this issue
- Deadline extension approval — not in this issue
- Any new database migrations — all required DB schema already exists

## Approach

### Server

1. **`packages/server/src/campaigns/queries.ts`** — three changes:
   - Add `cancellation_requested_at AS "cancellationRequestedAt"` to the campaign SELECT in
     `getCampaignById` so the client knows whether a cancellation is pending.
   - Add `evidence_description AS "evidenceDescription"`, `evidence_url AS "evidenceUrl"`,
     `evidence_submitted_at AS "evidenceSubmittedAt"` to the milestones SELECT in
     `getCampaignById` so admin can see submitted evidence. These columns exist (migration
     `20260311000015_add_milestone_evidence_fields.sql`) but are not currently selected.
   - Add `markNotificationRead(pool, id, userId)` that sets `read = true` WHERE
     `id = $1 AND user_id = $2` (scoped to owner).
2. **`packages/shared/src/campaign.ts`** — add
   `cancellationRequestedAt: z.coerce.date().nullable().optional()` to `CampaignDetailSchema`.
   `MilestoneSchema` already has the evidence fields as optional.
3. **`packages/server/src/notifications/routes.ts`** — add
   `PATCH /:id/read` (authenticated) that calls `markNotificationRead`.
   Return 404 if row not found/not owned.

### Client API

3. **`packages/client/src/api/notifications.ts`** — add `markNotificationRead(id: string)`.
4. **`packages/client/src/api/campaigns.ts`** — add three functions that call the existing
   server endpoints (which already exist in `routes.ts`):
   - `verifyMilestone(campaignId, milestoneId)` → `POST /v1/campaigns/:id/milestones/:mid/verify`
   - `returnMilestone(campaignId, milestoneId, feedback)` → `POST /v1/campaigns/:id/milestones/:mid/return`
   - `approveCancellation(campaignId)` → `POST /v1/campaigns/:id/approve-cancellation`

### Client Pages & Components

5. **`packages/client/src/pages/ReviewDetailPage.tsx`** — reviewer-scoped campaign view.
   Use `useCampaign(id)` hook for data. Display the full proposal (description, team,
   milestones, stretch goals) and embed `ReviewActionsPanel` prominently. Route:
   `/review/:id`, protected by `requireReviewer`. This is a focused reviewer workflow
   page separate from the public campaign detail.
6. **`packages/client/src/components/campaigns/AdminActionsPanel.tsx`** — renders when
   `user.role === 'Administrator' || 'SuperAdministrator'`. Two sub-panels:
   - **Milestone Verification**: list milestones where `status === 'Submitted'`. Each row
     shows evidence description/URL and Verify + Return (with feedback textarea) buttons.
   - **Cancellation Approval**: shown when `campaign.cancellationRequestedAt !== null`.
     Approve button calls `approveCancellation()`; no deny endpoint exists (deny is implicit
     — admin can decline the request by doing nothing, or we can show an informational note).
     Actually, check the server — `approve-cancellation` is the only endpoint. So the panel
     just shows the pending request and an Approve button.
7. **`packages/client/src/components/NotificationBell.tsx`** — icon button in Header.
   Uses `useQuery` to fetch `/v1/notifications` on mount. Shows red badge with unread count.
   On click, navigates to `/notifications`. Mark-as-read is done on the notifications page.
8. **`packages/client/src/pages/NotificationsPage.tsx`** — lists all notifications (newest
   first), mark-as-read per item via `useMutation` → `markNotificationRead()`.
   Empty state when none. Protected route (authenticated).

### Routing & Navigation

9. **`packages/client/src/App.tsx`**:
   - Rename `path="/review-queue"` → `path="/review"`, element stays `ReviewQueuePage`
   - Add `path="/review/:id"` under `requireReviewer`, element `ReviewDetailPage`
   - Add `path="/notifications"` under `ProtectedRoute` (no role restriction)
10. **`packages/client/src/components/Header.tsx`**:
    - Add "Review" nav link (visible when `user.role === 'Reviewer'`) pointing to `/review`
    - Add "Admin" nav link (visible when `isAdmin`) pointing to `/admin/users` (or a new
      `/admin/campaigns` if that page is created; for now link to `/admin/users` is acceptable)
    - Replace the static "Admin" Badge with an "Admin" nav link
    - Embed `NotificationBell` next to the profile link when authenticated
11. **`packages/client/src/pages/ReviewQueuePage.tsx`** — update claim success redirect from
    `/campaigns/${campaign.id}` → `/review/${campaign.id}`.
12. **`packages/client/src/pages/CampaignDetailPage.tsx`** — import and render
    `AdminActionsPanel` below `ReviewActionsPanel` when user is admin.

### Tests

13. `packages/client/src/pages/ReviewDetailPage.test.tsx` — renders proposal fields,
    shows ReviewActionsPanel for assigned reviewer.
14. `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` — renders
    milestone verify/return UI, cancellation approval UI.
15. `packages/client/src/components/NotificationBell.test.tsx` — renders unread badge,
    renders zero-state.
16. `packages/client/src/pages/NotificationsPage.test.tsx` — renders notification list,
    mark-as-read interaction.
17. `e2e/review-pipeline.spec.ts` — update `/review-queue` URLs to `/review`.
18. New `e2e/admin-campaign-management.spec.ts` — admin verifies milestone evidence,
    admin approves cancellation.
19. New `e2e/notifications.spec.ts` — notification bell shows badge, mark as read.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/src/campaigns/queries.ts` | modify | Add evidence fields + cancellationRequestedAt to `getCampaignById`; add `markNotificationRead` |
| `packages/shared/src/campaign.ts` | modify | Add `cancellationRequestedAt` to `CampaignDetailSchema` |
| `packages/server/src/notifications/routes.ts` | modify | Add `PATCH /:id/read` endpoint |
| `packages/client/src/api/notifications.ts` | modify | Add `markNotificationRead(id)` |
| `packages/client/src/api/campaigns.ts` | modify | Add `verifyMilestone`, `returnMilestone`, `approveCancellation` |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | Reviewer-scoped campaign view at `/review/:id` |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | Component tests |
| `packages/client/src/components/campaigns/AdminActionsPanel.tsx` | create | Admin milestone verification + cancellation approval panels |
| `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` | create | Component tests |
| `packages/client/src/components/NotificationBell.tsx` | create | Bell icon with unread badge |
| `packages/client/src/components/NotificationBell.test.tsx` | create | Component tests |
| `packages/client/src/pages/NotificationsPage.tsx` | create | `/notifications` listing with mark-as-read |
| `packages/client/src/pages/NotificationsPage.test.tsx` | create | Component tests |
| `packages/client/src/App.tsx` | modify | Rename `/review-queue` → `/review`, add `/review/:id`, `/notifications` routes |
| `packages/client/src/components/Header.tsx` | modify | Add Review nav link, Admin nav link, NotificationBell |
| `packages/client/src/pages/ReviewQueuePage.tsx` | modify | Update claim redirect to `/review/:id` |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Add `AdminActionsPanel` |
| `e2e/review-pipeline.spec.ts` | modify | Update `/review-queue` URLs to `/review` |
| `e2e/admin-campaign-management.spec.ts` | create | Admin milestone verification and cancellation E2E |
| `e2e/notifications.spec.ts` | create | Notification bell and mark-as-read E2E |

## Dependencies

No new npm packages needed. All required packages are present:

- `@tanstack/react-query` — already used for data fetching
- `react-router` — already used for routing
- `pg` — already used for DB queries

Server-side endpoints for milestone verify/return and cancellation approval already exist in
`packages/server/src/campaigns/routes.ts`. Only the `PATCH /v1/notifications/:id/read`
endpoint is new.

DB schema (`notifications` table with `read` column) already exists per migration
`20260311000005_create_notifications.sql`.

Seeded demo accounts already include a reviewer (`reviewer@example.com`) and admin.
The `cancellationRequestedAt` field exists on the campaigns table per migration
`20260311000013_add_cancellation_requested_campaigns.sql`.

## Verification

- **Build**: `npm run build` and `npx tsc -b --noEmit` pass
- **Lint/Format**: `npm run lint` and `npm run format:check` pass
- **Tests**: `npm run test:coverage` ≥ 80% threshold; new component tests pass
- **Visual** (at `http://localhost:5173`):
  - Log in as reviewer (`reviewer@example.com`) → header shows "Review" link
  - Navigate to `/review` → sees review queue (same content as old `/review-queue`)
  - Claim a campaign → redirected to `/review/:id` with full proposal and approve/reject forms
  - Log in as admin → header shows Admin nav link
  - Open a campaign in Settlement state with submitted evidence → `AdminActionsPanel` visible
    with milestone evidence and Verify/Return buttons
  - Open a campaign with pending cancellation → AdminActionsPanel shows Approve button
  - Log in as any authenticated user → notification bell visible in header with unread count
  - Navigate to `/notifications` → see list of notifications, click mark-as-read, unread count decreases
- **E2E flows**:
  - `reviewer can claim a campaign` → redirects to `/review/:id`
  - `admin can verify milestone evidence` on a Settlement campaign
  - `admin can approve a cancellation request`
  - `notification bell shows unread count` after actions that generate notifications
  - `user can mark notification as read`
