# Tasks: Issue #195 — Feature: add category filter and search to Explore Missions page

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Extend backend `ListQuerySchema` and update `listCampaigns()` SQL
  - **Goal**: Add `search` and `categories` filter support to the backend campaign list endpoint
  - **Details**:
    - In `packages/server/src/campaigns/types.ts`, extend `ListQuerySchema` with:
      - `categories`: `z.preprocess` that splits a comma-separated string into an array, then validates each value against `CampaignCategorySchema`; optional
      - `search`: `z.string().max(200).optional()`
      - Keep existing `category` (singular) field for backwards compat
    - In `packages/server/src/campaigns/queries.ts`, update `listCampaigns()`:
      - When `filters.categories` is a non-empty array, add `category = ANY($n)` with a `text[]` param
      - When `filters.category` is set (legacy single), keep existing `category = $n` clause
      - When `filters.search` is set, add `(title ILIKE $n OR summary ILIKE $n)` with `%term%` value
      - All params must remain positional and parameterised — no string interpolation of user input
      - `ORDER BY created_at DESC` unchanged
  - **Files**:
    - `packages/server/src/campaigns/types.ts`
    - `packages/server/src/campaigns/queries.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes with no errors
  - **Brief ref**: Backend section

- [x] TASK-02: Add backend unit tests for search and category filter combinations
  - **Goal**: Verify all new filter combinations work correctly at the query layer
  - **Details**:
    - In `packages/server/src/__tests__/campaigns.test.ts`, add test cases for:
      - `GET /v1/campaigns?search=<keyword>` — returns only campaigns whose title or summary match (case-insensitive)
      - `GET /v1/campaigns?categories=Propulsion` — returns only campaigns in that category
      - `GET /v1/campaigns?categories=Propulsion,Robotics+%26+Automation` — returns campaigns in either category
      - Combined: `?search=<keyword>&categories=<cat>` — intersection of both filters
      - Empty result: filters that match nothing return `[]`
    - Follow existing test patterns in the file (seeding test data, asserting response shape)
  - **Files**:
    - `packages/server/src/__tests__/campaigns.test.ts`
  - **Verify**: `npm run test:coverage` passes with no regressions and coverage ≥ 80%
  - **Brief ref**: Backend section, Verification section

- [ ] TASK-03: Update frontend API layer and `useCampaigns` hook
  - **Goal**: Thread `CampaignFilterParams` from the hook through to the API call
  - **Details**:
    - In `packages/client/src/api/campaigns.ts`:
      - Export a new `CampaignFilterParams` interface with optional `search?: string` and `categories?: string[]`
      - Update `fetchCampaigns` to accept an optional `filters?: CampaignFilterParams` argument
      - Build a `URLSearchParams` object: set `search` if truthy; set `categories` as a comma-joined string if the array is non-empty
      - Append the query string to the URL only when params are non-empty
    - In `packages/client/src/hooks/useCampaigns.ts`:
      - Accept an optional `filters?: CampaignFilterParams` argument
      - Include `filters` in the React Query `queryKey` so a change in filters triggers a re-fetch
      - Pass `filters` through to `fetchCampaigns`
  - **Files**:
    - `packages/client/src/api/campaigns.ts`
    - `packages/client/src/hooks/useCampaigns.ts`
  - **Verify**: `npx tsc -b --noEmit` passes; existing campaign-related unit tests still pass
  - **Brief ref**: Frontend section

- [ ] TASK-04: Create `CampaignFilters` component with unit tests
  - **Goal**: Implement the search input, category multi-select pills, and clear-filters control; cover with unit tests
  - **Details**:
    - Create `packages/client/src/components/campaigns/CampaignFilters.tsx`:
      - Props: `filters: CampaignFilterParams` and `onFiltersChange: (f: CampaignFilterParams) => void`
      - Render a `<input type="search">` for keyword. Use `useRef` + `setTimeout`/`clearTimeout` for 300 ms debounce; call `onFiltersChange` with updated `search` after the debounce fires
      - Render one toggle-pill `<button>` per category from `CampaignCategorySchema` enum values. Active pills are visually distinct. Each button has `aria-pressed={active}` and a visible label matching the category name
      - Clicking a pill toggles that category in/out of `filters.categories`; call `onFiltersChange` immediately (no debounce needed for clicks)
      - Render a "Clear filters" button only when `search` is non-empty or `categories` is non-empty; clicking resets to `{}`
      - Use only Tier 2 semantic CSS tokens (`--color-surface-elevated`, `--color-text-primary`, `--color-brand-primary`, etc.) — no hardcoded colour values
      - Responsive layout: vertical stack on mobile, horizontal row at `sm` (640 px) using the CSS-in-JS `<style>` injection pattern already used in `CampaignsPage`
    - Create `packages/client/src/components/campaigns/CampaignFilters.test.tsx`:
      - Test: renders all category pills
      - Test: search input calls `onFiltersChange` after debounce (use `vi.useFakeTimers`)
      - Test: clicking a category pill calls `onFiltersChange` with that category added
      - Test: clicking an active category pill removes it from the array
      - Test: "Clear filters" button is hidden when no filters are active
      - Test: "Clear filters" button appears when a filter is active and clicking it resets to `{}`
  - **Files**:
    - `packages/client/src/components/campaigns/CampaignFilters.tsx`
    - `packages/client/src/components/campaigns/CampaignFilters.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/components/campaigns/CampaignFilters.test.tsx` passes; `npx tsc -b --noEmit` passes
  - **Brief ref**: Frontend section

- [ ] TASK-05: Integrate filters into `CampaignsPage` with URL state and E2E coverage
  - **Goal**: Wire `CampaignFilters` into the Explore Missions page with URL-synced state and result count; verify with E2E tests
  - **Details**:
    - In `packages/client/src/pages/CampaignsPage.tsx`:
      - Import `useSearchParams` from `'react-router'` (not `'react-router-dom'`)
      - On mount, read initial filter state from search params: `search` string and `categories` as a comma-split array
      - Render `<CampaignFilters filters={filters} onFiltersChange={handleFiltersChange} />` above the campaign grid
      - In `handleFiltersChange`: call `setSearchParams` to update the URL (replace history entry, not push) with the new `search` and `categories` values; clear params that are empty/undefined
      - Pass current `filters` to `useCampaigns(filters)`
      - Below the filter bar and above the grid, show a result count line: "N missions found" when data is available; "Loading…" while fetching; surface error state if query fails
      - Keep the existing responsive CSS-in-JS grid unchanged
    - Update `e2e/campaigns.spec.ts` with the following scenarios (add to existing file, following existing patterns):
      1. Visit `/campaigns` — full list is shown, no active filter params in URL
      2. Type a keyword in the search box, wait for debounce — list narrows; count reflects filtered results
      3. Click a category pill — list further narrows; URL contains `categories=…`
      4. Click "Clear filters" — full list restored; URL has no filter params
      5. Apply a search filter, navigate to a campaign detail page, press Back — filter state is restored from URL
  - **Files**:
    - `packages/client/src/pages/CampaignsPage.tsx`
    - `e2e/campaigns.spec.ts`
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh e2e/campaigns.spec.ts` passes
  - **Brief ref**: Frontend section, Verification section (E2E flows)

- [ ] TASK-06: Full E2E regression and CI verification
  - **Goal**: Run the complete test suite as a final gate to confirm nothing is broken
  - **Details**: No new code — run the full suite and fix any regressions surfaced
  - **Files**: (none)
  - **Verify**: `./scripts/run-e2e.sh` (all tests) AND `./scripts/ci-check.sh` both pass cleanly
  - **Brief ref**: Verification section
