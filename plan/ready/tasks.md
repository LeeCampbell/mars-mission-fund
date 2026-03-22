# Tasks: Issue #116 — Campaign Lifecycle E2E Tests

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add DB migration seeding lifecycle test campaigns
  - **Goal**: Insert the five campaigns (plus required milestones, team members, one contribution row, and one notification row) into the database so subsequent tasks and tests have deterministic data.
  - **Details**:
    - Create `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql`
    - Insert five campaigns owned by the seeded `creator@example.com` user (look up the user UUID from `20260311000002_seed_accounts.sql`):
      - `00000000-0014-0000-0000-000000000014` — "Mars Lifecycle Submitted" — status `Submitted`
      - `00000000-0015-0000-0000-000000000015` — "Mars Lifecycle Approved" — status `Approved`
      - `00000000-0016-0000-0000-000000000016` — "Mars Lifecycle Reject Test" — status `Submitted`
      - `00000000-0017-0000-0000-000000000017` — "Mars Lifecycle Settlement" — status `Settlement`
      - `00000000-0018-0000-0000-000000000018` — "Mars Lifecycle Cancel" — status `Live`
    - Each campaign must have at least one valid milestone row and one team member row (required by the UI); check `schema.sql` for required columns and constraints.
    - Settlement campaign (`0017`): add two milestones — one `Pending` and one `Submitted` (with `evidence_description` set) so the Admin milestone verification section renders.
    - Cancel campaign (`0018`): add one `contributions` row with a non-zero amount and `cancellation_requested_at = NULL` so the backend raises a pending-request rather than immediate cancellation.
    - Seed one `notifications` row for `creator@example.com` with `campaign_id = 0014`, `type = 'campaign.approved'`, `read = false` for test 7.
    - Use `INSERT ... ON CONFLICT DO NOTHING` so re-running migrations is idempotent.
  - **Files**:
    - `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql`
  - **Verify**: Run `./scripts/run-local.sh` (or manually apply migrations with dbmate) and confirm the five campaigns appear in the DB; no migration errors.
  - **Brief ref**: "Seeded test data" section

