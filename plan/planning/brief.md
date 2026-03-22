# Brief: Issue #116 — Campaign Lifecycle E2E Tests

## Goal

Add seven Playwright E2E tests that exercise the complete campaign lifecycle on the Mars Mission Fund
platform: draft creation and submission, reviewer approval, creator launch, reviewer rejection and
creator resubmission, milestone evidence submission and admin verification, campaign cancellation
(creator request → admin approval), and notification delivery to creators. All tests use the seeded
demo accounts (creator@example.com, reviewer@example.com, admin@example.com) and isolated seeded
campaigns per test to avoid ordering dependencies.

## Scope

**In scope:**
- New file `e2e/campaign-lifecycle.spec.ts` with 7 tests
- New DB migration seeding test-specific campaigns in the required lifecycle states
- Add `cancelCampaign` API function to `packages/client/src/api/campaigns.ts` (backend route
  `POST /v1/campaigns/:id/cancel` already exists; frontend wrapper is missing)
- Add a "Cancel" button to `DashboardPage.tsx` for `Live`/`Funded` campaigns (required for test 6)
- Seed one notification record directly (for deterministic test 7)

**Out of scope:**
- Unit or integration tests for campaign lifecycle (separate coverage requirements)
- New backend routes or business logic (all required API endpoints already exist)
- Changes to the review or admin UI beyond the missing cancel button

## Approach

### Missing frontend piece

`cancelCampaign(id)` is absent from `packages/client/src/api/campaigns.ts` and there is no Cancel
button on the `DashboardPage` for Live/Funded campaigns. The backend endpoint
`POST /v1/campaigns/:id/cancel` is fully implemented. Add the thin wrapper and a "Cancel" button
(with `window.confirm` guard, matching the Delete pattern) for `Live`/`Funded` rows in `DashboardPage.tsx`.

### Seeded test data

Add a single new migration `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql`
that inserts campaigns (all owned by the seeded `creator@example.com` user) in these states:

| Constant | UUID | Title | Status | Purpose |
|---|---|---|---|---|
| `LIFECYCLE_SUBMITTED_ID` | `00000000-0014-0000-0000-000000000014` | Mars Lifecycle Submitted | Submitted | Tests 2 & 7 (approve + notification) |
| `LIFECYCLE_APPROVED_ID` | `00000000-0015-0000-0000-000000000015` | Mars Lifecycle Approved | Approved | Test 3 (launch) |
| `LIFECYCLE_REJECT_ID` | `00000000-0016-0000-0000-000000000016` | Mars Lifecycle Reject Test | Submitted | Test 4 (reject + resubmit) |
| `LIFECYCLE_SETTLEMENT_ID` | `00000000-0017-0000-0000-000000000017` | Mars Lifecycle Settlement | Settlement | Test 5 (evidence + verify) |
| `LIFECYCLE_CANCEL_ID` | `00000000-0018-0000-0000-000000000018` | Mars Lifecycle Cancel | Live | Test 6 (cancel request + admin approve) |

Each campaign needs valid milestones and team members (required by the UI). The Settlement campaign
needs at least two milestones — one with evidence already submitted (`status='Submitted'`,
`evidence_description` set) for the admin verification sub-test.

The Live cancel campaign (`LIFECYCLE_CANCEL_ID`) must be seeded with at least one contribution row
(so the backend treats it as "has contributors" → creates a pending request rather than immediate
cancellation) and `cancellation_requested_at = NULL` (the creator initiates the request in the
test). The `CancellationApprovalSection` in `AdminActionsPanel` will render once the test sets the
timestamp via the API call.

For test 7 (notifications), seed a `notifications` row linked to `creator@example.com` and
`LIFECYCLE_SUBMITTED_ID` representing the "campaign.approved" event triggered when reviewer approves.
This avoids coupling test 7 to test 2's runtime.

### Test file structure

`e2e/campaign-lifecycle.spec.ts` — follow the patterns established in `creator-dashboard.spec.ts`
and `review-pipeline.spec.ts`:

