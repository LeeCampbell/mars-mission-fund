# Tasks: Issue #65 — Fix client-server integration

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Fix port mismatch and shared package resolution
  - **Goal**: Ensure the server listens on port 3001, the Vite proxy targets port 3001, and `@mmf/shared` resolves from TypeScript source (no missing `dist/`).
  - **Details**:
    - `packages/server/src/index.ts`: change `process.env.PORT || '3000'` → `'3001'`
    - `packages/client/vite.config.ts`: change proxy target from `http://localhost:3000` → `http://localhost:3001`
    - `packages/shared/package.json`: change `exports` field to `"./src/index.ts"` (bare string, no condition object)
    - `packages/client/package.json`: add `"@mmf/shared": "*"` to `dependencies`
  - **Files**:
    - `packages/server/src/index.ts`
    - `packages/client/vite.config.ts`
    - `packages/shared/package.json`
    - `packages/client/package.json`
  - **Verify**: `grep -r "3001" packages/server/src/index.ts packages/client/vite.config.ts` shows the correct port in both files; `cat packages/shared/package.json` shows `"exports": "./src/index.ts"`; `cat packages/client/package.json` contains `"@mmf/shared"`.
  - **Brief ref**: §1 Fix port, §2 Fix `@mmf/shared` package resolution

- [x] TASK-02: Rewrite `@mmf/shared` campaign types to camelCase with nested schemas
  - **Goal**: Replace all snake_case field names with camelCase; add `MilestoneSchema`, `StretchGoalSchema`, `TeamMemberSchema`, `CampaignUpdateSchema`, extended `CampaignSummarySchema`, and `CampaignDetailSchema`.
  - **Details**:
    - Keep `CampaignStatusSchema` and `CampaignCategorySchema` enums unchanged.
    - Add `MilestoneStatusSchema`: `z.enum(['Pending', 'Submitted', 'Verified'])`.
    - Add `MilestoneSchema` with fields: `id`, `title`, `description`, `targetDate`, `fundingPercentage`, `verificationCriteria`, `status`, `sortOrder`.
    - Add `StretchGoalSchema` with fields: `id`, `targetAmount`, `description`, `deliverables`, `unlocked`, `sortOrder`.
    - Add `TeamMemberSchema` with fields: `id`, `name`, `role`, `bio`, `sortOrder`.
    - Add `CampaignUpdateSchema` with fields: `id`, `body`, `postedAt`.
    - Rewrite `CampaignSummarySchema` with camelCase fields: `id`, `title`, `summary`, `status`, `category`, `heroImageUrl`, `goalAmount`, `raisedAmount`, `contributorCount`, `deadline`, `createdAt`.
    - Add `CampaignDetailSchema` extending summary with: `slug`, `description`, `alignmentStatement`, `tags`, `maxFundingCapUsd`, `launchedAt`, `updatedAt`, plus arrays `milestones`, `stretchGoals`, `teamMembers`, `updates`.
    - Export inferred types: `CampaignSummary`, `CampaignDetail`, `Milestone`, `MilestoneStatus`, `StretchGoal`, `TeamMember`, `CampaignUpdate`.
    - Ensure all new exports are re-exported from `packages/shared/src/index.ts`.
  - **Files**:
    - `packages/shared/src/campaign.ts`
    - `packages/shared/src/index.ts`
  - **Verify**: `cd packages/shared && npx tsc --noEmit` passes (or `npm run build` if a build script exists); all new type names are present in the file.
  - **Brief ref**: §3 Rewrite `@mmf/shared/src/campaign.ts`

