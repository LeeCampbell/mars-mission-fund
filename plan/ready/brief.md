# Brief: Issue #111 — Review pipeline: claim, approve, reject

## Goal

Implement the back-end review pipeline and supporting client UI for the campaign review
workflow: a FIFO review queue, claim/approve/reject/resubmit state transitions with
ownership validation, per-event audit logging to an append-only PostgreSQL table (per
L3-006), and in-app creator notifications stored in a database table.
Covers acceptance criteria AC-CAMP-004, AC-CAMP-005, AC-CAMP-006, and AC-CAMP-008.

## Scope

**In scope**

- `GET /v1/campaigns/review-queue` — list Submitted campaigns FIFO (Reviewer role only)
- `POST /v1/campaigns/:id/claim` — Reviewer only; Submitted → Under Review; sets reviewer_id
- `POST /v1/campaigns/:id/approve` — Assigned reviewer only; Under Review → Approved; requires `notes`
- `POST /v1/campaigns/:id/reject` — Assigned reviewer only; Under Review → Rejected; requires `rationale` + `guidance`
- `POST /v1/campaigns/:id/resubmit` — Campaign creator only; Rejected → Draft; data preserved
- `GET /v1/notifications` — Authenticated user; returns own unread/all notifications
- Append-only `campaign_audit_events` table per L3-006 (no hash chains — demo scope)
- `notifications` table; rows created on claim, approve, reject (creator as recipient)
- Database: add `creator_id` and `reviewer_id` nullable columns to `campaigns` table
- Reviewer demo seed account (`reviewer@example.com`) + `reviewer-demo-pass`
- At least one seeded campaign in `Submitted` state for review pipeline E2E testing
- `requireRole` middleware updated to accept `Role | Role[]`
- Client: `ReviewQueuePage` at `/review-queue` (Reviewer-protected)
- Client: `ReviewActionsPanel` component on `CampaignDetailPage` (role+status-gated)
- Client: update `LoginPage` demo selector to include Reviewer account
- Client: update `ProtectedRoute` to support reviewer-only routes
- Server integration tests for all five action endpoints and the notifications endpoint
- E2E tests covering the full reviewer and creator flows

**Out of scope**

