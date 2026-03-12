# Tasks: Issue #114 — Creator dashboard and campaign submission form

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Extend shared schemas with milestone and team-member types
  - **Goal**: Add `CreateMilestoneRequestSchema` and `CreateTeamMemberRequestSchema` to shared package; extend `CreateCampaignRequestSchema` with `milestones` and `teamMembers` arrays; export new types
  - **Details**: In `packages/shared/src/campaign.ts`, add the two new Zod schemas above `CreateCampaignRequestSchema`. Add `milestones: z.array(CreateMilestoneRequestSchema).optional().default([])` and `teamMembers: z.array(CreateTeamMemberRequestSchema).optional().default([])` to `CreateCampaignRequestSchema`. Export `CreateMilestoneRequest` and `CreateTeamMemberRequest` types. `UpdateCampaignRequestSchema` inherits via `.partial()` automatically.
  - **Files**: `packages/shared/src/campaign.ts`
  - **Verify**: `npm run build -w @mmf/shared && npx tsc -b --noEmit` passes with no type errors
  - **Brief ref**: Shared schema extension

- [x] TASK-02: Update server queries to upsert milestones and team members
  - **Goal**: `createCampaign` and `updateCampaign` in `queries.ts` delete-then-reinsert milestone and team-member rows from the payload
  - **Details**: Read `packages/server/src/campaigns/queries.ts` fully first. After the INSERT/UPDATE of the campaign row in `createCampaign`, if `milestones` is provided, run `DELETE FROM campaign_milestones WHERE campaign_id = $1` then bulk-INSERT each milestone row. Same for `teamMembers` → `campaign_team_members`. Repeat the same pattern in `updateCampaign`. Handle the case where the arrays are empty or undefined (skip the deletes if arrays are absent). Check column names against `packages/server/db/schema.sql` first.
  - **Files**: `packages/server/src/campaigns/queries.ts`, read `packages/server/db/schema.sql` for column names
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; existing server tests pass with `npx vitest run -w packages/server`
  - **Brief ref**: Server query updates

- [x] TASK-03: Add creator API client functions
  - **Goal**: Add all 8 new functions to `packages/client/src/api/campaigns.ts`
  - **Details**: Add: `fetchMyCampaigns()` → `GET /v1/campaigns?createdBy=me`, returns `CampaignSummary[]`; `createCampaign(data: CreateCampaignRequest)` → `POST /v1/campaigns`, returns `CampaignDetail`; `updateCampaign(id, data: UpdateCampaignRequest)` → `PUT /v1/campaigns/:id`, returns `CampaignDetail`; `deleteCampaign(id)` → `DELETE /v1/campaigns/:id`, returns `void`; `submitCampaignForReview(id)` → `POST /v1/campaigns/:id/submit`, returns `void`; `launchCampaign(id)` → `POST /v1/campaigns/:id/launch`, returns `void`; `postCampaignUpdate(id, body: string)` → `POST /v1/campaigns/:id/update`, returns `void`; `submitMilestoneEvidence(id, mid, data: { evidenceDescription: string; evidenceUrl?: string })` → `POST /v1/campaigns/:id/milestones/:mid/submit-evidence`, returns `void`. All use `authedFetch` and throw on non-OK responses. Import and use `CreateCampaignRequest`, `UpdateCampaignRequest`, `CreateMilestoneRequest`, `CreateTeamMemberRequest` from `@mmf/shared`.
  - **Files**: `packages/client/src/api/campaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; no lint errors
  - **Brief ref**: Client API layer

- [x] TASK-04: Create `useCreatorCampaigns` hook
  - **Goal**: A `useQuery` hook wrapping `fetchMyCampaigns` for use by the dashboard
  - **Details**: Create `packages/client/src/hooks/useCreatorCampaigns.ts`. Export `useCreatorCampaigns()` which calls `useQuery({ queryKey: ['my-campaigns'], queryFn: fetchMyCampaigns, staleTime: 0 })`. Follow the pattern in existing hooks (e.g. `useCampaign.ts`).
  - **Files**: `packages/client/src/hooks/useCreatorCampaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes
  - **Brief ref**: Hooks

