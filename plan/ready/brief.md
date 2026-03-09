# Brief: Issue #3 — Create design system primitives and layout shell

## Goal

Build the core UI components and shared layout shell that all pages in the Mars Mission Fund
frontend use.
This includes seven design system primitives (`Button`, `Card`, `StatCard`, `SectionLabel`,
`Badge`, `ProgressBar`, `Logo`) placed in `src/components/ui/`, and three layout components
(`Header`, `Footer`, `Layout`) in `src/components/`.
All components consume only Tier 2 semantic tokens as mandated by L2-001.
Focus states, reduced-motion handling, and ARIA attributes are required on all relevant
components.

## Scope

**In scope:**

- `Button` — primary, secondary, ghost variants; disabled state; `href` renders as `<a>`
- `Card` — optional top accent bar
- `StatCard` — gradient background, label, value, optional sub text (positive/neutral)
- `SectionLabel` — numbered section headers ("01 — TITLE" format)
- `Badge` — funded, active, new variants with dot indicator
- `ProgressBar` — in-progress and complete fill variants; ARIA progressbar attributes
- `Logo` — inline SVG React component from `assets/logo.svg`; sm/md/lg sizes (32/72/120px)
- `Header` — logo, wordmark, navigation (Home, About, Contact), mobile collapse, skip-to-content link
- `Footer` — logo, tagline, links, copyright
- `Layout` — wraps routes with Header + `<main id="main-content">` + Footer
- Update `src/App.tsx` to use Layout as the React Router layout route

**Out of scope:**

- Testing setup or test files (separate milestone)
- Linting/formatting tooling (separate milestone)
- Any page components (Homepage, About, Contact — issue #4)
- Form inputs, dropdowns, or any components not listed in the issue
- Backend, API calls, or authentication

## Approach

Issue #2 (scaffold frontend project) must be complete first — it produces `package.json`,
`vite.config.ts`, `src/index.css` (with Tailwind v4 + `@import "tailwindcss"`),
`src/tokens.css` (all L2-001 Tier 1 and Tier 2 CSS custom properties), self-hosted fonts in
`src/assets/fonts/`, and placeholder routes in `src/App.tsx`.

With scaffolding in place, the implementation follows the exact task sequence in
`plan/public-marketing-pages/tasks/02-shared-ui.tasks.md` (TASK-01 through TASK-11):

1. **TASK-01 to TASK-07 — Design system primitives** (`src/components/ui/`).
   Each component is a TypeScript React component that uses semantic token CSS custom
   properties via `style` prop or Tailwind arbitrary values (`var(--token)`).
   No hardcoded hex, rgba, font-family, font-size, or duration values are permitted
   (L2-001 Section 8, L3-005 Section 2.1).

2. **TASK-08 to TASK-09 — Header and Footer** (`src/components/`).
   Header: `<header>` + `<nav aria-label="Main navigation">` with React Router `NavLink`.
   Mobile collapse below 768px (`--breakpoint-md`).
   Skip-to-content `<a href="#main-content">` as first focusable element.
   Footer: `<footer>` semantic element, stacks vertically on mobile.

3. **TASK-10 — Layout and routing update** (`src/components/Layout.tsx`, `src/App.tsx`).
   `Layout` renders `<Header />`, `<main id="main-content">`, `<Footer />`.
   `src/App.tsx` wraps all routes in `Layout` via React Router's `<Outlet>` pattern.

4. **TASK-11 — Final verification** of all components together.

**Key token constraints to enforce during implementation:**

- Buttons: `--radius-button` (full), `--type-button` (14px/600), padding 12px 24px.
  Primary uses `--gradient-action-primary`.
  Focus: `outline: 2px solid var(--color-action-primary-hover); outline-offset: 2px`.
- Cards: `--color-bg-surface` bg, `--color-border-subtle` border, `--radius-card` (20px).
  Accent bar: `2px` gradient `--color-border-accent` → `--color-status-warning`.
- StatCard: `--gradient-surface-stat` bg, `--radius-stat` (16px).
  Value: `--type-stat-value` (Bebas Neue, 40px).
- Badge dot: `aria-hidden="true"` (decorative); status text carries meaning.
- ProgressBar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`,
  `aria-valuemax="100"`, `aria-label`. Height 8px. Endpoint: 14px circle.
  `prefers-reduced-motion` → instant fill, no animation.
- Logo: reads `assets/logo.svg` content directly into TSX (inline SVG).
  `role="img"`, `aria-label` defaults to "Mars Mission Fund".

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/Button.tsx` | create | Button primitive — primary, secondary, ghost variants |
| `src/components/ui/Card.tsx` | create | Card primitive — optional top accent bar |
| `src/components/ui/StatCard.tsx` | create | Stat card — gradient bg, label, value, sub text |
| `src/components/ui/SectionLabel.tsx` | create | Section label — numbered header format |
| `src/components/ui/Badge.tsx` | create | Badge — funded, active, new variants |
| `src/components/ui/ProgressBar.tsx` | create | Progress bar — in-progress and complete states with ARIA |
| `src/components/ui/Logo.tsx` | create | Logo — inline SVG from `assets/logo.svg`, sm/md/lg |
| `src/components/Header.tsx` | create | Header with logo, nav, skip-to-content, mobile collapse |
| `src/components/Footer.tsx` | create | Footer with logo, tagline, links, copyright |
| `src/components/Layout.tsx` | create | Layout wrapper: Header + main + Footer |
| `src/App.tsx` | modify | Wire Layout as route wrapper via React Router Outlet |

## Dependencies

**Prerequisite work:**

- Issue #2 "Scaffold frontend project" must be merged before implementation.
  It provides: `package.json` (React 19, Vite, Tailwind v4, React Router v7, TypeScript),
  `src/tokens.css` (all L2-001 CSS custom properties), `src/assets/fonts/` (WOFF2 files),
  `src/index.css` (Tailwind import + token import + base styles), `src/App.tsx` (routing).

**No new npm packages required.**
All dependencies (`react`, `react-router`, `tailwindcss`) are installed by issue #2.

**Logo source:**
`assets/logo.svg` exists at the repository root and contains the inline SVG content to embed.

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors.
- **Dev server**: `npm run dev` serves the app at `http://localhost:5173`.
- **Visual checks in browser:**
  - All six primitives (Button variants, Card with/without accent, StatCard, SectionLabel,
    Badge variants, ProgressBar at various values) render with correct token-based styles.
  - Header appears on all routes with logo (32px), "MARS MISSION FUND" wordmark, and
    navigation links (Home, About, Contact) with active state indicator.
  - Footer appears on all routes with 72px logo, tagline, links, and copyright.
  - Skip-to-content link is first tab stop; pressing Enter jumps to `#main-content`.
  - Mobile (< 768px): Header nav collapses; Footer stacks vertically.
  - Focus rings visible on all interactive elements.
  - With `prefers-reduced-motion` active: ProgressBar fills instantly; no animated transitions.
- **Accessibility**: No Tier 1 token references or hardcoded colour/size values in any
  component file.
