# Tasks: Issue #4 — Build Homepage, About, and Contact pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Rebase onto Issue #3 branch and verify dependencies
  - **Goal**: Ensure all design system primitives and layout shell from Issue #3 are available on the current branch
  - **Details**: Rebase `feat/issue-4-build-homepage-about-and-contact-pages` onto `origin/feat/issue-3-create-design-system-primitives-and-layo`. Verify that `src/components/ui/`, `src/tokens.css`, `src/index.css`, and the Layout/Header/Footer components all exist. Run `npm run build` to confirm the baseline builds clean.
  - **Files**: No new files — git rebase only
  - **Verify**: `npm run build` succeeds; `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/StatCard.tsx`, `src/components/ui/SectionLabel.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/ProgressBar.tsx` all exist; `src/tokens.css` exists
  - **Brief ref**: "Dependencies" section

- [x] TASK-02: Create MissionCard composite component
  - **Goal**: Build the `MissionCard` reusable composite used in `FeaturedMissionsSection`
  - **Details**: Create `src/components/MissionCard.tsx`. Accept props: `title`, `description`, `badge` (label string), `progress` (0–100 number), `raised` (string), `goal` (string). Render: Card wrapper with a top accent bar (using `--color-accent` border or pseudo-element), Badge, title in `--type-heading-sm`, description, ProgressBar with ARIA attributes (`aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`), funding status text ("Raised X of Y"), ghost variant Button "View Mission" (`href="#"`). Use only `var(--semantic-token)` for colours and sizes.
  - **Files**: `src/components/MissionCard.tsx`
  - **Verify**: Component file exists and TypeScript compiles without errors (`npm run build`)
  - **Brief ref**: "MissionCard composite" and Files table

- [ ] TASK-03: Create HeroSection component
  - **Goal**: Build the full-viewport hero section for the Homepage
  - **Details**: Create `src/components/HeroSection.tsx`. Full-viewport height (`min-h-screen` or 100dvh). Background uses `var(--gradient-hero)`. Heading "CROWDFUNDING THE NEXT GIANT LEAP" in `var(--type-hero)` with responsive sizing (48px mobile → 72px md → 96px xl) via CSS custom property or Tailwind responsive classes. Subtext copy beneath heading. Primary Button "Explore Missions" linking to `href="#"`. Ambient radial glow `<div>` decoration element — apply `prefers-reduced-motion: reduce` media query via CSS to set `opacity: 0` or `display: none` on the glow element. Ensure heading has appropriate semantic level (`<h1>`).
  - **Files**: `src/components/HeroSection.tsx`
  - **Verify**: Component exists; `npm run build` passes; glow element present in markup with reduced-motion CSS
  - **Brief ref**: "Homepage structure — HeroSection"

- [ ] TASK-04: Create StatsSection component
  - **Goal**: Build the stats/platform-impact section with 4 StatCards
  - **Details**: Create `src/components/StatsSection.tsx`. Include SectionLabel with text "01 — PLATFORM IMPACT" and section `<h2>` "THE NUMBERS SO FAR". Render 4 StatCards in a responsive grid: 1 column default → 2 columns at `sm` (640px) → 4 columns at `lg` (1024px). Use placeholder stat data: e.g. "$4.2M Funded", "127 Missions", "18,400 Backers", "94% Success Rate". Section padding via semantic spacing tokens.
  - **Files**: `src/components/StatsSection.tsx`
  - **Verify**: Component exists; `npm run build` passes; 4 StatCards visible in grid
  - **Brief ref**: "Homepage structure — StatsSection"

- [ ] TASK-05: Create HowItWorksSection component
  - **Goal**: Build the 3-step explainer section for the Homepage
  - **Details**: Create `src/components/HowItWorksSection.tsx`. SectionLabel "02 — HOW IT WORKS", `<h2>` "FROM BACKER TO MISSION PARTNER". Three Card components in a responsive grid: 1 column → 3 columns at `lg` (1024px). Step cards: (1) "Discover" — Browse active missions aligned with your vision. (2) "Back" — Pledge your support and join the mission team. (3) "Track" — Follow progress with real-time mission updates. Each card may include a step number label. Use only semantic tokens for styling.
  - **Files**: `src/components/HowItWorksSection.tsx`
  - **Verify**: Component exists; `npm run build` passes; 3 step Cards in grid
  - **Brief ref**: "Homepage structure — HowItWorksSection"

- [ ] TASK-06: Create FeaturedMissionsSection component
  - **Goal**: Build the featured missions grid section for the Homepage
  - **Details**: Create `src/components/FeaturedMissionsSection.tsx`. SectionLabel "03 — ACTIVE MISSIONS", `<h2>` "MISSIONS SEEKING BACKERS". Three `MissionCard` components in a responsive grid: 1 column → 2 columns at `md` (768px) → 3 columns at `lg` (1024px). Use placeholder mission data for the three cards: e.g. "Lunar Regolith Harvester", "Deep Space Comms Array", "Mars Atmospheric Processor" with realistic badge labels (e.g. "PROPULSION", "COMMS", "LIFE SUPPORT"), progress values, and funding amounts.
  - **Files**: `src/components/FeaturedMissionsSection.tsx`
  - **Verify**: Component exists; `npm run build` passes; 3 MissionCards render in grid
  - **Brief ref**: "Homepage structure — FeaturedMissionsSection"

