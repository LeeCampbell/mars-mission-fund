# Tasks: Issue #3 — Create design system primitives and layout shell

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create Button component
  - **Goal**: Implement the Button design system primitive with primary, secondary, and ghost variants
  - **Details**:
    - Create `src/components/ui/Button.tsx`
    - Variants: `primary` (uses `--gradient-action-primary` bg, `--color-action-primary-text`, `--color-action-primary-shadow`), `secondary` (`--color-action-secondary-bg`, `--color-action-secondary-text`, `--color-action-secondary-border`), `ghost` (transparent bg, `--color-action-ghost-text`, `--color-action-ghost-border`)
    - All variants: `--radius-button` (full pill), `--type-button` (14px/600), padding 12px 24px
    - Hover timing: `--motion-hover`
    - Focus ring: `outline: 2px solid var(--color-action-primary-hover); outline-offset: 2px`
    - Disabled state: `--color-action-disabled` colours, `cursor: not-allowed`
    - Props: `variant` (`'primary' | 'secondary' | 'ghost'`, default `'primary'`), `disabled`, `href` (renders `<a>` when provided), `children`, `className`, `onClick`, plus spread of native button/anchor props
    - No hardcoded hex, rgba, font-family, font-size, or duration values
  - **Files**: `src/components/ui/Button.tsx`
  - **Verify**: `npm run build` passes; all three variants render with token-based styles; focus ring visible; disabled state styled correctly; `href` prop renders an anchor tag
  - **Brief ref**: Brief "Scope" — Button; "Approach" — TASK-01; "Key token constraints"

- [x] TASK-02: Create Card component
  - **Goal**: Implement the Card design system primitive with optional top accent bar
  - **Details**:
    - Create `src/components/ui/Card.tsx`
    - Background: `--color-bg-surface`; border: `1px solid var(--color-border-subtle)`; border-radius: `--radius-card` (20px); padding: 32px
    - Optional `accent` boolean prop: when true, renders a 2px top bar with gradient from `--color-border-accent` to `--color-status-warning`
    - Props: `accent` (boolean), `children`, `className`
    - No hardcoded values
  - **Files**: `src/components/ui/Card.tsx`
  - **Verify**: `npm run build` passes; Card renders with dark surface bg, subtle border, correct radius; accent variant shows top gradient bar
  - **Brief ref**: Brief "Scope" — Card; "Approach" — TASK-02

- [ ] TASK-03: Create StatCard component
  - **Goal**: Implement the StatCard design system primitive with gradient background, label, value, and optional sub text
  - **Details**:
    - Create `src/components/ui/StatCard.tsx`
    - Background: `--gradient-surface-stat`; border: `1px solid var(--color-border-subtle)`; border-radius: `--radius-stat` (16px)
    - Label: `--type-body-small` (Space Mono, 11px), weight 500, `--color-text-tertiary`, uppercase
    - Value: `--type-stat-value` (Bebas Neue, 40px), `--color-text-primary`
    - Optional `subText` with `subVariant`: `'positive'` uses `--color-status-success`; `'neutral'` uses `--color-text-secondary`
    - Props: `label`, `value`, `subText`, `subVariant` (`'positive' | 'neutral'`), `className`
    - No hardcoded values
  - **Files**: `src/components/ui/StatCard.tsx`
  - **Verify**: `npm run build` passes; StatCard renders with gradient bg, large value, small label, sub text in correct colour per variant
  - **Brief ref**: Brief "Scope" — StatCard; "Approach" — TASK-03

- [ ] TASK-04: Create SectionLabel component
  - **Goal**: Implement the SectionLabel design system primitive for numbered section headers
  - **Details**:
    - Create `src/components/ui/SectionLabel.tsx`
    - Font: `--type-section-label` (Space Mono, 11px, 400, letter-spacing 0.3em, uppercase)
    - Colour: `--color-text-accent`
    - Renders as: `{number} — {title}` (e.g., "01 — IDENTITY")
    - Margin bottom: 16px
    - Props: `number` (string, e.g., `"01"`), `title` (string), `className`
    - No hardcoded values
  - **Files**: `src/components/ui/SectionLabel.tsx`
  - **Verify**: `npm run build` passes; SectionLabel renders in Space Mono, uppercase, with accent colour and correct number–title format
  - **Brief ref**: Brief "Scope" — SectionLabel; "Approach" — TASK-04

