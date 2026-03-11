# Brief: Issue #110 — Campaign CRUD and submission flow

## Goal

Implement the server-side campaign write API for the Mars Mission Fund platform:
a Creator can create a Draft campaign, iteratively update it, delete it, submit it
for review (Draft → Submitted with full field validation), and list their own campaigns
via `GET /v1/campaigns?createdBy=me`.
KYC is stubbed as always-verified.
Every state transition is recorded in an immutable audit-event table per L3-006.

## Scope

### In scope

- `POST /v1/campaigns` — create a Draft campaign (Creator role only, authenticated)
- `PUT /v1/campaigns/:id` — replace draft fields (Creator, own campaign, Draft state only)
- `DELETE /v1/campaigns/:id` — delete a Draft campaign (Creator, own campaign, Draft state only)
- `POST /v1/campaigns/:id/submit` — transition Draft → Submitted with full spec §4.2/§4.5 validation
- `GET /v1/campaigns?createdBy=me` — list caller's own campaigns (requires auth when param present)
- DB migration: add `creator_id` and `risk_disclosures` to `campaigns` table
- DB migration: create `campaign_audit_events` table
- Shared Zod schemas: `CreateCampaignRequest`, `UpdateCampaignRequest`
- Server integration tests (100% endpoint coverage per L2-002 §4.2)
- Audit log entries for `campaign.created` and `campaign.submitted` events

### Out of scope

- Frontend UI for campaign creation/editing
- Review pipeline (Submitted → Under Review → Approved/Rejected)
- Campaign launch (Approved → Live)
- Payments, milestones evidence, or any post-submission workflow
- Real KYC verification (stubbed as always-passing)
- Email/push notifications (stubbed)
- Deadline enforcement automation

## Approach

### 1. Database migrations

**Migration `20260311000003_campaign_creator_and_risk.sql`**

Add two columns to `campaigns`:

```sql
ALTER TABLE campaigns
  ADD COLUMN creator_id uuid REFERENCES accounts(id),
  ADD COLUMN risk_disclosures text[] NOT NULL DEFAULT '{}';
```

`creator_id` is nullable to avoid breaking existing seed data (seeded campaigns have no creator).
New campaigns created via the API always set `creator_id` to the authenticated user's ID.

**Migration `20260311000004_create_campaign_audit_events.sql`**

```sql
CREATE TABLE campaign_audit_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id  uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  event_type   text NOT NULL,
  actor_id     uuid REFERENCES accounts(id),
  previous_state text,
  new_state    text NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}',
  occurred_at  timestamptz NOT NULL DEFAULT now()
);
```

Update `schema.sql` after running migrations.

### 2. Shared schemas (`packages/shared/src/campaign.ts`)

Add two new schemas:

```typescript
export const CreateCampaignRequestSchema = z.object({
  title: z.string().min(1).max(200),
  category: CampaignCategorySchema,
  summary: z.string().max(280).optional().default(''),
  description: z.string().optional().default(''),
  alignmentStatement: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  heroImageUrl: z.string().url().nullable().optional(),
  minFundingTargetUsd: z.number().int().positive().optional(),
  maxFundingCapUsd: z.number().int().positive().optional(),
  deadline: z.coerce.date().nullable().optional(),
  riskDisclosures: z.array(z.string()).optional().default([]),
})

export const UpdateCampaignRequestSchema = CreateCampaignRequestSchema
  .partial()
  .omit({ category: true })
  .extend({ category: CampaignCategorySchema.optional() })
```

Export types `CreateCampaignRequest` and `UpdateCampaignRequest`.

### 3. Server types (`packages/server/src/campaigns/types.ts`)

Import and re-export the two new shared schemas.
Add `SubmitRouteParamsSchema` (same as `RouteParamsSchema`).
Extend `ListQuerySchema` with `createdBy: z.literal('me').optional()`.

### 4. Server queries (`packages/server/src/campaigns/queries.ts`)

