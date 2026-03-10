# Brief: Issue #65 — Fix client-server integration

## Goal

Fix all integration bugs that prevent the React client from consuming real data from the Express server and PostgreSQL database.
The bugs span four layers: a port mismatch, missing response-envelope unwrapping, snake\_case column names reaching the client unchanged, and the server not yet fetching or exposing nested entities (milestones, stretch goals, team members, campaign updates).
The fix requires updating the shared type contract, the server query layer, and the client API / UI layer in a coordinated way.

## Scope

**In scope:**

- Fix port mismatch: server default port 3000 → 3001 (to match `.env.example`), Vite proxy target → 3001
- Unwrap `{ data: ... }` response envelope in `fetchCampaigns` and `fetchCampaign`
- Rewrite `@mmf/shared` campaign types to use camelCase field names matching the REST API contract
- Add nested entity schemas to `@mmf/shared`: `Milestone`, `StretchGoal`, `TeamMember`, `CampaignUpdate`
- Extend `CampaignSummarySchema` with fields the UI needs (`summary`, `heroImageUrl`, `deadline`, `contributorCount`)
- Extend `getCampaignById` server query to run four additional queries (milestones, stretch goals, team members, updates) and stitch results into a `CampaignDetail` response
- Update server to map snake\_case DB columns to camelCase via SQL `AS` aliases
- Fix `packages/shared/package.json` exports to resolve from source (`./src/index.ts`) — no `dist/` exists
- Add `@mmf/shared` as a dependency in `packages/client/package.json`
- Rewrite `packages/client/src/api/campaigns.ts` to import from `@mmf/shared`, unwrap `data`, throw on HTTP error, remove mock-data fallback
- Update all client components to import types from `@mmf/shared` and fix field-name mismatches
- Fix status value maps in `CampaignDetailPage` and `MilestonesSection` to use values from the shared enum
- Update client and server tests to match the new type shapes

**Out of scope:**

- Changing DB schema or seed data
- Adding pagination or filtering to the list endpoint
- Addressing the seed-data category mismatch with `CampaignCategorySchema` (seed uses 'Technology', 'Environment', etc., while the enum holds Mars-specific categories — this is a data-content issue, not a plumbing bug)
- Adding new UI pages or routes
- Authentication / authorisation

## Approach

### 1 — Fix port (trivial)

- `packages/server/src/index.ts` line 4: change fallback from `'3000'` → `'3001'`
- `packages/client/vite.config.ts` line 11: change proxy target from `http://localhost:3000` → `http://localhost:3001`

### 2 — Fix `@mmf/shared` package resolution

`packages/shared/package.json` currently exports `./dist/index.js`, but no `dist/` directory exists.
Change `exports` to `"./src/index.ts"` (bare string, no condition object) so Vite's bundler resolves the TypeScript source directly — the pattern confirmed in `specs/learnings.md` (Issue #53).

### 3 — Rewrite `@mmf/shared/src/campaign.ts`

Keep `CampaignStatusSchema` and `CampaignCategorySchema` enums as-is.

Add a `MilestoneStatusSchema`: `z.enum(['Pending', 'Submitted', 'Verified'])` (values from seed data).

Define camelCase schemas for nested entities:

**`MilestoneSchema`** — maps DB `campaign_milestones`:

| DB column              | API field             |
| ---------------------- | --------------------- |
| `id`                   | `id`                  |
| `title`                | `title`               |
| `description`          | `description`         |
| `target_date`          | `targetDate`          |
| `funding_pct`          | `fundingPercentage`   |
| `verification_criteria`| `verificationCriteria`|
| `status`               | `status`              |
| `sort_order`           | `sortOrder`           |

**`StretchGoalSchema`** — maps DB `campaign_stretch_goals` (note: DB has no `title` or `unlocked`; `unlocked` is computed server-side):

| DB column / source             | API field      |
| ------------------------------ | -------------- |
| `id`                           | `id`           |
| `target_usd`                   | `targetAmount` |
| `description`                  | `description`  |
| `deliverables`                 | `deliverables` |
| computed (targetAmount <= raisedAmount) | `unlocked` |
| `sort_order`                   | `sortOrder`    |

**`TeamMemberSchema`** — maps DB `campaign_team_members`:

| DB column    | API field   |
| ------------ | ----------- |
| `id`         | `id`        |
| `name`       | `name`      |
| `role`       | `role`      |
| `bio`        | `bio`       |
| `sort_order` | `sortOrder` |

**`CampaignUpdateSchema`** — maps DB `campaign_updates` (note: DB has no `title`):

| DB column    | API field  |
| ------------ | ---------- |
| `id`         | `id`       |
| `body`       | `body`     |
| `posted_at`  | `postedAt` |

**`CampaignSummarySchema`** — rewrite in camelCase; add fields needed by `CampaignCard`:

| DB column              | API field         |
| ---------------------- | ----------------- |
| `id`                   | `id`              |
| `title`                | `title`           |
| `summary`              | `summary`         |
| `status`               | `status`          |
| `category`             | `category`        |
| `hero_image_url`       | `heroImageUrl`    |
| `min_funding_target_usd` | `goalAmount`    |
| `current_amount_usd`   | `raisedAmount`    |
| `contributor_count`    | `contributorCount`|
| `deadline`             | `deadline`        |
| `created_at`           | `createdAt`       |

**`CampaignDetailSchema`** — full campaign with nested arrays:
All fields from `CampaignSummarySchema` plus `slug`, `description`, `alignmentStatement`, `tags`, `maxFundingCapUsd`, `launchedAt`, `updatedAt`, and the four nested arrays.

Export `CampaignSummary`, `CampaignDetail`, `Milestone`, `MilestoneStatus`, `StretchGoal`, `TeamMember`, `CampaignUpdate`.

### 4 — Update server queries (`packages/server/src/campaigns/queries.ts`)

**`listCampaigns`**: Add SQL `AS` aliases matching `CampaignSummary` camelCase fields; add `summary`, `hero_image_url`, `deadline`, `contributor_count` to SELECT.

**`getCampaignById`**: After fetching the campaign row, run four sequential `pool.query` calls for milestones, stretch goals, team members, and updates (ordered by `sort_order` or `posted_at`).
Compute `unlocked` for each stretch goal: `goal.target_usd <= campaign.current_amount_usd`.
Assemble and return a `CampaignDetail`-shaped object.

Update `packages/server/src/campaigns/types.ts` to import `CampaignSummary` and `CampaignDetail` from `@mmf/shared` (removing the re-exports that are now mismatched).

### 5 — Rewrite `packages/client/src/api/campaigns.ts`

- Import `CampaignSummary`, `CampaignDetail`, `ApiResponse` from `@mmf/shared`
- Remove all locally-defined types (`Campaign`, `Milestone`, etc.) and mock-data constants
- `fetchCampaigns(): Promise<CampaignSummary[]>` — fetch `/v1/campaigns`, throw on non-OK, return `json.data`
- `fetchCampaign(id: string): Promise<CampaignDetail>` — fetch `/v1/campaigns/:id`, throw on non-OK, return `json.data`
- Export `CampaignSummary` and `CampaignDetail` (re-exports for backward import compatibility)

### 6 — Update client components

| Component / file | Change |
| --- | --- |
| `CampaignCard.tsx` | Change `campaign.raisedAmount / campaign.goalAmount * 100` for progress bar instead of `fundingProgressPct`; update import |
| `FundingProgressSection.tsx` | `campaign.targetAmount` → `campaign.goalAmount`; `campaign.deadline` is now `Date \| null` — convert with `.toISOString()` |
| `MilestonesSection.tsx` | Fix `statusBadgeVariant` to map `'Pending'`, `'Submitted'`, `'Verified'` (not lowercase); update import |
| `StretchGoalsSection.tsx` | No `title` field — render `goal.description` as the heading, `goal.deliverables` as sub-text; update import |
| `TeamSection.tsx` | Update import only |
| `CampaignUpdatesSection.tsx` | No `title` field — remove title `<h4>` or replace with formatted date; use `update.postedAt` instead of `update.date`; update import |
| `CampaignDetailPage.tsx` | Fix `statusBadgeVariant` to use `CampaignStatus` values: `'Complete'`, `'Live'`, `'Draft'`, `'Failed'`, etc.; update import |
| `hooks/useCampaign.ts` | Change generic from `Campaign` to `CampaignDetail` |

### 7 — Update tests

