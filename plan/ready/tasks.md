# Tasks: Issue #43 — Build campaign detail and contribution placeholder pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Set up API layer and TanStack Query infrastructure
  - **Goal**: Establish `src/api/campaigns.ts` with full TypeScript types, `fetchCampaigns()`, and `fetchCampaign(id)` with mock fallback; install/configure TanStack Query provider and Vite proxy if not already present from Issue #42
  - **Details**:
    - Check if `@tanstack/react-query` is already installed (`package.json`); if not, `npm install @tanstack/react-query`
    - Check if `QueryClientProvider` is already wrapping the app in `src/main.tsx`; if not, add it
    - Check if `vite.config.ts` has a `/v1` proxy to `http://localhost:3001`; if not, add it
    - Create (or extend) `src/api/campaigns.ts` with these exported types: `Milestone` (id, title, targetDate, fundingPercentage, verificationCriteria, status: `'pending'|'active'|'completed'`), `StretchGoal` (id, title, description, targetAmount, unlocked), `TeamMember` (id, name, role, bio), `CampaignUpdate` (id, title, date, body), `Campaign` (id, title, description, heroImageUrl, status, category, raisedAmount, targetAmount, contributorCount, deadline, milestones, stretchGoals, teamMembers, updates)
    - Add `fetchCampaigns(): Promise<Campaign[]>` — `GET /v1/campaigns`, returns mock array on network error
    - Add `fetchCampaign(id: string): Promise<Campaign>` — `GET /v1/campaigns/:id`, returns a static mock object on network error; mock must include: ≥2 milestones, ≥1 stretch goal, ≥1 update, ≥2 team members
  - **Files**: `package.json`, `src/main.tsx`, `vite.config.ts`, `src/api/campaigns.ts`
  - **Verify**: `npm run build` succeeds; TypeScript reports no errors in `src/api/campaigns.ts`
  - **Brief ref**: Dependencies, Mock data strategy, `src/api/campaigns.ts` row in Files table

- [x] TASK-02: Create `useCampaign` hook
  - **Goal**: Provide a typed TanStack Query hook that fetches a single campaign by id
  - **Details**:
    - Create `src/hooks/useCampaign.ts`
    - Export `useCampaign(id: string)` — calls `useQuery({ queryKey: ['campaign', id], queryFn: () => fetchCampaign(id), staleTime: 0 })`
    - Return the full query result (data, isLoading, isError, error) so callers can handle all states
  - **Files**: `src/hooks/useCampaign.ts`
  - **Verify**: `npm run build` succeeds with no TypeScript errors; hook file exports `useCampaign`
  - **Brief ref**: `src/hooks/useCampaign.ts` row in Files table, L3-005 §1.3 staleTime requirement

- [x] TASK-03: Create `FundingProgressSection` component
  - **Goal**: Display raised/target amounts, contributor count, time remaining, a `ProgressBar`, and a "Contribute" button linking to `/contribute/:id`
  - **Details**:
    - Create `src/components/campaigns/FundingProgressSection.tsx`
    - Props interface: `{ campaign: Campaign; className?: string }`
    - Calculate funding percentage: `(raisedAmount / targetAmount) * 100`
    - Format currency amounts (e.g. `$12,345`)
    - Compute time remaining from `campaign.deadline` (show days remaining or "Ended")
    - Use `ProgressBar` component with the calculated percentage
    - Include a primary `Button` with `href={'/contribute/' + campaign.id}` labelled "Contribute Now"
    - All styles via inline `React.CSSProperties` using semantic tokens (`var(--color-*)`, `var(--type-*)`, `var(--radius-*)`, `var(--motion-*)`); no hardcoded hex values or pixel font sizes
  - **Files**: `src/components/campaigns/FundingProgressSection.tsx`
  - **Verify**: `npm run build` succeeds; component renders ProgressBar, formatted amounts, contributor count, time remaining, and Contribute button
  - **Brief ref**: `FundingProgressSection` row in Files table, Page layout §Sidebar

