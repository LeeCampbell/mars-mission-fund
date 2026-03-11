# Brief: Issue #112 — Campaign launch, funding progress, and deadline enforcement

## Goal

Implement the live-phase of the campaign state machine on the server: launching an
approved campaign (Approved → Live), accepting stubbed contributions with auto-transition
to Funded when the minimum target is met, enforcing the maximum funding cap, handling
creator cancellation requests and admin approval of those requests, enforcing the deadline
(Live → Failed when underfunded), and letting creators post updates on live campaigns.
Every state transition must be audit-logged to a new `audit_events` table per L3-006.
Delivery is entirely server-side with integration tests; no frontend changes.

## Scope

**In scope:**

- `POST /v1/campaigns/:id/launch` — Creator-owned campaign, Approved → Live, sets `launched_at`
- `POST /v1/campaigns/:id/updates` — Creator posts a text update; campaign must be Live or Funded
- `POST /v1/campaigns/:id/contribute` — Stubbed contribution: increments `current_amount_usd`
  and `contributor_count`, auto-transitions Live → Funded when minimum target is reached,
  rejects contributions that would breach the maximum funding cap
- `POST /v1/campaigns/:id/cancel` — Creator cancels: immediate if no contributions, sets
  `cancellation_requested_at` if contributions exist (requires admin approval)
- `POST /v1/campaigns/:id/approve-cancel` — Admin approves a pending cancellation; status → Cancelled
- `POST /v1/campaigns/:id/enforce-deadline` — Admin-callable endpoint: transitions Live →
  Failed when deadline has passed and minimum target is unmet; also called as an inline guard
  at the start of the contribute handler
- DB migration: `creator_id uuid` on `campaigns` (FK to `accounts`, nullable to preserve seed data)
- DB migration: `cancellation_requested_at timestamptz` on `campaigns`
- DB migration: `audit_events` table per L3-006 §3 schema
- Server integration tests for all new endpoints (100% documented-contract coverage per L4-002 §2)
- All CI checks green

**Out of scope:**