- Campaign submission/creation endpoint (Issue #2 dependency; seeded data fills the gap)
- Reviewer recusal and Admin manual reassignment (spec §5.1)
- "Request clarification" action (spec §5.3)
- Review SLA alerts (spec §5.4)
- Appeal process (spec §6.3)
- Hash-chain tamper detection on audit events (L3-006 §5.2 — theatre for demo)
- Notification bell/unread-count UI — notifications are written to DB and readable via API
- Any notification email delivery (no email service in demo)

## Approach

### 1. Database migrations (new files in `packages/server/db/migrations/`)

**`20260311000003_add_creator_reviewer_to_campaigns.sql`**
Add `creator_id UUID REFERENCES accounts(id)` and `reviewer_id UUID REFERENCES accounts(id)`
(both nullable) to `campaigns`.
Backfill `creator_id` for all existing seeded rows to the demo creator UUID
(`22222222-2222-2222-2222-222222222222`).

**`20260311000004_create_campaign_audit_events.sql`**
Create an append-only `campaign_audit_events` table.
Fields: `id` (UUID PK), `campaign_id` (FK campaigns), `actor_id` (FK accounts),
`action` (TEXT — e.g. `campaign.claim`), `previous_status` (TEXT), `new_status` (TEXT),
`rationale` (TEXT nullable), `correlation_id` (UUID nullable), `occurred_at` (TIMESTAMPTZ DEFAULT now()).
No DELETE or UPDATE triggers needed for demo; immutability is enforced at the application layer.

**`20260311000005_create_notifications.sql`**
Create a `notifications` table.
Fields: `id` (UUID PK), `account_id` (FK accounts), `campaign_id` (FK campaigns nullable),
`type` (TEXT — e.g. `campaign.claimed`), `message` (TEXT), `read_at` (TIMESTAMPTZ nullable),
`created_at` (TIMESTAMPTZ DEFAULT now()).

**`20260311000006_seed_reviewer_account.sql`**
Insert a Reviewer demo account:
`id = 44444444-4444-4444-4444-444444444444`, `email = reviewer@example.com`,
`role = Reviewer`, password hash of `reviewer-demo-pass` (bcrypt, cost 10).
Also insert:
- One seeded campaign in `Submitted` status with `creator_id = 22222222-2222-2222-2222-222222222222`
  for the reviewer flow E2E test.
- One seeded campaign in `Rejected` status with `creator_id = 22222222-2222-2222-2222-222222222222`
  and `reviewer_id = 44444444-4444-4444-4444-444444444444` for the creator resubmit E2E test.
  (This avoids the creator flow depending on the reviewer flow running first.)

### 2. Server middleware

**`packages/server/src/middleware/requireRole.ts`**
Change the signature from `requireRole(role: Role)` to `requireRole(role: Role | Role[])`.
Inside, convert to array and check `roles.includes(user.role)`.
Backward-compatible for all existing callers that pass a single string.

### 3. Server types (`packages/server/src/campaigns/types.ts`)

Add Zod schemas:

- `ClaimBodySchema` — empty object (no body needed)
- `ApproveBodySchema` — `{ notes: z.string().min(1) }`
- `RejectBodySchema` — `{ rationale: z.string().min(1), guidance: z.string().min(1) }`
- `ResubmitBodySchema` — empty object
- Export the inferred TypeScript types

### 4. Server queries (`packages/server/src/campaigns/queries.ts`)

Add functions (all use parameterised queries):

- `getReviewQueue(pool)` — SELECT campaigns WHERE status = 'Submitted' ORDER BY created_at ASC
- `claimCampaign(pool, id, reviewerId)` — UPDATE status + reviewer_id, return updated row
- `approveCampaign(pool, id, reviewerId, notes)` — UPDATE status = 'Approved', return row
- `rejectCampaign(pool, id, reviewerId, rationale, guidance)` — UPDATE status = 'Rejected', return row
- `resubmitCampaign(pool, id, creatorId)` — UPDATE status = 'Draft', clear reviewer_id, return row
- `createAuditEvent(pool, event)` — INSERT into campaign_audit_events
- `createNotification(pool, notification)` — INSERT into notifications
- `getNotificationsForUser(pool, accountId)` — SELECT from notifications WHERE account_id = $1 ORDER BY created_at DESC

Each state-transition query also reads the current status before updating (SELECT FOR UPDATE or
a CTE) so the route handler can validate the transition and populate `previous_status` in the
audit event.

### 5. Server routes (`packages/server/src/campaigns/routes.ts`)

**IMPORTANT**: Register `GET /review-queue` before `GET /:id` to prevent Express treating the
literal string "review-queue" as a UUID ID parameter (the `:id` route already validates UUID
format, so this would result in a 400 — but explicit ordering is clearer).

New endpoints:

```
GET  /review-queue        authenticate → requireRole('Reviewer') → getReviewQueue
POST /:id/claim           authenticate → requireRole('Reviewer') → validate UUID → claimCampaign
POST /:id/approve         authenticate → requireRole('Reviewer') → validate UUID + body → approveCampaign
POST /:id/reject          authenticate → requireRole('Reviewer') → validate UUID + body → rejectCampaign
POST /:id/resubmit        authenticate → validate UUID → resubmitCampaign (creator ownership check in handler)
GET  /notifications       (separate router in /v1/notifications — see below)
```

Each state-transition handler:
1. Validate UUID and request body via Zod.
2. Fetch the campaign; return 404 if not found.
3. Validate the current state is correct for the transition; return 409 `INVALID_CAMPAIGN_STATUS` if not.
4. For approve/reject: validate `reviewer_id == actor_id`; return 403 if mismatch.
5. For resubmit: validate `creator_id == actor_id`; return 403 if mismatch.
6. Execute the UPDATE query.
7. Write an audit event row via `createAuditEvent`.
8. Create a notification for the campaign creator (claim/approve/reject) via `createNotification`.
9. Respond 200 with `{ data: updatedCampaign }`.

**Notifications router** — new file `packages/server/src/notifications/routes.ts`:

```
GET /v1/notifications     authenticate → getNotificationsForUser(req.user.id)
```

Register in `packages/server/src/app.ts` alongside existing routers.

### 6. Client API (`packages/client/src/api/campaigns.ts`)

Add:

- `fetchReviewQueue()` → `GET /v1/campaigns/review-queue`
- `claimCampaign(id)` → `POST /v1/campaigns/:id/claim`
- `approveCampaign(id, notes)` → `POST /v1/campaigns/:id/approve`
- `rejectCampaign(id, rationale, guidance)` → `POST /v1/campaigns/:id/reject`
- `resubmitCampaign(id)` → `POST /v1/campaigns/:id/resubmit`

New file `packages/client/src/api/notifications.ts`:

- `fetchNotifications()` → `GET /v1/notifications`

### 7. Client UI

**`packages/client/src/components/ProtectedRoute.tsx`**
Add a `requireReviewer?: boolean` prop (alongside existing `requireAdmin`).
Check `user.role === 'Reviewer'` when true.

**`packages/client/src/App.tsx`**
Add lazy-loaded `ReviewQueuePage` route at `/review-queue` inside a Reviewer-protected
`ProtectedRoute` block.

**`packages/client/src/pages/ReviewQueuePage.tsx`** (new)
Fetches `GET /v1/campaigns/review-queue` (React Query).
Renders a table/list of Submitted campaigns with campaign title, submission date, and a
"Claim" button. Clicking Claim calls `claimCampaign(id)` and then navigates to
`/campaigns/:id` for the full review action panel.

**`packages/client/src/components/campaigns/ReviewActionsPanel.tsx`** (new)
Rendered inside `CampaignDetailPage` conditionally based on role + status:

- Reviewer + status `Under Review` + reviewer_id == current user: shows Approve and Reject forms.
- Creator + status `Rejected`: shows Resubmit button.

Approve form: textarea for notes, submit button.
Reject form: textarea for rationale, textarea for guidance, submit button.
Each action calls the corresponding API function and invalidates the campaign React Query cache.

**`packages/client/src/pages/CampaignDetailPage.tsx`**
Import and render `<ReviewActionsPanel />` after the existing content, passing campaign data
and current user.
The `CampaignDetail` type needs `reviewerId` and `creatorId` fields — add them to
`CampaignDetailSchema` in `packages/shared/src/campaign.ts` (nullable strings).

**`packages/client/src/pages/LoginPage.tsx`**
Add `reviewer@example.com` / `reviewer-demo-pass` to the demo user selector array.

### 8. Shared types (`packages/shared/src/campaign.ts`)

Extend `CampaignDetailSchema` with:

- `reviewerId: z.string().uuid().nullable()` — the assigned reviewer
- `creatorId: z.string().uuid().nullable()` — the campaign creator

These fields are returned by the existing `GET /v1/campaigns/:id` endpoint once the
`campaigns` table has the new columns. Update `getCampaignById` SQL SELECT to include them.

### 9. Server integration tests

New file `packages/server/src/__tests__/campaigns.review.test.ts`.
Pattern: same as `campaigns.test.ts` — `createApp(mockPool)` + `supertest` + `mockQuery`.

Test matrix:

| Endpoint | Cases |
|---|---|
| GET /review-queue | 200 with list; 401 unauthenticated; 403 wrong role |
| POST /:id/claim | 200 success; 401; 403 wrong role; 404 not found; 409 wrong status |
| POST /:id/approve | 200 success; 401; 403 not assigned reviewer; 404; 409 wrong status; 400 missing notes |
| POST /:id/reject | 200 success; 401; 403; 404; 409; 400 missing rationale or guidance |
| POST /:id/resubmit | 200 success; 401; 403 not creator; 404; 409 wrong status |
| GET /v1/notifications | 200 with list; 401 unauthenticated |

Each test mocks `pool.query` to control the DB responses.
For multi-query handlers (select current + update + insert audit + insert notification),
chain `mockResolvedValueOnce` calls in order.

### 10. E2E tests (`e2e/review-pipeline.spec.ts`)

Two flows using real browser + running stack:

**Reviewer flow**:
1. Login as `reviewer@example.com`.
2. Navigate to `/review-queue`.
3. Assert the seeded Submitted campaign appears.
4. Click Claim → verify redirect/page shows Under Review status.
5. Submit Approve with notes → verify status changes to Approved.

**Creator flow**:
1. Login as `creator@example.com`.
2. Navigate to the seeded Rejected campaign.
3. Assert the Resubmit button is visible in the ReviewActionsPanel.
4. Click Resubmit → verify status changes to Draft.

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `packages/server/db/migrations/20260311000003_add_creator_reviewer_to_campaigns.sql` | create | Add creator_id + reviewer_id columns; backfill existing rows |
| `packages/server/db/migrations/20260311000004_create_campaign_audit_events.sql` | create | Append-only audit events table |
| `packages/server/db/migrations/20260311000005_create_notifications.sql` | create | Notifications table |
| `packages/server/db/migrations/20260311000006_seed_reviewer_account.sql` | create | Reviewer demo account + Submitted seed campaign |
| `packages/server/src/middleware/requireRole.ts` | modify | Accept `Role \| Role[]` |
| `packages/server/src/campaigns/types.ts` | modify | Add Claim/Approve/Reject/Resubmit body schemas |
| `packages/server/src/campaigns/queries.ts` | modify | Add review queue + state transition + audit + notification queries |
| `packages/server/src/campaigns/routes.ts` | modify | Add 5 review endpoints; register review-queue before /:id |
| `packages/server/src/notifications/routes.ts` | create | GET /v1/notifications endpoint |
| `packages/server/src/app.ts` | modify | Register notifications router |
| `packages/server/src/__tests__/campaigns.review.test.ts` | create | Integration tests for review endpoints |
| `packages/shared/src/campaign.ts` | modify | Add reviewerId + creatorId to CampaignDetailSchema |
| `packages/client/src/api/campaigns.ts` | modify | Add review action API functions |
| `packages/client/src/api/notifications.ts` | create | fetchNotifications function |
| `packages/client/src/components/ProtectedRoute.tsx` | modify | Add requireReviewer prop |
| `packages/client/src/App.tsx` | modify | Add /review-queue route |
| `packages/client/src/pages/ReviewQueuePage.tsx` | create | FIFO review queue page for Reviewers |
| `packages/client/src/components/campaigns/ReviewActionsPanel.tsx` | create | Approve/reject/resubmit forms |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Render ReviewActionsPanel |
| `packages/client/src/pages/LoginPage.tsx` | modify | Add reviewer to demo user selector |
| `e2e/review-pipeline.spec.ts` | create | E2E tests for reviewer and creator flows |

## Dependencies

- No new npm packages required.
- All database tooling (dbmate) already in place.
- Depends on the existing `authenticate` middleware and `requireRole` middleware.
- The `Reviewer` role already exists in `@mmf/shared` `RoleSchema`.
- The seeded Submitted campaign provides the demo data needed for E2E without implementing
  the submission endpoint (Issue #2).

## Verification

- **Type-check**:
  ```
  npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json
  ```
- **Lint + format**: `npm run lint && npm run format:check`
- **Unit/integration tests**: `npm run test:coverage` (80% threshold; new code requires
  90% per L2-002 §4.2 for business logic, 100% for API endpoints per issue checklist)
- **Build**: `npm run build`
- **Visual** (browser at `http://localhost:5173`):
  - Login as `reviewer@example.com` → navigate to `/review-queue` → see Submitted campaign
  - Claim the campaign → campaign detail shows Under Review + Approve/Reject panel
  - Approve with notes → status badge changes to Approved
  - Login as `creator@example.com` → navigate to a Rejected campaign → see Resubmit button
  - Click Resubmit → status changes to Draft
- **E2E**: `npm run test:e2e` — `e2e/review-pipeline.spec.ts` full reviewer and creator flows
- **CI**: `./scripts/ci-check.sh` passes cleanly
