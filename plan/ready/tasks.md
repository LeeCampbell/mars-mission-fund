# Tasks: Issue #4 — Build Homepage, About, and Contact pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Merge issue #3 branch onto current branch
  - **Goal**: Get the frontend project files (Vite + React 19 + Tailwind v4 + React Router v7, all primitives, layout shell) onto this branch so subsequent tasks can build on them
  - **Details**: Run `git fetch origin` then merge or rebase `origin/feat/issue-3-create-design-system-primitives-and-layo` onto the current branch. Confirm that `src/components/ui/`, `src/components/Layout.tsx`, `src/tokens.css`, `App.tsx`, and `package.json` are all present and `npm install` succeeds.
  - **Files**: No new files — just git history changes + whatever issue #3 added
  - **Verify**: `npm install` exits 0; `src/components/ui/Button.tsx`, `src/tokens.css`, `src/components/Layout.tsx` all exist
  - **Brief ref**: Approach — "Issue #3 must be merged before implementation begins"

- [x] TASK-02: Create `MissionCard` composite component
  - **Goal**: Build the reusable `MissionCard` component that composes `Card accent`, `Badge`, title, description, `ProgressBar`, funding status text, and a ghost `Button`
  - **Details**: Create `src/components/MissionCard.tsx`. Props: `badge` (variant: `funded | active | new`), `title`, `description`, `progress` (0–100), `fundingText`, `ctaLabel`. Use `var(--...)` semantic tokens only for inline styles. Include a `<style>` tag with `href` + `precedence` per the existing React 19 pattern for any layout-specific CSS.
  - **Files**: `src/components/MissionCard.tsx`
  - **Verify**: File exists; no TypeScript errors (`npm run build` or `tsc --noEmit`); imports resolve correctly
  - **Brief ref**: Scope — "One composite component for mission cards: MissionCard"; Implementation note 4

- [x] TASK-03: Create `HeroSection` component
  - **Goal**: Full-viewport hero with display heading, subtext, primary CTA button, and ambient glow animation
  - **Details**: Create `src/components/HeroSection.tsx`. Background: `var(--gradient-hero)`. Heading: `font-family: var(--font-family-display)`, uppercase, 48px mobile / 72px md / 96px xl. Ambient glow: absolutely positioned div with `animation: ... var(--motion-ambient)` wrapped in `@media (prefers-reduced-motion: no-preference)` (use a `<style>` tag). CTA: `Button variant="primary"` with text "Explore Missions". `min-height: 100dvh`.
  - **Files**: `src/components/HeroSection.tsx`
  - **Verify**: Component renders without errors; heading font resolves to Bebas Neue; glow animation is present in CSS; no Tier 1 token refs or raw hex values
  - **Brief ref**: Implementation note 1

- [x] TASK-04: Create `StatsSection` component
  - **Goal**: Platform impact stats section with a `SectionLabel` and 4 `StatCard` components in a responsive grid
  - **Details**: Create `src/components/StatsSection.tsx`. Use `SectionLabel number={1} label="PLATFORM IMPACT"` + a section heading + 4× `StatCard` with realistic copy (e.g., missions funded, total raised, active researchers, success rate). Grid: 1-col default → 2-col at 640px → 4-col at 1024px. Use `<style>` tag for breakpoint CSS.
  - **Files**: `src/components/StatsSection.tsx`
  - **Verify**: 4 StatCards render; grid collapses/expands at the correct breakpoints (visual check or snapshot)
  - **Brief ref**: Implementation note 2

- [x] TASK-05: Create `HowItWorksSection` component
  - **Goal**: Three-step explainer section using `Card accent` components
  - **Details**: Create `src/components/HowItWorksSection.tsx`. Use `SectionLabel number={2} label="HOW IT WORKS"` + section heading + 3× `Card accent`. Each card: step number styled with `var(--font-size-stat-value-compact)` and `var(--color-text-accent)`, step title in `var(--font-size-card-title)`, body in `var(--font-size-body)`. Grid: 1-col → 3-col at 1024px. Use `<style>` tag for breakpoints.
  - **Files**: `src/components/HowItWorksSection.tsx`
  - **Verify**: 3 step cards render with correct typography tokens; grid is responsive; no raw colours
  - **Brief ref**: Implementation note 3