- `packages/server/src/__tests__/campaigns.test.ts`: update `mockCampaignSummary` to camelCase field names; update detail test to mock five sequential `pool.query` calls (campaign, milestones, stretch goals, team members, updates)
- `packages/client/src/pages/CampaignDetailPage.test.tsx`: update mock `Campaign` type to `CampaignDetail` shape (correct status `'Live'`, milestone statuses `'Pending'`/`'Verified'`, etc.; remove `heroImageUrl`, `raisedAmount`, etc. now correctly typed)
- `packages/client/src/components/campaigns/FundingProgressSection.test.tsx`: update mock to `CampaignDetail` shape (`goalAmount` instead of `targetAmount`)
- `packages/client/src/components/campaigns/MilestonesSection.test.tsx`: update mock milestone status values
- Other component tests: update import paths if they import from `../../api/campaigns`

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/shared/package.json` | modify | Change `exports` to `"./src/index.ts"` (source resolution, no dist) |
| `packages/shared/src/campaign.ts` | modify | Rewrite: camelCase schemas, nested entity types, CampaignDetail |
| `packages/client/package.json` | modify | Add `"@mmf/shared": "*"` to `dependencies` |
| `packages/client/vite.config.ts` | modify | Fix proxy target port 3000 → 3001 |
| `packages/server/src/index.ts` | modify | Fix default port `'3000'` → `'3001'` |
| `packages/server/src/campaigns/queries.ts` | modify | camelCase SQL aliases, nested entity queries for detail endpoint |
| `packages/server/src/campaigns/types.ts` | modify | Import `CampaignSummary` / `CampaignDetail` from updated `@mmf/shared` |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Update mock data shapes; multi-query mocks for detail test |
| `packages/client/src/api/campaigns.ts` | modify | Import from `@mmf/shared`; remove local types; unwrap `data`; remove mock |
| `packages/client/src/hooks/useCampaign.ts` | modify | Use `CampaignDetail` type |
| `packages/client/src/components/campaigns/CampaignCard.tsx` | modify | Compute progress from `raisedAmount`/`goalAmount`; update import |
| `packages/client/src/components/campaigns/FundingProgressSection.tsx` | modify | `targetAmount` → `goalAmount`; handle `deadline: Date \| null` |
| `packages/client/src/components/campaigns/MilestonesSection.tsx` | modify | Fix status maps; update import |
| `packages/client/src/components/campaigns/StretchGoalsSection.tsx` | modify | No `title` — use `description`; add `deliverables`; update import |
| `packages/client/src/components/campaigns/TeamSection.tsx` | modify | Update import |
| `packages/client/src/components/campaigns/CampaignUpdatesSection.tsx` | modify | No `title`; `date` → `postedAt`; update import |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Fix status maps to `CampaignStatus` enum values; update import |
| `packages/client/src/pages/CampaignDetailPage.test.tsx` | modify | Update mock to `CampaignDetail` shape |
| `packages/client/src/components/campaigns/FundingProgressSection.test.tsx` | modify | Update mock shape |
| `packages/client/src/components/campaigns/MilestonesSection.test.tsx` | modify | Update mock milestone status values |
| `packages/client/src/components/campaigns/StretchGoalsSection.test.tsx` | modify | Update mock stretch goal shape |
| `packages/client/src/components/campaigns/CampaignUpdatesSection.test.tsx` | modify | Update mock update shape (no title, postedAt) |
| `packages/client/src/components/campaigns/TeamSection.test.tsx` | modify | Update mock shape |

## Dependencies

No new npm packages required.
`zod` is already a dependency of `@mmf/shared`.
`@mmf/shared` workspace resolution handles all cross-package imports once `exports` is fixed and the client `package.json` is updated.

## Verification

- **Build**: `npm run build` succeeds from the repo root (builds all workspaces)
- **Server tests**: `npm test -w @mmf/server` — all existing route tests pass with updated mocks
- **Client tests**: `npm test -w @mmf/client` — all component and page tests pass with updated mocks
- **Visual (list page)**: `http://localhost:5173/campaigns` renders real campaign cards with live data (title, summary, raised/goal amounts, deadline) fetched from the server, no mock fallback
- **Visual (detail page)**: `http://localhost:5173/campaigns/<uuid>` renders full campaign detail including milestones, stretch goals, team members, and updates from the DB
- **Network**: DevTools Network tab shows `/v1/campaigns` and `/v1/campaigns/:id` returning 200 with `{ data: ... }` envelopes; no 502 or mock fallback data visible
