# Tasks: Issue #110 — Campaign CRUD and submission flow

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: DB migrations — add creator_id, risk_disclosures, audit events table
  - **Goal**: Create two new DB migrations and update schema.sql to reflect them
  - **Details**: Create `20260311000003_campaign_creator_and_risk.sql` adding `creator_id uuid REFERENCES accounts(id)` (nullable) and `risk_disclosures text[] NOT NULL DEFAULT '{}'` to the `campaigns` table. Create `20260311000004_create_campaign_audit_events.sql` with the full `campaign_audit_events` table DDL. Update `packages/server/db/schema.sql` to reflect both new columns and the new table.
  - **Files**:
    - `packages/server/db/migrations/20260311000003_campaign_creator_and_risk.sql` (create)
    - `packages/server/db/migrations/20260311000004_create_campaign_audit_events.sql` (create)
    - `packages/server/db/schema.sql` (modify)
  - **Verify**: Files exist and SQL is syntactically valid; schema.sql contains `creator_id`, `risk_disclosures`, and `campaign_audit_events`
  - **Brief ref**: Section 1 — Database migrations

- [x] TASK-02: Shared schemas — CreateCampaignRequestSchema and UpdateCampaignRequestSchema
  - **Goal**: Add and export two new Zod schemas and their TypeScript types to `packages/shared/src/campaign.ts`
  - **Details**: Add `CreateCampaignRequestSchema` with all fields from the brief (title, category, summary, description, alignmentStatement, tags, heroImageUrl, minFundingTargetUsd, maxFundingCapUsd, deadline, riskDisclosures). Add `UpdateCampaignRequestSchema` as a partial extension that makes `category` optional. Export both as types `CreateCampaignRequest` and `UpdateCampaignRequest`.
  - **Files**:
    - `packages/shared/src/campaign.ts` (modify)
  - **Verify**: `npm run build -w @mmf/shared` succeeds; types are exported
  - **Brief ref**: Section 2 — Shared schemas

- [x] TASK-03: Server types — extend ListQuerySchema and import new schemas
  - **Goal**: Update `packages/server/src/campaigns/types.ts` to import new shared schemas and extend the list query
  - **Details**: Import and re-export `CreateCampaignRequestSchema` and `UpdateCampaignRequestSchema` from `@mmf/shared`. Add `SubmitRouteParamsSchema` (same shape as `RouteParamsSchema`). Extend `ListQuerySchema` with `createdBy: z.literal('me').optional()`.
  - **Files**:
    - `packages/server/src/campaigns/types.ts` (modify)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes with no new errors
  - **Brief ref**: Section 3 — Server types

- [x] TASK-04: Server queries — createCampaign, updateCampaign, deleteCampaign, submitCampaign
  - **Goal**: Implement all four new query functions in `packages/server/src/campaigns/queries.ts`
  - **Details**:
    - `createCampaign(pool, creatorId, data)`: insert with `status='Draft'`, slug = `slugify(title) + '-' + randomHex(6)`, insert `campaign.created` audit event, return `CampaignDetail`.
    - `updateCampaign(pool, id, creatorId, data)`: update mutable Draft fields, return `{ campaign, reason }` where reason is `'not_found' | 'forbidden' | 'not_draft' | null`.
    - `deleteCampaign(pool, id, creatorId)`: delete if owned and Draft, return same discriminated result shape.
    - `submitCampaign(pool, id, creatorId)`: verify ownership + Draft state; KYC stub (always passes, add `// DEMO STUB: KYC always verified` comment); validate all §4.2/§4.5 rules (title/summary/description/alignmentStatement non-empty, funding target in [1_000_000, 1_000_000_000], maxCap >= min, deadline 7–365 days from now, ≥1 team member, ≥2 milestones, milestone pct sum = 100, ≥1 risk disclosure); on success UPDATE status to Submitted + insert `campaign.submitted` audit event, return `{ campaign, errors }`.
    - All queries use parameterised SQL — no string interpolation for user data.
  - **Files**:
    - `packages/server/src/campaigns/queries.ts` (modify)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes
  - **Brief ref**: Section 4 — Server queries

- [ ] TASK-05: Server routes — POST, PUT, DELETE, submit + createdBy=me on GET
  - **Goal**: Wire up all four new write endpoints and update the GET handler for `createdBy=me`
  - **Details**:
    - `POST /` with `authenticate, requireRole('Creator')` → call `createCampaign`, respond 201.
    - `PUT /:id` with `authenticate, requireRole('Creator')` → call `updateCampaign`, respond 200/404/403/409 based on reason.
    - `DELETE /:id` with `authenticate, requireRole('Creator')` → call `deleteCampaign`, respond 204/404/403/409.
    - `POST /:id/submit` with `authenticate, requireRole('Creator')` → call `submitCampaign`, respond 200 or 422 with `SUBMISSION_VALIDATION_FAILED` + details array.
    - `GET /` with `createdBy=me`: manually verify JWT, extract `user.id`, pass to `listCampaigns`; 401 if header absent/invalid. Public listing (no param) unchanged.
    - Use `Object.assign(new Error(...), { status, code, details })` error pattern throughout; validate UUIDs, return `INVALID_CAMPAIGN_ID` on bad UUID parse, `INVALID_REQUEST_BODY` on Zod failure.
  - **Files**:
    - `packages/server/src/campaigns/routes.ts` (modify)
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; server starts without errors
  - **Brief ref**: Section 5 — Server routes

- [ ] TASK-06: Integration tests — full campaign write endpoint coverage
  - **Goal**: Add a `describe('Campaign Write Endpoints')` block to `packages/server/src/__tests__/campaigns.test.ts` covering 100% of new endpoint contracts
  - **Details**: Follow the existing mock-pool + supertest pattern. Cover:
    - `POST /v1/campaigns`: 201 success, 400 invalid body, 401 no token, 403 non-Creator role
    - `PUT /v1/campaigns/:id`: 200 success, 400 bad UUID, 404 not found, 403 forbidden, 409 not Draft
    - `DELETE /v1/campaigns/:id`: 204 success, 403 forbidden, 409 not Draft
    - `POST /v1/campaigns/:id/submit`: 200 success, 422 milestone % ≠ 100 (AC-CAMP-003), 422 missing required fields (AC-CAMP-001), 409 not Draft
    - `GET /v1/campaigns?createdBy=me`: 200 with filtered list, 401 no token
    Sign test JWTs with a test secret using `jsonwebtoken` (same pattern as `auth.test.ts`). Mock all query functions with `vi.fn()`.
  - **Files**:
    - `packages/server/src/__tests__/campaigns.test.ts` (modify)
  - **Verify**: `npm run test:coverage` passes with coverage ≥ 80%; all new test cases green
  - **Brief ref**: Section 6 — Integration tests

- [ ] TASK-07: Final CI verification
  - **Goal**: Confirm all lint, type-check, format, build, and test checks pass end-to-end
  - **Details**: Run the full CI check script and fix any remaining issues (formatting, lint warnings, type errors). Ensure coverage threshold is met.
  - **Files**: Any files needing minor formatting or lint fixes
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors
  - **Brief ref**: Verification — CI section
