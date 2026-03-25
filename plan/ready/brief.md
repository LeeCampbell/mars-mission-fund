# Brief: Issue #116 — Campaign lifecycle E2E tests

## Goal

Add Playwright E2E tests covering the full campaign lifecycle on the demo platform: a creator
submits a draft campaign through the 7-step form; a reviewer claims and approves (or rejects)
it; the creator launches an approved campaign; milestone evidence is submitted and admin-verified;
a creator requests cancellation and an admin approves it; and a creator marks a notification as
read. All tests use the seeded demo accounts and rely on seed data inserted by a dedicated
migration.

## Scope

**In scope**

- `e2e/campaign-lifecycle.spec.ts` — 7 test cases covering the full lifecycle
- `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` — five
  seeded campaigns with milestones, team members, and a notification
- Backend routes already implemented: `POST /:id/submit-review`, `/launch`, `/resubmit`,
  `/cancel`, `/approve-cancel`, `/:id/milestones/:mid/submit-evidence`,
  `/:id/milestones/:mid/verify`
- Frontend components already implemented: `SubmitEvidencePanel` (inline in
  `CampaignDetailPage`), `AdminActionsPanel`, `ReviewActionsPanel`, `DashboardPage` launch/cancel
  buttons
- Passing all CI checks (`npm run build`, type-check, lint, format, unit tests with 80%
  coverage, E2E suite)

**Out of scope**

- Milestone return/feedback flow (not required by issue)
- Appeal process, deadline extensions (theatre per L4-002)
- KYC / payment integration
- New UI pages beyond what the tests reference

## Approach

The E2E test file and seed migration are **already written**. The backend routes and frontend
components are also in place. The principal work is ensuring the full test suite passes in CI.

### Current state

| Artifact | File | Status |
|---|---|---|
| E2E test suite | `e2e/campaign-lifecycle.spec.ts` | Exists (264 lines, 7 tests) |
| Seed migration | `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` | Exists |
| Backend routes | `packages/server/src/campaigns/routes.ts` (submit-review, launch, cancel, approve-cancel, submit-evidence, verify) | Exists |
| ReviewActionsPanel | `packages/client/src/components/campaigns/ReviewActionsPanel.tsx` | Exists |
| AdminActionsPanel | `packages/client/src/components/campaigns/AdminActionsPanel.tsx` | Exists |
| SubmitEvidencePanel | `packages/client/src/pages/CampaignDetailPage.tsx` (inline component, line 361) | Exists |
| Dashboard launch/cancel | `packages/client/src/pages/DashboardPage.tsx` (lines 202–295) | Exists |

### Known risks to investigate

1. **Seed campaigns missing risk disclosures** — The five seeded campaigns have
   `risk_disclosures = '{}'` (default). If any rendered section or backend guard requires
   non-empty risk disclosures, tests may fail. Audit `CampaignDetailPage` rendering and backend
   route guards.

2. **Single-milestone campaigns at 50%** — Campaigns 0014, 0015, and 0016 each have one
   milestone at 50% funding (not 100%). The form validates ≥2 milestones summing to 100%, but
   seeded rows bypass this. Verify the campaign detail page renders correctly and the reviewer
   approval route does not re-validate milestone totals.

3. **React Query cache invalidation after launch/cancel** — The test expects the `Live` status
   badge to appear in the dashboard table immediately after clicking Launch, without navigating
   away. The `useMutation` in `DashboardPage` must invalidate the relevant query key on success.
   Check that `queryClient.invalidateQueries` is called correctly.

4. **`window.confirm` vs Playwright dialog handling** — The cancellation test installs a
   `page.on('dialog', ...)` handler before clicking Cancel. The dashboard uses `window.confirm`
   (line 230). Confirm the handler is registered before the click and that Playwright intercepts
   the native dialog.

5. **Settlement campaign milestone seed** — Campaign 0017 has Phase 1 (`Pending`) and Phase 2
   (`Submitted`). The test submits evidence for Phase 1, then verifies Phase 2 via the admin
   panel. Verify that `AdminActionsPanel` renders the `Verify` button for milestones with status
   `Submitted` and that `nth(1)` correctly targets Phase 2 after Phase 1 evidence is submitted.

6. **Notification seed** — One `campaign.approved` notification is seeded for campaign 0014.
   Earlier tests in the suite (reviewer approval in test 2) may create additional notifications.
   Test 7 counts `markReadButtons` before clicking; this works as long as `initialCount > 0`.
   Ensure the notification seeded for 0014 has `read = false`.

### Implementation steps

1. Run `./scripts/e2e-check-docker.sh` to get a baseline pass/fail on the current branch.
2. If tests fail, inspect each failure against the risks above and make targeted fixes.
3. Common fix locations:
   - **Seed data**: add risk disclosures or adjust milestone `funding_pct` in
     `20260322000001_seed_lifecycle_test_campaigns.sql` via a new migration (never edit existing
     migrations).
   - **Query invalidation**: `packages/client/src/pages/DashboardPage.tsx` — ensure `onSuccess`
     calls `queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] })` (or equivalent).
   - **AdminActionsPanel**: `packages/client/src/components/campaigns/AdminActionsPanel.tsx` —
     verify milestone `Submitted` status guard and `Verify` button rendering.
4. Re-run CI checks until all pass.

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `e2e/campaign-lifecycle.spec.ts` | Already exists | 7 lifecycle E2E tests; modify only if tests need fixing |
| `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql` | Already exists | Seed data for 5 lifecycle campaigns; if data fixes are needed, add a new migration |
| `packages/client/src/pages/DashboardPage.tsx` | Modify if needed | Ensure query invalidation after launch/cancel mutations |
| `packages/client/src/components/campaigns/AdminActionsPanel.tsx` | Modify if needed | Verify milestone Submitted guard and Verify button |
| `packages/client/src/pages/CampaignDetailPage.tsx` | Modify if needed | Verify SubmitEvidencePanel aria-label and form placeholders match test selectors |

## Dependencies

- All npm packages already installed (Playwright 1.58.2, React Query, Vitest)
- PostgreSQL seed data via dbmate migrations (no new packages required)
- No new external services

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors
- **Lint/format**: `npm run lint && npm run format:check` pass
- **Unit tests**: `npm run test:coverage` passes (80% threshold)
- **E2E**: `./scripts/e2e-check-docker.sh` runs all 7 lifecycle tests green
- **Visual** (manual): at `http://localhost:5173`
  - Creator can navigate Dashboard → New Campaign → fill all 7 steps → submit
  - Reviewer sees submitted campaign in `/review`, can claim → approve/reject
  - Creator Dashboard shows Approved campaign with Launch button; clicking it updates status to Live
  - `/campaigns` shows newly launched campaign
  - Campaign detail for Settlement campaign shows evidence form for Pending milestone
  - Admin can verify Submitted milestones via Admin actions panel
  - Creator Dashboard shows Live campaign with Cancel button; requesting cancellation shows pending state
  - Admin sees "Pending Cancellation Request" and can approve → status becomes Cancelled
  - Creator `/notifications` shows unread notification with Mark as read button
- **E2E flows** (Playwright, `e2e/campaign-lifecycle.spec.ts`):
  1. Creator submits draft campaign through all 7 form steps
  2. Reviewer claims and approves submitted campaign with notes
  3. Creator launches approved campaign → visible in /campaigns
  4. Reviewer rejects campaign; creator sees Resubmit button
  5. Creator submits milestone evidence; admin verifies it
  6. Creator requests cancellation; admin approves it
  7. Creator marks notification as read
