# Tasks: Issue #4 — Build Homepage, About, and Contact pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Merge issue #3 branch as base
  - **Goal**: Ensure all design system primitives and layout shell are available on the current branch
  - **Details**: Merge or rebase `origin/feat/issue-3-create-design-system-primitives-and-layo` into `feat/issue-4-build-homepage-about-and-contact-pages`. Verify that `src/components/ui/` contains `Button`, `Card`, `StatCard`, `SectionLabel`, `Badge`, `ProgressBar`, `Logo` and that `Header`, `Footer`, `Layout` are present. Run `npm run build` to confirm a clean baseline.
  - **Files**: No new files; merges existing branch
  - **Verify**: `npm run build` succeeds; `src/components/ui/` has all primitives listed above
  - **Brief ref**: Dependencies section

- [x] TASK-02: Create MissionCard composite component
  - **Goal**: Build the `MissionCard` composite that wraps Card with Badge, mission title, description, ProgressBar, funding status text, and ghost Button
  - **Details**: Create `src/components/MissionCard.tsx`. Define a TypeScript props interface (`title`, `description`, `badge`, `progress`, `fundingStatus`, `buttonLabel`). Use the `Card` primitive with `accent` prop. Include `Badge` for category label, mission title in `--type-section-heading`, description text, `ProgressBar`, funding status line, and a ghost `Button`. Use only Tier 2 semantic CSS custom properties for all styling (no hardcoded hex/rgb, no Tier 1 token names like `--launchfire`).
  - **Files**: `src/components/MissionCard.tsx` (create)
  - **Verify**: Component file has no TypeScript errors (`npm run build`); no hardcoded colors; uses only Tier 2 tokens
  - **Brief ref**: MissionCard composite section

- [x] TASK-03: Create HeroSection composite component
  - **Goal**: Build the `HeroSection` composite with gradient background, display heading, subtext, primary CTA button, and ambient radial glow with `prefers-reduced-motion` support
  - **Details**: Create `src/components/HeroSection.tsx`. Apply `--gradient-hero` as background. Heading uses `--type-hero` font sizing token. Include a `<Button>` (primary) labeled "Fund a Mission". Add an ambient radial glow element (absolutely positioned `div` with radial gradient). Use a `useReducedMotion`-style check (or CSS `@media (prefers-reduced-motion: reduce)`) to make the glow static when motion is reduced — implement via inline style or a CSS class toggled by a `window.matchMedia` check in a `useEffect`. Accepts no required external props (hero content is static).
  - **Files**: `src/components/HeroSection.tsx` (create)
  - **Verify**: Component renders; ambient glow present; `prefers-reduced-motion` path does not animate; `npm run build` passes
  - **Brief ref**: Homepage structure — HeroSection; Verification — ambient hero glow

- [x] TASK-04: Create StatsSection composite component
  - **Goal**: Build the `StatsSection` composite with SectionLabel and 4 StatCards in a responsive grid
  - **Details**: Create `src/components/StatsSection.tsx`. Use `SectionLabel` with text `"01 — PLATFORM IMPACT"`. Render 4× `StatCard` with static placeholder data (e.g., `$24M Funded`, `1,200 Backers`, `18 Missions`, `3 Launches`). Responsive grid: 1 col on mobile, 2 cols at 640px, 4 cols at 1024px (use Tailwind responsive utilities or inline style with CSS grid). All styling via Tier 2 tokens only.
  - **Files**: `src/components/StatsSection.tsx` (create)
  - **Verify**: 4 StatCards visible; responsive at 640/1024px; `npm run build` passes
  - **Brief ref**: Homepage structure — StatsSection

- [x] TASK-05: Create HowItWorksSection composite component
  - **Goal**: Build the `HowItWorksSection` composite with SectionLabel and 3 step Cards
  - **Details**: Create `src/components/HowItWorksSection.tsx`. Use `SectionLabel` with text `"02 — HOW IT WORKS"`. Render 3× `Card` (with `accent` prop), each showing a step number (e.g., `"01"`), step title, and description. Static copy: step 1 "Browse Missions", step 2 "Back a Mission", step 3 "Track Progress". Responsive grid: 1 col mobile, 3 cols at 1024px. Tier 2 tokens only.
  - **Files**: `src/components/HowItWorksSection.tsx` (create)
  - **Verify**: 3 step cards visible with numbers, titles, descriptions; responsive layout; `npm run build` passes
  - **Brief ref**: Homepage structure — HowItWorksSection

