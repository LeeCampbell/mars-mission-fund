# Tasks: Issue #116 — Campaign Lifecycle E2E Tests

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Add reviewer seed migration
  - **Goal**: Create a DB seed migration that inserts the `reviewer@example.com` demo account
  - **Details**: Create `packages/server/db/migrations/20260311000003_seed_reviewer.sql` with an INSERT for UUID `44444444-4444-4444-4444-444444444444`, email `reviewer@example.com`, bcrypt hash of `reviewer-demo-pass`, and role `Reviewer`. Follow the pattern of existing seed migrations in the same directory.
  - **Files**: `packages/server/db/migrations/20260311000003_seed_reviewer.sql`
  - **Verify**: File exists with correct SQL; `npm run build` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: "Reviewer seed account" section

- [ ] TASK-02: Add Demo Reviewer card to LoginPage
  - **Goal**: Add a fourth demo card for the Reviewer role so the E2E login helper can pre-fill reviewer credentials
  - **Details**: In `packages/client/src/pages/LoginPage.tsx`, add a `DemoCard` entry for `Demo Reviewer` (email: `reviewer@example.com`, password: `reviewer-demo-pass`) to the `DEMO_USERS` array, positioned between Creator and Admin. The 2×2 grid layout already fits 4 cards — no CSS change needed.
  - **Files**: `packages/client/src/pages/LoginPage.tsx`
  - **Verify**: `npm run build` passes; `npx tsc -b --noEmit` passes; login page visually shows a Reviewer card
  - **Brief ref**: "LoginPage demo card" section

- [ ] TASK-03: Write E2E tests for campaign lifecycle
  - **Goal**: Create `e2e/campaign-lifecycle.spec.ts` with all 7 lifecycle scenarios described in the brief
  - **Details**: Create the file in `e2e/`. Reuse the `login` helper pattern from `e2e/auth.spec.ts`. Each test must be independent: log in fresh, create a new draft via UI, and drive the full scenario. Tests must not rely on execution order or shared state. Cover all 7 scenarios:
    1. Creator creates draft, fills required fields, submits for review
    2. Reviewer views queue, claims campaign, approves with notes
    3. Creator launches approved campaign — campaign appears on public `/campaigns`
    4. Reviewer rejects campaign — creator sees rejection and can resubmit to Draft
    5. Creator submits milestone evidence — Admin verifies — funds released indicator visible
    6. Creator requests cancellation of live campaign — Admin approves — campaign Cancelled
    7. Creator receives visible notification for review actions (approve / reject)
    Use `test.skip` or `test.fixme` with a comment referencing the blocking dependency issues (#6 and #7) for tests that depend on routes/pages not yet implemented, so the file is valid and runnable without failing on missing infrastructure.
  - **Files**: `e2e/campaign-lifecycle.spec.ts`
  - **Verify**: `npx tsc --noEmit -p e2e/tsconfig.json` (or equivalent) passes; `npm run test:e2e` runs without syntax errors; existing E2E tests continue to pass
  - **Brief ref**: "Test structure" section and all 7 lifecycle flows in Verification
