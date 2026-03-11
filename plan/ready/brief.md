# Brief: Issue #113 — Milestone verification and settlement workflow

## Goal

Implement the backend settlement and milestone verification workflow for funded campaigns.
When a campaign transitions from **Funded** to **Settlement**, creators submit evidence per milestone,
admins verify (or return) each submission, and verified milestones trigger a stubbed fund disbursement.
Once all milestones are Verified the campaign auto-transitions to **Complete**.
Every state mutation is recorded in an audit log.

## Scope

**In scope:**

- `POST /v1/campaigns/:id/settle` — Admin transitions a Funded campaign to Settlement
- `POST /v1/campaigns/:id/milestones/:mid/submit-evidence` — Creator submits evidence; milestone status becomes `Submitted`
- `POST /v1/campaigns/:id/milestones/:mid/verify` — Admin verifies milestone; status becomes `Verified`; triggers stubbed disbursement; auto-transitions campaign to `Complete` when all milestones Verified
- `POST /v1/campaigns/:id/milestones/:mid/return` — Admin returns evidence with feedback; milestone status becomes `Returned`
- `POST /v1/campaigns/:id/cancel` — Admin cancels a Settlement-state campaign; stubbed refund
- Audit log table and entries for all new state transitions
- Notifications: DEMO STUB — `console.log` only (no email service)
- Disbursement: DEMO STUB — logged, no real payment
- Server integration tests for all 5 new endpoints
- All CI checks pass

**Out of scope:**

- Real payment gateway or escrow mechanics (L4-004 theatre)
- Multi-approval disbursement workflow (L4-004 theatre)
- Email/push notification delivery
- Frontend changes
- Campaign cancellation for states other than Settlement
- Non-settlement cancel flows (Live cancel, creator-initiated cancel)

## Approach

### Database — two new migrations

**Migration 1** (`20260311000003_add_milestone_evidence_fields.sql`):
Add evidence and feedback columns to `campaign_milestones`:

```sql
ALTER TABLE campaign_milestones
  ADD COLUMN evidence_description TEXT,
  ADD COLUMN evidence_url         TEXT,
  ADD COLUMN evidence_submitted_at TIMESTAMPTZ,
  ADD COLUMN feedback             TEXT;
```

The `status` column is a plain `TEXT` with no `CHECK` constraint, so `Returned` is valid
without a schema change; we simply extend the `MilestoneStatusSchema` enum in shared.

**Migration 2** (`20260311000004_create_audit_log.sql`):
Create a minimal append-only audit log table:

```sql
CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   TEXT NOT NULL,
  campaign_id  UUID REFERENCES campaigns(id),
  milestone_id UUID REFERENCES campaign_milestones(id),
  actor_id     TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Shared types (`packages/shared/src/campaign.ts`)

- Add `'Returned'` to `MilestoneStatusSchema`
- Add evidence fields to `MilestoneSchema`:
  `evidenceDescription`, `evidenceUrl`, `evidenceSubmittedAt`, `feedback`

### Middleware (`packages/server/src/middleware/requireRole.ts`)

Extend `requireRole` to accept a single role or an array of roles so admin endpoints
can accept both `'Administrator'` and `'SuperAdministrator'`:

```typescript
export function requireRole(role: Role | Role[])
```

### Server routes (`packages/server/src/campaigns/routes.ts`)

Add 5 new protected routes.
All routes run `authenticate` first; admin routes additionally run `requireRole(['Administrator', 'SuperAdministrator'])`;
the evidence-submission route runs `requireRole('Creator')`.

| Method | Path | Guard | Business logic |
|--------|------|-------|----------------|
| POST | `/:id/settle` | Admin | Validate campaign status is `Funded`; update to `Settlement`; write audit log |
| POST | `/:id/milestones/:mid/submit-evidence` | Creator | Validate campaign is `Settlement`; milestone status is `Pending` or `Returned`; write evidence fields; set status `Submitted`; write audit log; stub: log admin notification |
| POST | `/:id/milestones/:mid/verify` | Admin | Validate campaign is `Settlement`; milestone status is `Submitted`; set `Verified`; write audit log; stub disbursement log; check if all milestones Verified → set campaign to `Complete`, write audit log; stub creator notification |
| POST | `/:id/milestones/:mid/return` | Admin | Validate campaign is `Settlement`; milestone status is `Submitted`; require `feedback` body field; set status `Returned`; write feedback; write audit log; stub creator notification |
| POST | `/:id/cancel` | Admin | Validate campaign is in `Settlement`; set to `Cancelled`; write audit log; stub refund log |

Request body for `submit-evidence`:

```json
{ "evidenceDescription": "...", "evidenceUrl": "https://..." }
```

Request body for `return`:

```json
{ "feedback": "..." }
```

All responses follow the existing `{ data: ... }` envelope pattern.
All error responses use the existing error handler with `status`, `code`, and `details`.

### Server queries (`packages/server/src/campaigns/queries.ts`)

Add new query functions (follow existing parameterised-query pattern):

- `settleCampaign(pool, campaignId)` — UPDATE campaigns SET status = 'Settlement'
- `submitMilestoneEvidence(pool, campaignId, milestoneId, body)` — UPDATE campaign_milestones
- `verifyMilestone(pool, campaignId, milestoneId)` — UPDATE milestone + check all milestones + conditional campaign UPDATE in a single DB transaction; returns whether campaign transitioned to Complete
- `returnMilestone(pool, campaignId, milestoneId, feedback)` — UPDATE campaign_milestones
- `cancelSettlement(pool, campaignId)` — UPDATE campaigns SET status = 'Cancelled'
- `insertAuditLog(pool, entry)` — INSERT into audit_log

### Server types (`packages/server/src/campaigns/types.ts`)

Add Zod schemas for:

- `MilestoneRouteParamsSchema` — `{ id: uuid, mid: uuid }`
- `SubmitEvidenceBodySchema` — `{ evidenceDescription: string, evidenceUrl: string().url().optional() }`
- `ReturnMilestoneBodySchema` — `{ feedback: string.min(1) }`

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/server/db/migrations/20260311000003_add_milestone_evidence_fields.sql` | create | Add evidence/feedback columns to `campaign_milestones` |
| `packages/server/db/migrations/20260311000004_create_audit_log.sql` | create | New `audit_log` table |
| `packages/server/db/schema.sql` | modify | Reflect new columns and table |
| `packages/shared/src/campaign.ts` | modify | Add `'Returned'` to `MilestoneStatusSchema`; add evidence fields to `MilestoneSchema` |
| `packages/server/src/middleware/requireRole.ts` | modify | Accept `Role \| Role[]` |
| `packages/server/src/campaigns/types.ts` | modify | Add `MilestoneRouteParamsSchema`, `SubmitEvidenceBodySchema`, `ReturnMilestoneBodySchema` |
| `packages/server/src/campaigns/queries.ts` | modify | Add 6 new query functions |
| `packages/server/src/campaigns/routes.ts` | modify | Add 5 new authenticated routes |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Integration tests for all 5 new endpoints |

## Dependencies

No new npm packages required.
All needed libraries (`express`, `pg`, `zod`, `jsonwebtoken`, `vitest`, `supertest`) are already installed.

## Verification

**Build:**

```bash
npm run build -w @mmf/shared
npx tsc -b --noEmit
npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
```

**Lint/format:**

```bash
npm run lint
npm run format:check
```

**Unit/integration tests:**

```bash
npm run test:coverage
```

Coverage threshold is 80% overall; campaign business logic targets 90%.
All 5 new endpoints must have tests for:

- Happy path (correct role, valid state)
- 401 Unauthorized (no token)
- 403 Forbidden (wrong role)
- 404 Campaign not found
- 409 Conflict (campaign in wrong state, e.g. `settle` on non-Funded campaign)
- 422 / 400 Invalid body (for endpoints with a body)

**Visual (browser):**

No frontend changes; verify via curl or Postman against `http://localhost:3001`:

1. Login as admin, get token
2. `POST /v1/campaigns/00000000-0002-0000-0000-000000000002/settle` → 200, campaign status becomes `Settlement`
   (Campaign 2 seed data: 2 milestones already `Verified`, 1 milestone already `Submitted`)
3. Login as admin, `POST /v1/campaigns/00000000-0002-0000-0000-000000000002/milestones/10000000-0002-0003-0000-000000000002/verify`
   → 200; all 3 milestones now `Verified` → campaign auto-transitions to `Complete`
4. Login as creator, `POST /v1/campaigns/00000000-0006-0000-0000-000000000006/milestones/.../submit-evidence`
   → 200; milestone status becomes `Submitted`
5. Login as admin, test `return` on that milestone → feedback stored, status becomes `Returned`

**E2E (Playwright — no new spec required for this server-only issue):**

The existing E2E tests should continue to pass.
No new Playwright specs are needed as this is purely a backend feature with no frontend.

**Acceptance criteria:**

- AC-CAMP-013: Creator submits evidence → `Submitted` status + audit log entry
- AC-CAMP-014: Admin verifies milestone → `Verified` status + disbursement stub logged + audit log
- AC-CAMP-015: Admin returns evidence → `Returned` status + feedback stored + audit log
- AC-CAMP-016: All milestones `Verified` → campaign transitions to `Complete` + audit log
