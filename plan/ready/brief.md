# Brief: Issue #109 — Campaign schema additions and audit log

## Goal

Extend the database schema to support the full campaign lifecycle pipeline by adding ownership
and review tracking fields to the `campaigns` table, creating an immutable `campaign_audit_log`
table for state-transition history (per L3-006), and adding `notifications`,
`milestone_evidence`, and a seeded Reviewer demo account.
Shared TypeScript/Zod types are updated to expose the new fields, and existing GET campaign
queries are updated to include `created_by` in responses.

## Scope

**In scope:**

- Migration: add `created_by` (FK → accounts), `reviewer_id` (FK → accounts),
  `rejection_rationale`, `approval_notes`, `submitted_at` columns to `campaigns`
- Migration: create `campaign_audit_log` table
- Migration: create `notifications` table
- Migration: create `milestone_evidence` table
- Migration: seed Reviewer demo account (`reviewer@example.com` / `reviewer-demo-pass`)
- Migration: update seed campaigns — set `created_by` to Demo Creator account UUID
- Add `AuditLogEntrySchema`, `NotificationSchema`, `MilestoneEvidenceSchema` Zod schemas
  and TypeScript types to `@mmf/shared`
- Extend `CampaignSummarySchema` and `CampaignDetailSchema` with nullable `createdBy` field
- Update `listCampaigns` and `getCampaignById` SQL to select `created_by AS "createdBy"`
- Update server unit tests to cover the new `createdBy` field

**Out of scope:**

- Business logic endpoints for audit log, notifications, or milestone evidence (no new routes)
- Campaign submission / review pipeline API endpoints (future issues)
- Front-end changes
- Auth enforcement for the Reviewer role (future issues)

## Approach

### Migrations (sequential after existing `20260311000002`)

Use the naming pattern `YYYYMMDD######_<description>.sql` continuing from `20260311000002`.
Six new migration files required:

1. **`20260311000003_add_campaign_lifecycle_fields.sql`** — `ALTER TABLE campaigns ADD COLUMN`
   for `created_by UUID REFERENCES accounts(id)`, `reviewer_id UUID REFERENCES accounts(id)`,
   `rejection_rationale TEXT`, `approval_notes TEXT`, `submitted_at TIMESTAMPTZ`.
   All nullable (existing rows have no values yet).

2. **`20260311000004_create_campaign_audit_log.sql`** — new table with columns matching the
   issue spec: `id UUID PK`, `campaign_id UUID NOT NULL REFERENCES campaigns(id)`,
   `previous_state TEXT`, `new_state TEXT NOT NULL`, `actor_id UUID NOT NULL REFERENCES accounts(id)`,
   `rationale TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   Index on `campaign_id` for query performance.

3. **`20260311000005_create_notifications.sql`** — new table:
   `id UUID PK`, `user_id UUID NOT NULL REFERENCES accounts(id)`, `type TEXT NOT NULL`,
   `title TEXT NOT NULL`, `message TEXT NOT NULL`, `campaign_id UUID REFERENCES campaigns(id)`,
   `read BOOLEAN NOT NULL DEFAULT false`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   Index on `user_id`.

4. **`20260311000006_create_milestone_evidence.sql`** — new table:
   `id UUID PK`, `milestone_id UUID NOT NULL REFERENCES campaign_milestones(id)`,
   `campaign_id UUID NOT NULL REFERENCES campaigns(id)`,
   `submitted_by UUID NOT NULL REFERENCES accounts(id)`,
   `evidence_type TEXT NOT NULL`, `evidence_url TEXT NOT NULL`,
   `description TEXT`, `submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   Index on `milestone_id`.

5. **`20260311000007_seed_reviewer_account.sql`** — INSERT into `accounts` with fixed UUID
   `44444444-4444-4444-4444-444444444444`, email `reviewer@example.com`, role `Reviewer`.
   Password hash is the bcrypt-10 hash of `reviewer-demo-pass`.
   Follow the DEMO STUB comment pattern from `20260311000002_seed_accounts.sql`.
   Generate the hash with:
   `node -e "require('bcrypt').hash('reviewer-demo-pass', 10).then(h => console.log(h))"`
   (bcrypt is already a project dependency via the auth layer).

