# Brief: Issue #4 — Build Homepage, About, and Contact pages

## Goal

Build three static marketing pages — Homepage (`/`), About (`/about`), and Contact (`/contact`) — using the design system primitives and layout shell established in Issue #3.
The pages use React components consuming only Tier 2 semantic tokens per L2-001, follow mobile-first responsive design at four breakpoints (640/768/1024/1280px), and implement the voice, accessibility, and motion standards defined in L2-001 and L3-005.

## Scope

### In scope

- `HomePage.tsx` page component with five sections: hero, stats, how-it-works, featured missions, closing CTA
- `AboutPage.tsx` page component with four sections: mission statement, problem/solution, principles grid, persona cards
- `ContactPage.tsx` page component with contact info and social links (no form)
- Five composite section components for the homepage: `HeroSection`, `StatsSection`, `HowItWorksSection`, `FeaturedMissionsSection`, `ClosingCtaSection`
- One composite component for mission cards: `MissionCard`
- All copy follows L2-001 Section 4 voice patterns (no forbidden language)
- Mobile-first responsive at all four breakpoints
- Accessibility: WCAG 2.1 AA focus states, `prefers-reduced-motion`, ARIA on progress bars and stat cards
- Document `<title>` updates on route change (already handled by `Layout.tsx`)
- Wiring up pages in `App.tsx` (replacing the stub page components)

### Out of scope

- Backend API, authentication, or real data
- Contact form submission
- New design system primitives (Button, Card, StatCard, Badge, ProgressBar, SectionLabel already exist)
- Linting/test setup
- New routes or navigation changes

## Approach

Issue #3 is already implemented (remote branch `origin/feat/issue-3-create-design-system-primitives-and-layo`).
The current branch `feat/issue-4-build-homepage-about-and-contact-pages` does not yet contain the frontend project files.
The implementation agent must first merge or rebase from issue #3's work (or cherry-pick the src/ files) to get the existing codebase, then build on top of it.

### Existing primitives available (from issue #3)

- `src/components/ui/Button.tsx` — variants: `primary`, `secondary`, `ghost`
- `src/components/ui/Card.tsx` — props: `accent?: boolean`
- `src/components/ui/StatCard.tsx` — props: `label`, `value`, `subtext`
- `src/components/ui/Badge.tsx` — variants: `funded`, `active`, `new`
- `src/components/ui/ProgressBar.tsx` — props: `value`, `aria-label`
- `src/components/ui/SectionLabel.tsx` — props: `number`, `label`
- `src/components/Layout.tsx`, `Header.tsx`, `Footer.tsx` — shared layout shell
- `src/tokens.css` — full Tier 1 + Tier 2 token definitions
- `App.tsx` — stub page components inside `<Routes>` (replace these with real page components)

### Component structure

```text
src/
  pages/
    HomePage.tsx          (assembles 5 section components)
    AboutPage.tsx         (self-contained; 4 sections inline or via sub-components)
    ContactPage.tsx       (self-contained; static info)
  components/
    HeroSection.tsx
    StatsSection.tsx
    HowItWorksSection.tsx
    FeaturedMissionsSection.tsx
    MissionCard.tsx
    ClosingCtaSection.tsx
```

Page components live in `src/pages/`. Composite section components live in `src/components/`.
`App.tsx` is updated to import the real page components from `src/pages/` instead of the inline stubs.

### Key implementation notes

1. **Hero**: Full-viewport (`min-height: 100dvh`), background `var(--gradient-hero)`, heading `font-family: var(--font-family-display)` at 48px mobile / 72px md / 96px xl, uppercase. Ambient glow div uses `animation: ... var(--motion-ambient)` wrapped in `@media (prefers-reduced-motion: no-preference)`. Single primary CTA "Explore Missions".

2. **Stats**: `SectionLabel number={1} label="PLATFORM IMPACT"` + section heading + 4× `StatCard`. Grid: 1col → 2col at sm → 4col at lg.

