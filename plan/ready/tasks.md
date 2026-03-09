# Tasks: Issue #3 — Create design system primitives and layout shell

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Verify scaffold and create ui/ directory structure
  - **Goal**: Confirm Issue #2 outputs exist and create the `src/components/ui/` directory so subsequent tasks have a known-good baseline
  - **Details**: Read `src/App.tsx`, `src/index.css`, `src/tokens.css`, `src/fonts.css`, and `vite.config.ts` to confirm the scaffold is in place. Create `src/components/ui/.gitkeep` (or any placeholder) so the directory exists. Note all available Tier 2 semantic token names for reference by later tasks.
  - **Files**: `src/components/ui/` (directory)
  - **Verify**: Directory `src/components/ui/` exists; `src/tokens.css` contains Tier 2 `--color-*`, `--font-*`, `--radius-*`, `--transition-*` custom properties
  - **Brief ref**: Prerequisites section; Files to Create/Modify table

- [x] TASK-02: Button component
  - **Goal**: Implement the `Button` primitive with `primary`, `secondary`, and `ghost` variants, polymorphic `href` rendering, disabled state, and focus/hover/transition states
  - **Details**: Create `src/components/ui/Button.tsx`. Props: `variant: 'primary' | 'secondary' | 'ghost'` (default `primary`), `href?: string`, `disabled?: boolean`, plus standard button/anchor HTML attrs. When `href` is set render an `<a>` element, otherwise `<button>`. Primary: gradient background using `--color-action-primary` token family. Secondary: surface background with border. Ghost: transparent with border. Hover darkens via token. Focus ring uses `--color-border-accent` (orange outline). Disabled: reduced opacity, `cursor: not-allowed`, `pointer-events: none`. All colours, radii, font, transitions via `var(--semantic-token)` only — no hardcoded values.
  - **Files**: `src/components/ui/Button.tsx`
  - **Verify**: File exists; TypeScript compiles (`npm run build`); three variants, href, disabled props are typed; no `#`, `rgb`, `rgba`, `hsl`, hardcoded `px` font-size, or `ms` literals in the file
  - **Brief ref**: Scope → primitives; Files table; Token discipline; Verification → Button

- [x] TASK-03: Card component
  - **Goal**: Implement the `Card` primitive with optional top accent gradient bar
  - **Details**: Create `src/components/ui/Card.tsx`. Props: `accent?: boolean`, `className?: string`, `children: React.ReactNode`. Renders a `<div>` with dark surface background (`--color-surface-*`), subtle border (`--color-border-*`), border-radius (`--radius-*`). When `accent` is true, render a thin top bar element with gradient using action/accent tokens. All values via semantic tokens.
  - **Files**: `src/components/ui/Card.tsx`
  - **Verify**: File exists; compiles; `accent` prop toggles gradient bar; no hardcoded values
  - **Brief ref**: Scope → Card; Files table; Verification → Card

- [x] TASK-04: StatCard component
  - **Goal**: Implement the `StatCard` primitive — a gradient-background stat block with label, value, and optional subtext
  - **Details**: Create `src/components/ui/StatCard.tsx`. Props: `label: string`, `value: string | number`, `subtext?: string`, `className?: string`. Renders a block with gradient background (using action/brand token family), large display `value` (using `--font-size-display-*` or equivalent), small tertiary `label` above, and optional `subtext` below. Typography uses DM Sans for value, Space Mono or DM Sans for label per token. All via `var(--semantic-token)`.
  - **Files**: `src/components/ui/StatCard.tsx`
  - **Verify**: File exists; compiles; all three text areas render; no hardcoded values
  - **Brief ref**: Scope → StatCard; Files table; Verification → StatCard

- [x] TASK-05: SectionLabel component
  - **Goal**: Implement the `SectionLabel` primitive — a numbered section header in Space Mono uppercase
  - **Details**: Create `src/components/ui/SectionLabel.tsx`. Props: `number: number | string`, `label: string`, `className?: string`. Renders text in the format `01 — LABEL` (zero-padded two-digit number). Font family: Space Mono via `--font-family-mono` token. Text transform: uppercase. Colour: accent/orange via `--color-text-accent` or equivalent token. Font size via token. Rendered as a `<p>` or `<span>` (not a heading — callers decide heading semantics).
  - **Files**: `src/components/ui/SectionLabel.tsx`
  - **Verify**: File exists; compiles; renders "01 — EXAMPLE" format; Space Mono token applied; no hardcoded values
  - **Brief ref**: Scope → SectionLabel; Files table; Verification → SectionLabel

