# Tasks: Issue #114 — Creator Dashboard and Campaign Submission Form

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: DB migrations — creator_id, campaign_risks, budget/images columns
  - **Goal**: Add all new database columns and tables required by this feature
  - **Details**: Create three migration files with timestamp prefix `20260311`:
    1. `20260311000003_add_creator_to_campaigns.sql` — `ALTER TABLE campaigns ADD COLUMN creator_id uuid REFERENCES accounts(id) ON DELETE SET NULL;`
    2. `20260311000004_create_campaign_risks.sql` — table with `id uuid PK`, `campaign_id uuid FK CASCADE`, `description text NOT NULL`, `mitigation text NOT NULL`, `sort_order integer DEFAULT 0`
    3. `20260311000005_add_budget_and_images_to_campaigns.sql` — `budget_breakdown text` and `additional_image_urls text[] DEFAULT '{}'`
    Update `packages/server/db/schema.sql` to reflect the new schema.
    Also verify `packages/server/db/migrations/20260311000002_seed_accounts.sql` contains a demo Creator account; add one if missing (role `Creator`, email e.g. `creator@example.com`, password hashed with bcrypt).
  - **Files**:
    - `packages/server/db/migrations/20260311000003_add_creator_to_campaigns.sql` (create)
    - `packages/server/db/migrations/20260311000004_create_campaign_risks.sql` (create)
    - `packages/server/db/migrations/20260311000005_add_budget_and_images_to_campaigns.sql` (create)
    - `packages/server/db/schema.sql` (modify)
    - `packages/server/db/migrations/20260311000002_seed_accounts.sql` (modify if needed)
  - **Verify**: Migration files are syntactically correct SQL; schema.sql updated; seed has a Creator account
  - **Brief ref**: Database section

- [x] TASK-02: Shared Zod schemas — RiskDisclosure, MilestoneInput, CreateCampaignInput, UpdateCampaignInput
  - **Goal**: Add all new shared validation schemas and extend `CampaignDetailSchema`
  - **Details**: In `packages/shared/src/campaign.ts` add:
    - `RiskDisclosureSchema` — `{ id: z.string().uuid(), description: z.string().min(1), mitigation: z.string().min(1), sortOrder: z.number().int().default(0) }`
    - `MilestoneInputSchema` — input shape (title, description, targetDate, fundingPercentage, verificationCriteria) with no id/status fields
    - `CreateCampaignInputSchema` — title required; summary, description, alignmentStatement, category optional with `''` defaults; fundingMin/Max optional with `0` defaults; deadline optional; teamMembers, milestones, risks, budgetBreakdown, heroImageUrl, additionalImageUrls optional
    - `UpdateCampaignInputSchema` — all fields optional (`.partial()` of a full campaign shape)
    Extend `CampaignDetailSchema` to include `creatorId: z.string().uuid().nullable()`, `budgetBreakdown: z.string().nullable()`, `additionalImageUrls: z.array(z.string()).default([])`, `risks: z.array(RiskDisclosureSchema).default([])`
    Export all new types.
  - **Files**:
    - `packages/shared/src/campaign.ts` (modify)
  - **Verify**: `npm run build -w @mmf/shared` passes with no TypeScript errors
  - **Brief ref**: Shared types section

- [x] TASK-03: Backend queries — add all new campaign DB queries
  - **Goal**: Implement all new parameterised database query functions
  - **Details**: In `packages/server/src/campaigns/queries.ts`:
    - `getMyCampaigns(pool, userId)` — SELECT campaigns WHERE creator_id = userId, include risk count or basic info
    - `createCampaign(pool, userId, input)` — INSERT with creator_id; insert related team_members, milestones, risks rows atomically in a transaction
    - `updateCampaign(pool, campaignId, userId, input)` — UPDATE campaign fields; replace team_members, milestones, risks rows atomically (DELETE then INSERT)
    - `deleteCampaign(pool, campaignId, userId)` — DELETE WHERE id AND creator_id AND status = 'Draft'
    - `submitCampaign(pool, campaignId, userId)` — validate required fields non-empty and amounts in bounds, then UPDATE status to 'Submitted'; return error if validation fails
    - `createCampaignUpdate(pool, campaignId, userId, body)` — INSERT into campaign_updates; check campaign Live/Funded and owner
    - `submitMilestoneEvidence(pool, campaignId, milestoneId, userId, evidenceText)` — UPDATE milestone evidence, set status to 'Submitted'; check campaign Settlement and owner
    Update `getCampaignById` to also SELECT `creator_id`, `budget_breakdown`, `additional_image_urls`, and JOIN/subquery `campaign_risks`.
    Update `packages/server/src/campaigns/types.ts` to add server-side types derived from the new schemas.
  - **Files**:
    - `packages/server/src/campaigns/queries.ts` (modify)
    - `packages/server/src/campaigns/types.ts` (modify)
  - **Verify**: TypeScript compiles (`npx tsc --noEmit -p packages/server/tsconfig.json`)
  - **Brief ref**: Backend section — queries