- [x] TASK-02: Add `cancelCampaign` API wrapper and Cancel button on DashboardPage
  - **Goal**: Expose the existing `POST /v1/campaigns/:id/cancel` backend route to the frontend so test 6 can trigger a cancellation via the UI.
  - **Details**:
    - In `packages/client/src/api/campaigns.ts`, add `export async function cancelCampaign(id: string)` that calls `POST /v1/campaigns/${id}/cancel` — follow the exact pattern of `launchCampaign` (or the nearest equivalent POST-with-no-body helper already in that file).
    - In `packages/client/src/pages/DashboardPage.tsx`:
      - Import `cancelCampaign`.
      - In the "Active" table row actions section, add a Cancel button for campaigns with `status === 'Live' || status === 'Funded'`:
        - `aria-label="Cancel {title}"` (match the brief's navigation detail).
        - Guard with `window.confirm('Are you sure you want to request cancellation?')` (match the Delete pattern).
        - On confirmation, call `cancelCampaign(campaign.id)` then refresh/reload the dashboard.
        - Style consistently with existing action buttons (e.g. same size/variant used for Delete).
    - Do **not** remove or alter the Delete button logic — only add alongside it.
  - **Files**:
    - `packages/client/src/api/campaigns.ts`
    - `packages/client/src/pages/DashboardPage.tsx`
  - **Verify**: `npm run build` passes with no TypeScript errors; open `/dashboard` as `creator@example.com` — the "Mars Lifecycle Cancel" row in the Active section shows a Cancel button.
  - **Brief ref**: "Missing frontend piece" section

- [ ] TASK-03: Write the seven campaign lifecycle E2E tests
  - **Goal**: Create `e2e/campaign-lifecycle.spec.ts` with all seven tests exercising the full campaign lifecycle using seeded data from TASK-01 and the Cancel button from TASK-02.
  - **Details**:
    - Follow the patterns in `e2e/creator-dashboard.spec.ts` and `e2e/review-pipeline.spec.ts` for login helpers, `baseURL`, `page.goto`, and assertion style.
    - Use `test.describe('Campaign Lifecycle', ...)` with `test.use({ storageState: undefined })` or per-test login (no shared auth state between tests).
    - Define constants at the top of the file for the five campaign UUIDs.
    - **Test 1 — creator submits a draft**: Login as `creator@example.com` → `/dashboard` → create a new campaign via the 7-step form (fill minimum required fields) → click Submit → assert the dashboard shows a "Submitted" badge for the new campaign.
    - **Test 2 — reviewer approves with notes**: Login as `reviewer@example.com` → `/review` → find "Mars Lifecycle Submitted" (`LIFECYCLE_SUBMITTED_ID`) → Claim → redirected to `/review/:id` → fill approval notes → Approve → assert the campaign detail shows an "Approved" badge.
    - **Test 3 — creator launches approved campaign**: Login as `creator@example.com` → `/dashboard` → find "Mars Lifecycle Approved" in the "In Review / Approved" group → click `aria-label="Launch Mars Lifecycle Approved"` → assert badge changes to "Live" → navigate to `/campaigns` → assert the campaign appears in the public list.
    - **Test 4 — reviewer rejects; creator sees Revise**: Login as `reviewer@example.com` → `/review` → find "Mars Lifecycle Reject Test" (`LIFECYCLE_REJECT_ID`) → Claim → fill rejection rationale/guidance → Reject → logout → login as `creator@example.com` → `/dashboard` → find the campaign in the "Rejected" group → assert `aria-label="Revise Mars Lifecycle Reject Test"` button is visible.
    - **Test 5 — milestone evidence and admin verification**: Login as `creator@example.com` → `/campaigns/LIFECYCLE_SETTLEMENT_ID` → find the evidence submission panel (`aria-label="Submit milestone evidence"`) → fill evidence description → Submit Evidence → logout → login as `admin@example.com` → same campaign URL → assert `aria-label="Admin actions"` panel is visible → click Verify on the submitted milestone → assert that milestone is no longer shown in the verification queue.
    - **Test 6 — cancellation flow**: Login as `creator@example.com` → `/dashboard` → find "Mars Lifecycle Cancel" in "Active" group → click `aria-label="Cancel Mars Lifecycle Cancel"` → accept confirm dialog → assert campaign remains visible (request lodged, not immediately cancelled) → logout → login as `admin@example.com` → `/campaigns/LIFECYCLE_CANCEL_ID` → assert admin panel shows "Pending Cancellation Request" → click Approve Cancellation → assert campaign status badge changes to "Cancelled".
    - **Test 7 — notification delivery**: Login as `creator@example.com` → `/notifications` → find notification with type "Campaign Approved" (or matching text) linked to `LIFECYCLE_SUBMITTED_ID` → click "Mark read" → assert notification is marked read (e.g. visual change or disappears from unread list).
    - For each test, use `expect(...).toBeVisible()` / `expect(...).toHaveText(...)` assertions — avoid relying on implicit network timing; wait for navigation/badge to settle.
  - **Files**:
    - `e2e/campaign-lifecycle.spec.ts`
  - **Verify**: `./scripts/run-e2e.sh e2e/campaign-lifecycle.spec.ts` — all 7 tests pass.
  - **Brief ref**: "Test file structure" and "Key navigation details" sections

- [ ] TASK-04: Full E2E regression and CI verification
  - **Goal**: Run the complete test suite and CI checks to confirm nothing is broken by the new migration and frontend changes.
  - **Details**: No new code — only run the full verification pipeline.
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes (lint, type-check, unit tests, build) AND `./scripts/run-e2e.sh` (full suite, all spec files) passes.
  - **Brief ref**: "Verification" section