6. **`20260311000008_seed_campaign_created_by.sql`** — UPDATE all seed campaigns to set
   `created_by = '22222222-2222-2222-2222-222222222222'` (Demo Creator UUID).

### Shared types (`packages/shared/src/campaign.ts`)

Add three new schemas and export their TypeScript types:

```ts
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  previousState: CampaignStatusSchema.nullable(),
  newState: CampaignStatusSchema,
  actorId: z.string().uuid(),
  rationale: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  campaignId: z.string().uuid().nullable(),
  read: z.boolean(),
  createdAt: z.coerce.date(),
})

export const MilestoneEvidenceSchema = z.object({
  id: z.string().uuid(),
  milestoneId: z.string().uuid(),
  campaignId: z.string().uuid(),
  submittedBy: z.string().uuid(),
  evidenceType: z.string(),
  evidenceUrl: z.string().url(),
  description: z.string().nullable(),
  submittedAt: z.coerce.date(),
})
```

Extend `CampaignSummarySchema` to add `createdBy: z.string().uuid().nullable()`.
`CampaignDetailSchema` inherits this via `CampaignSummarySchema.extend(...)`.

### Server queries (`packages/server/src/campaigns/queries.ts`)

Add `created_by AS "createdBy"` to the `SELECT` clause in both `listCampaigns` and
`getCampaignById`.
No change to the `CampaignSummary`/`CampaignDetail` TypeScript types required — they are
inferred from the Zod schemas in `@mmf/shared`.

### Server tests (`packages/server/src/__tests__/campaigns.test.ts`)

Add `createdBy` (UUID or null) to `mockCampaignSummary` and `mockCampaignRow`.
Add an assertion that the list and detail responses include the `createdBy` field.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/db/migrations/20260311000003_add_campaign_lifecycle_fields.sql` | create | ALTER TABLE campaigns ADD COLUMN for 5 new fields |
| `packages/server/db/migrations/20260311000004_create_campaign_audit_log.sql` | create | new campaign_audit_log table |
| `packages/server/db/migrations/20260311000005_create_notifications.sql` | create | new notifications table |
| `packages/server/db/migrations/20260311000006_create_milestone_evidence.sql` | create | new milestone_evidence table |
| `packages/server/db/migrations/20260311000007_seed_reviewer_account.sql` | create | seed Reviewer demo account |
| `packages/server/db/migrations/20260311000008_seed_campaign_created_by.sql` | create | set created_by on seed campaigns |
| `packages/shared/src/campaign.ts` | modify | add 3 new schemas + types; add createdBy to CampaignSummarySchema |
| `packages/server/src/campaigns/queries.ts` | modify | add created_by to both SELECT clauses |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | add createdBy to mock data and assertions |

## Dependencies

- No new npm packages required.
- `bcrypt` is already available (used by auth layer) — needed only to pre-generate the
  hash during brief authoring, not at runtime.
- All migrations depend on the `accounts` table existing (`20260311000001`) and seed
  accounts existing (`20260311000002`) before running.
  Migration `20260311000008` depends on `20260311000003`.

## Verification

- **Build**: `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json` passes
- **Tests**: `npm run test:coverage` passes (80% threshold)
- **Lint/format**: `npm run lint && npm run format:check` passes
- **Full CI**: `./scripts/ci-check.sh` passes
- **Migrations**: Running `dbmate up` against a fresh DB applies all migrations without error
- **Visual (after full stack start)**:
  - `GET /v1/campaigns` response includes `createdBy` field on each campaign object
  - `GET /v1/campaigns/:id` response includes `createdBy` field
- **E2E**: No new E2E tests required for this issue (no new UI flows; schema/type changes only)