- [ ] TASK-07: Create ClosingCtaSection component
  - **Goal**: Build the closing call-to-action section for the Homepage
  - **Details**: Create `src/components/ClosingCtaSection.tsx`. Background uses `var(--gradient-surface-card)`. Centered content: `<h2>` "EVERY DOLLAR MOVES THE LAUNCH WINDOW CLOSER", brief subtext copy, secondary variant Button "Browse All Missions" (`href="#"`). Generous vertical padding. Use only semantic tokens.
  - **Files**: `src/components/ClosingCtaSection.tsx`
  - **Verify**: Component exists; `npm run build` passes
  - **Brief ref**: "Homepage structure — ClosingCtaSection"

- [ ] TASK-08: Create HomePage page component
  - **Goal**: Assemble all five homepage sections into the HomePage page component
  - **Details**: Create `src/pages/HomePage.tsx`. Import and render in order: `HeroSection`, `StatsSection`, `HowItWorksSection`, `FeaturedMissionsSection`, `ClosingCtaSection`. Wrap in a `<main>` element with `id="main-content"` to support skip-to-content (the Layout shell may already provide this — check and coordinate). No additional styling needed at the page level beyond what each section provides.
  - **Files**: `src/pages/HomePage.tsx`
  - **Verify**: Component exists and imports all five sections; `npm run build` passes
  - **Brief ref**: "Homepage structure" and Files table

- [ ] TASK-09: Create AboutPage page component
  - **Goal**: Build the four-section About page
  - **Details**: Create `src/pages/AboutPage.tsx`. Four sections, each using SectionLabel + `<h2>` + content:
    1. **Mission Statement** — SectionLabel "OUR MISSION", heading "WE EXIST TO FUND THE FUTURE OF SPACE", narrative paragraph about democratizing space investment.
    2. **Problem/Solution** — SectionLabel "THE CHALLENGE", heading "THE FUNDING GAP IS THE FINAL FRONTIER", two-column (md) Card layout: Problem card and Solution card with descriptive copy.
    3. **Principles** — SectionLabel "HOW WE OPERATE", heading "FIVE PRINCIPLES THAT GUIDE EVERY DECISION", 5 Cards in responsive grid (1col → 2col sm → 3col lg): Transparency, Accountability, Accessibility, Long-term Thinking, Community First.
    4. **Who We Serve** — SectionLabel "OUR COMMUNITY", heading "BUILT FOR BELIEVERS IN THE MISSION", 4 persona Cards in responsive grid (1col → 2col md): Individual Backers, Mission Teams, Corporate Partners, Research Institutions.
    Wrap all sections in `<main id="main-content">`. Use only semantic tokens for styling.
  - **Files**: `src/pages/AboutPage.tsx`
  - **Verify**: Component exists; `npm run build` passes; 4 sections render with correct headings
  - **Brief ref**: "AboutPage structure" and Files table

- [ ] TASK-10: Create ContactPage page component
  - **Goal**: Build the static contact information page (no form)
  - **Details**: Create `src/pages/ContactPage.tsx`. Two sections:
    1. **Contact Details** — SectionLabel "GET IN TOUCH", heading "WE'D LOVE TO HEAR FROM YOU", Card-based layout with: email (`missions@marsmissionfund.com`), address (placeholder), hours ("Monday–Friday, 09:00–18:00 UTC"). Single column mobile, two columns at `md`.
    2. **Social Links** — SectionLabel "FOLLOW THE MISSION", heading "JOIN US ON SOCIAL", Cards or styled links for: X/Twitter, LinkedIn, YouTube, Instagram — each with platform name and handle/URL as accessible `<a>` elements with `aria-label`. No form elements anywhere.
    Wrap in `<main id="main-content">`. Use only semantic tokens.
  - **Files**: `src/pages/ContactPage.tsx`
  - **Verify**: Component exists; `npm run build` passes; no `<form>` element in output; contact details visible
  - **Brief ref**: "ContactPage structure" and Files table

- [ ] TASK-11: Wire pages into App.tsx and verify routing
  - **Goal**: Replace placeholder stubs in `src/App.tsx` with real page imports and verify navigation works
  - **Details**: Open `src/App.tsx`. Remove the inline placeholder `HomePage`, `AboutPage`, and `ContactPage` stub components. Add import statements for `./pages/HomePage`, `./pages/AboutPage`, and `./pages/ContactPage`. Confirm the route definitions already reference these component names (they should — only the definitions change, not the route config). Run `npm run build` to confirm zero TypeScript errors. Then do a visual browser check: start dev server, navigate between all three pages via header links, confirm document titles update and no full-page reloads occur.
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` succeeds with zero errors; dev server shows all three pages with real content; React Router navigation works without full reload
  - **Brief ref**: "Files to Create/Modify — App.tsx" and "Verification" section

- [ ] TASK-12: Accessibility and token compliance audit
  - **Goal**: Verify WCAG 2.1 AA compliance and confirm zero hardcoded values across all new components
  - **Details**: Review all created files for: (1) Every interactive element (`<a>`, `<button>`) has visible focus styles inherited from design system or explicitly set via `var(--color-focus-ring)` or equivalent token. (2) All `ProgressBar` usages have `aria-label`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`. (3) Social link `<a>` elements have `aria-label` with descriptive text. (4) Ambient glow in HeroSection has `aria-hidden="true"`. (5) Grep all new `.tsx` files for any hardcoded hex colours (`#`), `rgb(`, pixel sizes that aren't `0px`, or hardcoded font sizes — fix any found. (6) Confirm `prefers-reduced-motion` CSS is applied to the glow decoration. Run final `npm run build`.
  - **Files**: All files in `src/components/` and `src/pages/` created in this issue
  - **Verify**: `npm run build` passes; no hardcoded colour/size values in grep output; ARIA attributes present on ProgressBar and social links
  - **Brief ref**: "WCAG 2.1 AA accessibility" in Scope and "Verification — Accessibility" section