- [x] TASK-03: Update server queries with camelCase SQL aliases and nested entity fetching
  - **Goal**: `listCampaigns` returns camelCase field names; `getCampaignById` fetches milestones, stretch goals, team members, and updates and stitches them into a `CampaignDetail` response.
  - **Details**:
    - `packages/server/src/campaigns/queries.ts`:
      - `listCampaigns`: add `AS` aliases for every selected column to match `CampaignSummary` field names (e.g., `hero_image_url AS "heroImageUrl"`, `min_funding_target_usd AS "goalAmount"`, `current_amount_usd AS "raisedAmount"`, `contributor_count AS "contributorCount"`, `created_at AS "createdAt"`); add `summary`, `hero_image_url`, `deadline`, `contributor_count` to SELECT if not already present.
      - `getCampaignById`: after fetching the campaign row (with same camelCase aliases), run four additional `pool.query` calls:
        1. `campaign_milestones` ordered by `sort_order` — alias columns to camelCase
        1. `campaign_stretch_goals` ordered by `sort_order` — alias columns; compute `unlocked` as `goal.target_usd <= campaign.current_amount_usd`
        1. `campaign_team_members` ordered by `sort_order` — alias columns
        1. `campaign_updates` ordered by `posted_at DESC` — alias columns
      - Return assembled `CampaignDetail`-shaped object.
    - `packages/server/src/campaigns/types.ts`: import `CampaignSummary` and `CampaignDetail` from `@mmf/shared`; remove any local re-exports that are now mismatched.
  - **Files**:
    - `packages/server/src/campaigns/queries.ts`
    - `packages/server/src/campaigns/types.ts`
  - **Verify**: TypeScript compiles without errors in `packages/server`; query file contains the four nested query calls; `types.ts` imports from `@mmf/shared`.
  - **Brief ref**: §4 Update server queries

- [x] TASK-04: Rewrite client API module and update `useCampaign` hook
  - **Goal**: `packages/client/src/api/campaigns.ts` imports types from `@mmf/shared`, unwraps `data` envelope, throws on HTTP error, and has no mock fallback. `useCampaign` hook uses `CampaignDetail`.
  - **Details**:
    - `packages/client/src/api/campaigns.ts`:
      - Remove all locally-defined types (`Campaign`, `Milestone`, etc.) and mock-data constants.
      - Import `CampaignSummary`, `CampaignDetail` from `@mmf/shared`.
      - `fetchCampaigns(): Promise<CampaignSummary[]>`: fetch `/v1/campaigns`, throw `Error` if `!response.ok`, return `json.data`.
      - `fetchCampaign(id: string): Promise<CampaignDetail>`: fetch `/v1/campaigns/${id}`, throw `Error` if `!response.ok`, return `json.data`.
      - Re-export `CampaignSummary` and `CampaignDetail` for backward import compatibility.
    - `packages/client/src/hooks/useCampaign.ts`: update generic type parameter from `Campaign` to `CampaignDetail`.
  - **Files**:
    - `packages/client/src/api/campaigns.ts`
    - `packages/client/src/hooks/useCampaign.ts`
  - **Verify**: No local type definitions remain in `api/campaigns.ts`; file imports from `@mmf/shared`; `useCampaign.ts` references `CampaignDetail`.
  - **Brief ref**: §5 Rewrite client API module

- [x] TASK-05: Update client campaign components for new type shapes
  - **Goal**: All campaign UI components use the new camelCase field names and import types from `@mmf/shared` (or re-exports from the API module).
  - **Details**:
    - `CampaignCard.tsx`: compute progress bar as `(campaign.raisedAmount / campaign.goalAmount) * 100` instead of `fundingProgressPct`; update import.
    - `FundingProgressSection.tsx`: rename `campaign.targetAmount` → `campaign.goalAmount`; handle `deadline: Date | null` (e.g., convert with `.toISOString()` or guard with null check).
    - `MilestonesSection.tsx`: fix `statusBadgeVariant` map to use `'Pending'`, `'Submitted'`, `'Verified'` (title-case, not lowercase); update import.
    - `StretchGoalsSection.tsx`: there is no `title` field — render `goal.description` as the heading and `goal.deliverables` as sub-text; update import.
    - `TeamSection.tsx`: update import only.
    - `CampaignUpdatesSection.tsx`: remove or replace any `title` usage; replace `update.date` with `update.postedAt`; update import.
    - `CampaignDetailPage.tsx`: fix `statusBadgeVariant` to use `CampaignStatus` enum values (`'Complete'`, `'Live'`, `'Draft'`, `'Failed'`, etc.); update import.
  - **Files**:
    - `packages/client/src/components/campaigns/CampaignCard.tsx`
    - `packages/client/src/components/campaigns/FundingProgressSection.tsx`
    - `packages/client/src/components/campaigns/MilestonesSection.tsx`
    - `packages/client/src/components/campaigns/StretchGoalsSection.tsx`
    - `packages/client/src/components/campaigns/TeamSection.tsx`
    - `packages/client/src/components/campaigns/CampaignUpdatesSection.tsx`
    - `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npm run build -w @mmf/client` compiles without TypeScript errors; no references to removed fields (`fundingProgressPct`, `targetAmount` in progress section, `update.date`, `update.title`, `goal.title`) remain.
  - **Brief ref**: §6 Update client components

