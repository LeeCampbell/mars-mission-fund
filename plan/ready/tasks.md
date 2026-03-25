# Tasks: Issue #116 — Campaign lifecycle E2E tests

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Baseline E2E run and failure audit
  - **Goal**: Establish which of the 7 lifecycle tests fail and map each failure to its known risk
  - **Details**: Run `./scripts/e2e-check-docker.sh` and capture output. Read `e2e/campaign-lifecycle.spec.ts` in full. Cross-reference every failure against the 6 known risks in the brief: (1) missing risk disclosures, (2) single-milestone 50% campaigns, (3) React Query cache invalidation, (4) `window.confirm` dialog handling, (5) AdminActionsPanel `Submitted` guard, (6) notification `read = false`. Produce a concise list of failures → root causes before touching any production code.
  - **Files**: (read-only audit — no code changes)
  - **Verify**: Have a documented list of failing test names and their root causes mapped to risk numbers
  - **Brief ref**: Implementation steps §1; Known risks §1–6

- [ ] TASK-02: Fix seed data migration issues
  - **Goal**: Ensure the five seeded campaigns have valid data for all frontend guards and backend checks
  - **Details**: Read `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` in full. Check whether: (a) any campaign has `risk_disclosures = '{}'` and the frontend or backend rejects that, (b) single-milestone campaigns 0014–0016 at 50% cause render errors, (c) the notification row for campaign 0014 has `read = false`. If fixes are needed, create a **new** migration (e.g. `20260325000001_fix_lifecycle_seed_data.sql`) — never edit the existing one. The new migration must be additive-only (`UPDATE` statements or `INSERT … ON CONFLICT DO UPDATE`). After writing the migration, verify it applies cleanly with `dbmate up` inside docker.
  - **Files**: `packages/server/db/migrations/20260325000001_fix_lifecycle_seed_data.sql` (create only if fixes are needed)
  - **Verify**: Migration applies without error; `SELECT risk_disclosures, status FROM campaigns WHERE id IN ('0014','0015','0016','0017','0018')` and the notification row look correct
  - **Brief ref**: Known risks §1, §2, §6

- [ ] TASK-03: Fix DashboardPage query invalidation after launch and cancel
  - **Goal**: Ensure the dashboard table reflects `Live` / `Pending Cancellation` status immediately after mutation success, without a page reload
  - **Details**: Read `packages/client/src/pages/DashboardPage.tsx` lines 202–295. Locate the `useMutation` hooks for launch and cancel. Verify that each `onSuccess` callback calls `queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] })` (or the exact key used by the campaign list query in the same file). If the key is wrong or the call is missing, add/fix it. Do not refactor beyond the minimal change needed.
  - **Files**: `packages/client/src/pages/DashboardPage.tsx`
  - **Verify**: `npm run build` passes with no TypeScript errors; the mutation `onSuccess` handlers visibly call `invalidateQueries` with the correct key
  - **Brief ref**: Known risks §3; Implementation steps §3

- [ ] TASK-04: Fix AdminActionsPanel Verify button for Submitted milestones
  - **Goal**: Ensure the `Verify` button renders for milestones whose status is `Submitted` and that `nth(1)` in the test correctly targets Phase 2 of campaign 0017
  - **Details**: Read `packages/client/src/components/campaigns/AdminActionsPanel.tsx` in full. Confirm that the milestone list renders a `Verify` button when `milestone.status === 'Submitted'`. Check the ordering of milestone rows matches what the test expects (Phase 1 first, Phase 2 second). If Phase 1 has just had evidence submitted, its status may now be `Submitted` too — verify the test's `nth(1)` still selects the correct button. Fix any status-guard or ordering bug.
  - **Files**: `packages/client/src/components/campaigns/AdminActionsPanel.tsx`
  - **Verify**: `npm run build` passes; component renders `Verify` button only for `Submitted` milestones; milestone row order is stable
  - **Brief ref**: Known risks §5; Implementation steps §3

- [ ] TASK-05: Fix CampaignDetailPage SubmitEvidencePanel selectors and dialog handling
  - **Goal**: Ensure E2E test selectors for `SubmitEvidencePanel` match the rendered DOM, and that `window.confirm` dialogs are interceptable by Playwright
  - **Details**: Read `packages/client/src/pages/CampaignDetailPage.tsx` around the `SubmitEvidencePanel` inline component (brief says line 361). Compare `aria-label` attributes, form field names, and button text against the selectors used in `e2e/campaign-lifecycle.spec.ts` (tests 5 and 6). If any selector is mismatched, fix the component (preferred) or the test. For the `window.confirm` used in the cancel flow (DashboardPage line 230): confirm the test installs `page.on('dialog', …)` **before** clicking Cancel — if the handler is registered after the click, move it before in the test file.
  - **Files**: `packages/client/src/pages/CampaignDetailPage.tsx`, `e2e/campaign-lifecycle.spec.ts` (only if selector fixes are needed in the test)
  - **Verify**: `npm run build` passes; `aria-label` values and button text in the component match what the test queries; dialog handler is registered before the Cancel click
  - **Brief ref**: Known risks §4, §5; Implementation steps §3

- [ ] TASK-06: Visual verification screenshots
  - **Goal**: Capture screenshots of every changed UI state to confirm visual correctness
  - **Details**: Start the dev server and backend if needed. Use Playwright MCP to navigate to each affected page and state: (a) Dashboard with Approved campaign showing Launch button, (b) Dashboard after launching — status badge shows `Live`, (c) Campaign detail for Settlement campaign showing `SubmitEvidencePanel` for a Pending milestone, (d) Admin actions panel showing `Verify` button for a Submitted milestone, (e) Dashboard showing Cancel button for a Live campaign, (f) Notifications page with unread notification. Save screenshots to `/screenshots/ISSUE-116-TASK-06-{a-f}.png`.
  - **Files**: (none — screenshots only)
  - **Verify**: At least one `.png` exists in `/screenshots/` matching `ISSUE-116-*`
  - **Brief ref**: Verification section (Visual manual checks)

- [ ] TASK-07: Full E2E regression and CI verification
  - **Goal**: Run the complete E2E suite and all CI checks to confirm all 7 lifecycle tests and the full suite pass
  - **Details**: No new code changes. Run `./scripts/e2e-check-docker.sh` (includes build, type-check, lint, format, unit tests, and full Playwright suite). All 7 tests in `campaign-lifecycle.spec.ts` must be green. If any test is still red, fix the root cause and re-run before marking this task complete.
  - **Files**: (none)
  - **Verify**: `./scripts/e2e-check-docker.sh` exits 0 with all 7 lifecycle tests green and no other regressions
  - **Brief ref**: Verification section; Implementation steps §4