- [x] TASK-04: Backend routes — add new campaign API endpoints
  - **Goal**: Wire all new routes into the campaign router with auth and validation middleware
  - **Details**: In `packages/server/src/campaigns/routes.ts`:
    - Define `GET /my` before `GET /:id` (important ordering)
    - `GET /my` — `authenticate`, `requireRole('Creator')`, calls `getMyCampaigns`
    - `POST /` — `authenticate`, `requireRole('Creator')`, Zod validate `CreateCampaignInputSchema`, calls `createCampaign`
    - `PATCH /:id` — `authenticate`, `requireRole('Creator')`, Zod validate `UpdateCampaignInputSchema`, calls `updateCampaign`
    - `DELETE /:id` — `authenticate`, `requireRole('Creator')`, calls `deleteCampaign`
    - `POST /:id/submit` — `authenticate`, `requireRole('Creator')`, calls `submitCampaign`; return 422 with field errors if submission validation fails
    - `POST /:id/updates` — `authenticate`, `requireRole('Creator')`, validate `{ body: string }`, calls `createCampaignUpdate`
    - `POST /:id/milestones/:milestoneId/evidence` — `authenticate`, `requireRole('Creator')`, validate `{ evidenceText: string }`, calls `submitMilestoneEvidence`
  - **Files**:
    - `packages/server/src/campaigns/routes.ts` (modify)
  - **Verify**: TypeScript compiles; `npm run build` succeeds
  - **Brief ref**: Backend section — routes

- [x] TASK-05: Backend tests — cover all new endpoints
  - **Goal**: Add integration tests for every new endpoint
  - **Details**: In `packages/server/src/__tests__/campaigns.test.ts`, add test cases covering:
    - `GET /v1/campaigns/my` — 401 unauthenticated, 403 non-Creator, 200 returns creator's campaigns
    - `POST /v1/campaigns` — 400 missing title, 201 creates draft with creator_id set
    - `PATCH /v1/campaigns/:id` — 403 not owner, 404 not found, 200 updates fields
    - `DELETE /v1/campaigns/:id` — 403 not owner or not Draft, 204 deletes
    - `POST /v1/campaigns/:id/submit` — 422 missing required fields, 200 transitions to Submitted
    - `POST /v1/campaigns/:id/updates` — 403 wrong status/non-owner, 201 creates update
    - `POST /v1/campaigns/:id/milestones/:milestoneId/evidence` — 403 wrong status, 200 submits evidence
    Use a Creator-role test JWT/account and a Backer-role account to test role enforcement.
  - **Files**:
    - `packages/server/src/__tests__/campaigns.test.ts` (modify)
  - **Verify**: `npx vitest run packages/server` passes; all new tests green
  - **Brief ref**: Tests section

- [x] TASK-06: API client functions — fetchMyCampaigns and campaign write operations
  - **Goal**: Add all new API client functions for campaign write operations
  - **Details**: In `packages/client/src/api/campaigns.ts` add (all using `authedFetch`):
    - `fetchMyCampaigns()` — GET `/v1/campaigns/my`
    - `createCampaign(input: CreateCampaignInput)` — POST `/v1/campaigns`
    - `updateCampaign(id: string, input: UpdateCampaignInput)` — PATCH `/v1/campaigns/:id`
    - `deleteCampaign(id: string)` — DELETE `/v1/campaigns/:id`
    - `submitCampaign(id: string)` — POST `/v1/campaigns/:id/submit`
    - `postCampaignUpdate(id: string, body: string)` — POST `/v1/campaigns/:id/updates`
    - `submitMilestoneEvidence(campaignId: string, milestoneId: string, evidenceText: string)` — POST `/v1/campaigns/:id/milestones/:milestoneId/evidence`
    Import shared types from `@mmf/shared`. Ensure return types are properly typed.
  - **Files**:
    - `packages/client/src/api/campaigns.ts` (modify)
  - **Verify**: `npx tsc -b --noEmit` passes with no new errors
  - **Brief ref**: Frontend — API layer