3. **How It Works**: `SectionLabel number={2} label="HOW IT WORKS"` + 3× `Card accent` with step number in `var(--font-size-stat-value-compact)` / `var(--color-text-accent)`, title in `var(--font-size-card-title)`, body in `var(--font-size-body)`. Grid: 1col → 3col at lg.

4. **Featured Missions**: `SectionLabel number={3} label="ACTIVE MISSIONS"` + 3× `MissionCard`. Each `MissionCard` composes: `Card accent`, `Badge`, title, description, `ProgressBar`, funding status text, ghost `Button`. Grid: 1col → 2col at md → 3col at lg.

5. **Closing CTA**: Background `var(--gradient-surface-card)`, centred heading + body + secondary `Button`.

6. **About**: Four sections labelled 01–04, each using `SectionLabel`. Section 3 (principles) uses 5× `Card accent` in a grid (2col at sm, 3col at lg, last card centred on lg). Section 4 (personas) uses 4× `Card` in a grid (1col → 2col at md → 4col at lg). Content sourced from L1-001 Sections 1.1–1.4.

7. **Contact**: Two sections (01 GET IN TOUCH, 02 FOLLOW THE MISSION). Contact details in `Card` components. Social links as `Button variant="ghost"` or styled anchor elements.

8. **Token compliance**: All inline styles use `var(--...)` semantic tokens. No raw hex, no Tier 1 token references in component code.

9. **Responsive**: Use CSS-in-JS `<style>` tags (same React 19 deduplication pattern as `Button.tsx`) or Tailwind utility classes for breakpoint-dependent layout. The existing project uses inline styles + React 19 `<style>` tags with `href` + `precedence`.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/HomePage.tsx` | create | Assembles 5 homepage section components |
| `src/pages/AboutPage.tsx` | create | About page with 4 sections (mission, problem/solution, principles, personas) |
| `src/pages/ContactPage.tsx` | create | Contact page with static info and social links |
| `src/components/HeroSection.tsx` | create | Hero section with heading, subtext, CTA, ambient glow |
| `src/components/StatsSection.tsx` | create | Stats section with 4 StatCards |
| `src/components/HowItWorksSection.tsx` | create | 3-step How It Works section |
| `src/components/FeaturedMissionsSection.tsx` | create | Featured missions section with 3 MissionCards |
| `src/components/MissionCard.tsx` | create | Composite card: Badge + title + description + ProgressBar + Button |
| `src/components/ClosingCtaSection.tsx` | create | Closing CTA section |
| `src/App.tsx` | modify | Replace stub page components with imports from `src/pages/` |

## Dependencies

- **Issue #3 must be merged** (or its files brought onto this branch) before implementation begins.
  The frontend project (Vite + React 19 + Tailwind v4 + React Router v7) with all primitives and layout shell must be present.
- No new npm packages required — all primitives and layout are in place.
- Content for About page drawn from `specs/product-vision-and-mission.md` (L1-001) Sections 1.1–1.4.

## Verification

- **Build**: `npm run build` succeeds with no TypeScript or Vite errors
- **Dev server**: `npm run dev` serves the app at `http://localhost:5173`
- **Homepage** (`/`): Hero fills viewport; heading is Bebas Neue uppercase; CTA button is primary; stats grid shows 4 StatCards; How It Works shows 3 Cards; Featured Missions shows 3 MissionCards with badges, progress bars, funding text; Closing CTA has secondary button
- **About page** (`/about`): All 4 sections render; principles grid shows 5 Cards; persona grid shows 4 Cards
- **Contact page** (`/contact`): Contact details and social links render; no form present
- **Navigation**: Clicking nav links transitions between all 3 pages without full reload
- **Responsive**: Pages reflow correctly at 640/768/1024/1280px breakpoints
- **Reduced motion**: Ambient hero glow is static when `prefers-reduced-motion: reduce` is set
- **Focus**: Tab key navigates all interactive elements with visible focus rings
- **No token violations**: No Tier 1 (`--launchfire`, `--void`, etc.) or raw hex values in component files