- [x] TASK-06: Create FeaturedMissionsSection composite component
  - **Goal**: Build the `FeaturedMissionsSection` composite with SectionLabel and 3 MissionCard instances
  - **Details**: Create `src/components/FeaturedMissionsSection.tsx`. Use `SectionLabel` with text `"03 — ACTIVE MISSIONS"`. Render 3× `MissionCard` with distinct placeholder data (different mission names, badges like "Lunar", "Mars", "Orbital", varied progress values 30–85%). Responsive grid: 1 col mobile, 2 cols at 768px, 3 cols at 1024px. Tier 2 tokens only.
  - **Files**: `src/components/FeaturedMissionsSection.tsx` (create)
  - **Verify**: 3 MissionCards render with badges and progress bars; responsive; `npm run build` passes
  - **Brief ref**: Homepage structure — FeaturedMissionsSection

- [ ] TASK-07: Create ClosingCtaSection composite component
  - **Goal**: Build the `ClosingCtaSection` with deep-field background, heading, and secondary Button
  - **Details**: Create `src/components/ClosingCtaSection.tsx`. Apply `--gradient-surface-card` as background. Include a prominent heading (Tier 2 heading token) with copy encouraging users to back a mission. Add a `<Button>` (secondary or outline variant) labeled "Explore All Missions". Center-aligned layout. Tier 2 tokens only.
  - **Files**: `src/components/ClosingCtaSection.tsx` (create)
  - **Verify**: Section renders with heading and button; gradient background visible; `npm run build` passes
  - **Brief ref**: Homepage structure — ClosingCtaSection

- [ ] TASK-08: Implement full Home page
  - **Goal**: Replace the `Home.tsx` stub with the full homepage assembling all 5 section composites
  - **Details**: Modify `src/pages/Home.tsx`. Import and render in order: `HeroSection`, `StatsSection`, `HowItWorksSection`, `FeaturedMissionsSection`, `ClosingCtaSection`. No additional logic needed — each section is self-contained. Wrap in a single `<main>` or fragment. Verify no TypeScript errors.
  - **Files**: `src/pages/Home.tsx` (modify)
  - **Verify**: `/` route renders all 5 sections top-to-bottom; `npm run build` passes
  - **Brief ref**: Homepage structure section

- [ ] TASK-09: Implement full About page
  - **Goal**: Replace the `About.tsx` stub with the full 4-section about page assembled inline (no sub-components)
  - **Details**: Modify `src/pages/About.tsx`. Read `specs/product-vision-and-mission.md` for copy (Sections 1.1, 1.2, 1.3, 1.4). Build 4 sections inline:
    1. Hero area — page title in `--type-page-title`
    2. `SectionLabel "01 — OUR MISSION"` + 1–2 paragraphs from Section 1.1 vision
    3. `SectionLabel "02 — THE PROBLEM WE SOLVE"` + problem/solution paragraphs from Section 1.2
    4. `SectionLabel "03 — OUR PRINCIPLES"` + 5× `Card` (accent) from Section 1.4 principles
    5. `SectionLabel "04 — WHO WE SERVE"` + 4× `Card` with persona data from Section 1.3
    Responsive grids for card sections: 1 col mobile, 2–3 cols at 768/1024px. Tier 2 tokens only.
  - **Files**: `src/pages/About.tsx` (modify)
  - **Verify**: All 4 sections render; principles shows 5 cards; personas shows 4 cards; `/about` route works; `npm run build` passes
  - **Brief ref**: About page section

- [ ] TASK-10: Implement full Contact page
  - **Goal**: Replace the `Contact.tsx` stub with the static 2-section contact page assembled inline
  - **Details**: Modify `src/pages/Contact.tsx`. Build 2 sections inline:
    1. Page title + intro paragraph, `SectionLabel "01 — GET IN TOUCH"` + 3× `Card` (email, mailing address, office hours) with static dummy contact info
    2. `SectionLabel "02 — FOLLOW THE MISSION"` + social links (X/Twitter, LinkedIn, GitHub) each linking to `#` — styled as text links or ghost buttons. No form elements.
    Tier 2 tokens only.
  - **Files**: `src/pages/Contact.tsx` (modify)
  - **Verify**: Both sections render; 3 contact cards visible; 3 social links present; no form; `/contact` route works; `npm run build` passes
  - **Brief ref**: Contact page section

- [ ] TASK-11: Cross-page verification and token audit
  - **Goal**: Final integration check — responsive layout, navigation, focus states, and token audit across all pages
  - **Details**: Run the dev server (`npm run dev`). Manually verify or use Playwright to check:
    - All three routes (`/`, `/about`, `/contact`) render without console errors
    - Header nav links highlight active route correctly
    - All pages are responsive at 640/768/1024/1280px (resize browser or use DevTools)
    - Ambient hero glow is static when `prefers-reduced-motion: reduce` is set
    - All interactive elements (buttons, links) have visible focus outlines
    - Token audit: grep component files for hardcoded hex/rgb values and Tier 1 token names (e.g., `--launchfire`, `--void`) — none should appear
    - Run `npm run build` one final time for a clean build
  - **Files**: No file changes expected; fix any issues found
  - **Verify**: `npm run build` passes with zero errors/warnings; all visual checks above pass
  - **Brief ref**: Verification section
