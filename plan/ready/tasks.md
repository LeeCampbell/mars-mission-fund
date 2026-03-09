# Tasks: Issue #42 — Build campaign listing page

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Install TanStack Query and configure build/runtime infrastructure
  - **Goal**: Add `@tanstack/react-query` v5 as a dependency, configure the Vite proxy so `/v1` requests reach the Express backend, and wrap the React tree with `QueryClientProvider`.
  - **Details**:
    1. Run `npm install @tanstack/react-query` (v5).
    2. In `vite.config.ts`, add a `server.proxy` entry: `'/v1': 'http://localhost:3000'`.
    3. In `src/main.tsx`, import `QueryClient` and `QueryClientProvider` from `@tanstack/react-query`, create a `queryClient` instance, and wrap `<App />` with `<QueryClientProvider client={queryClient}>`.
  - **Files**: `package.json`, `vite.config.ts`, `src/main.tsx`
  - **Verify**: `npm run build` succeeds with no TypeScript errors; `vite.config.ts` contains the proxy rule; `src/main.tsx` renders `<QueryClientProvider>`.
  - **Brief ref**: Section "1 — Dependency & build config"

- [x] TASK-02: Create API layer (`src/api/campaigns.ts`)
  - **Goal**: Provide a typed `Campaign` interface and a `fetchCampaigns()` function that calls `GET /v1/campaigns` and throws on non-OK responses.
  - **Details**:
    - Export the `Campaign` interface exactly as specified in the brief (id, title, summary, category, status, raisedAmount, goalAmount, fundingProgressPct, deadline, heroImageUrl?).
    - Export `fetchCampaigns(): Promise<Campaign[]>` using `fetch('/v1/campaigns')`. Check `response.ok`; if false, throw an `Error` with the HTTP status text. Return `response.json()` cast to `Campaign[]`.
  - **Files**: `src/api/campaigns.ts` (create)
  - **Verify**: File exists; TypeScript compiles without errors (`npm run build`); the `Campaign` interface matches the brief spec.
  - **Brief ref**: Section "2 — API layer"

- [x] TASK-03: Create TanStack Query hook (`src/hooks/useCampaigns.ts`)
  - **Goal**: Expose a `useCampaigns()` hook that queries the API via TanStack Query with default `staleTime` (0).
  - **Details**:
    - Import `useQuery` from `@tanstack/react-query` and `fetchCampaigns` from `../api/campaigns`.
    - Export `useCampaigns()` which returns `useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns })`. Do not set `staleTime` (leave at default 0).
  - **Files**: `src/hooks/useCampaigns.ts` (create)
  - **Verify**: File exists; TypeScript compiles without errors; hook returns correct TanStack Query result shape.
  - **Brief ref**: Section "3 — Query hook"

- [x] TASK-04: Create `CampaignCard` component (`src/components/campaigns/CampaignCard.tsx`)
  - **Goal**: Build a composite card component that accepts a `Campaign` prop and renders a category badge, title, summary excerpt, funding progress bar, raised/goal amounts (USD), and time-remaining label — following the same inline `React.CSSProperties` + semantic-token pattern as existing components.
  - **Details**:
    - Create the directory `src/components/campaigns/` if it does not exist.
    - Use `<Card accent>`, `<Badge>`, `<ProgressBar>`, and `<Button>` primitives (same as `MissionCard.tsx`).
    - All visual styles must be `const xyzStyle: React.CSSProperties` objects using CSS custom properties (`var(--color-*)`, `var(--type-*)`, etc.). No hardcoded colours, font sizes, or Tailwind utility classes on visual properties.
    - Summary excerpt: truncate to ≤ 120 characters, appending `…` if truncated.
    - Raised/goal amounts: format as USD using `Intl.NumberFormat` (e.g. `$12,345`).
    - Time-remaining: compute difference between `campaign.deadline` (ISO 8601) and today's date; display as e.g. `"14 days left"` or `"Ended"` if past deadline.
    - `CampaignCard` accepts a single `campaign: Campaign` prop.
  - **Files**: `src/components/campaigns/CampaignCard.tsx` (create)
  - **Verify**: `npm run build` passes; component renders all required fields; no hardcoded colours or Tailwind visual classes.
  - **Brief ref**: Section "4 — CampaignCard component"

- [x] TASK-05: Create `CampaignsPage` (`src/pages/CampaignsPage.tsx`)
  - **Goal**: Page component that calls `useCampaigns()` and renders a responsive 1→2→3-column CSS grid of `CampaignCard`s, with accessible loading and error states.
  - **Details**:
    - Import `useCampaigns` and `CampaignCard`.
    - Loading state: render a `<div role="status" aria-busy="true">` containing `"Loading missions…"`.
    - Error state: render a brief, non-alarming message following brand voice (e.g. `"We couldn't load missions right now. Please try again later."`).
    - Success state: CSS grid of `<CampaignCard key={campaign.id} campaign={campaign} />`.
    - Inject grid breakpoint styles via `ensureStyle()` (same helper used in `Header.tsx`), targeting a class name unique to this page. Grid adapts at 640 px (2 cols) and 1024 px (3 cols).
    - Wrap all content in `<main id="main-content">` for the skip-to-content link.
  - **Files**: `src/pages/CampaignsPage.tsx` (create)
  - **Verify**: `npm run build` passes; component is exported; loading/error/success branches all present in source.
  - **Brief ref**: Section "5 — CampaignsPage"

- [x] TASK-06: Wire up route and navigation link
  - **Goal**: Register the `/campaigns` route in the router and add the "Explore Missions" nav link to the header so both desktop and mobile menus include it automatically.
  - **Details**:
    - `src/App.tsx`: import `CampaignsPage` and add `<Route path="/campaigns" element={<CampaignsPage />} />` inside the existing `<Route element={<Layout />}>` wrapper.
    - `src/components/Header.tsx`: locate the `navLinks` array and append `{ to: '/campaigns', label: 'Explore Missions', end: false }`. No other changes needed — both desktop and mobile menus render from this array.
  - **Files**: `src/App.tsx`, `src/components/Header.tsx`
  - **Verify**: `npm run build` passes; `App.tsx` contains the `/campaigns` route; `Header.tsx` `navLinks` array contains the new entry.
  - **Brief ref**: Section "6 — Routing & navigation"

- [ ] TASK-07: Final verification — build, lint, and tests
  - **Goal**: Confirm the full implementation compiles cleanly, passes linting, and does not break existing tests.
  - **Details**:
    - Run `npm run build` and confirm zero TypeScript errors.
    - Run `npm run lint` and confirm zero lint errors.
    - Run `npm test` and confirm the existing Button smoke tests (and any others) still pass.
    - Fix any issues found without changing behaviour beyond what was already implemented.
  - **Files**: Any files with lint or type errors (fix only)
  - **Verify**: All three commands exit with code 0.
  - **Brief ref**: Section "Verification"