- [x] TASK-07: React Query hooks — useMyCampaigns and useCampaignMutations
  - **Goal**: Create the data-fetching and mutation hooks for the creator workflow
  - **Details**:
    - `packages/client/src/hooks/useMyCampaigns.ts` — `useQuery` with key `['campaigns', 'my']` wrapping `fetchMyCampaigns`
    - `packages/client/src/hooks/useCampaignMutations.ts` — export individual hooks:
      - `useCreateCampaign()` — mutation that calls `createCampaign`; on success invalidate `['campaigns', 'my']`
      - `useUpdateCampaign()` — mutation; on success invalidate campaign detail and my list
      - `useDeleteCampaign()` — mutation; on success invalidate my list
      - `useSubmitCampaign()` — mutation; NOT optimistic; on success invalidate campaign detail and my list
      - `usePostCampaignUpdate()` — mutation; use `onMutate` to optimistically append update to campaign detail cache; rollback on error
      - `useSubmitMilestoneEvidence()` — mutation; on success invalidate campaign detail
  - **Files**:
    - `packages/client/src/hooks/useMyCampaigns.ts` (create)
    - `packages/client/src/hooks/useCampaignMutations.ts` (create)
  - **Verify**: TypeScript compiles; no lint errors
  - **Brief ref**: Frontend — Hooks

- [x] TASK-08: ProtectedRoute, App.tsx routes, Layout.tsx titles
  - **Goal**: Extend routing infrastructure to support creator-only routes
  - **Details**:
    - `ProtectedRoute.tsx` — add optional `requireCreator?: boolean` prop; if true and `user.role !== 'Creator'`, redirect to `/`
    - `App.tsx` — wrap three new routes in `<ProtectedRoute requireCreator />`: `/dashboard` → `DashboardPage`, `/campaigns/new` → `CampaignNewPage`, `/campaigns/:id/edit` → `CampaignEditPage`
    - `Layout.tsx` — add to `routeTitles`: `'/dashboard': 'Dashboard'`, `'/campaigns/new': 'New Campaign'` (edit page title will be set dynamically in the page component)
  - **Files**:
    - `packages/client/src/components/ProtectedRoute.tsx` (modify)
    - `packages/client/src/App.tsx` (modify)
    - `packages/client/src/components/Layout.tsx` (modify)
  - **Verify**: TypeScript compiles; existing ProtectedRoute tests still pass
  - **Brief ref**: Frontend — ProtectedRoute, Routing, Page titles

- [ ] TASK-09: Campaign form step components (Steps 1–6)
  - **Goal**: Implement the six data-entry step components for the multi-step campaign form
  - **Details**: Create each as a pure controlled component under `packages/client/src/components/campaigns/form/`. Each receives a state slice and `onChange` callback, performs field-level validation, and shows inline errors.
    - `StepIndicator.tsx` — horizontal list of 7 step labels; highlights current, completed, upcoming
    - `MissionObjectivesStep.tsx` — title (required), summary (≤280 chars with counter), description, alignmentStatement text areas; inline errors for empty required fields and summary overflow
    - `TeamStep.tsx` — list of team members; Add Member button opens inline fields (name, role, bio); Remove button per member
    - `FundingStep.tsx` — minTarget (≥$1M), maxCap (≤$1B), deadline date picker, budgetBreakdown text area, category select; validate range constraints
    - `MilestonesStep.tsx` — list of milestones; Add Milestone; each has title, description, targetDate, fundingPercentage (number), verificationCriteria; shows running sum with error when ≠100%
    - `RisksStep.tsx` — list of risk disclosures; Add Risk; each has description and mitigation; Remove button per risk
    - `MediaStep.tsx` — hero image URL input, additional image URLs (add/remove)
  - **Files**:
    - `packages/client/src/components/campaigns/form/StepIndicator.tsx` (create)
    - `packages/client/src/components/campaigns/form/MissionObjectivesStep.tsx` (create)
    - `packages/client/src/components/campaigns/form/TeamStep.tsx` (create)
    - `packages/client/src/components/campaigns/form/FundingStep.tsx` (create)
    - `packages/client/src/components/campaigns/form/MilestonesStep.tsx` (create)
    - `packages/client/src/components/campaigns/form/RisksStep.tsx` (create)
    - `packages/client/src/components/campaigns/form/MediaStep.tsx` (create)
  - **Verify**: TypeScript compiles; no lint errors; components render without crashes
  - **Brief ref**: Frontend — Components

