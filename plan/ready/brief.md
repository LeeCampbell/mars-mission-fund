# Brief: Issue #114 — Creator Dashboard and Campaign Submission Form

## Goal

Implement the creator-facing campaign management surfaces: a dashboard at `/dashboard` listing the creator's campaigns grouped by status with quick actions, a 7-step campaign creation form at `/campaigns/new`, and a pre-populated edit form at `/campaigns/:id/edit`.
Also add campaign update posting and milestone evidence submission to the existing campaign detail page for creators managing their own Live/Funded/Settlement campaigns.
This requires new backend write endpoints, database schema additions, shared input validation schemas, new API client functions and React Query mutation hooks, and component tests.

## Scope

### In scope

- DB migrations: add `creator_id` FK to `campaigns`, add `campaign_risks` table, add `budget_breakdown` text column, add `additional_image_urls` text[] column to campaigns
- Backend routes (all authenticated, Creator role required unless stated):
  - `GET /v1/campaigns/my` — list the calling user's campaigns
  - `POST /v1/campaigns` — create a new Draft campaign
  - `PATCH /v1/campaigns/:id` — update a Draft campaign (full or partial fields; creator owns it)
  - `DELETE /v1/campaigns/:id` — delete a Draft campaign
  - `POST /v1/campaigns/:id/submit` — transition Draft → Submitted (validates all required fields)
  - `POST /v1/campaigns/:id/updates` — post a campaign update (creator, Live or Funded status)
  - `POST /v1/campaigns/:id/milestones/:milestoneId/evidence` — submit milestone evidence (creator, Settlement status)
- Shared Zod schemas for `CreateCampaignInput`, `UpdateCampaignInput`, `RiskDisclosure`, `MilestoneInput`
- API client functions for all new endpoints in `packages/client/src/api/campaigns.ts`
- React Query hooks: `useMyCampaigns`, mutations for create/update/delete/submit/postUpdate/submitEvidence
- Creator dashboard page (`/dashboard`) — campaigns grouped by status, "New Campaign" CTA, per-campaign quick actions (Edit draft, Submit for review, View)
- Multi-step campaign creation form (`/campaigns/new`) with 7 steps:
  - Step 1: Mission Objectives (title, summary ≤280 chars, description, alignment statement)
  - Step 2: Team (add/remove team members: name, role, bio)
  - Step 3: Funding (min target USD, max cap USD, deadline, budget breakdown, category)
  - Step 4: Milestones (add/remove: title, description, target date, funding %, verification criteria; sum must equal 100%)
  - Step 5: Risks (add/remove risk disclosures: description + mitigation)
  - Step 6: Media (hero image URL, additional image URLs)
  - Step 7: Review & Submit (summary of all inputs, submit button, confirmation dialog)
- Draft edit page (`/campaigns/:id/edit`) — same multi-step form pre-populated with draft data
- Submit-for-review confirmation dialog on Step 7
- Campaign update posting form on `CampaignDetailPage` for creator's own Live/Funded campaigns
- Milestone evidence submission form on `CampaignDetailPage` for creator's own Settlement campaigns
- Client-side validation matching server-side rules (required fields, summary ≤280 chars, milestone % sum = 100%, funding target $1M–$1B, deadline 1 week–1 year from submission)
- `ProtectedRoute` extended to support `requireCreator` (Creator role)
- `App.tsx` route additions: `/dashboard`, `/campaigns/new`, `/campaigns/:id/edit`
- `Layout.tsx` routeTitles additions for new static routes
- Component tests for dashboard and each form step
- E2E Playwright tests for the core creator flow

### Out of scope

- Review pipeline UI (Reviewer/Admin claim and process reviews) — separate issue
- Campaign launch after approval (Approved → Live) — separate issue
- Stretch goals in the creation form (spec marks them optional; no UI step requested)
- Payment/funding mechanics and escrow — separate domain
- KYC enforcement (spec marks it theatre for local demo)
- Real-time funding progress polling
- Deadline enforcement automation

## Approach

### Database (new migrations, timestamp prefix `20260311`)