- [x] TASK-04: Create `MilestonesSection` component
  - **Goal**: Render an ordered list of campaign milestones with status indicators
  - **Details**:
    - Create `src/components/campaigns/MilestonesSection.tsx`
    - Props interface: `{ milestones: Milestone[]; className?: string }`
    - Display each milestone: title, target date (formatted), funding percentage with `ProgressBar`, verification criteria, and status (`pending` / `active` / `completed`) using `Badge` component or equivalent semantic-token-coloured indicator
    - Order milestones as provided (they arrive ordered from API)
    - All styles via inline `React.CSSProperties` with semantic tokens
  - **Files**: `src/components/campaigns/MilestonesSection.tsx`
  - **Verify**: `npm run build` succeeds; component renders milestone items with title, date, progress, and status
  - **Brief ref**: `MilestonesSection` row in Files table

- [ ] TASK-05: Create `StretchGoalsSection` component
  - **Goal**: Render stretch goal tiers; component must render nothing when no stretch goals exist
  - **Details**:
    - Create `src/components/campaigns/StretchGoalsSection.tsx`
    - Props interface: `{ stretchGoals: StretchGoal[]; className?: string }`
    - Return `null` (render nothing) when `stretchGoals.length === 0`
    - Display each stretch goal: title, description, target amount (formatted), and unlocked/locked state (visual distinction via semantic tokens, e.g. `var(--color-status-success)` vs muted)
    - All styles via inline `React.CSSProperties` with semantic tokens
  - **Files**: `src/components/campaigns/StretchGoalsSection.tsx`
  - **Verify**: `npm run build` succeeds; component renders goals when present and renders nothing when array is empty
  - **Brief ref**: `StretchGoalsSection` row in Files table

- [ ] TASK-06: Create `CampaignUpdatesSection` and `TeamSection` components
  - **Goal**: Two smaller components — creator updates list and team member cards
  - **Details**:
    - Create `src/components/campaigns/CampaignUpdatesSection.tsx`
      - Props: `{ updates: CampaignUpdate[]; className?: string }`
      - When `updates.length === 0`, render a "No updates yet." empty-state message
      - Otherwise render each update: title, formatted date, body text
    - Create `src/components/campaigns/TeamSection.tsx`
      - Props: `{ teamMembers: TeamMember[]; className?: string }`
      - Render each member: name (heading), role (subheading), bio (paragraph)
      - Use `Card` component per team member or a consistent card-like container
    - All styles via inline `React.CSSProperties` with semantic tokens; no hardcoded colours
  - **Files**: `src/components/campaigns/CampaignUpdatesSection.tsx`, `src/components/campaigns/TeamSection.tsx`
  - **Verify**: `npm run build` succeeds; `CampaignUpdatesSection` shows empty-state when updates is `[]`; `TeamSection` renders name/role/bio for each member
  - **Brief ref**: `CampaignUpdatesSection` and `TeamSection` rows in Files table

- [ ] TASK-07: Create `CampaignDetailPage`
  - **Goal**: Assemble all section components into the full campaign detail layout, reading `:id` from the URL
  - **Details**:
    - Create `src/pages/CampaignDetailPage.tsx`
    - Read `id` from React Router `useParams`
    - Call `useCampaign(id)` and handle loading (`isLoading`) and error (`isError`) states with appropriate messages/spinners using semantic tokens
    - Page structure (top to bottom):
      1. Hero image (full-width `<img>` or `<div>` with `backgroundImage`) with gradient overlay using `var(--gradient-campaign-hero)` (or nearest available gradient token); if token doesn't exist, use a dark-to-transparent linear-gradient inline
      2. Campaign title with `--font-heading` (or `var(--type-scale-*)` heading token), `Badge` for status, category label
      3. At `--breakpoint-lg` (≥1024 px): two-column layout with main (~65%) left and sticky sidebar (~35%) right; below that breakpoint, single column with sidebar below main
      4. Main column order: description, `TeamSection`, `MilestonesSection`, `StretchGoalsSection`, `CampaignUpdatesSection`
      5. Sidebar: `FundingProgressSection`
    - Use `React.CSSProperties` with a media-query workaround (add a `<style>` tag inline or use a conditional className) for the responsive breakpoint — follow whatever pattern existing pages use, or use a simple approach with a CSS class in a `<style>` tag
    - Import and use `Badge` from `src/components/ui/Badge`; import `Card` where appropriate
  - **Files**: `src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npm run build` succeeds; page renders all sections, loading/error states are handled
  - **Brief ref**: `CampaignDetailPage` row in Files table, Page layout section