- [ ] TASK-05: Create Badge component
  - **Goal**: Implement the Badge design system primitive with funded, active, and new variants
  - **Details**:
    - Create `src/components/ui/Badge.tsx`
    - Variants: `funded`, `active`, `new` — each with its own bg/text/border/dot colour set from Tier 2 tokens per L2-001 Section 3.5
    - All badges: `--radius-badge`, `--type-button` at 12px, padding 6px 12px; 6px filled circle dot indicator
    - Dot: `aria-hidden="true"` (decorative); status meaning carried by text content
    - Props: `variant` (`'funded' | 'active' | 'new'`), `children`, `className`
    - No hardcoded values
  - **Files**: `src/components/ui/Badge.tsx`
  - **Verify**: `npm run build` passes; all three badge variants render with correct colours, dot indicator, and border; dot has `aria-hidden`
  - **Brief ref**: Brief "Scope" — Badge; "Approach" — TASK-05

- [ ] TASK-06: Create ProgressBar component
  - **Goal**: Implement the ProgressBar design system primitive with ARIA attributes and reduced-motion support
  - **Details**:
    - Create `src/components/ui/ProgressBar.tsx`
    - Track: height 8px, background `--color-progress-track`, border-radius `--radius-progress`
    - Fill (in-progress): gradient `--color-progress-fill`; fill (complete): gradient `--color-progress-complete`
    - Endpoint indicator: 14px circle at fill right edge, background `--color-progress-indicator`, `box-shadow: 0 0 12px var(--color-progress-indicator)`
    - Transition: smooth width animation respecting `prefers-reduced-motion` (when active: instant, no transition)
    - ARIA: `role="progressbar"`, `aria-valuenow={value}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label={label}`
    - Props: `value` (0–100), `complete` (boolean), `label` (string for `aria-label`), `className`
    - No hardcoded values
  - **Files**: `src/components/ui/ProgressBar.tsx`
  - **Verify**: `npm run build` passes; track/fill render correctly; endpoint dot visible; ARIA attributes present in DOM; with `prefers-reduced-motion: reduce` media query active, fill transitions instantly
  - **Brief ref**: Brief "Scope" — ProgressBar; "Approach" — TASK-06; "Key token constraints"

- [ ] TASK-07: Create Logo component
  - **Goal**: Create inline SVG React Logo component from `assets/logo.svg` with sm/md/lg size variants
  - **Details**:
    - Read `/workspace/repo/assets/logo.svg` and embed its SVG markup directly in `src/components/ui/Logo.tsx`
    - Props: `size` (`'sm' | 'md' | 'lg'`), default `'sm'`; size maps to height 32px / 72px / 120px (width scales proportionally via `viewBox`)
    - Add `role="img"` to the SVG element
    - Accept `aria-label` prop; default to `"Mars Mission Fund"`
    - Accept `className` prop
  - **Files**: `src/components/ui/Logo.tsx`
  - **Verify**: `npm run build` passes; Logo renders at all three sizes; `role="img"` and `aria-label` present in DOM
  - **Brief ref**: Brief "Scope" — Logo; "Approach" — TASK-07; "Key token constraints"

