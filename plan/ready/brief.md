# Brief: Issue #4 — Build Homepage, About, and Contact pages

## Goal

Build the three static marketing pages (Homepage, About, Contact) for the Mars Mission Fund platform
using the design system primitives and layout shell established in issue #3.
Each page is implemented as a full-content React component replacing the placeholder stubs in
`src/pages/Home.tsx`, `src/pages/About.tsx`, and `src/pages/Contact.tsx`.
All copy follows L2-001 Section 4 voice-in-product patterns.
All pages are mobile-first responsive at the four defined breakpoints (640/768/1024/1280px).

## Scope

### In scope

- `src/pages/Home.tsx` — full homepage with 5 sections: Hero, Stats, How It Works, Featured Missions, Closing CTA
- `src/components/HeroSection.tsx` — hero with ambient glow, `prefers-reduced-motion` support
- `src/components/StatsSection.tsx` — 4 StatCards in responsive grid
- `src/components/HowItWorksSection.tsx` — 3-step explanation cards
- `src/components/FeaturedMissionsSection.tsx` — 3 placeholder MissionCard composites
- `src/components/MissionCard.tsx` — card composite with Badge, ProgressBar, and ghost button
- `src/components/ClosingCtaSection.tsx` — secondary CTA section
- `src/pages/About.tsx` — full about page with 4 sections: Mission, Problem/Solution, Principles, Who We Serve
- `src/pages/Contact.tsx` — full contact page with static dummy info and social links
- All Tier 2 semantic token usage only (no Tier 1 or hardcoded values)
- Responsive at all four breakpoints using inline styles or Tailwind responsive utilities
- `prefers-reduced-motion` compliance for hero ambient animation
- Document title updates on each route (already handled by Layout — verify only)
- `npm run build` passes

### Out of scope

- Backend, API, or form submission
- Authentication or protected routes
- New design system primitives (Button, Card, StatCard, SectionLabel, Badge, ProgressBar already exist)
- SEO static pre-rendering
- Test files

## Approach

The source code does not exist on the current branch yet.
Issue #3 is complete on `origin/feat/issue-3-create-design-system-primitives-and-layo`,
which provides all necessary primitives and the layout shell.
The current branch `feat/issue-4-build-homepage-about-and-contact-pages` must be based on or
merge from that branch before implementation.

All new components live in `src/components/` (composites) and `src/pages/` (page components).
Pages assemble composite components using only existing design system primitives from `src/components/ui/`:
`Button`, `Card`, `StatCard`, `SectionLabel`, `Badge`, `ProgressBar`, `Logo`.

All styling uses inline `style` props referencing Tier 2 semantic CSS custom properties (consistent
with the existing component pattern in issue #3) or Tailwind responsive utilities.

### Homepage structure (`src/pages/Home.tsx`)

1. `<HeroSection>` — `--gradient-hero` background, `--type-hero` heading, primary Button, ambient radial glow
2. `<StatsSection>` — SectionLabel "01 — PLATFORM IMPACT", 4× StatCard, responsive grid
3. `<HowItWorksSection>` — SectionLabel "02 — HOW IT WORKS", 3× Card with step number/title/description
4. `<FeaturedMissionsSection>` — SectionLabel "03 — ACTIVE MISSIONS", 3× MissionCard
5. `<ClosingCtaSection>` — `--gradient-surface-card` background, heading, secondary Button

### MissionCard composite

Wraps `Card` (with `accent` prop) and contains: `Badge`, mission title, description,
`ProgressBar`, funding status text, ghost `Button`. Accepts typed props for mission data.

### About page (`src/pages/About.tsx`)

Four sections assembled directly in the page component (no sub-components required):

1. Hero area — page title in `--type-page-title`
2. SectionLabel "01 — OUR MISSION" + body paragraphs from L1-001 Section 1.1
3. SectionLabel "02 — THE PROBLEM WE SOLVE" + problem/solution narrative from L1-001 Section 1.2
4. SectionLabel "03 — OUR PRINCIPLES" + 5× Card (accent bar) from L1-001 Section 1.4
5. SectionLabel "04 — WHO WE SERVE" + 4× Card with persona data from L1-001 Section 1.3

### Contact page (`src/pages/Contact.tsx`)

Two sections assembled directly in the page component:

1. Page title + intro, SectionLabel "01 — GET IN TOUCH" + 3× Card (email, address, hours)
2. SectionLabel "02 — FOLLOW THE MISSION" + social links (X/Twitter, LinkedIn, GitHub → `#`)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Home.tsx` | modify | Replace stub with full homepage assembling all section composites |
| `src/pages/About.tsx` | modify | Replace stub with full about page (4 sections, inline) |
| `src/pages/Contact.tsx` | modify | Replace stub with static contact page (2 sections, inline) |
| `src/components/HeroSection.tsx` | create | Hero composite: gradient bg, display heading, subtext, primary CTA, ambient glow |
| `src/components/StatsSection.tsx` | create | Stats composite: SectionLabel + 4× StatCard in responsive grid |
| `src/components/HowItWorksSection.tsx` | create | How It Works composite: SectionLabel + 3× Card with step data |
| `src/components/FeaturedMissionsSection.tsx` | create | Featured missions composite: SectionLabel + 3× MissionCard |
| `src/components/MissionCard.tsx` | create | Mission card composite: Card + Badge + ProgressBar + Button |
| `src/components/ClosingCtaSection.tsx` | create | Closing CTA composite: deep-field bg, heading, secondary Button |

## Dependencies

- Issue #3 must be merged or its branch must be the base for this branch.
  All design system primitives (`Button`, `Card`, `StatCard`, `SectionLabel`, `Badge`,
  `ProgressBar`, `Logo`) and layout shell (`Header`, `Footer`, `Layout`) must be present.
- No new npm packages required.
- Content source: L1-001 (`specs/product-vision-and-mission.md`) for About page copy
  (Section 1.1 vision, 1.2 problem, 1.3 personas, 1.4 principles).

## Verification

- **Build**: `npm run build` succeeds with no TypeScript or Vite errors
- **Visual**: At `http://localhost:5173` verify:
  - `/` — Hero fills viewport with Bebas Neue heading, orange CTA button, ambient glow; stats section shows 4 cards; How It Works shows 3 step cards; Featured Missions shows 3 mission cards with badges and progress bars; closing CTA section renders at bottom
  - `/about` — All 4 sections render; principles grid shows 5 cards; persona grid shows 4 cards
  - `/contact` — Contact info cards and social links render; no form present
  - Navigation between all three pages works (Header links active-state highlights correctly)
  - All pages responsive at 640/768/1024/1280px breakpoints
  - Ambient hero glow is static under `prefers-reduced-motion: reduce`
  - All interactive elements have visible focus states
- **Token audit**: No Tier 1 identity token names (e.g., `--launchfire`, `--void`) appear in component style props; no hardcoded hex/rgb values
