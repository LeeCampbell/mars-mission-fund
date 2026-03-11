# Brief: Issue #115 — Reviewer and Admin Campaign Management UI

## Goal

Implement the reviewer and administrator campaign management interfaces:
a reviewer queue and detail pages for approving/rejecting campaign proposals;
admin pages for verifying milestone evidence and approving cancellation requests;
a notification bell in the header with a `/notifications` page;
and role-based navigation showing the Review link for Reviewers and Admin links for Admins.
This requires both new backend API endpoints (the review pipeline from issue #3) and the corresponding frontend UI.

## Scope

### In scope

- DB migrations: `creator_id` on campaigns (missing column — required for notifications);
  `reviewer_id`/review fields on campaigns; evidence/feedback fields on milestones;
  `notifications` table; reviewer demo seed account; Submitted-status campaign seed data;
  seed notifications for demo accounts
- Server: `GET /v1/review` — list Submitted campaigns (Reviewer only);
  `POST /v1/review/:id/claim` — transition to Under Review (Reviewer only);
  `POST /v1/review/:id/approve` — transition to Approved with notes (Reviewer only);
  `POST /v1/review/:id/reject` — transition to Rejected with rationale + guidance (Reviewer only)
- Server: `GET /v1/notifications` — own notifications (authenticated);
  `PATCH /v1/notifications/:id/read` — mark as read (authenticated)
- Server: `GET /v1/admin/milestones` — list Submitted milestones (Admin only);
  `POST /v1/admin/milestones/:id/verify` — mark Verified, store admin notes (Admin only);
  `POST /v1/admin/milestones/:id/return` — return to Pending with feedback (Admin only);
  `GET /v1/admin/campaigns/cancellations` — list campaigns with cancellation requested (Admin only);
  `POST /v1/admin/campaigns/:id/approve-cancellation` — transition to Cancelled (Admin only);
  `POST /v1/admin/campaigns/:id/deny-cancellation` — clear cancellation request (Admin only)
- Update `requireRole` middleware to accept `Role | Role[]`
- Frontend pages: `ReviewQueuePage` (`/review`), `ReviewDetailPage` (`/review/:id`),
  `AdminMilestonesPage` (`/admin/milestones`), `AdminCancellationsPage` (`/admin/cancellations`),
  `NotificationsPage` (`/notifications`)
- `NotificationBell` component in the Header (with unread count badge)
- Role-based Header navigation: Review link for Reviewer role; Admin section links for
  Administrator/SuperAdministrator
- Update `ProtectedRoute` to support `requireReviewer` prop
- Component tests for `ReviewQueuePage`, `ReviewDetailPage`, `NotificationBell`
- E2E test for reviewer claim → approve flow
- Add reviewer demo account to `LoginPage` demo selector

### Out of scope

- Creator evidence submission UI (separate creator-management issue)
- Creator cancellation request flow (admin side only; requests are seeded)
- KYC integration, payment processing, email notifications
- Appeal process (spec §6.3 — theatre for this workshop)
- Deadline enforcement automation
- Real-time push notifications (polling on mount only)

## Approach

### Database layer

Six new migrations (continuing from `20260311000002`):

1. **`20260311000003_add_campaign_owner_and_review_fields.sql`** — add `creator_id UUID REFERENCES accounts(id)`
   (**the campaigns table has no owner column** — this is required so review/admin queries can
   look up who to notify); also add `reviewer_id UUID REFERENCES accounts(id)`,
   `review_notes TEXT`, `rejection_rationale TEXT`, `rejection_guidance TEXT`, `reviewed_at TIMESTAMPTZ`,
   `cancellation_requested_at TIMESTAMPTZ`, `cancellation_reason TEXT`.
   All new columns nullable (existing seeded rows have no creator).
2. **`20260311000004_add_evidence_fields_to_milestones.sql`** — add `evidence_url TEXT`,
   `evidence_notes TEXT`, `admin_feedback TEXT`, `verified_at TIMESTAMPTZ`, `returned_at TIMESTAMPTZ`
   to `campaign_milestones`.
3. **`20260311000005_create_notifications.sql`** — create `notifications` table:
   `id UUID PK`, `user_id UUID NOT NULL REFERENCES accounts(id)`, `type TEXT NOT NULL`,
   `title TEXT NOT NULL`, `body TEXT NOT NULL`, `campaign_id UUID REFERENCES campaigns(id)`,
   `is_read BOOLEAN NOT NULL DEFAULT false`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
4. **`20260311000006_seed_reviewer.sql`** — insert reviewer demo account
   `reviewer@example.com` / known bcrypt hash for `reviewer-demo-pass` / role `Reviewer`
   (UUID `44444444-4444-4444-4444-444444444444`).
   Generate hash at implementation time: `node -e "require('bcryptjs').hash('reviewer-demo-pass',10).then(console.log)"`.
5. **`20260311000007_seed_review_data.sql`** — insert 2 campaigns in `Submitted` status
   with `creator_id = '22222222-2222-2222-2222-222222222222'` (the demo creator account);
   update one existing live campaign to have `cancellation_requested_at` set and `creator_id` assigned;
   update the two already-Submitted milestones (in campaigns 2 and 10) with `evidence_notes`
   and `evidence_url` so the admin milestone page has something to display.
6. **`20260311000008_seed_notifications.sql`** — seed 4-6 demo notifications:
   reviewer account gets "new campaign submission" notifications (campaign_id pointing to seeded
   Submitted campaigns); admin account gets "milestone submitted" notifications; creator account
   gets a "your campaign was submitted" notification.
   Use `is_read = false` so the bell badge shows a non-zero count on login.

### Server layer

Follow the hexagonal pattern already established: `createXRouter(pool): Router` factory functions
registered in `app.ts`. Use `authenticate` + `requireRole` middleware for access control.
Embed notification creation (INSERT into `notifications`) within the same transaction/query
as each state transition to keep it simple for this demo.

**`packages/server/src/review/`**:
- `types.ts` — Zod schemas for `ClaimBody` (none needed), `ApproveBody` (`{ notes: string }`),
  `RejectBody` (`{ rationale: string; guidance: string }`), `ReviewRouteParams` (`{ id: uuid }`)
- `queries.ts` — `listSubmittedCampaigns(pool)`, `claimCampaign(pool, id, reviewerId)`,
  `approveCampaign(pool, id, notes, reviewerId)`, `rejectCampaign(pool, id, rationale, guidance, reviewerId)`;
  each mutating function also inserts a notification for the campaign creator
- `routes.ts` — `createReviewRouter(pool)` with `authenticate + requireRole('Reviewer')` on all routes

**`packages/server/src/notifications/`**:
- `types.ts` — route params schema
- `queries.ts` — `listNotifications(pool, userId)`, `markNotificationRead(pool, id, userId)`
- `routes.ts` — `createNotificationsRouter(pool)` with `authenticate` on all routes

**`packages/server/src/admin/`**:
- `types.ts` — Zod schemas for verify/return/cancellation bodies and params
- `queries.ts` — `listSubmittedMilestones(pool)`, `verifyMilestone(pool, id, notes)`,
  `returnMilestone(pool, id, feedback)`, `listCancellationRequests(pool)`,
  `approveCancellation(pool, id)`, `denyCancellation(pool, id)`;
  each mutating function also inserts relevant notifications
- `routes.ts` — `createAdminRouter(pool)` with `authenticate + requireRole(['Administrator', 'SuperAdministrator'])`

Register all three new routers in `app.ts`:
`/v1/review`, `/v1/notifications`, `/v1/admin`.

Update `requireRole` to accept `Role | Role[]` and check with `Array.isArray`.

### Shared types

Add `packages/shared/src/notification.ts`:
- `NotificationSchema` with `id`, `userId`, `type`, `title`, `body`, `campaignId`, `isRead`, `createdAt`
- `NotificationType` union: `'CAMPAIGN_SUBMITTED' | 'CAMPAIGN_APPROVED' | 'CAMPAIGN_REJECTED' | 'MILESTONE_SUBMITTED' | 'MILESTONE_VERIFIED' | 'MILESTONE_RETURNED' | 'CAMPAIGN_CANCELLED'`

Export from `packages/shared/src/index.ts`.

No separate shared review types are needed — the review response shapes are
`CampaignSummary[]` (queue) and `CampaignDetail` (detail), which already exist.

### Frontend layer

**API clients** (`packages/client/src/api/`):
- `review.ts` — `fetchReviewQueue()`, `claimCampaign(id)`, `approveCampaign(id, notes)`,
  `rejectCampaign(id, rationale, guidance)` — all use `authedFetch` (copy pattern from `auth.ts`)
- `notifications.ts` — `fetchNotifications()`, `markNotificationRead(id)`
- `adminCampaigns.ts` — `fetchSubmittedMilestones()`, `verifyMilestone(id, notes)`,
  `returnMilestone(id, feedback)`, `fetchCancellationRequests()`, `approveCancellation(id)`,
  `denyCancellation(id)`

**Hooks** (`packages/client/src/hooks/`):
- `useReview.ts` — `useReviewQueue()`, `useClaimCampaign()`, `useApproveCampaign()`,
  `useRejectCampaign()` using TanStack Query (pattern mirrors `useCampaigns.ts` / `useAuth.ts`)
- `useNotifications.ts` — `useNotifications()`, `useMarkNotificationRead()`
- `useAdmin.ts` — hooks for all six admin actions

**Pages** (`packages/client/src/pages/`):
- `ReviewQueuePage.tsx` — table of `CampaignSummary[]` filtered to Submitted, FIFO ordered,
  with a "Claim" button per row that calls `claimCampaign`; redirects to `/review/:id` on success
- `ReviewQueuePage.test.tsx` — mock `useReviewQueue` and `useClaimCampaign`; assert queue renders
- `ReviewDetailPage.tsx` — loads `CampaignDetail` via existing `useCampaign(id)` hook;
  displays full proposal; two action panels: Approve (textarea for notes + submit) and
  Reject (textareas for rationale + guidance + submit); role-gate: redirect if not Reviewer
- `ReviewDetailPage.test.tsx` — mock hook + mutations; assert form fields and submission
- `AdminMilestonesPage.tsx` — table of milestones with status `Submitted`, with campaign title,
  evidence notes/url, "Verify" and "Return" action buttons with inline note input
- `AdminMilestonesPage.test.tsx` — mock hooks; assert rows render
- `AdminCancellationsPage.tsx` — table of campaigns with cancellation requested, showing
  campaign title, cancellation reason, "Approve" and "Deny" buttons
- `NotificationsPage.tsx` — full list of notifications for authenticated user, each with
  title, body, timestamp, and "Mark as read" button (grayed out if already read)

**Components** (`packages/client/src/components/`):
- `NotificationBell.tsx` — renders a bell icon (SVG or unicode) with a red badge showing
  unread notification count; fetches via `useNotifications()` on mount; links to `/notifications`
- `NotificationBell.test.tsx` — mock `useNotifications`; assert badge count renders

**Modified files**:
- `Header.tsx` — add `NotificationBell` when authenticated; add "Review Queue" `NavLink`
  when `user.role === 'Reviewer'`; add "Milestones" and "Cancellations" `NavLink` items
  in both desktop and mobile nav when `isAdmin`
- `ProtectedRoute.tsx` — add `requireReviewer?: boolean` prop; redirect if not Reviewer role
- `App.tsx` — add lazy-loaded routes: `/review` → `ReviewQueuePage` (requireReviewer),
  `/review/:id` → `ReviewDetailPage` (requireReviewer), `/admin/milestones` → `AdminMilestonesPage`
  (requireAdmin), `/admin/cancellations` → `AdminCancellationsPage` (requireAdmin),
  `/notifications` → `NotificationsPage` (ProtectedRoute)
- `LoginPage.tsx` — add reviewer demo option to the demo user selector (pattern: same as existing
  backer/creator/admin entries; credentials `reviewer@example.com` / `reviewer-demo-pass`)

**E2E** (`e2e/`):
- `review.spec.ts` — log in as reviewer, navigate to `/review`, assert submitted campaigns visible,
  click Claim on first campaign, assert redirect to detail page, fill approval notes, submit,
  assert campaign no longer in queue

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/db/migrations/20260311000003_add_campaign_owner_and_review_fields.sql` | create | creator_id (new!), reviewer_id, review notes, rejection fields, cancellation fields on campaigns |
| `packages/server/db/migrations/20260311000004_add_evidence_fields_to_milestones.sql` | create | evidence_url/notes, admin_feedback, verified_at, returned_at on milestones |
| `packages/server/db/migrations/20260311000005_create_notifications.sql` | create | notifications table |
| `packages/server/db/migrations/20260311000006_seed_reviewer.sql` | create | reviewer demo account (reviewer@example.com) |
| `packages/server/db/migrations/20260311000007_seed_review_data.sql` | create | 2 Submitted campaigns + milestone evidence + cancellation request |
| `packages/server/db/migrations/20260311000008_seed_notifications.sql` | create | seed demo notifications for reviewer, admin, creator accounts |
| `packages/server/src/middleware/requireRole.ts` | modify | accept `Role \| Role[]` |
| `packages/server/src/review/types.ts` | create | Zod schemas for review route inputs |
| `packages/server/src/review/queries.ts` | create | list, claim, approve, reject DB queries |
| `packages/server/src/review/routes.ts` | create | `createReviewRouter(pool)` |
| `packages/server/src/notifications/types.ts` | create | notification route schemas |
| `packages/server/src/notifications/queries.ts` | create | list, mark-read DB queries |
| `packages/server/src/notifications/routes.ts` | create | `createNotificationsRouter(pool)` |
| `packages/server/src/admin/types.ts` | create | Zod schemas for admin route inputs |
| `packages/server/src/admin/queries.ts` | create | milestone and cancellation DB queries |
| `packages/server/src/admin/routes.ts` | create | `createAdminRouter(pool)` |
| `packages/server/src/app.ts` | modify | register `/v1/review`, `/v1/notifications`, `/v1/admin` routers |
| `packages/shared/src/notification.ts` | create | `NotificationSchema`, `NotificationType`, exported types |
| `packages/shared/src/index.ts` | modify | export from `./notification.js` |
| `packages/client/src/api/review.ts` | create | review API client functions |
| `packages/client/src/api/notifications.ts` | create | notifications API client functions |
| `packages/client/src/api/adminCampaigns.ts` | create | admin milestone + cancellation API functions |
| `packages/client/src/hooks/useReview.ts` | create | TanStack Query hooks for review actions |
| `packages/client/src/hooks/useNotifications.ts` | create | TanStack Query hooks for notifications |
| `packages/client/src/hooks/useAdmin.ts` | create | TanStack Query hooks for admin actions |
| `packages/client/src/pages/ReviewQueuePage.tsx` | create | reviewer queue page |
| `packages/client/src/pages/ReviewQueuePage.test.tsx` | create | component tests |
| `packages/client/src/pages/ReviewDetailPage.tsx` | create | review detail + approve/reject form |
| `packages/client/src/pages/ReviewDetailPage.test.tsx` | create | component tests |
| `packages/client/src/pages/AdminMilestonesPage.tsx` | create | admin milestone verification page |
| `packages/client/src/pages/AdminMilestonesPage.test.tsx` | create | component tests |
| `packages/client/src/pages/AdminCancellationsPage.tsx` | create | admin cancellation approval page |
| `packages/client/src/pages/NotificationsPage.tsx` | create | notifications listing page |
| `packages/client/src/components/NotificationBell.tsx` | create | bell icon + unread badge |
| `packages/client/src/components/NotificationBell.test.tsx` | create | component tests |
| `packages/client/src/components/Header.tsx` | modify | add NotificationBell; role-based nav links |
| `packages/client/src/components/ProtectedRoute.tsx` | modify | add `requireReviewer` prop |
| `packages/client/src/App.tsx` | modify | add new routes for review, admin, notifications |
| `packages/client/src/pages/LoginPage.tsx` | modify | add reviewer demo selector option |
| `e2e/review.spec.ts` | create | E2E test: reviewer claim → approve flow |

## Dependencies

All dependencies are already present in the monorepo:

- `@tanstack/react-query` (already used in all hooks)
- `zod` (already used in shared and server)
- `jsonwebtoken` / `bcryptjs` (already used in auth)
- No new npm packages required

The reviewer demo account password `reviewer-demo-pass` needs a bcrypt hash seeded in
migration 006. Generate with `bcrypt.hash('reviewer-demo-pass', 10)` — a pre-computed hash
matching the pattern of the existing seed file should be used.

## Verification

### Build

```
npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
npm run lint
npm run format:check
npm run test:coverage
```

### Visual — check in the browser at `http://localhost:5173`

- Log in as `reviewer@example.com` (reviewer-demo-pass) → Header shows "Review Queue" nav link
  and notification bell with unread count badge
- Navigate to `/review` → table of Submitted campaigns with Claim buttons
- Click Claim → redirected to `/review/:id` → full campaign detail with Approve / Reject forms
- Submit Approve (with notes) → campaign disappears from queue; notification appears for creator
- Log in as `admin@example.com` → Header shows "Milestones" and "Cancellations" admin links
- Navigate to `/admin/milestones` → table of Submitted milestones with Verify/Return actions
- Navigate to `/admin/cancellations` → table of campaigns with pending cancellation requests
- Navigate to `/notifications` → notification list; "Mark as read" updates unread count in bell
- Log in as `backer@example.com` → no Review or Admin links visible in Header

### Tests

```bash
npx vitest run packages/client/src/pages/ReviewQueuePage.test.tsx
npx vitest run packages/client/src/pages/ReviewDetailPage.test.tsx
npx vitest run packages/client/src/pages/AdminMilestonesPage.test.tsx
npx vitest run packages/client/src/components/NotificationBell.test.tsx
npm run test:coverage   # overall 80% threshold must pass
```

### E2E

```bash
npm run test:e2e
```

User flows that must have Playwright E2E tests:

- Reviewer logs in, navigates to `/review`, sees Submitted campaign queue
- Reviewer claims a campaign → detail page loads with correct campaign
- Reviewer approves campaign with notes → campaign removed from queue
- Admin navigates to `/admin/milestones` → sees Submitted milestone rows
- Notification bell shows unread count; navigating to `/notifications` lists them