- [ ] TASK-08: Create `ContributePlaceholderPage`
  - **Goal**: Simple "Coming Soon" placeholder page that links back to the campaign detail
  - **Details**:
    - Create `src/pages/ContributePlaceholderPage.tsx`
    - Read `id` from React Router `useParams`
    - Centred layout with a `Card` component containing:
      - "Coming Soon" heading (using `var(--type-*)` heading token)
      - Paragraph explaining the contribution flow is in development
      - Ghost `Button` with `href={'/campaigns/' + id}` labelled "Back to Campaign"
    - All styles via inline `React.CSSProperties` with semantic tokens
  - **Files**: `src/pages/ContributePlaceholderPage.tsx`
  - **Verify**: `npm run build` succeeds; page renders heading, message, and back-link button
  - **Brief ref**: `ContributePlaceholderPage` row in Files table, `ContributePlaceholderPage` layout section

- [ ] TASK-09: Add routes and lazy loading to `App.tsx`
  - **Goal**: Register `/campaigns/:id` and `/contribute/:id` routes with `React.lazy` + `Suspense`
  - **Details**:
    - Open `src/App.tsx`
    - Convert existing page imports to `React.lazy` if not already lazy-loaded (apply to `CampaignListingPage` from Issue #42 if present, and all new pages)
    - Import `React`, `Suspense`, and `lazy` from `react`
    - Lazy-load: `const CampaignDetailPage = React.lazy(() => import('./pages/CampaignDetailPage'))` and `const ContributePlaceholderPage = React.lazy(() => import('./pages/ContributePlaceholderPage'))`
    - Wrap `<Routes>` (or each lazy route) in `<Suspense fallback={<div>Loading…</div>}>`
    - Add inside the `<Route element={<Layout />}>` wrapper:
      ```tsx
      <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      <Route path="/contribute/:id" element={<ContributePlaceholderPage />} />
      ```
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` succeeds; navigating to `/campaigns/1` and `/contribute/1` renders the correct pages
  - **Brief ref**: Routing section, `src/App.tsx` row in Files table, L3-005 §1.4 code-splitting requirement

- [ ] TASK-10: Write smoke tests for new components and pages
  - **Goal**: Ensure all new components have basic render tests following the Button test pattern
  - **Details**:
    - Create test files alongside each new component/page using Vitest + React Testing Library (same setup as `src/components/ui/Button.test.tsx`)
    - `src/components/campaigns/FundingProgressSection.test.tsx`: renders raised amount, target amount, contributor count, and Contribute button given a mock campaign
    - `src/components/campaigns/MilestonesSection.test.tsx`: renders milestone titles; verify at least one milestone item appears
    - `src/components/campaigns/StretchGoalsSection.test.tsx`: renders stretch goal title when goals present; renders nothing (null) when empty array passed
    - `src/components/campaigns/CampaignUpdatesSection.test.tsx`: renders update titles when present; renders "No updates yet" when empty
    - `src/components/campaigns/TeamSection.test.tsx`: renders team member names and roles
    - `src/pages/CampaignDetailPage.test.tsx`: smoke test — mock `useCampaign` to return a complete mock campaign; assert page renders campaign title
    - `src/pages/ContributePlaceholderPage.test.tsx`: renders "Coming Soon" heading and back-link
    - Wrap components that use React Router hooks (`useParams`) with a `MemoryRouter` in tests
    - Wrap components that use TanStack Query hooks with a `QueryClientProvider` in tests
  - **Files**: `src/components/campaigns/FundingProgressSection.test.tsx`, `src/components/campaigns/MilestonesSection.test.tsx`, `src/components/campaigns/StretchGoalsSection.test.tsx`, `src/components/campaigns/CampaignUpdatesSection.test.tsx`, `src/components/campaigns/TeamSection.test.tsx`, `src/pages/CampaignDetailPage.test.tsx`, `src/pages/ContributePlaceholderPage.test.tsx`
  - **Verify**: `npm test` passes with all new tests green; `npm run build` and `npm run lint` also pass
  - **Brief ref**: Verification section (Tests), Button test pattern