- [ ] TASK-10: ReviewSubmitStep and CampaignUpdateForm / MilestoneEvidenceForm components
  - **Goal**: Implement Step 7 (review + submit) and the two inline creator forms for the detail page
  - **Details**:
    - `ReviewSubmitStep.tsx` — read-only summary of all steps' data (title, team count, milestone table with % sum, risk count, media URL); "Save Draft" button; "Submit for Review" button that opens a confirmation dialog (use a simple `<dialog>` or a modal state); on confirm calls the `onSubmit` callback
    - `CampaignUpdateForm.tsx` — single textarea + "Post Update" button; calls `usePostCampaignUpdate`; shows success/error feedback; only rendered when `user.role === 'Creator' && user.id === campaign.creatorId && ['Live','Funded'].includes(campaign.status)`
    - `MilestoneEvidenceForm.tsx` — per-milestone evidence textarea + "Submit Evidence" button; calls `useSubmitMilestoneEvidence`; only rendered when campaign is Settlement and user is owner Creator
  - **Files**:
    - `packages/client/src/components/campaigns/form/ReviewSubmitStep.tsx` (create)
    - `packages/client/src/components/campaigns/CampaignUpdateForm.tsx` (create)
    - `packages/client/src/components/campaigns/MilestoneEvidenceForm.tsx` (create)
  - **Verify**: TypeScript compiles; no lint errors
  - **Brief ref**: Frontend — Components (ReviewSubmitStep, CampaignUpdateForm, MilestoneEvidenceForm)

- [ ] TASK-11: DashboardPage and CampaignDetailPage update
  - **Goal**: Build the creator dashboard page and add creator-specific sections to the campaign detail page
  - **Details**:
    - `DashboardPage.tsx` — uses `useMyCampaigns`; groups campaigns by status with a `reduce`; renders a section per status group (Draft, Submitted, Approved, Live, Funded, Settlement, Completed); each campaign row shows status badge, title, deadline, quick-action buttons: "Edit" (→ `/campaigns/:id/edit`, only Draft), "Submit for Review" (calls `useSubmitCampaign`, only Draft), "View" (→ `/campaigns/:id`); "New Campaign" CTA button at top navigates to `/campaigns/new`; loading and empty states
    - `CampaignDetailPage.tsx` — import and conditionally render `CampaignUpdateForm` when user is Creator owner and status is Live or Funded; import and conditionally render `MilestoneEvidenceForm` when user is Creator owner and status is Settlement; pass required props
  - **Files**:
    - `packages/client/src/pages/DashboardPage.tsx` (create)
    - `packages/client/src/pages/CampaignDetailPage.tsx` (modify)
  - **Verify**: TypeScript compiles; page renders without errors when mock data provided
  - **Brief ref**: Frontend — Pages (DashboardPage, CampaignDetailPage)