- [ ] TASK-06: Update server tests for new type shapes and multi-query mocks
  - **Goal**: Server test suite passes with updated mock data (camelCase) and mocked sequential `pool.query` calls for the detail endpoint.
  - **Details**:
    - `packages/server/src/__tests__/campaigns.test.ts`:
      - Update `mockCampaignSummary` object to use camelCase field names matching `CampaignSummary`.
      - Update the detail-route test to mock five sequential `pool.query` calls in order: campaign row, milestones, stretch goals, team members, updates (each returning `{ rows: [...] }`).
      - Ensure the expected response body in assertions matches the assembled `CampaignDetail` shape.
  - **Files**:
    - `packages/server/src/__tests__/campaigns.test.ts`
  - **Verify**: `npm test -w @mmf/server` exits 0 with all tests passing.
  - **Brief ref**: §7 Update tests (server)

- [ ] TASK-07: Update client tests for new type shapes
  - **Goal**: All client test files compile and pass with mock data updated to match `CampaignDetail` / `CampaignSummary` field names.
  - **Details**:
    - `CampaignDetailPage.test.tsx`: update mock object to `CampaignDetail` shape — correct status value to `'Live'`, milestone statuses to `'Pending'`/`'Verified'`, use `goalAmount`/`raisedAmount`, add required nested arrays.
    - `FundingProgressSection.test.tsx`: rename `targetAmount` → `goalAmount` in mock; ensure mock conforms to `CampaignDetail`.
    - `MilestonesSection.test.tsx`: update mock milestone `status` values to `'Pending'`/`'Submitted'`/`'Verified'`.
    - `StretchGoalsSection.test.tsx`: update mock to remove `title`; add `description`, `deliverables`, `unlocked`, `sortOrder`.
    - `CampaignUpdatesSection.test.tsx`: update mock to remove `title`; rename `date` → `postedAt`.
    - `TeamSection.test.tsx`: update mock shape if needed.
    - Any other component test that imports from `../../api/campaigns`: update import path or mock to match new exports.
  - **Files**:
    - `packages/client/src/pages/CampaignDetailPage.test.tsx`
    - `packages/client/src/components/campaigns/FundingProgressSection.test.tsx`
    - `packages/client/src/components/campaigns/MilestonesSection.test.tsx`
    - `packages/client/src/components/campaigns/StretchGoalsSection.test.tsx`
    - `packages/client/src/components/campaigns/CampaignUpdatesSection.test.tsx`
    - `packages/client/src/components/campaigns/TeamSection.test.tsx`
  - **Verify**: `npm test -w @mmf/client` exits 0 with all tests passing.
  - **Brief ref**: §7 Update tests (client)

- [ ] TASK-08: Final build and integration verification
  - **Goal**: Full monorepo build succeeds and all workspace tests pass.
  - **Details**:
    - Run `npm run build` from the repo root and confirm it succeeds for all workspaces (shared, server, client).
    - Run `npm test -w @mmf/server` and `npm test -w @mmf/client` and confirm all tests pass.
    - Fix any remaining TypeScript or test errors not caught in earlier tasks.
  - **Files**: Any files with residual errors discovered during the build/test run.
  - **Verify**: `npm run build` exits 0; `npm test -w @mmf/server` exits 0; `npm test -w @mmf/client` exits 0.
  - **Brief ref**: §Verification