- [ ] TASK-08: Create Header component
  - **Goal**: Build the shared site header with logo, wordmark, navigation, skip-to-content link, and mobile collapse
  - **Details**:
    - Create `src/components/Header.tsx`
    - `<a href="#main-content">` skip-to-content as first focusable element (visually hidden until focused, per L3-005 Section 4.3)
    - Sticky/fixed `<header>` with `--color-bg-page` background (or transparent + backdrop-filter blur)
    - Left side: `<Logo size="sm" />` wrapped in React Router `<Link to="/">`, followed by "MARS MISSION FUND" wordmark in `--font-display`
    - Right side: `<nav aria-label="Main navigation">` with React Router `<NavLink>` for Home (`/`), About (`/about`), Contact (`/contact`)
    - Active link: `--color-action-primary` or `--color-border-accent` indicator
    - Mobile collapse below 768px (`--breakpoint-md`): toggle button (hamburger icon) shows/hides nav; toggle button has `aria-expanded` and `aria-controls`
    - Semantic `<header>` element
    - No hardcoded values
  - **Files**: `src/components/Header.tsx`
  - **Verify**: `npm run build` passes; Header renders with logo, wordmark, nav links; active NavLink is styled; skip-to-content is first tab stop; at <768px nav collapses behind toggle
  - **Brief ref**: Brief "Scope" — Header; "Approach" — TASK-08

- [ ] TASK-09: Create Footer component
  - **Goal**: Build the shared site footer with logo, tagline, links, and copyright
  - **Details**:
    - Create `src/components/Footer.tsx`
    - Semantic `<footer>` element
    - Background: `--color-bg-surface`; border-top: `1px solid var(--color-border-subtle)`
    - Logo at `md` size (72px) using `<Logo size="md" />`
    - Tagline: "Your stake. Their mission. Our planet." using `--color-text-secondary`
    - Navigation links: Home, About, Contact (React Router `<Link>`)
    - Copyright: "© 2026 Mars Mission Fund. All rights reserved."
    - Responsive: flex layout that stacks vertically on mobile
    - No hardcoded values
  - **Files**: `src/components/Footer.tsx`
  - **Verify**: `npm run build` passes; Footer renders with 72px logo, tagline, nav links, copyright; semantic `<footer>` in DOM; stacks on mobile
  - **Brief ref**: Brief "Scope" — Footer; "Approach" — TASK-09

- [ ] TASK-10: Create Layout component and wire routing in App.tsx
  - **Goal**: Create the shared page Layout wrapper and update App.tsx to use it for all routes
  - **Details**:
    - Create `src/components/Layout.tsx`: renders `<Header />`, `<main id="main-content">` (skip-link target), `<Footer />`; `<main>` has top padding/margin to clear sticky header height
    - Update `src/App.tsx`: wrap existing routes in Layout using React Router's layout route pattern (`<Route element={<Layout />}>`  with child routes using `<Outlet />`)
    - Ensure `document.title` updates on route change (can use `useEffect` + `useLocation` or defer to page components — note this in code)
    - No hardcoded values
  - **Files**: `src/components/Layout.tsx`, `src/App.tsx`
  - **Verify**: `npm run build` passes; navigating to `/`, `/about`, `/contact` all show Header and Footer wrapping page content; `id="main-content"` present on `<main>`; skip-to-content `href="#main-content"` jumps correctly
  - **Brief ref**: Brief "Scope" — Layout / App.tsx; "Approach" — TASK-10

- [ ] TASK-11: Final verification — build, visual checks, and accessibility audit
  - **Goal**: Confirm all components are complete, token-compliant, and the dev server renders them correctly
  - **Details**:
    - Run `npm run build` — must succeed with zero TypeScript errors
    - Start dev server (`npm run dev`) and visually inspect:
      - All six primitives render (Button × 3 variants, Card with/without accent, StatCard, SectionLabel, Badge × 3, ProgressBar at 0/50/100%)
      - Header on every route: 32px logo, "MARS MISSION FUND" wordmark, active nav link styled
      - Footer on every route: 72px logo, tagline, links, copyright
      - Skip-to-content: first Tab stop; Enter jumps to `#main-content`
      - Mobile (<768px): Header nav collapses; Footer stacks vertically
      - Focus rings visible on all interactive elements (buttons, links)
    - Grep all `src/components/**/*.tsx` for hardcoded colour/size/font values (hex, rgba, `font-family:`, `font-size:` literals) — must find none
    - Confirm `prefers-reduced-motion` disables ProgressBar transition
  - **Files**: no new files; read-only verification
  - **Verify**: build succeeds; all visual checks pass; no hardcoded values found in component files
  - **Brief ref**: Brief "Verification" section
