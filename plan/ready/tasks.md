# Tasks: Issue #193 — Fix: campaign deadline shown as raw ISO string on Step 7 review screen

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Add `formatReviewDate` helper and apply it to the Deadline ReviewRow
  - **Goal**: Format the deadline ISO string as `Dec 27, 2026` on the Step 7 review screen instead of the raw `2026-12-27` string
  - **Details**:
    1. Open `packages/client/src/pages/CampaignFormPage.tsx` and locate the `StepReview` component (around line 1425)
    2. Add a `formatReviewDate` helper near `StepReview` that:
       - Returns `'—'` for a falsy value
       - Parses the `YYYY-MM-DD` string via `new Date(year, month - 1, day)` (split on `'-'`) to avoid UTC-to-local timezone shift
       - Formats with `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`
    3. Replace `<ReviewRow label="Deadline" value={state.deadline || '—'} />` with `<ReviewRow label="Deadline" value={formatReviewDate(state.deadline)} />`
    4. Update `packages/client/src/pages/CampaignFormPage.test.tsx` — confirm existing tests cover the review step, or add a unit test that renders the Step 7 review with a known deadline string and asserts the formatted output (`Dec 27, 2026`)
    5. Write/extend the E2E spec: in `e2e/campaigns.spec.ts` (or a dedicated `e2e/campaign-review-deadline.spec.ts`), navigate the campaign creation wizard through to Step 7 and assert that the deadline field shows the human-readable date (e.g. `Dec 27, 2026`), not the raw ISO string
  - **Files**:
    - `packages/client/src/pages/CampaignFormPage.tsx`
    - `packages/client/src/pages/CampaignFormPage.test.tsx`
    - `e2e/campaigns.spec.ts` (or new `e2e/campaign-review-deadline.spec.ts`)
  - **Verify**: `npm run build` succeeds with no TypeScript errors; `npm run test:coverage` passes; `./scripts/run-e2e.sh e2e/campaigns.spec.ts` (or the new spec file) passes and the deadline renders as `Dec 27, 2026` on Step 7
  - **Brief ref**: Approach section, Files to Create/Modify section

- [ ] TASK-02: Full E2E regression and CI verification
  - **Goal**: Run the complete E2E suite and CI checks to verify nothing is broken
  - **Details**: No new code — just run the full test suite as a final gate
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh` (all tests) passes
  - **Brief ref**: Verification section