- [ ] TASK-05: Extend `ProtectedRoute` and update routing + layout titles
  - **Goal**: Add `requireCreator` prop to `ProtectedRoute`; register three new lazy-loaded routes in `App.tsx`; add `routeTitles` entries in `Layout.tsx`
  - **Details**: In `ProtectedRoute.tsx`, add `requireCreator?: boolean` to the props interface; add a guard: `if (requireCreator && user?.role !== 'Creator') return <Navigate to="/" replace />`. In `App.tsx`, add lazy imports for `DashboardPage`, `CampaignFormPage`, `CampaignEditPage` (same pattern as existing lazy pages). Add a `<Route element={<ProtectedRoute requireCreator />}>` block containing `/dashboard`, `/campaigns/new`, `/campaigns/:id/edit` routes. In `Layout.tsx`, add `'/dashboard': 'Creator Dashboard — Mars Mission Fund'` and `'/campaigns/new': 'New Campaign — Mars Mission Fund'` to `routeTitles`.
  - **Files**: `packages/client/src/components/ProtectedRoute.tsx`, `packages/client/src/App.tsx`, `packages/client/src/components/Layout.tsx`
  - **Verify**: `npx tsc -b --noEmit` and `npm run lint` pass
  - **Brief ref**: Routing and auth

- [ ] TASK-06: Create Creator Dashboard page
  - **Goal**: `DashboardPage.tsx` lists the creator's campaigns grouped by status with quick-action buttons
  - **Details**: Create `packages/client/src/pages/DashboardPage.tsx`. Use `useCreatorCampaigns()` to fetch. Group campaigns into sections: Draft, Submitted/Under Review/Approved, Live/Funded, Settlement/Complete, Rejected/Cancelled/Failed. Each campaign row shows: title, status badge (use the `Badge` component from `../components/ui/Badge`), deadline, raised amount, and quick-action buttons:
    - Draft → "Edit" (`Link` to `/campaigns/:id/edit`), "Submit" (inline `useMutation` → `submitCampaignForReview`, then `invalidateQueries(['my-campaigns'])`), "Delete" (inline `useMutation` → `deleteCampaign`, confirm with `window.confirm`)
    - Approved → "Launch" (inline `useMutation` → `launchCampaign`), "Edit"
    - Live/Funded → "View" (`Link` to `/campaigns/:id`)
    - Rejected → "Revise" (calls `resubmitCampaign` then navigates to `/campaigns/:id/edit`)
    - Settlement/Complete/Cancelled/Failed/Suspended → "View"
  - Show a "New Campaign" link to `/campaigns/new`. Handle loading and error states. Use inline `React.CSSProperties` style objects only.
  - **Files**: `packages/client/src/pages/DashboardPage.tsx`
  - **Verify**: Page renders without TypeScript errors; `npx tsc -b --noEmit` passes
  - **Brief ref**: Creator Dashboard

- [ ] TASK-07: Create 7-step Campaign Form page
  - **Goal**: `CampaignFormPage.tsx` — a multi-step form usable for both create (`/campaigns/new`) and edit (`/campaigns/:id/edit`) modes
  - **Details**: Create `packages/client/src/pages/CampaignFormPage.tsx`. Export `CampaignFormPage` accepting an optional `campaignId?: string` prop. Use `useReducer` with a `FormState` type covering all 7 steps' fields. If `campaignId` is provided, call `useCampaign(campaignId)` and populate the reducer on load. Steps (numbered indicator at top, Back/Next navigation):
    1. **Mission** — title (required), category (select from `CampaignCategorySchema` values), summary (max 280), description, alignmentStatement
    2. **Team** — dynamic list of team members (name, role, bio); validate at least 1 member before Next
    3. **Funding** — minFundingTargetUsd ($1M–$1B), maxFundingCapUsd, deadline (1 week–1 year out)
    4. **Milestones** — dynamic list (title, description, fundingPercentage, targetDate, verificationCriteria, sortOrder); validate sum of fundingPercentage === 100% and at least 2 milestones before Next
    5. **Risks** — riskDisclosures dynamic list of strings; validate at least 1 before Next
    6. **Media** — heroImageUrl (optional URL)
    7. **Review & Submit** — read-only summary; "Submit for Review" button opens a `<dialog>` confirmation; on confirm calls `submitCampaignForReview(id)` then navigates to `/dashboard`
  - "Save Draft" button on every step: if no `campaignId`, call `createCampaign(data)` and `navigate` to `/campaigns/${id}/edit`; otherwise call `updateCampaign(id, data)`. Use inline `React.CSSProperties`. Import `CampaignCategory` values for the category select. Show server error messages inline on failure.
  - **Files**: `packages/client/src/pages/CampaignFormPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; form renders all 7 steps and navigation works
  - **Brief ref**: Multi-step Form

- [ ] TASK-08: Create Campaign Edit page wrapper
  - **Goal**: `CampaignEditPage.tsx` reads `:id` from route params and renders `CampaignFormPage` in edit mode; sets document title once campaign loads
  - **Details**: Create `packages/client/src/pages/CampaignEditPage.tsx`. Use `useParams()` to get `id`. Render `<CampaignFormPage campaignId={id} />`. Set `document.title` to `${campaign.title} — Edit — Mars Mission Fund` using `useEffect` once the campaign data loads (follow the pattern in `CampaignDetailPage`).
  - **Files**: `packages/client/src/pages/CampaignEditPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes
  - **Brief ref**: Multi-step Form (edit wrapper)