- [ ] TASK-06: Badge component
  - **Goal**: Implement the `Badge` primitive with `funded`, `active`, and `new` variants and a decorative dot indicator
  - **Details**: Create `src/components/ui/Badge.tsx`. Props: `variant: 'funded' | 'active' | 'new'`, `children: React.ReactNode`, `className?: string`. Each variant maps to a distinct semantic colour token: funded → green (`--color-status-success-*`), active → orange (`--color-status-warning-*` or `--color-action-primary`), new → blue (`--color-status-info-*`). Renders a small coloured dot `<span aria-hidden="true">` before the text label. Dot is decorative; status conveyed by visible text. All colours via tokens.
  - **Files**: `src/components/ui/Badge.tsx`
  - **Verify**: File exists; compiles; three variants type-check; dot has `aria-hidden="true"`; no hardcoded colour values
  - **Brief ref**: Scope → Badge; Accessibility notes → Badge; Verification → Badge

- [ ] TASK-07: ProgressBar component
  - **Goal**: Implement the fully accessible `ProgressBar` with track, fill, endpoint dot, complete ARIA attributes, and `prefers-reduced-motion` support
  - **Details**: Create `src/components/ui/ProgressBar.tsx`. Props: `value: number` (0–100), `aria-label: string`, `className?: string`. Renders: outer track div, inner fill div (width = `${value}%`), and a small circle dot at the right end of the fill. Add `role="progressbar"`, `aria-valuenow={value}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label` on the track element. Fill colour: orange (`--color-action-primary` or `--color-progress-fill`) for in-progress; green (`--color-status-success-*`) when `value === 100`. Fill transition via `var(--transition-duration-*)` token. Under `@media (prefers-reduced-motion: reduce)`, set `transition: none` (use a CSS class or inline style with the media query). All visual values via tokens.
  - **Files**: `src/components/ui/ProgressBar.tsx`
  - **Verify**: File exists; compiles; ARIA attrs present in rendered output; `prefers-reduced-motion` handled; endpoint dot visible; no hardcoded values
  - **Brief ref**: Scope → ProgressBar; Accessibility notes → ProgressBar; Verification → ProgressBar

- [ ] TASK-08: Logo component
  - **Goal**: Implement the `Logo` inline SVG component with `sm`/`md`/`lg` size variants and instance-unique gradient IDs
  - **Details**: Create `src/components/ui/Logo.tsx`. Props: `size?: 'sm' | 'md' | 'lg'` (default `md`), `aria-label?: string` (default `"Mars Mission Fund"`), `className?: string`. Size maps: `sm` → 32px height, `md` → 72px height, `lg` → 120px height (width scales proportionally). Inline the SVG coin logo from `assets/logo.svg` (read that file first). Because SVG `linearGradient` / `radialGradient` `id` attributes are global in the DOM, generate a unique suffix per component instance using `useId()` (React 18+) or a module-level counter, and suffix all gradient `id` and `xlink:href`/`href` references with that suffix. Add `role="img"` and `aria-label` to the `<svg>` element.
  - **Files**: `src/components/ui/Logo.tsx`
  - **Verify**: File exists; compiles; three sizes render correctly; gradient IDs are unique when two `<Logo>` instances appear in the DOM simultaneously (inspect rendered HTML); `role="img"` and `aria-label` present
  - **Brief ref**: Approach → Logo; Accessibility notes → Logo; Verification → Logo

- [ ] TASK-09: Header component
  - **Goal**: Implement the responsive `Header` with skip-to-content link, Logo, wordmark, NavLink navigation, and mobile hamburger toggle
  - **Details**: Create `src/components/Header.tsx`. Structure: `<header>` containing — (1) `<a href="#main-content" className="skip-link">Skip to content</a>` as the first child; (2) Logo (`size="sm"`, 32px); (3) wordmark "MARS MISSION FUND" in Bebas Neue via `--font-family-display` token; (4) `<nav aria-label="Main navigation">` with React Router `<NavLink>` links for `/`, `/about`, `/contact` — active link gets distinct styling via `--color-border-accent` or `--color-action-primary`; (5) hamburger `<button>` visible only below `--breakpoint-md` (768px), toggling a `useState` boolean that shows/hides the nav. Skip link is visually hidden until focused (standard `sr-only` + `focus:not-sr-only` pattern using tokens for position/background). All colours, fonts, spacing via semantic tokens.
  - **Files**: `src/components/Header.tsx`
  - **Verify**: File exists; compiles; skip link is the first focusable element; hamburger toggles nav on small viewports; NavLink active class applies; no hardcoded values
  - **Brief ref**: Approach → Header; Accessibility notes → Header; Verification → Header