- Frontend UI changes
- Real payment processing or refund execution (contributions are stubbed; refund trigger is a no-op log entry)
- Email/push notifications (theatre per L4-002 §1 local demo scope; audit entries fulfil the traceability requirement)
- KYC validation at launch time (theatre)
- Settlement and milestone-verification flows (post-Funded, separate issue)
- Stretch goal activation (theatre)
- Deadline extension requests and admin approval (AC-CAMP-019/020, separate feature)
- Campaign submission / review pipeline (handled by issue #3)

## Approach

### DB migrations (run in order after existing `20260311000002`)

Three new migrations are required:

1. **`20260311000003_add_creator_id_to_campaigns.sql`** — `ALTER TABLE campaigns ADD COLUMN
   creator_id uuid REFERENCES accounts(id)`. Nullable so existing seed rows are preserved.
   Also update the seed migration or add a follow-up seed UPDATE for demo accounts (see note).

2. **`20260311000004_add_cancellation_requested_campaigns.sql`** — `ALTER TABLE campaigns ADD
   COLUMN cancellation_requested_at timestamptz`. Null = no pending cancellation.

3. **`20260311000005_create_audit_events.sql`** — Creates `audit_events` per L3-006 §3.2:
   `id`, `timestamp`, `level` (always `'AUDIT'`), `correlation_id`, `service`, `message`,
   `event_type`, `actor_id`, `actor_type`, `action`, `resource_type`, `resource_id`,
   `outcome`, `previous_state jsonb`, `new_state jsonb`, `rationale text`.

> **Seed note**: The existing seed accounts (`20260311000002_seed_accounts.sql`) include a
> Creator-role account. A seed UPDATE in migration 20260311000003 should assign that account's
> UUID as `creator_id` for the seeded campaigns whose status is Approved, Live, or Funded so
> the launch/update/cancel endpoints work in the live demo. Campaigns in other states can
> remain with `creator_id = NULL` for demo simplicity.

### Audit helper

Create `packages/server/src/campaigns/audit.ts` exporting:

```ts
writeAuditEvent(pool: Pool, event: AuditEventInput): Promise<void>
```

Called within each route handler after the DB mutation completes. The helper inserts into
`audit_events`. Failures are swallowed (fire-and-forget) so they do not break the primary
operation — log the error to stderr.

### Route patterns

All new endpoints follow the existing routes.ts conventions:

- Parse/validate with Zod before touching the DB.
- Retrieve the current campaign row first to validate state preconditions.
- Perform the mutation.
- Write the audit event.
- Return the appropriate HTTP response.

Authentication middleware chain on each new route: `authenticate` (from
`middleware/authenticate.ts`) then role/ownership check inline.

**Creator ownership check**: After verifying `role === 'Creator'`, compare
`res.locals['user'].id` to `campaign.creatorId`. Return 403 if they differ. If
`campaign.creatorId` is null (legacy seed data), allow the action so the demo still works.

**Multi-role endpoints**: `POST /cancel` is Creator-only. The Admin path to complete a
cancellation is the separate `approve-cancel` endpoint.

### Endpoint details

#### POST `/v1/campaigns/:id/launch`

- Auth: `authenticate` + role must be `Creator` and user owns campaign.
- Precondition: `campaign.status === 'Approved'`.
- Mutation: `UPDATE campaigns SET status = 'Live', launched_at = NOW(), updated_at = NOW()`.
- Audit: action `campaign.launch`, previous state `{status:'Approved'}`, new state `{status:'Live'}`.
- Response: `200 { data: { id, status, launchedAt } }`.
- Errors: 409 `INVALID_CAMPAIGN_STATE` if not Approved.

#### POST `/v1/campaigns/:id/updates`

- Auth: `authenticate` + Creator + owns campaign.
- Body schema: `{ body: z.string().min(1).max(10000) }`.
- Precondition: `campaign.status` is `Live` or `Funded`.
- Mutation: `INSERT INTO campaign_updates (campaign_id, body)`.
- Audit: action `campaign.update_posted`.
- Response: `201 { data: { id, body, postedAt } }`.
- Errors: 409 `INVALID_CAMPAIGN_STATE` if not Live/Funded.

#### POST `/v1/campaigns/:id/contribute`

- Auth: `authenticate` (any role).
- Body schema: `{ amountUsd: z.number().int().positive() }`.
- Preconditions (checked in order):
  1. Deadline guard: if `deadline < now()` and `status === 'Live'` and
     `current_amount_usd < min_funding_target_usd` → enforce failure inline (status →
     Failed, audit `campaign.deadline_expired`) then return 409 `CAMPAIGN_DEADLINE_PASSED`.
  2. Campaign must be `Live` or `Funded`; else 409 `INVALID_CAMPAIGN_STATE`.
  3. `current_amount_usd + amountUsd > max_funding_cap_usd` → 422 `FUNDING_CAP_EXCEEDED`.
- Mutation: `UPDATE campaigns SET current_amount_usd = current_amount_usd + $amount, contributor_count = contributor_count + 1`.
- Auto-transition: if new `current_amount_usd >= min_funding_target_usd` and old `status === 'Live'`
  → additionally `SET status = 'Funded'`; emit separate audit `campaign.status_changed` (Live → Funded).
- Audit: action `campaign.contribution_received`.
- Response: `200 { data: { currentAmountUsd, contributorCount, status } }`.

#### POST `/v1/campaigns/:id/cancel`

- Auth: `authenticate` + Creator + owns campaign.
- Precondition: `campaign.status === 'Live'`.
- Branch A — no contributions (`contributor_count === 0`):
  - `UPDATE campaigns SET status = 'Cancelled', updated_at = NOW()`.
  - Audit: `campaign.cancelled`.
  - Response: `200 { data: { status: 'Cancelled' } }`.
- Branch B — contributions exist:
  - `UPDATE campaigns SET cancellation_requested_at = NOW(), updated_at = NOW()`.
  - Audit: `campaign.cancellation_requested`.
  - Response: `202 { data: { message: 'Cancellation request submitted; awaiting admin approval.' } }`.
- Errors: 409 `INVALID_CAMPAIGN_STATE` if not Live; 409 `CANCELLATION_ALREADY_REQUESTED` if
  `cancellation_requested_at` is already set.

#### POST `/v1/campaigns/:id/approve-cancel`

- Auth: `authenticate` + role must be `Administrator`.
- Precondition: `campaign.status === 'Live'` AND `cancellation_requested_at IS NOT NULL`.
- Mutation: `UPDATE campaigns SET status = 'Cancelled', cancellation_requested_at = NULL, updated_at = NOW()`.
- Audit: `campaign.cancellation_approved` with rationale stub `'Admin approved creator cancellation request'`.
- Response: `200 { data: { status: 'Cancelled' } }`.
- Errors: 409 `NO_PENDING_CANCELLATION` if there is no pending request.

#### POST `/v1/campaigns/:id/enforce-deadline`

- Auth: `authenticate` + role must be `Administrator`.
- Precondition: `campaign.status === 'Live'` AND `deadline IS NOT NULL` AND `deadline < NOW()`.
- Branch A — underfunded: `UPDATE campaigns SET status = 'Failed', updated_at = NOW()`.
  Audit: `campaign.deadline_expired` (Live → Failed).
  Response: `200 { data: { status: 'Failed' } }`.
- Branch B — funded (min target already met, status became Funded earlier):
  Response: `200 { data: { status: campaign.status, message: 'No enforcement needed.' } }`.
- Errors: 409 `DEADLINE_NOT_PASSED` if deadline has not yet passed; 409 `INVALID_CAMPAIGN_STATE` if
  campaign is not Live.

### Testing

All tests added to `packages/server/src/__tests__/campaigns.test.ts` following the existing
SuperTest + mock-pool pattern. Each new endpoint needs tests for:

- Happy path (correct state, valid input, expected response body and status code)
- Auth failures: no token (401), wrong role (403), wrong owner (403 for creator endpoints)
- Invalid campaign state (409)
- Input validation failures (400 or 422)
- DB error propagation (500 via `next(err)`)

The contribute endpoint additionally tests: cap enforcement (422), auto-transition to Funded,
and deadline enforcement guard.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/server/db/migrations/20260311000003_add_creator_id_to_campaigns.sql` | create | Adds `creator_id` FK + seed UPDATE for demo Creator account |
| `packages/server/db/migrations/20260311000004_add_cancellation_requested_campaigns.sql` | create | Adds `cancellation_requested_at` column |
| `packages/server/db/migrations/20260311000005_create_audit_events.sql` | create | Creates `audit_events` table per L3-006 §3 |
| `packages/server/db/schema.sql` | modify | Regenerated by dbmate after running migrations |
| `packages/server/src/campaigns/audit.ts` | create | `writeAuditEvent` helper for inserting into `audit_events` |
| `packages/server/src/campaigns/queries.ts` | modify | Add query functions: `launchCampaign`, `postCampaignUpdate`, `recordContribution`, `cancelCampaign`, `approveCancellation`, `enforceDeadline` |
| `packages/server/src/campaigns/types.ts` | modify | Add Zod schemas: `PostUpdateBodySchema`, `ContributeBodySchema` |
| `packages/server/src/campaigns/routes.ts` | modify | Register 5 new POST endpoints with auth middleware |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Integration tests for all new endpoints |

## Dependencies

No new npm packages required. All dependencies (express, pg, zod, jsonwebtoken, vitest,
supertest) are already installed.

The existing `authenticate` and `requireRole` middleware are ready for use. `requireRole`
only accepts a single role; creator-ownership checks are done inline in the route handler.

## Verification

- **Build**: `npm run build` succeeds (all workspaces).
- **Type-check**: `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json`.
- **Lint / format**: `npm run lint && npm run format:check`.
- **Unit + integration tests**: `npm run test:coverage` — coverage must stay above 80% (project threshold); campaign business logic targeting 90% per L4-002 §2.
- **Full CI**: `./scripts/ci-check.sh` passes.
- **Manual demo** (optional — requires running stack): log in as a Creator demo account, call
  `POST /v1/campaigns/:id/launch` on an Approved campaign via a REST client, verify status
  becomes `Live` and `launched_at` is set. Then call `POST /v1/campaigns/:id/contribute` with
  an amount that crosses the minimum target and verify status transitions to `Funded`.
- **E2E**: No Playwright E2E tests required for this issue — it is a pure API/server change
  with no frontend component.
