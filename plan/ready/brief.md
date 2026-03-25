# Brief: Issue #116 — Campaign lifecycle E2E tests

## Goal

Add Playwright E2E tests that exercise the full campaign lifecycle on the demo stack: a creator
drafts and submits a campaign; a reviewer claims, approves, or rejects it; the creator launches
an approved campaign; milestone evidence is submitted and verified; a campaign is cancelled; and
the creator can interact with review-action notifications. All tests must use the pre-seeded demo
accounts and campaign records so they are fully deterministic.

## Scope

**In scope**

- `e2e/campaign-lifecycle.spec.ts` — seven E2E tests covering every deliverable in the issue
- `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` — seed migration
  that creates the five deterministic test campaigns (IDs `0014`–`0018`) with milestones, team
  members, and a notification used by the tests
- Rebasing the feature branch onto the current `main` so CI does not diverge
- All CI checks passing (`./scripts/ci-check.sh`) and E2E tests passing
  (`./scripts/e2e-check-docker.sh`)

**Out of scope**

- Any new backend endpoints or frontend pages (all required API routes and UI already exist)
- Changes to existing E2E test files
- Unit or integration tests (Vitest) for lifecycle flows already covered by existing test suites

## Approach

**Current state**: Both deliverables are already committed on the branch.

`e2e/campaign-lifecycle.spec.ts` (265 lines) contains all seven tests inside a single
`test.describe('Campaign lifecycle')` block:

| Test | Covers |
|------|--------|
| `creator submits a draft campaign` | 7-step form → draft save → submit for review → redirected to dashboard |
| `reviewer approves a submitted campaign with notes` | Queue → claim → navigate to detail → ReviewActionsPanel → Approve |
| `creator launches an approved campaign` | Dashboard Launch button → status Live → campaign visible on /campaigns |
| `reviewer rejects a campaign; creator sees Resubmit` | Reject with rationale → creator login → Resubmit button visible |
| `creator submits milestone evidence; admin verifies milestone` | SubmitEvidencePanel → submit → admin AdminActionsPanel → Verify nth(1) |
| `creator requests cancellation; admin approves it` | Dashboard Cancel button → dialog → admin Approve Cancellation |
| `creator can mark a notification as read` | /notifications page → mark-read button count decrements |

The seed migration (`20260322000001`) inserts five campaigns:

| ID | Title | Initial status | Purpose |
|----|-------|---------------|---------|
| `0014` | Mars Lifecycle Submitted | Submitted | Approval flow |
| `0015` | Mars Lifecycle Approved | Approved | Creator launch flow |
| `0016` | Mars Lifecycle Reject Test | Submitted | Rejection/resubmit flow |
| `0017` | Mars Lifecycle Settlement | Settlement | Milestone evidence flow (2 milestones: Pending + Submitted) |
| `0018` | Mars Lifecycle Cancel | Live, 3 contributors | Cancellation request flow |

Each campaign has one team member and the required milestones. A `campaign.approved`
notification for `creator@example.com` supports the notifications test.

**Key implementation notes**

- `DatePickerInput` (introduced in #198) renders a native `<input id="deadline">` underneath, so
  `page.locator('#deadline').fill(...)` works correctly — confirmed by `campaign-date-picker.spec.ts`
  which uses the same pattern.
- The `logout` helper navigates to `/about` before clicking "Log out" to avoid ProtectedRoute
  injecting `from` state that would redirect the subsequent login away from `/`.
- The cancellation test uses `page.on('dialog', (dialog) => dialog.accept())` for the browser
  confirm dialog before clicking the Cancel button.

**What remains**: The feature branch is 20+ commits behind `main` (includes #196–#202). The
implementation must be rebased onto `main` and CI + E2E verified.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `e2e/campaign-lifecycle.spec.ts` | **already created** | Seven lifecycle E2E tests (265 lines) |
| `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` | **already created** | Seed migration for five test campaigns |
| *(rebase only)* | modify | Rebase feature branch onto `main`; resolve any conflicts |

No new files need to be created; no existing source files need to be changed.

## Dependencies

- All required npm packages are already installed (`@playwright/test` is in `devDependencies`)
- No new npm packages required
- Dependent issues #6 (Creator UI) and #7 (Reviewer/Admin UI) are fully merged into `main`
- PostgreSQL seed data from all earlier migrations must be present (existing CI stack provides this)

## Verification

- **Build**: `npm run build` succeeds
- **CI checks**: `./scripts/ci-check.sh` passes (type-check, lint, format, unit tests)
- **E2E** (requires full stack — use Docker):
  ```
  ./scripts/e2e-check-docker.sh
  ```
  All seven tests in `e2e/campaign-lifecycle.spec.ts` must pass:
  - Navigate to `/campaigns/new`, complete all 7 form steps, save draft → submit → redirected to dashboard
  - Reviewer at `/review` sees "Mars Lifecycle Submitted", claims it, approves with notes
  - Creator at `/dashboard` sees "Mars Lifecycle Approved" with Launch button; after launch, status is Live and campaign appears on `/campaigns`
  - Reviewer rejects "Mars Lifecycle Reject Test"; creator logs in and sees Resubmit button
  - Creator submits milestone evidence for "Mars Lifecycle Settlement"; admin verifies Phase 2 milestone
  - Creator cancels "Mars Lifecycle Cancel" via dashboard; admin approves cancellation
  - Creator at `/notifications` sees "Campaign Approved" notification and can mark it as read