Add the following functions (all use parameterised queries, no string interpolation for user data):

- **`createCampaign(pool, creatorId, data)`** — inserts a new row with `status='Draft'`, generates a
  unique slug via `slugify(title) + '-' + randomHex(6)` (pure function, no DB call needed for slug),
  inserts a `campaign.created` audit event, returns the new campaign row as `CampaignDetail`.
- **`updateCampaign(pool, id, creatorId, data)`** — updates mutable Draft fields, returns updated row
  or `null` if not found/forbidden/wrong-state.
  Returns an object `{ campaign, reason }` where `reason` is `'not_found' | 'forbidden' | 'not_draft' | null`.
- **`deleteCampaign(pool, id, creatorId)`** — deletes if owned and Draft. Returns same discriminated result.
- **`submitCampaign(pool, id, creatorId)`** — validates all §4.2/§4.5 rules (queries milestones/team
  inline), transitions to Submitted, writes `campaign.submitted` audit event. Returns
  `{ campaign, errors }` where `errors` is an array of validation error strings (empty = success).

The `submitCampaign` query must:
1. Fetch the campaign, verify ownership, verify status = 'Draft'.
2. KYC stub — always passes (log a `// DEMO STUB: KYC always verified` comment).
3. Validate:
   - title, summary, description, alignmentStatement non-empty
   - category is a valid enum value (already enforced at create/update)
   - `minFundingTargetUsd` ∈ [1\_000\_000, 1\_000\_000\_000]
   - `maxFundingCapUsd` >= `minFundingTargetUsd`
   - `deadline` is at least 7 days from now and at most 365 days from now
   - At least 1 team member exists (`campaign_team_members` count ≥ 1)
   - At least 2 milestones exist (`campaign_milestones` count ≥ 2)
   - Sum of milestone `funding_pct` = 100 (AC-CAMP-003)
   - At least 1 risk disclosure (`risk_disclosures` array length ≥ 1)
4. If valid: `UPDATE campaigns SET status='Submitted', updated_at=now()` + insert audit event.
5. Return the updated campaign (call `getCampaignById` for the full detail shape).

### 5. Server routes (`packages/server/src/campaigns/routes.ts`)

Add routes following the established Express factory pattern, matching existing code style:

```
POST   /          authenticate, requireRole('Creator')  → createCampaign
PUT    /:id        authenticate, requireRole('Creator')  → updateCampaign
DELETE /:id        authenticate, requireRole('Creator')  → deleteCampaign
POST   /:id/submit authenticate, requireRole('Creator')  → submitCampaign
```

For `GET /` with `createdBy=me`:
- Parse query as before.
- If `createdBy === 'me'`, manually verify the `Authorization: Bearer` JWT header within the handler
  (using `jwt.verify(token, process.env['JWT_SECRET'])`, same logic as `authenticate.ts`).
  Extract `user.id` and pass it to `listCampaigns` to add `AND creator_id = $N` to the SQL.
  If header is absent or JWT is invalid, call `next` with a 401 error object.
- Public campaign listing (no `createdBy` param) remains unauthenticated — no change to existing behaviour.

**Success HTTP status codes**: `POST /` → 201; `PUT /:id` → 200; `DELETE /:id` → 204 (no body);
`POST /:id/submit` → 200; `GET /` → 200.

**Error codes** (returned via `Object.assign(new Error(...), { status, code, details })` pattern):

| Route | Status | Code |
|-------|--------|------|
| All write routes | 400 | `INVALID_REQUEST_BODY` |
| All write routes | 400 | `INVALID_CAMPAIGN_ID` |
| PUT/DELETE/submit | 404 | `CAMPAIGN_NOT_FOUND` |
| PUT/DELETE/submit | 403 | `FORBIDDEN` (caller is not creator) |
| PUT/DELETE/submit | 409 | `CAMPAIGN_NOT_EDITABLE` (not in Draft state) |
| submit | 422 | `SUBMISSION_VALIDATION_FAILED` (details: string[]) |

