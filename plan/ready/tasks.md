# Tasks: Issue #109 — Campaign schema additions and audit log

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create migration — add campaign lifecycle fields
  - **Goal**: Add `created_by`, `reviewer_id`, `rejection_rationale`, `approval_notes`, and `submitted_at` columns to the `campaigns` table
  - **Details**: Create `packages/server/db/migrations/20260311000003_add_campaign_lifecycle_fields.sql` with `ALTER TABLE campaigns ADD COLUMN` statements. All columns nullable. `created_by` and `reviewer_id` reference `accounts(id)`.
  - **Files**: `packages/server/db/migrations/20260311000003_add_campaign_lifecycle_fields.sql`
  - **Verify**: File exists and contains valid SQL with 5 new columns; no syntax errors
  - **Brief ref**: Migrations section, migration #1

- [x] TASK-02: Create migration — campaign_audit_log table
  - **Goal**: Create the immutable `campaign_audit_log` table for state-transition history
  - **Details**: Create `packages/server/db/migrations/20260311000004_create_campaign_audit_log.sql`. Columns: `id UUID PK`, `campaign_id UUID NOT NULL REFERENCES campaigns(id)`, `previous_state TEXT`, `new_state TEXT NOT NULL`, `actor_id UUID NOT NULL REFERENCES accounts(id)`, `rationale TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`. Add index on `campaign_id`.
  - **Files**: `packages/server/db/migrations/20260311000004_create_campaign_audit_log.sql`
  - **Verify**: File exists with correct schema and index definition
  - **Brief ref**: Migrations section, migration #2

- [ ] TASK-03: Create migration — notifications table
  - **Goal**: Create the `notifications` table
  - **Details**: Create `packages/server/db/migrations/20260311000005_create_notifications.sql`. Columns: `id UUID PK`, `user_id UUID NOT NULL REFERENCES accounts(id)`, `type TEXT NOT NULL`, `title TEXT NOT NULL`, `message TEXT NOT NULL`, `campaign_id UUID REFERENCES campaigns(id)`, `read BOOLEAN NOT NULL DEFAULT false`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`. Add index on `user_id`.
  - **Files**: `packages/server/db/migrations/20260311000005_create_notifications.sql`
  - **Verify**: File exists with correct schema and index definition
  - **Brief ref**: Migrations section, migration #3

- [ ] TASK-04: Create migration — milestone_evidence table
  - **Goal**: Create the `milestone_evidence` table
  - **Details**: Create `packages/server/db/migrations/20260311000006_create_milestone_evidence.sql`. Columns: `id UUID PK`, `milestone_id UUID NOT NULL REFERENCES campaign_milestones(id)`, `campaign_id UUID NOT NULL REFERENCES campaigns(id)`, `submitted_by UUID NOT NULL REFERENCES accounts(id)`, `evidence_type TEXT NOT NULL`, `evidence_url TEXT NOT NULL`, `description TEXT`, `submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()`. Add index on `milestone_id`.
  - **Files**: `packages/server/db/migrations/20260311000006_create_milestone_evidence.sql`
  - **Verify**: File exists with correct schema and index definition
  - **Brief ref**: Migrations section, migration #4

- [ ] TASK-05: Create migration — seed Reviewer demo account
  - **Goal**: Insert the Reviewer demo account into `accounts`
  - **Details**: Create `packages/server/db/migrations/20260311000007_seed_reviewer_account.sql`. Generate bcrypt-10 hash of `reviewer-demo-pass` via `node -e "require('bcrypt').hash('reviewer-demo-pass', 10).then(h => console.log(h))"`. INSERT with fixed UUID `44444444-4444-4444-4444-444444444444`, email `reviewer@example.com`, role `Reviewer`. Follow DEMO STUB comment pattern from `20260311000002_seed_accounts.sql`.
  - **Files**: `packages/server/db/migrations/20260311000007_seed_reviewer_account.sql`
  - **Verify**: File exists; INSERT uses correct UUID, email, role, and a valid bcrypt hash string
  - **Brief ref**: Migrations section, migration #5

- [ ] TASK-06: Create migration — set created_by on seed campaigns
  - **Goal**: Backfill `created_by` on all seed campaigns to the Demo Creator UUID
  - **Details**: Create `packages/server/db/migrations/20260311000008_seed_campaign_created_by.sql`. UPDATE all rows in `campaigns` setting `created_by = '22222222-2222-2222-2222-222222222222'`.
  - **Files**: `packages/server/db/migrations/20260311000008_seed_campaign_created_by.sql`
  - **Verify**: File exists with correct UPDATE statement and UUID
  - **Brief ref**: Migrations section, migration #6

- [ ] TASK-07: Add new Zod schemas and types to @mmf/shared
  - **Goal**: Export `AuditLogEntrySchema`, `NotificationSchema`, `MilestoneEvidenceSchema` and their TypeScript types; extend `CampaignSummarySchema` with nullable `createdBy`
  - **Details**: Modify `packages/shared/src/campaign.ts`. Add the three new schemas exactly as specified in the brief. Add `createdBy: z.string().uuid().nullable()` to `CampaignSummarySchema`. Export inferred types for all three new schemas. `CampaignDetailSchema` inherits `createdBy` automatically via `.extend(...)`.
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: `npm run build -w @mmf/shared` passes; TypeScript types are exported
  - **Brief ref**: Shared types section

- [ ] TASK-08: Update server SQL queries to include createdBy
  - **Goal**: Add `created_by AS "createdBy"` to both `listCampaigns` and `getCampaignById` SELECT clauses
  - **Details**: Modify `packages/server/src/campaigns/queries.ts`. Add `created_by AS "createdBy"` to the SELECT in both query functions. No TypeScript type changes needed — types infer from the updated shared schemas.
  - **Files**: `packages/server/src/campaigns/queries.ts`
  - **Verify**: File diff shows `createdBy` added to both SELECTs; `npx tsc -b --noEmit` passes
  - **Brief ref**: Server queries section

- [ ] TASK-09: Update server unit tests for createdBy field
  - **Goal**: Cover the new `createdBy` field in campaign server tests
  - **Details**: Modify `packages/server/src/__tests__/campaigns.test.ts`. Add `createdBy` (a UUID string or null) to `mockCampaignSummary` and `mockCampaignRow`. Add assertions that list and detail API responses include the `createdBy` field.
  - **Files**: `packages/server/src/__tests__/campaigns.test.ts`
  - **Verify**: `npm run test:coverage` passes with 80% threshold met
  - **Brief ref**: Server tests section

- [ ] TASK-10: Run full CI check and verify
  - **Goal**: Confirm the entire implementation passes all CI checks
  - **Details**: Run `./scripts/ci-check.sh`. Fix any type errors, lint issues, or test failures. Ensure `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test:coverage` all pass cleanly.
  - **Files**: (none — verification only)
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors
  - **Brief ref**: Verification section
