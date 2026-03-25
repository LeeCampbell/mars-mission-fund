# Brief: Issue #195 — Feature: add category filter and search to Explore Missions page

## Goal

The Explore Missions page (`/campaigns`) currently shows all campaigns in a single unfiltered list with no search or filter controls. As the campaign catalogue grows this becomes unusable. This issue asks for a keyword search input (matching title and summary) and a category filter using the existing 10-value taxonomy, with result count displayed, filter state preserved in the URL, and a clear-filters control — all per L4-003 §3 (discovery and search).

## Scope

**IN scope**

- Keyword search on campaign title and summary (case-insensitive ILIKE; no PostgreSQL full-text index required for demo)
- Category filter — multi-select from the existing `CampaignCategorySchema` enum (L4-003 §3.2 specifies multi-select)
- Debounced search input (300 ms) so the API is not called on every keystroke
- Visible result count ("N missions found")
- Clear-all-filters control that restores the full list
- URL query-string state (`?search=&categories=`) for back-button / shareability (L4-003 §3.2)
- Backend: extend `ListQuerySchema` with `search` and `categories` (array); update `listCampaigns()` SQL
- Frontend: new `CampaignFilters` component; update `fetchCampaigns`, `useCampaigns`, `CampaignsPage`
- Unit tests: `CampaignFilters` component, updated `useCampaigns` hook, backend list-query filter combinations
- E2E test: filter and search flow on `/campaigns`

**OUT of scope**

- Sort order controls (spec mentions them but the issue does not; avoid gold-plating)
- Funding-status filter, deadline range filter, contribution-amount range filter
- PostgreSQL full-text index / `tsvector` — ILIKE is sufficient for demo scale
- Pagination / infinite scroll
- Auto-complete suggestions or result highlighting
- Personalised recommendations, search history
- Any changes to campaign detail page or other routes

## Approach

### Backend

**`packages/server/src/campaigns/types.ts`** — extend `ListQuerySchema`:

```ts
export const ListQuerySchema = z.object({
  status: CampaignStatusSchema.optional(),
  category: CampaignCategorySchema.optional(),          // keep for backwards compat (createdBy=me path)
  categories: z.preprocess(                             // new: comma-separated or repeated param
    (v) => (typeof v === 'string' ? v.split(',') : v),
    z.array(CampaignCategorySchema)
  ).optional(),
  search: z.string().max(200).optional(),
  createdBy: z.literal('me').optional(),
})
```

Note: `category` (singular) is kept to avoid breaking the existing `createdBy=me` path used by `fetchMyCampaigns`.

**`packages/server/src/campaigns/queries.ts`** — update `listCampaigns()`:

- When `filters.categories` is a non-empty array, generate `category = ANY($n)` with a `text[]` param.
- When `filters.category` is set (single, legacy), keep the existing `category = $n` clause.
- When `filters.search` is set, add `(title ILIKE $n OR summary ILIKE $n)` with `%term%` value.
- `ORDER BY created_at DESC` is unchanged.

All params remain positional and parameterised — no raw string interpolation of user input (L2-002 §1.2).

### Frontend

**`packages/client/src/api/campaigns.ts`** — add `CampaignFilters` params type and update `fetchCampaigns`:

```ts
export interface CampaignFilterParams {
  search?: string
  categories?: string[]
}

export async function fetchCampaigns(filters?: CampaignFilterParams): Promise<CampaignSummary[]> {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.categories?.length) params.set('categories', filters.categories.join(','))
  const url = `/v1/campaigns${params.size ? `?${params}` : ''}`
  // ... rest unchanged
}
```

**`packages/client/src/hooks/useCampaigns.ts`** — accept filters, include in query key (so React Query re-fetches on change):

```ts
export function useCampaigns(filters?: CampaignFilterParams) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => fetchCampaigns(filters),
  })
}
```

**`packages/client/src/components/campaigns/CampaignFilters.tsx`** (new) — renders:

- A text input (`<input type="search">`) for keyword. Fires `onFiltersChange` after 300 ms debounce using `useRef` + `setTimeout` (no extra library).
- A multi-select category control: a set of toggle buttons (one per category), each rendering as a pill/chip. Active categories are visually indicated. Uses semantic tokens only (`--color-surface-elevated`, `--color-text-primary`, `--color-brand-primary`).
- A "Clear filters" button (shown only when any filter is active).
- Accepts `filters: CampaignFilterParams` and `onFiltersChange: (f: CampaignFilterParams) => void` as props.
- All interactive elements have accessible labels; toggle buttons use `aria-pressed`.

**`packages/client/src/pages/CampaignsPage.tsx`** — integrate filters and URL state:

- Read initial filter state from `useSearchParams()` (react-router v7, imported from `'react-router'`).
- On `onFiltersChange`, update `searchParams` with `setSearchParams` (replaces history entry — preserves back-button behaviour).
- Pass current filters to `useCampaigns(filters)`.
- Show result count below the filter bar: "N missions found" (or "Loading…" / error).
- The existing responsive CSS-in-JS grid is unchanged.

URL format: `/campaigns?search=propulsion&categories=Propulsion,Robotics+%26+Automation`

### Responsive / Design System

- `CampaignFilters` stacks vertically on mobile, lays out in a row on `sm` (640 px+) using the same CSS-in-JS `<style>` injection pattern already used in `CampaignsPage`.
- Exclusively uses Tier 2 semantic tokens (L2-001 §2.1–2.6). No hardcoded colour values.
- Category pills wrap naturally — no fixed-width columns needed.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/server/src/campaigns/types.ts` | modify | Add `categories` (array) and `search` to `ListQuerySchema` |
| `packages/server/src/campaigns/queries.ts` | modify | Add `ILIKE` search clause and `ANY($n)` multi-category clause in `listCampaigns()` |
| `packages/client/src/api/campaigns.ts` | modify | Add `CampaignFilterParams` type; update `fetchCampaigns` to build query string |
| `packages/client/src/hooks/useCampaigns.ts` | modify | Accept `CampaignFilterParams`; include in `queryKey` |
| `packages/client/src/components/campaigns/CampaignFilters.tsx` | create | Search input + category multi-select + clear button |
| `packages/client/src/pages/CampaignsPage.tsx` | modify | Integrate `CampaignFilters`, URL state via `useSearchParams`, result count |
| `packages/server/src/__tests__/campaigns.test.ts` | modify | Add cases for `search`, `categories`, and combined filter queries |
| `packages/client/src/components/campaigns/CampaignFilters.test.tsx` | create | Unit tests for filter component |
| `e2e/campaigns.spec.ts` | modify | Add filter/search E2E scenarios |

## Dependencies

No new npm packages required.

- `useSearchParams` from `react-router` v7 (already in dependencies; project imports from `'react-router'`, not `'react-router-dom'`).
- Debounce via native `setTimeout` / `clearTimeout` in a `useRef`.
- `Array.prototype.join(',')` for serialising multi-select into URL param.

## Verification

**Build**

```bash
npm run build -w @mmf/shared
npx tsc -b --noEmit
npx tsc --noEmit -p packages/server/tsconfig.json
npm run build
```

**Lint / format**

```bash
npm run lint
npm run format:check
```

**Unit tests**

```bash
npm run test:coverage
```

Coverage threshold is 80%; new files must be tested.

**Visual (browser at `http://localhost:5173/campaigns`)**

- Search input and category pills appear above the campaign grid.
- Typing in the search box (after 300 ms pause) narrows the list; result count updates.
- Clicking a category pill toggles it on/off; multiple can be active simultaneously; list re-fetches.
- "Clear filters" button appears when any filter is active; clicking it resets both controls and restores the full list.
- URL updates to reflect active filters; navigating away and pressing Back restores the filtered view.
- Layout remains responsive (1 / 2 / 3 column grid at mobile / sm / lg breakpoints).

**E2E flows** (to be covered in `e2e/campaigns.spec.ts`)

1. Visit `/campaigns` — full list is shown with no active filters.
2. Type a keyword in the search box — list narrows to matching campaigns; count updates.
3. Click a category pill — list further narrows to that category; URL contains `categories=…`.
4. Click "Clear filters" — full list is restored; URL has no filter params.
5. Apply a filter, navigate to a campaign detail, press Back — filter state is restored.