- [ ] TASK-12: CampaignNewPage and CampaignEditPage
  - **Goal**: Implement the multi-step campaign creation and edit pages
  - **Details**:
    - `CampaignNewPage.tsx` — manages `currentStep` (1–7) and a single `formData` state object accumulating all step data; renders `StepIndicator` + the current step component; "Next" / "Back" navigation between steps 1–6; on Step 7, "Save Draft" calls `createCampaign(formData)` then navigates to `/campaigns/:id/edit`; "Submit for Review" calls `createCampaign` then `submitCampaign(id)` then shows confirmation modal; handles mutation loading/error states
    - `CampaignEditPage.tsx` — fetches campaign by `id` param using `useCampaign`; pre-populates `formData` from fetched data; same 7-step UI; any step's "Save" calls `updateCampaign(id, changedFields)` (can save on step navigation or explicit save button); Step 7 "Submit for Review" calls `submitCampaign`; handles loading/error states; sets document title to `Edit Campaign — Mars Mission Fund`
  - **Files**:
    - `packages/client/src/pages/CampaignNewPage.tsx` (create)
    - `packages/client/src/pages/CampaignEditPage.tsx` (create)
  - **Verify**: TypeScript compiles; no lint errors; pages import step components correctly
  - **Brief ref**: Frontend — Pages (CampaignNewPage, CampaignEditPage)

- [ ] TASK-13: Component tests — Dashboard, form steps, and CampaignNewPage
  - **Goal**: Add Vitest + React Testing Library tests for the new UI components
  - **Details**: Mock React Query hooks where needed. Tests to write:
    - `DashboardPage.test.tsx` — mock `useMyCampaigns` returning campaigns in various statuses; assert status group headings, campaign titles, "New Campaign" button, "Edit" and "View" action buttons
    - `MissionObjectivesStep.test.tsx` — render component with empty state; type into fields; assert summary char counter updates; assert validation error shown when summary exceeds 280 chars; assert required-field errors
    - `MilestonesStep.test.tsx` — add two milestones with percentages not summing to 100; assert error message; update to sum 100; assert error gone
    - `RisksStep.test.tsx` — add a risk entry; assert it appears; remove it; assert it's gone
    - `CampaignNewPage.test.tsx` — assert step 1 renders; click Next; assert step 2 renders; go back; assert step 1 still has entered data (state persists)
  - **Files**:
    - `packages/client/src/pages/DashboardPage.test.tsx` (create)
    - `packages/client/src/components/campaigns/form/MissionObjectivesStep.test.tsx` (create)
    - `packages/client/src/components/campaigns/form/MilestonesStep.test.tsx` (create)
    - `packages/client/src/components/campaigns/form/RisksStep.test.tsx` (create)
    - `packages/client/src/pages/CampaignNewPage.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client` passes; all new tests green; coverage threshold maintained
  - **Brief ref**: Tests section

- [ ] TASK-14: Write E2E tests
  - **Goal**: Create Playwright E2E tests covering the creator dashboard and campaign creation flows
  - **Details**: Create `e2e/creator-dashboard.spec.ts`. Follow patterns in existing tests (`e2e/auth.spec.ts`, `e2e/campaigns.spec.ts`). Tests must cover:
    - Login as demo Creator account → navigate to `/dashboard` → assert page heading
    - Click "New Campaign" → assert step 1 form visible
    - Fill in Steps 1–7 with valid data → click "Save Draft" → assert redirect to edit page, campaign title visible
    - On the edit page, change the title → go to Step 7 → click "Submit for Review" → assert confirmation dialog appears → confirm → assert campaign status shows as Submitted (either on redirect or dashboard)
    Use `test.describe` blocks to group related flows. Ensure tests are independent and don't rely on prior test state where possible.
  - **Files**: `e2e/creator-dashboard.spec.ts`
  - **Verify**: `npm run test:e2e` — all tests pass (existing + new)
  - **Brief ref**: Verification section — E2E flows

- [ ] TASK-15: Final build, lint, and format verification
  - **Goal**: Confirm the entire CI pipeline passes end-to-end
  - **Details**: Run each check individually (per CLAUDE.md, do not chain with `&&`):
    1. `npm run build -w @mmf/shared`
    2. `npx tsc -b --noEmit`
    3. `npx tsc --noEmit -p packages/server/tsconfig.json`
    4. `npm run lint`
    5. `npm run format:check`
    6. `npm run build`
    7. `npm run test:coverage`
    Fix any type errors, lint warnings, or formatting issues found. Run `npm run format` to auto-fix formatting if needed.
  - **Files**: Any files with remaining issues
  - **Verify**: All seven commands complete with exit code 0
  - **Brief ref**: Verification section