`res.locals['user']` (set by `authenticate`) has shape `{ id: string; role: string }` — use `id` for `creatorId`.

### 6. Integration tests (`packages/server/src/__tests__/campaigns.test.ts`)

Follow the existing mock-pool pattern (`vi.fn()` pool, no real DB).
Add a `describe('Campaign Write Endpoints')` block with coverage for:

- `POST /v1/campaigns` — 201 success; 400 invalid body; 401 no token; 403 non-Creator role
- `PUT /v1/campaigns/:id` — 200 success; 400 bad UUID; 404 not found; 403 forbidden; 409 not Draft
- `DELETE /v1/campaigns/:id` — 204 success; 403 forbidden; 409 not Draft
- `POST /v1/campaigns/:id/submit` — 200 success; 422 milestone % ≠ 100 (AC-CAMP-003); 422 missing required fields (AC-CAMP-001); 409 not Draft
- `GET /v1/campaigns?createdBy=me` — 200 with filtered list; 401 no token

For auth-required routes, sign a test JWT with a test secret using the `jsonwebtoken` package (same pattern as `auth.test.ts`).

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/server/db/migrations/20260311000003_campaign_creator_and_risk.sql` | create | Add `creator_id`, `risk_disclosures` to campaigns |
| `packages/server/db/migrations/20260311000004_create_campaign_audit_events.sql` | create | Immutable audit event table |
| `packages/server/db/schema.sql` | modify | Reflect new columns and table after migrations |
| `packages/shared/src/campaign.ts` | modify | Add `CreateCampaignRequestSchema`, `UpdateCampaignRequestSchema` + types |
| `packages/server/src/campaigns/types.ts` | modify | Import new shared schemas; extend `ListQuerySchema` with `createdBy` |
| `packages/server/src/campaigns/queries.ts` | modify | Add `createCampaign`, `updateCampaign`, `deleteCampaign`, `submitCampaign` |
| `packages/server/src/campaigns/routes.ts` | modify | Add 4 new routes + update GET / for `createdBy=me` |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Add tests for all new endpoints (100% contract coverage) |

## Dependencies

No new npm packages required.
All dependencies already present: `express`, `pg`, `zod`, `jsonwebtoken`, `@mmf/shared`.

## Verification

### Build

```bash
npm run build -w @mmf/shared
npx tsc -b --noEmit
npx tsc --noEmit -p packages/server/tsconfig.json
```

### Unit / integration tests

```bash
npm run test:coverage
```

Coverage must remain ≥ 80% (project threshold).
New campaign endpoint tests must cover all documented error codes.

### Manual API smoke test (with local stack running)

```bash
# 1. Log in as creator, capture token
TOKEN=$(curl -s -X POST http://localhost:3001/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"creator@example.com","password":"creator-demo-pass"}' \
  | jq -r '.data.token')

# 2. Create a draft
CAMP=$(curl -s -X POST http://localhost:3001/v1/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test Mars Mission","category":"Propulsion"}' \
  | jq -r '.data')
echo $CAMP | jq '.status'   # → "Draft"

# 3. List my campaigns
curl -s http://localhost:3001/v1/campaigns?createdBy=me \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# 4. Submit (will fail validation — missing required fields — returns 422)
ID=$(echo $CAMP | jq -r '.id')
curl -s -X POST http://localhost:3001/v1/campaigns/$ID/submit \
  -H "Authorization: Bearer $TOKEN" | jq '.error.code'  # → "SUBMISSION_VALIDATION_FAILED"
```

### CI

```bash
./scripts/ci-check.sh
```

All lint, type-check, format, and test checks must pass.

### E2E

No browser E2E tests are required for this issue — there is no frontend campaign-creation UI.
The campaign submission flow will be covered by E2E tests when the Creator frontend is built.
API-level integration tests (supertest) provide the equivalent coverage for this phase.