- [ ] TASK-09: Add creator panels to Campaign Detail page
  - **Goal**: Post Update panel and Submit Evidence panel rendered conditionally for the campaign creator
  - **Details**: Read the full `CampaignDetailPage.tsx` first. Add two new creator-only sections after the existing content:
    - **Post Update panel**: rendered when `user?.id === campaign.creatorId && (campaign.status === 'Live' || campaign.status === 'Funded')`. Contains a `<textarea>` for update body and a "Post Update" button. Use inline `useMutation` calling `postCampaignUpdate(id, body)`, then `invalidateQueries(['campaign', id])` on success. Clear textarea on success.
    - **Submit Evidence panel**: rendered when `user?.id === campaign.creatorId && campaign.status === 'Settlement'`. Lists milestones with `status === 'Pending' || status === 'Returned'`. Each milestone has an `evidenceDescription` textarea, an `evidenceUrl` input (optional), and a "Submit Evidence" button. Use inline `useMutation` calling `submitMilestoneEvidence(id, milestone.id, { evidenceDescription, evidenceUrl })`, then `invalidateQueries(['campaign', id])` on success. Follow the visual style of `ReviewActionsPanel.tsx`.
  - Import `postCampaignUpdate` and `submitMilestoneEvidence` from `../api/campaigns`.
  - **Files**: `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npx tsc -b --noEmit` passes; no lint errors
  - **Brief ref**: Campaign Detail Page additions

- [ ] TASK-10: Write component tests for Dashboard and Form pages
  - **Goal**: Achieve ≥80% coverage for the new dashboard and campaign form pages
  - **Details**: Create `packages/client/src/pages/DashboardPage.test.tsx` covering: loading state, error state, empty state (no campaigns), populated state with multiple status groups, "New Campaign" link presence. Create `packages/client/src/pages/CampaignFormPage.test.tsx` covering: step 1 renders required fields, Next blocked when title is empty, step 4 Next blocked when milestone percentages ≠ 100%, "Save Draft" calls `createCampaign` in create mode, form initialises from existing data in edit mode. Follow the testing patterns in existing test files (e.g. `ReviewQueuePage.test.tsx`). Mock `../api/campaigns` and `../hooks/useCreatorCampaigns`. Use `@testing-library/react` and `vitest`.
  - **Files**: `packages/client/src/pages/DashboardPage.test.tsx`, `packages/client/src/pages/CampaignFormPage.test.tsx`
  - **Verify**: `npm run test:coverage` passes at 80% threshold
  - **Brief ref**: Component tests

- [ ] TASK-11: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the creator flow end-to-end
  - **Details**: Create `e2e/creator-dashboard.spec.ts`. Follow patterns in `e2e/auth.spec.ts` and `e2e/campaigns.spec.ts`. Cover: (1) Log in as a Creator demo user; (2) Navigate to `/dashboard` — verify page title and "New Campaign" button; (3) Click "New Campaign" → `/campaigns/new`; (4) Fill all 7 steps with valid data (use test values: title "E2E Test Campaign", a team member, 2 milestones summing to 100%, 1 risk); (5) Click "Save Draft" on step 1 — verify URL changes to `/campaigns/:id/edit`; (6) Navigate to step 7 and click "Submit for Review" → confirm dialog → verify navigation to `/dashboard`; (7) Verify the campaign appears on the dashboard with status "Submitted" or "Under Review". Tests must pass against the running local stack.
  - **Files**: `e2e/creator-dashboard.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Verification section

- [ ] TASK-12: Final CI verification
  - **Goal**: Confirm the full CI pipeline passes before the branch is ready for review
  - **Details**: Run the individual CI checks in sequence: (1) `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json`; (2) `npm run lint`; (3) `npm run format:check`; (4) `npm run build`; (5) `npm run test:coverage`. Fix any remaining type errors, lint warnings, or test failures. Do NOT run `./scripts/ci-check.sh` as a single command (chaining breaks auto-approval); run each check separately.
  - **Files**: Any files flagged by the checks
  - **Verify**: All five checks exit 0
  - **Brief ref**: Verification section
