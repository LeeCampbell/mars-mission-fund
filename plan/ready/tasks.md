# Tasks: Issue #112 — Campaign launch, funding progress, and deadline enforcement

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: DB migrations — creator_id, cancellation_requested_at, audit_events
  - **Goal**: Add the three database migrations required by the brief so subsequent server code can use the new columns and table.
  - **Details**:
    1. Create `20260311000003_add_creator_id_to_campaigns.sql`: `ALTER TABLE campaigns ADD COLUMN creator_id uuid REFERENCES accounts(id)`. After the ALTER, add a seed UPDATE that sets `creator_id` to the UUID of the demo Creator account (look up via `role = 'Creator'` subquery) for campaigns whose status is in `('Approved','Live','Funded')`.
    2. Create `20260311000004_add_cancellation_requested_campaigns.sql`: `ALTER TABLE campaigns ADD COLUMN cancellation_requested_at timestamptz`.
    3. Create `20260311000005_create_audit_events.sql`: create table `audit_events` with columns: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `timestamp timestamptz NOT NULL DEFAULT NOW()`, `level text NOT NULL DEFAULT 'AUDIT'`, `correlation_id text`, `service text`, `message text`, `event_type text`, `actor_id uuid`, `actor_type text`, `action text NOT NULL`, `resource_type text`, `resource_id uuid`, `outcome text`, `previous_state jsonb`, `new_state jsonb`, `rationale text`.
    4. Update `packages/server/db/schema.sql` to reflect the new columns and table (manually or via dbmate dump).
  - **Files**:
    - `packages/server/db/migrations/20260311000003_add_creator_id_to_campaigns.sql` (create)
    - `packages/server/db/migrations/20260311000004_add_cancellation_requested_campaigns.sql` (create)
    - `packages/server/db/migrations/20260311000005_create_audit_events.sql` (create)
    - `packages/server/db/schema.sql` (modify)
  - **Verify**: Files exist and contain valid SQL. `schema.sql` includes the new columns and `audit_events` table.
  - **Brief ref**: DB migrations section; Audit helper section (table schema)

- [x] TASK-02: Audit helper — writeAuditEvent
  - **Goal**: Create `packages/server/src/campaigns/audit.ts` that exports a fire-and-forget `writeAuditEvent` helper.
  - **Details**:
    - Import `Pool` from `pg`.
    - Define `AuditEventInput` type covering all optional/required fields that map to `audit_events` columns (action is required; all others optional).
    - Implement `writeAuditEvent(pool, event)`: inserts a row into `audit_events`. Catch any error and log to `console.error`; never throw.
    - Do NOT `await` the call at the call site (callers fire-and-forget), but the helper itself should `await` the pool query internally.
  - **Files**:
    - `packages/server/src/campaigns/audit.ts` (create)
  - **Verify**: File compiles with `npx tsc --noEmit -p packages/server/tsconfig.json`.
  - **Brief ref**: Audit helper section

- [x] TASK-03: Zod schemas and query functions for new endpoints
  - **Goal**: Extend `types.ts` with new request body schemas and `queries.ts` with the DB mutation functions needed by all new endpoints.
  - **Details**:
    In `packages/server/src/campaigns/types.ts`:
    - Add `PostUpdateBodySchema`: `{ body: z.string().min(1).max(10000) }`.
    - Add `ContributeBodySchema`: `{ amountUsd: z.number().int().positive() }`.

    In `packages/server/src/campaigns/queries.ts`, add the following functions (each accepts `pool: Pool` + relevant args and returns a typed result):
    - `launchCampaign(pool, id)` — UPDATE status → Live, set launched_at; return updated row.
    - `postCampaignUpdate(pool, campaignId, body)` — INSERT into `campaign_updates`; return `{id, body, postedAt}`.
    - `recordContribution(pool, id, amountUsd)` — UPDATE current_amount_usd + contributor_count; optionally flip to Funded; return `{currentAmountUsd, contributorCount, status}`.
    - `cancelCampaign(pool, id)` — UPDATE status → Cancelled; return updated row.
    - `requestCancellation(pool, id)` — UPDATE cancellation_requested_at = NOW(); return updated row.
    - `approveCancellation(pool, id)` — UPDATE status → Cancelled, cancellation_requested_at → NULL; return updated row.
    - `enforceDeadline(pool, id)` — UPDATE status → Failed; return updated row.
  - **Files**:
    - `packages/server/src/campaigns/types.ts` (modify)
    - `packages/server/src/campaigns/queries.ts` (modify)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes with no new errors.
  - **Brief ref**: Endpoint details section; Files to Create/Modify table