1. **Migration: add `creator_id` to `campaigns`**
   - `ALTER TABLE campaigns ADD COLUMN creator_id uuid REFERENCES accounts(id) ON DELETE SET NULL;`
   - No NOT NULL constraint initially (existing seeded rows have no owner); server enforces owner on creation.
2. **Migration: create `campaign_risks` table**
   - Columns: `id uuid PK`, `campaign_id uuid FK`, `description text NOT NULL`, `mitigation text NOT NULL`, `sort_order integer DEFAULT 0`
   - CASCADE delete.
3. **Migration: add `budget_breakdown` and `additional_image_urls` to `campaigns`**
   - `budget_breakdown text` (nullable; free-form text describing how funds will be spent)
   - `additional_image_urls text[] DEFAULT '{}'`

**Draft field nullability**: The existing schema requires NOT NULL on `title`, `summary`, `description`, `alignment_statement`, `category`, `min_funding_target_usd`, `max_funding_cap_usd`. Rather than migrating away NOT NULL constraints, creation will require at minimum a title (Step 1), use empty strings for other text fields, and 0 for funding amounts. Submission validation on the server will enforce all required fields are non-empty and amounts are within bounds before transitioning to Submitted.

### Shared types (`packages/shared/src/campaign.ts`)

Add:
- `RiskDisclosureSchema` — `{ id, description, mitigation, sortOrder }`
- `MilestoneInputSchema` — input shape for create/update (no id, no status)
- `CreateCampaignInputSchema` — minimum required fields to create a draft (title required; other fields optional with defaults)
- `UpdateCampaignInputSchema` — all fields optional (partial update)
- `CampaignDetailSchema` extended to include `creatorId`, `budgetBreakdown`, `additionalImageUrls`, `risks`

### Backend (`packages/server/src/campaigns/`)

Follow existing patterns: `createCampaignRouter(pool)` factory, parameterised queries in `queries.ts`, Zod validation on all inputs, `authenticate` middleware, new `requireRole('Creator')` usage from existing `requireRole` middleware.

Route order matters: define `GET /my` before `GET /:id` to avoid the UUID param catching `my`.

`POST /v1/campaigns` — creates Draft with `creator_id = req.user.id`.
`PATCH /v1/campaigns/:id` — checks ownership and Draft status; replaces related rows (milestones, team members, risks) atomically.
`POST /v1/campaigns/:id/submit` — validates all required fields, transitions status to Submitted.
`POST /v1/campaigns/:id/updates` — creates row in `campaign_updates`; checks campaign is Live or Funded and creator owns it.
`POST /v1/campaigns/:id/milestones/:milestoneId/evidence` — stores evidence text against the milestone; updates milestone status to Submitted; checks campaign is Settlement and creator owns it.

`getCampaignById` query must also be updated to SELECT `creator_id`, `budget_breakdown`, `additional_image_urls`, and to JOIN/query `campaign_risks` — so the detail page can display these fields and the edit form can pre-populate them.