- [ ] TASK-10: Footer component
  - **Goal**: Implement the `Footer` with Logo (72px), tagline, navigation links, and copyright — responsive vertical stack on mobile
  - **Details**: Create `src/components/Footer.tsx`. Renders a `<footer>` semantic element containing: Logo (`size="md"`, 72px), a tagline string (e.g. "Funding humanity's multiplanetary future"), nav links (`/`, `/about`, `/contact`), and copyright text (e.g. "© 2026 Mars Mission Fund"). On mobile (below `--breakpoint-md`): stack all sections vertically. On desktop: horizontal layout. All spacing, colour, font via semantic tokens. No React Router NavLink required (plain `<a>` or Link is fine).
  - **Files**: `src/components/Footer.tsx`
  - **Verify**: File exists; compiles; `<footer>` element present; Logo renders at md size; responsive layout applies; no hardcoded values
  - **Brief ref**: Approach → Footer; Files table; Verification → Footer

- [ ] TASK-11: Layout component
  - **Goal**: Implement the `Layout` wrapper that composes Header + `<main id="main-content">` + Footer and updates `document.title` on route change
  - **Details**: Create `src/components/Layout.tsx`. Uses React Router v7's `<Outlet>` to render child routes inside `<main id="main-content">`. Imports and renders `<Header />` above and `<Footer />` below. On each route change, update `document.title` using `useLocation()` from `react-router` — map pathnames to human-readable titles, e.g. `/` → `"Mars Mission Fund"`, `/about` → `"About — Mars Mission Fund"`, `/contact` → `"Contact — Mars Mission Fund"`. Use a `useEffect` that fires on `location.pathname` change. The `<main>` element is the skip-link target: `id="main-content"`, `tabIndex={-1}` to allow programmatic focus.
  - **Files**: `src/components/Layout.tsx`
  - **Verify**: File exists; compiles; `<main id="main-content">` present in rendered DOM; `document.title` updates on navigation; Header and Footer appear on all routes
  - **Brief ref**: Approach → Layout; Files table; Verification → all three routes show Header/Footer

- [ ] TASK-12: Wire Layout into App.tsx
  - **Goal**: Replace the existing placeholder routes in `src/App.tsx` with the `Layout` component as a React Router v7 layout route wrapping all three page routes
  - **Details**: Read current `src/App.tsx`. Replace the route structure so `Layout` is the parent route (using `<Outlet>`) and `/`, `/about`, `/contact` are child routes rendering placeholder `<div>` elements (actual page components are Issue #4). Use React Router v7 `createBrowserRouter` + `RouterProvider` or the JSX `<Routes>`/`<Route>` pattern — match whichever pattern is already in the file. Add `<Suspense>` wrapper if lazy-loading is used. Ensure all three routes are accessible.
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` succeeds; `npm run dev` serves the app; navigating to `/`, `/about`, `/contact` all show Header and Footer; no TypeScript errors
  - **Brief ref**: Approach → App.tsx update; Scope → Layout wired into App.tsx; Files table

- [ ] TASK-13: Build verification and token audit
  - **Goal**: Confirm the complete implementation builds cleanly, passes a token-discipline audit, and meets the visual/accessibility checklist from the brief
  - **Details**: (1) Run `npm run build` — zero TypeScript errors, zero Vite errors. (2) Grep all new component files for forbidden patterns: `#[0-9a-fA-F]`, `rgb(`, `rgba(`, `hsl(`, hardcoded font-size `px` values, and `ms` duration literals — none should appear. (3) Start `npm run dev` and manually verify via Playwright or browser: all three routes show Header+Footer; skip link works on Tab; hamburger works at mobile width; Button variants render; Badge variants render; ProgressBar ARIA attrs in DOM; Logo gradient IDs are unique per instance; document.title updates on route change. (4) Fix any issues found before marking complete.
  - **Files**: No new files; fixes to any component files if issues are found
  - **Verify**: `npm run build` exits 0; grep audit finds no hardcoded values; dev server visual checks pass
  - **Brief ref**: Verification section (entire)
