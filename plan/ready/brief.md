# Brief: Issue #116 — Campaign Lifecycle E2E Tests

## Goal

Write comprehensive Playwright E2E tests for the full campaign lifecycle on Mars Mission Fund,
covering: creator draft submission, reviewer approval and rejection, creator launch, milestone
evidence and admin verification, campaign cancellation, and notification delivery.
All tests run against seeded demo accounts and must pass in CI without manual intervention.

## Scope

**In scope:**

- `e2e/campaign-lifecycle.spec.ts` — new test file covering all 7 lifecycle scenarios in the
  issue deliverables
- A new DB seed migration adding `reviewer@example.com` (role `Reviewer`) — required because this
  account is referenced in every test but does not exist in current seeds
- Adding the reviewer demo card to `LoginPage.tsx` so the login helper can pre-fill credentials
  during tests (mirrors the existing pattern for Backer/Creator/Admin cards)
- Reusing the `login` helper pattern from `e2e/auth.spec.ts`

**Out of scope:**

- Campaign creation/submission API routes (covered by dependency issue #6 — Creator UI)
- Reviewer review-queue and approval/rejection API routes (covered by dependency issue #7 —
  Reviewer/Admin UI)
- Admin milestone verification API routes (covered by dependency issue #7)
- Frontend pages for creator campaign management, reviewer queue, and admin verification
  (covered by dependencies #6 and #7)
- Notification infrastructure (stub or real email/in-app — assumed delivered by #6/#7 or
  earlier infra work; tests verify UI-visible notification indicators only)
- Payment/escrow mechanics (theatre for the demo per L4-004)
- Appeal process (theatre per the campaign spec)

## Approach

The tests are pure UI-driving Playwright tests; no direct DB access or API mocking.
Each scenario logs in as the relevant demo user, navigates to the relevant page, and asserts
visible state changes.

**Assumed routes delivered by dependency issues #6 and #7:**

| Route | Who uses it |
| --- | --- |
| `GET /creator/campaigns` | Creator dashboard — lists their drafts |
| `GET /creator/campaigns/new` | Creator — create draft form |
| `GET /creator/campaigns/:id/edit` | Creator — edit draft |
| `GET /review-queue` | Reviewer — list submitted campaigns |
| `GET /review/:campaignId` | Reviewer — review detail + approve/reject actions |
| `GET /admin/campaigns/:id` | Admin — milestone verification |

**Assumed server endpoints (provided by #6 and #7):**

- `POST /v1/campaigns` — create draft (creator)
- `PATCH /v1/campaigns/:id` — update draft fields (creator)
- `POST /v1/campaigns/:id/submit` — submit for review (creator)
- `POST /v1/campaigns/:id/claim` — claim from review queue (reviewer)
- `POST /v1/campaigns/:id/approve` — approve with notes (reviewer)
- `POST /v1/campaigns/:id/reject` — reject with rationale (reviewer)
- `POST /v1/campaigns/:id/launch` — launch approved campaign (creator)
- `POST /v1/campaigns/:id/milestones/:milestoneId/evidence` — submit evidence (creator)
- `POST /v1/campaigns/:id/milestones/:milestoneId/verify` — verify milestone (admin)
- `POST /v1/campaigns/:id/cancel` — request cancellation (creator), approve cancellation (admin)

**campaigns table prerequisite** — the dependency issues must add a `creator_id UUID REFERENCES
accounts(id)` column (currently absent) so campaigns are associated with a creator and the
creator dashboard can list them.

**Test structure in `e2e/campaign-lifecycle.spec.ts`:**

```
describe('Campaign lifecycle')
  test: Creator creates draft, fills required fields, submits for review
  test: Reviewer views queue, claims campaign, approves with notes
  test: Creator launches approved campaign — campaign appears on public /campaigns
  test: Reviewer rejects campaign — creator sees rejection and can resubmit to Draft
  test: Creator submits milestone evidence — Admin verifies — funds released indicator visible
  test: Creator requests cancellation of live campaign — Admin approves — campaign Cancelled
  test: Creator receives visible notification for review actions (approve / reject)
```

Each test is independent: it logs in fresh, creates a new draft via UI, and drives the full
scenario to completion.
Shared state is avoided; tests must not rely on execution order.

**Reviewer seed account** — a new migration `20260311000003_seed_reviewer.sql` adds:

- email: `reviewer@example.com`
- password: `reviewer-demo-pass` (bcrypt hash)
- role: `Reviewer`
- UUID: `44444444-4444-4444-4444-444444444444`

**LoginPage demo card** — add a fourth `DemoCard` entry for `Demo Reviewer` matching the new
seed, between Creator and Admin in the `DEMO_USERS` array.
Update the `demoGridStyle` `gridTemplateColumns` from `repeat(2, 1fr)` to `repeat(2, 1fr)` — 4
cards still fit a 2×2 grid; no layout change needed.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `e2e/campaign-lifecycle.spec.ts` | create | All 7 lifecycle E2E scenarios |
| `packages/server/db/migrations/20260311000003_seed_reviewer.sql` | create | Seed `reviewer@example.com` (role `Reviewer`) |
| `packages/client/src/pages/LoginPage.tsx` | modify | Add Demo Reviewer card to `DEMO_USERS` |

## Dependencies

**Blocking prerequisites (must be merged before this issue can be implemented):**

- **Issue #6 — Creator UI**: frontend pages (`/creator/campaigns`, `/creator/campaigns/new`,
  `/creator/campaigns/:id/edit`) and backend routes (`POST /v1/campaigns`, `PATCH /v1/campaigns/:id`,
  `POST /v1/campaigns/:id/submit`, `POST /v1/campaigns/:id/launch`).
  Also requires `creator_id` FK on the `campaigns` table.
- **Issue #7 — Reviewer/Admin UI**: frontend pages (`/review-queue`, `/review/:id`,
  `/admin/campaigns/:id`) and backend routes (claim, approve, reject, milestone evidence/verify,
  cancel/approve-cancel).

**Current codebase gaps (confirmed by code review):**

- `reviewer@example.com` does not exist in any seed migration.
- `campaigns` table has no `creator_id` column.
- Server has only `GET /v1/campaigns` and `GET /v1/campaigns/:id`; no write routes.
- No creator, reviewer, or admin campaign management pages exist in the frontend.

No new npm packages are required.
Playwright and `@playwright/test` are already installed.

## Verification

- **Build**: `npm run build` succeeds after adding the reviewer seed migration and LoginPage change
- **Type-check**: `npx tsc -b --noEmit` passes
- **Unit tests**: `npm run test:coverage` continues to pass (no unit tests changed)
- **E2E**: `npm run test:e2e` — all tests in `e2e/campaign-lifecycle.spec.ts` pass with a running
  backend and seeded DB
- **Visual** (manual check): log in as `reviewer@example.com` at `http://localhost:5173/login` —
  the Demo Reviewer card should appear and pre-fill credentials
- **Lifecycle flows to verify end-to-end:**
  1. `/creator/campaigns/new` → fill form → submit → status shows `Submitted`
  2. `/review-queue` as reviewer → claim → approve → creator dashboard shows `Approved`
  3. Creator launches → `/campaigns` list shows new campaign
  4. Reviewer rejects → `/creator/campaigns` shows `Rejected` with rationale
  5. Creator clicks "Revise" → status returns to `Draft`
  6. Creator submits milestone evidence → `/admin/campaigns/:id` shows pending evidence
  7. Admin verifies → campaign milestone shows `Verified`
  8. Creator requests cancellation → admin approves → campaign shows `Cancelled`