```
test 1 — creator submits a draft
  Login as creator → /dashboard → create campaign via 7-step form → Submit button →
  dashboard shows "Submitted" badge

test 2 — reviewer approves with notes
  Login as reviewer → /review → find LIFECYCLE_SUBMITTED_ID campaign → Claim →
  redirected to /review/:id → fill approval notes → Approve →
  campaign detail shows "Approved" badge

test 3 — creator launches approved campaign
  Login as creator → /dashboard → find LIFECYCLE_APPROVED_ID in "In Review / Approved" group →
  click Launch → badge changes to "Live" →
  navigate to /campaigns → confirm campaign appears in public list

test 4 — reviewer rejects; creator resubmits
  Login as reviewer → /review → find LIFECYCLE_REJECT_ID → Claim → fill rejection
  rationale/guidance → Reject →
  logout → login as creator → /dashboard → find campaign in "Rejected" group →
  click Revise → redirected to edit page → verify status is Draft

test 5 — milestone evidence submission and admin verification
  Login as creator → navigate to /campaigns/LIFECYCLE_SETTLEMENT_ID →
  fill evidence description → Submit Evidence →
  logout → login as admin → same campaign detail →
  AdminActionsPanel visible → click Verify on submitted milestone →
  milestone no longer shown in verification section

test 6 — cancellation flow (creator request + admin approve)
  Login as creator → /dashboard → find LIFECYCLE_CANCEL_ID in "Active" group →
  click Cancel → confirm dialog → campaign has seeded contributions so request is lodged
  (cancellation_requested_at set, campaign remains Live) →
  logout → login as admin → navigate to /campaigns/LIFECYCLE_CANCEL_ID →
  AdminActionsPanel shows "Pending Cancellation Request" → click Approve Cancellation →
  campaign status badge changes to "Cancelled"

test 7 — notification delivery
  Login as creator → navigate to /notifications →
  find notification with type "Campaign Approved" linked to LIFECYCLE_SUBMITTED_ID →
  click "Mark read" → notification marked read
```

### Key navigation details

- Launch button: `DashboardPage` row actions, `aria-label="Launch {title}"`
- Revise button: `DashboardPage` row actions, `aria-label="Revise {title}"`
- Cancel button (to add): `DashboardPage` row actions, `aria-label="Cancel {title}"`
- Admin actions panel: `aria-label="Admin actions"` on `CampaignDetailPage`
- Evidence submission panel: `aria-label="Submit milestone evidence"` on `CampaignDetailPage`
- Notifications page: `/notifications`

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `e2e/campaign-lifecycle.spec.ts` | create | 7 lifecycle E2E tests |
| `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` | create | Seeded campaigns in Submitted (×2)/Approved/Settlement/Live states, one contribution row, one notification row |
| `packages/client/src/api/campaigns.ts` | modify | Add `cancelCampaign(id)` calling `POST /v1/campaigns/:id/cancel` |
| `packages/client/src/pages/DashboardPage.tsx` | modify | Import `cancelCampaign`; add Cancel button with confirm guard for `Live`/`Funded` rows |

## Dependencies

- All required backend routes already exist (`/cancel`, `/launch`, `/approve`, `/reject`,
  `/milestones/:id/verify`, `/approve-cancel`)
- Playwright + Chromium already configured (`playwright.config.ts`)
- Seeded demo accounts already exist (migration `20260311000002_seed_accounts.sql`)
- `AdminActionsPanel` already handles milestone verification and cancellation approval
- `SubmitEvidencePanel` already handles creator evidence submission

## Verification

**Build:**
```bash
npm run build -w @mmf/shared
npx tsc -b --noEmit
npm run build
```

**Manual browser checks at `http://localhost:5173`:**
- Login as `creator@example.com` → `/dashboard` → "In Review / Approved" section shows
  `Mars Lifecycle Approved` campaign with a "Launch" button; "Active" section shows cancel button
  on Live campaigns
- Login as `admin@example.com` → navigate to `/campaigns/00000000-0018-...` → Admin Actions panel
  shows "Pending Cancellation Request" with Approve button
- Navigate to `/campaigns/00000000-0017-...` → evidence submitted milestone visible in
  "Milestone Verification" section
- Login as `creator@example.com` → `/notifications` → at least one notification present

**Unit tests:**
```bash
npm run test:coverage
```

**E2E:**
```bash
./scripts/e2e-check.sh
# or in Docker:
./scripts/e2e-check-docker.sh
```

**E2E user flows to verify:**
1. `/dashboard` → create campaign via 7-step form → Submit → dashboard shows Submitted badge
2. `/review` as reviewer → claim `Mars Lifecycle Submitted` → approve with notes → Approved badge
3. `/dashboard` as creator → Launch `Mars Lifecycle Approved` → Live badge → `/campaigns` shows it
4. `/review` as reviewer → claim `Mars Lifecycle Reject Test` → reject → creator sees Revise button
5. `/campaigns/00000000-0017-...` as creator → submit evidence → as admin → verify milestone
6. `/dashboard` as creator → Cancel live campaign → confirmation → as admin → Approve Cancellation
7. `/notifications` as creator → notification for approved campaign visible