**Optimistic updates**: `postCampaignUpdate` mutation can use `onMutate` to append the new update optimistically to the `useCampaign` cache (financial-safe — it's just content). `submitCampaign` must NOT be optimistic — wait for the server to confirm the status transition before updating the UI.

### Frontend

**API layer** (`src/api/campaigns.ts`): add `createCampaign`, `updateCampaign`, `deleteCampaign`, `submitCampaign`, `fetchMyCampaigns`, `postCampaignUpdate`, `submitMilestoneEvidence` — all using `authedFetch`.

**Hooks** (`src/hooks/`):
- `useMyCampaigns.ts` — `useQuery` wrapping `fetchMyCampaigns`
- `useCampaignMutations.ts` — `useMutation` hooks for create, update, delete, submit, postUpdate, submitEvidence

**Pages** (`src/pages/`):
- `DashboardPage.tsx` — uses `useMyCampaigns`; groups campaigns by status using a simple `reduce`; shows status badge, title, deadline; quick-action buttons.
- `CampaignNewPage.tsx` — manages current step and entire form state in `useState`; accumulates all data client-side through Steps 1–6; on Step 7 the user clicks "Save Draft" (calls `createCampaign` once, then navigates to `/campaigns/:id/edit` for any further edits) or "Submit for Review" (calls `createCampaign` then immediately `submitCampaign`). This deferred-creation approach avoids persisting partially-filled records to the DB mid-flow.
- `CampaignEditPage.tsx` — fetches existing campaign by id (uses existing `useCampaign`); pre-populates state; same step components; any step's "Save" calls `updateCampaign`.

**Components** (`src/components/campaigns/form/`):
- `StepIndicator.tsx` — horizontal step list showing current/completed/upcoming steps.
- `MissionObjectivesStep.tsx`, `TeamStep.tsx`, `FundingStep.tsx`, `MilestonesStep.tsx`, `RisksStep.tsx`, `MediaStep.tsx`, `ReviewSubmitStep.tsx` — each receives form state slice and an `onChange` callback; pure controlled components; perform field-level validation and show inline errors.

`CampaignDetailPage.tsx` — conditionally render `CampaignUpdateForm` or `MilestoneEvidenceForm` when `user.role === 'Creator'` and `user.id === campaign.creatorId` and the campaign is in the appropriate status.

**ProtectedRoute** — add optional `requireCreator?: boolean` prop; redirect to `/` if role is not Creator (or Admin, so admins can also access creator routes if needed — actually keep it strict: Creator only for creator routes).

**Routing** (`App.tsx`):
```tsx
<Route element={<ProtectedRoute requireCreator />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/campaigns/new" element={<CampaignNewPage />} />
  <Route path="/campaigns/:id/edit" element={<CampaignEditPage />} />
</Route>
```

**Page titles** (`Layout.tsx`):
- `/dashboard` → `Dashboard — Mars Mission Fund`
- `/campaigns/new` → `New Campaign — Mars Mission Fund`
(edit page title is dynamic: `Edit Campaign — Mars Mission Fund`)

### Tests

Component tests using Vitest + React Testing Library:
- `DashboardPage.test.tsx` — renders campaign groups, "New Campaign" button, quick actions
- `MissionObjectivesStep.test.tsx` — renders fields, summary char count, validation errors
- `MilestonesStep.test.tsx` — add/remove milestones, validates sum = 100%
- `RisksStep.test.tsx` — add/remove risks
- `CampaignNewPage.test.tsx` — step navigation, form state persistence across steps

E2E Playwright (`e2e/creator-dashboard.spec.ts`):
- Login as demo Creator → navigate to `/dashboard`
- Click "New Campaign" → complete 7 steps → submit draft
- Edit draft → change title → submit for review → confirm dialog → campaign shows as Submitted

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/db/migrations/20260311000003_add_creator_to_campaigns.sql` | create | Add `creator_id` FK to campaigns table |
| `packages/server/db/migrations/20260311000004_create_campaign_risks.sql` | create | New campaign_risks table |
| `packages/server/db/migrations/20260311000005_add_budget_and_images_to_campaigns.sql` | create | Add `budget_breakdown` and `additional_image_urls` columns |
| `packages/server/db/schema.sql` | modify | Updated schema reflecting new migrations |
| `packages/shared/src/campaign.ts` | modify | Add RiskDisclosure, MilestoneInput, CreateCampaignInput, UpdateCampaignInput schemas; extend CampaignDetailSchema |
| `packages/server/src/campaigns/types.ts` | modify | Add server-side input types derived from new schemas |
| `packages/server/src/campaigns/queries.ts` | modify | Add createCampaign, updateCampaign, deleteCampaign, submitCampaign, getMyCampaigns, createCampaignUpdate, submitMilestoneEvidence queries; update getCampaignById to return creatorId, budgetBreakdown, additionalImageUrls, risks |
| `packages/server/src/campaigns/routes.ts` | modify | Add GET /my, POST /, PATCH /:id, DELETE /:id, POST /:id/submit, POST /:id/updates, POST /:id/milestones/:milestoneId/evidence routes |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Add tests for all new endpoints |
| `packages/client/src/api/campaigns.ts` | modify | Add createCampaign, updateCampaign, deleteCampaign, submitCampaign, fetchMyCampaigns, postCampaignUpdate, submitMilestoneEvidence |
| `packages/client/src/hooks/useMyCampaigns.ts` | create | useQuery hook for creator's campaigns |
| `packages/client/src/hooks/useCampaignMutations.ts` | create | useMutation hooks for campaign write operations |
| `packages/client/src/pages/DashboardPage.tsx` | create | Creator dashboard |
| `packages/client/src/pages/DashboardPage.test.tsx` | create | Dashboard component tests |
| `packages/client/src/pages/CampaignNewPage.tsx` | create | Multi-step campaign creation page |
| `packages/client/src/pages/CampaignNewPage.test.tsx` | create | Creation form tests |
| `packages/client/src/pages/CampaignEditPage.tsx` | create | Draft editing page |
| `packages/client/src/components/campaigns/form/StepIndicator.tsx` | create | Step progress indicator |
| `packages/client/src/components/campaigns/form/MissionObjectivesStep.tsx` | create | Step 1 form fields |
| `packages/client/src/components/campaigns/form/MissionObjectivesStep.test.tsx` | create | Step 1 tests |
| `packages/client/src/components/campaigns/form/TeamStep.tsx` | create | Step 2 form fields |
| `packages/client/src/components/campaigns/form/FundingStep.tsx` | create | Step 3 form fields |
| `packages/client/src/components/campaigns/form/MilestonesStep.tsx` | create | Step 4 form fields |
| `packages/client/src/components/campaigns/form/MilestonesStep.test.tsx` | create | Milestone sum validation tests |
| `packages/client/src/components/campaigns/form/RisksStep.tsx` | create | Step 5 form fields |
| `packages/client/src/components/campaigns/form/RisksStep.test.tsx` | create | Risks add/remove tests |
| `packages/client/src/components/campaigns/form/MediaStep.tsx` | create | Step 6 form fields |
| `packages/client/src/components/campaigns/form/ReviewSubmitStep.tsx` | create | Step 7 review and submit with confirmation dialog |
| `packages/client/src/components/campaigns/CampaignUpdateForm.tsx` | create | Update posting UI for campaign detail |
| `packages/client/src/components/campaigns/MilestoneEvidenceForm.tsx` | create | Evidence submission UI for campaign detail |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Conditionally render update/evidence forms for creator |
| `packages/client/src/components/ProtectedRoute.tsx` | modify | Add `requireCreator` prop |
| `packages/client/src/App.tsx` | modify | Add /dashboard, /campaigns/new, /campaigns/:id/edit routes |
| `packages/client/src/components/Layout.tsx` | modify | Add routeTitles for /dashboard and /campaigns/new |
| `e2e/creator-dashboard.spec.ts` | create | End-to-end creator flow tests |

## Dependencies

- No new npm packages required — TanStack Query v5, Zod, and React are already installed.
- The demo Creator account must exist in `seed_accounts` migration (check `20260311000002_seed_accounts.sql`; add if missing).

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors
- **Type-check**: `npm run build -w @mmf/shared && npx tsc -b --noEmit` passes
- **Lint/format**: `npm run lint && npm run format:check` pass
- **Unit tests**: `npm run test:coverage` passes with ≥80% coverage threshold
- **Visual** (at `http://localhost:5173`):
  - Login as demo Creator → `/dashboard` shows existing campaigns grouped by status
  - "New Campaign" button navigates to `/campaigns/new`
  - Completing all 7 steps and submitting creates a Draft, visible on dashboard
  - Editing a Draft pre-populates all fields
  - "Submit for Review" shows confirmation dialog; confirming transitions status to Submitted
  - On a Live/Funded campaign detail page (when logged in as owner Creator), an update-posting form appears
  - On a Settlement campaign detail page (when logged in as owner Creator), milestone evidence forms appear
- **E2E flows** (Playwright):
  - `creator-dashboard.spec.ts`: Login as Creator → dashboard visible → create campaign → step navigation → submit draft → edit draft → submit for review → confirm dialog