- [ ] TASK-06: Create `FeaturedMissionsSection` component
  - **Goal**: Active missions grid with `SectionLabel` and 3 `MissionCard` components
  - **Details**: Create `src/components/FeaturedMissionsSection.tsx`. Use `SectionLabel number={3} label="ACTIVE MISSIONS"` + section heading + 3× `MissionCard` with varied badge variants (`active`, `funded`, `new`), realistic mission titles/descriptions, varied progress values. Grid: 1-col → 2-col at 768px → 3-col at 1024px. Use `<style>` tag for breakpoints.
  - **Files**: `src/components/FeaturedMissionsSection.tsx`
  - **Verify**: 3 MissionCards render with different badge variants, visible progress bars, and CTA buttons
  - **Brief ref**: Implementation note 4

- [ ] TASK-07: Create `ClosingCtaSection` component
  - **Goal**: Closing call-to-action section with gradient background, centred content, and secondary button
  - **Details**: Create `src/components/ClosingCtaSection.tsx`. Background: `var(--gradient-surface-card)`. Centred heading + body paragraph + `Button variant="secondary"`. Adequate vertical padding (`var(--space-section-y)` or equivalent token).
  - **Files**: `src/components/ClosingCtaSection.tsx`
  - **Verify**: Section renders with correct gradient background and secondary button; no raw hex or Tier 1 tokens
  - **Brief ref**: Implementation note 5

- [ ] TASK-08: Create `HomePage.tsx` page component
  - **Goal**: Assemble all five homepage section components into a single page
  - **Details**: Create `src/pages/HomePage.tsx`. Import and render in order: `HeroSection`, `StatsSection`, `HowItWorksSection`, `FeaturedMissionsSection`, `ClosingCtaSection`. No additional markup beyond the fragment wrapper. Page `<title>` is already handled by `Layout.tsx`.
  - **Files**: `src/pages/HomePage.tsx`
  - **Verify**: File exists; all 5 section imports resolve; `npm run build` succeeds
  - **Brief ref**: Scope — "HomePage.tsx page component with five sections"

- [ ] TASK-09: Create `AboutPage.tsx` page component
  - **Goal**: About page with four labelled sections: mission statement, problem/solution, principles grid, persona cards
  - **Details**: Create `src/pages/AboutPage.tsx`. Four sections each prefixed with `SectionLabel` (01–04): (1) mission statement — heading + body drawn from `specs/product-vision-and-mission.md` §1.1–1.2; (2) problem/solution — two-column layout at lg with problem on left and solution on right (use `<style>` for breakpoint); (3) principles — 5× `Card accent` in grid (2-col at 640px, 3-col at 1024px, last card centred on 3-col row); (4) personas — 4× `Card` in grid (1-col → 2-col at 768px → 4-col at 1024px). All copy from L1-001 §1.1–1.4. All styles use `var(--...)` tokens only.
  - **Files**: `src/pages/AboutPage.tsx`
  - **Verify**: All 4 sections render; principles shows 5 cards; personas shows 4 cards; `npm run build` succeeds
  - **Brief ref**: Implementation note 6; Scope — "AboutPage.tsx page component with four sections"

- [ ] TASK-10: Create `ContactPage.tsx` page component
  - **Goal**: Contact page with static contact info and social links — no form
  - **Details**: Create `src/pages/ContactPage.tsx`. Two sections: (01) GET IN TOUCH — contact details (email, GitHub org, general inquiry address) inside `Card` components; (02) FOLLOW THE MISSION — social/community links rendered as `Button variant="ghost"` or styled anchors. No `<form>` element anywhere. Each section prefixed with `SectionLabel`.
  - **Files**: `src/pages/ContactPage.tsx`
  - **Verify**: Two sections render; no form element; all links are real anchor elements; `npm run build` succeeds
  - **Brief ref**: Implementation note 7; Scope — "ContactPage.tsx … contact info and social links (no form)"

- [ ] TASK-11: Wire pages into `App.tsx` and verify full build
  - **Goal**: Replace stub page components in `App.tsx` with real imports from `src/pages/` and confirm everything builds and runs
  - **Details**: Modify `src/App.tsx` — remove the inline stub components (or inline JSX) for `/`, `/about`, `/contact` routes and replace with `import HomePage from './pages/HomePage'`, `import AboutPage from './pages/AboutPage'`, `import ContactPage from './pages/ContactPage'`. Run `npm run build` to confirm zero TypeScript or Vite errors.
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` exits 0 with no errors; `npm run dev` serves the app; navigating between `/`, `/about`, `/contact` in the browser renders each page without full reload
  - **Brief ref**: Scope — "Wiring up pages in App.tsx"; Verification section