- [x] TASK-04: Route handlers — launch, updates, contribute, cancel, approve-cancel, enforce-deadline
  - **Goal**: Register the six new POST endpoints in `packages/server/src/campaigns/routes.ts` with full business logic, auth checks, and audit event writes.
  - **Details**: For each endpoint follow the pattern: authenticate → role/ownership check → fetch campaign → state precondition → DB mutation → writeAuditEvent (fire-and-forget) → response.

    **POST /v1/campaigns/:id/launch**
    - Auth: `authenticate` + `role === 'Creator'` + ownership check (allow null creatorId).
    - Precondition: status === 'Approved'; else 409 `INVALID_CAMPAIGN_STATE`.
    - Call `launchCampaign`; audit `campaign.launch`; respond `200 { data: { id, status, launchedAt } }`.

    **POST /v1/campaigns/:id/updates**
    - Auth: `authenticate` + Creator + ownership.
    - Validate body with `PostUpdateBodySchema`.
    - Precondition: status in ['Live','Funded']; else 409 `INVALID_CAMPAIGN_STATE`.
    - Call `postCampaignUpdate`; audit `campaign.update_posted`; respond `201 { data: { id, body, postedAt } }`.

    **POST /v1/campaigns/:id/contribute**
    - Auth: `authenticate` (any role).
    - Validate body with `ContributeBodySchema`.
    - Deadline guard: if deadline < now AND status === 'Live' AND current_amount_usd < min_funding_target_usd → `enforceDeadline`, audit `campaign.deadline_expired`, return 409 `CAMPAIGN_DEADLINE_PASSED`.
    - Precondition: status in ['Live','Funded']; else 409 `INVALID_CAMPAIGN_STATE`.
    - Cap check: current_amount_usd + amountUsd > max_funding_cap_usd → 422 `FUNDING_CAP_EXCEEDED`.
    - Call `recordContribution`; if old status was Live and new status is Funded emit additional audit `campaign.status_changed`; always emit audit `campaign.contribution_received`; respond `200 { data: { currentAmountUsd, contributorCount, status } }`.

    **POST /v1/campaigns/:id/cancel**
    - Auth: `authenticate` + Creator + ownership.
    - Precondition: status === 'Live'; else 409 `INVALID_CAMPAIGN_STATE`. Also 409 `CANCELLATION_ALREADY_REQUESTED` if cancellation_requested_at is set.
    - Branch A (contributor_count === 0): `cancelCampaign`; audit `campaign.cancelled`; respond `200 { data: { status: 'Cancelled' } }`.
    - Branch B: `requestCancellation`; audit `campaign.cancellation_requested`; respond `202 { data: { message: '...' } }`.

    **POST /v1/campaigns/:id/approve-cancel**
    - Auth: `authenticate` + role === 'Administrator'.
    - Precondition: status === 'Live' AND cancellation_requested_at IS NOT NULL; else 409 `NO_PENDING_CANCELLATION`.
    - Call `approveCancellation`; audit `campaign.cancellation_approved`; respond `200 { data: { status: 'Cancelled' } }`.

    **POST /v1/campaigns/:id/enforce-deadline**
    - Auth: `authenticate` + role === 'Administrator'.
    - Precondition: status === 'Live'; else 409 `INVALID_CAMPAIGN_STATE`. Also 409 `DEADLINE_NOT_PASSED` if deadline >= now or deadline IS NULL.
    - Branch A (underfunded): `enforceDeadline`; audit `campaign.deadline_expired`; respond `200 { data: { status: 'Failed' } }`.
    - Branch B (already funded): respond `200 { data: { status: campaign.status, message: 'No enforcement needed.' } }`.
  - **Files**:
    - `packages/server/src/campaigns/routes.ts` (modify)
  - **Verify**: Server builds (`npm run build`); manual curl or type-check passes.
  - **Brief ref**: Route patterns section; Endpoint details section

- [x] TASK-05: Integration tests for all new endpoints
  - **Goal**: Add comprehensive integration tests to `packages/server/src/__tests__/campaigns.test.ts` covering all six new endpoints.
  - **Details**: Follow the existing SuperTest + mock-pool pattern in the file. For each endpoint add tests for:
    - Happy path (correct state, valid input, expected response code and body)
    - 401 when no token
    - 403 for wrong role (e.g., Backer calling Creator endpoint)
    - 403 for wrong owner (Creator endpoints with mismatched creatorId)
    - 409 for invalid campaign state
    - 400/422 for input validation failures (contribute: cap exceeded 422; body schema: 400)
    - 500 via DB error propagation (`next(err)`)

    Additional contribute tests:
    - Funding cap enforcement (422 `FUNDING_CAP_EXCEEDED`)
    - Auto-transition to Funded when min target is met
    - Deadline guard triggers 409 `CAMPAIGN_DEADLINE_PASSED` inline

    Coverage target: campaign business logic ≥ 90% (L4-002 §2); overall project threshold ≥ 80%.
  - **Files**:
    - `packages/server/src/__tests__/campaigns.test.ts` (modify)
  - **Verify**: `npm run test:coverage` passes all tests with coverage thresholds met.
  - **Brief ref**: Testing section

- [x] TASK-06: Full CI check and final verification
  - **Goal**: Ensure all CI checks pass end-to-end before the branch is considered ready for review.
  - **Details**:
    - Run `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json`.
    - Run `npm run lint && npm run format:check`.
    - Run `npm run test:coverage` (all tests green, thresholds met).
    - Run `npm run build` (all workspaces).
    - Fix any type errors, lint violations, formatting issues, or test failures discovered.
  - **Files**: Any files needing fixes found during CI run.
  - **Verify**: `./scripts/ci-check.sh` exits 0.
  - **Brief ref**: Verification section
