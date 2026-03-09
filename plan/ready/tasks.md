# Tasks: Issue #3 — Create design system primitives and layout shell

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Audit scaffold and token baseline
  - **Goal**: Confirm the Issue #2 scaffold is in place and all required Tier 2 CSS custom properties exist in `tokens.css` (or equivalent), web fonts are declared, and `src/App.tsx` has a bare React Router v7 setup.
  - **Details**: Read `src/App.tsx`, `src/index.css` (or `tokens.css`), `index.html`, and `package.json`. Document which tokens are available (colour, radius, motion, gradient, breakpoint) and note any gaps that must be patched before component work begins. If `src/components/ui/` does not exist, create the directory.
  - **Files**: Read-only audit; create `src/components/ui/` directory if absent; patch `tokens.css` only if tokens referenced in the brief are missing.
  - **Verify**: `npm run build` passes with zero errors. All token names referenced in the brief (`--color-action-*`, `--color-border-accent`, `--color-status-*`, `--gradient-surface-stat`, `--radius-card`, `--motion-hover`, `--breakpoint-*`) exist in the stylesheet.
  - **Brief ref**: §Approach "Prerequisite", §Dependencies

- [x] TASK-02: Button primitive
  - **Goal**: Implement `src/components/ui/Button.tsx` — a stateless primitive that renders as `<button>` by default or as `<a>` when `href` is provided, with three visual variants (primary / secondary / ghost).
  - **Details**: Props: `variant: 'primary' | 'secondary' | 'ghost'` (default `'primary'`), `href?: string`, `disabled?: boolean`, `children`, standard button/anchor HTML attributes. Render `<a>` when `href` is set, else `<button>`. Apply variant styles via `style` prop or Tailwind arbitrary values referencing only Tier 2 tokens. Disabled state uses `--color-action-disabled` for bg/text and sets `aria-disabled` + `pointer-events: none`. Hover transition uses `--motion-hover`. Focus ring uses `--color-border-accent` (2px solid offset ring per L2-001 §5.3).
  - **Files**: `src/components/ui/Button.tsx`
  - **Verify**: File created. `npm run build` passes. Import Button in App.tsx temporarily and confirm all three variants render without TS errors (revert import after check).
  - **Brief ref**: §Approach step 1

- [x] TASK-03: Card primitive
  - **Goal**: Implement `src/components/ui/Card.tsx` — a wrapper `<div>` with optional gradient accent bar at the top.
  - **Details**: Props: `accent?: boolean`, `children`, `className?: string`. Background uses `--color-surface-card` (or equivalent surface token). Border uses `--color-border-subtle` with `--radius-card` rounding. When `accent` is `true`, render a 2px-height top bar with a CSS gradient from `--color-border-accent` to `--color-status-warning`. No hardcoded colours or sizes outside of the 2px bar height which is a structural constant.
  - **Files**: `src/components/ui/Card.tsx`
  - **Verify**: File created. `npm run build` passes. Component renders visually dark surface with subtle border; `accent` prop shows orange→amber gradient top strip.
  - **Brief ref**: §Approach step 2

- [x] TASK-04: StatCard primitive
  - **Goal**: Implement `src/components/ui/StatCard.tsx` — a stat display card with gradient background, large Bebas Neue value, Space Mono label, and optional sub text.
  - **Details**: Props: `label: string`, `value: string`, `subtext?: string`, `subtextVariant?: 'positive' | 'neutral'`. Background: `--gradient-surface-stat`. Value typography: Bebas Neue, large size from `--text-*` scale. Label typography: Space Mono, small, uppercase, `--color-text-muted`. Sub text colour: `positive` → `--color-status-success`, `neutral` → `--color-text-muted`. All font families and colours via tokens only.
  - **Files**: `src/components/ui/StatCard.tsx`
  - **Verify**: File created. `npm run build` passes. Renders gradient bg, correct font families, correct sub-text colours.
  - **Brief ref**: §Approach step 3

- [x] TASK-05: SectionLabel primitive
  - **Goal**: Implement `src/components/ui/SectionLabel.tsx` — a numbered section header rendered in Space Mono.
  - **Details**: Props: `number: number | string`, `title: string`. Renders the string `"<number> — <title>"` in a single element (e.g. `<p>` or `<span>`). Font: Space Mono via `--font-mono`. Uppercase via `text-transform: uppercase`. Colour: `--color-text-accent`. Letter spacing: `--tracking-wide` (or equivalent token). No hardcoded values.
  - **Files**: `src/components/ui/SectionLabel.tsx`
  - **Verify**: File created. `npm run build` passes. Renders "01 — SECTION NAME" in orange Space Mono.
  - **Brief ref**: §Approach step 4

- [x] TASK-06: Badge primitive
  - **Goal**: Implement `src/components/ui/Badge.tsx` — a status badge with three variants (funded / active / new) each with a coloured dot indicator.
  - **Details**: Props: `variant: 'funded' | 'active' | 'new'`. Each variant maps to its own set of tokens from L2-001 §3.5: bg, text, border, dot colour. Dot is a small circle rendered before the label text; dot element has `aria-hidden="true"`. Badge text is the capitalised variant name (or accept a `label` prop). Border: 1px solid variant border token. Rounding: `--radius-badge` or `--radius-full`.
  - **Files**: `src/components/ui/Badge.tsx`
  - **Verify**: File created. `npm run build` passes. Three variants render with correct green/orange/blue colour sets and hidden dot.
  - **Brief ref**: §Approach step 5

- [ ] TASK-07: ProgressBar primitive
  - **Goal**: Implement `src/components/ui/ProgressBar.tsx` — an accessible progress bar with ARIA, gradient fill, endpoint dot, and `prefers-reduced-motion` support.
  - **Details**: Props: `value: number` (0–100), `max?: number` (default 100), `label: string`, `complete?: boolean`. Root element: `<div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>`. Track: 8px height, `--color-surface-subtle` background, `--radius-full`. Fill: width `${value/max*100}%`, gradient `--gradient-progress-active`; when `complete` is true use `--gradient-progress-complete`. Transition: `width var(--motion-progress, 300ms) ease` — suppressed to `none` when `prefers-reduced-motion: reduce` (both via CSS media query and via `window.matchMedia` check in component). Endpoint dot: small circle at right edge of fill, same gradient stop colour. Token names may need adjustment to match what exists in `tokens.css`.
  - **Files**: `src/components/ui/ProgressBar.tsx`
  - **Verify**: File created. `npm run build` passes. Renders orange fill at non-100 value; green fill at `complete`. ARIA attributes present in DOM. Setting `prefers-reduced-motion` suppresses animation.
  - **Brief ref**: §Approach step 6

- [ ] TASK-08: Logo primitive
  - **Goal**: Implement `src/components/ui/Logo.tsx` — an inline SVG coin logo component with `sm`/`md`/`lg` size variants.
  - **Details**: Read `assets/logo.svg` to get the raw SVG markup. Convert to JSX (camelCase attributes, `xmlns` retained). Props: `size?: 'sm' | 'md' | 'lg'` (default `'md'`). Size map: `sm` → 32px height, `md` → 72px height, `lg` → 120px height. Width scales proportionally (preserve aspect ratio via `viewBox`). Add `role="img"` and `aria-label` prop (default `"Mars Mission Fund"`). Do not reference an external file — the SVG paths must be inlined in the JSX.
  - **Files**: `src/components/ui/Logo.tsx`
  - **Verify**: File created. `npm run build` passes. Logo renders at all three sizes with no external network request.
  - **Brief ref**: §Approach step 7, §Dependencies "Assets"

- [ ] TASK-09: Header component
  - **Goal**: Implement `src/components/Header.tsx` — sticky site header with skip-to-content link, logo + wordmark, and responsive nav with mobile hamburger.
  - **Details**: Structure: `<header>` as first element, skip-to-content `<a href="#main-content">` as first focusable child (visually hidden until focused, then shown per standard skip-link pattern using tokens). Logo (`size="sm"`) + "MARS MISSION FUND" wordmark text in Bebas Neue (`--font-display`). Nav: `<nav aria-label="Main navigation">` with React Router `NavLink` components for Home (`/`), About (`/about`), Contact (`/contact`). Active `NavLink` gets `--color-border-accent` underline/colour. Header position: `sticky top-0` with `z-index` above page content; background `--color-surface-header` (or `--color-surface-overlay`). Mobile (below `--breakpoint-md` / 768px): hamburger button toggles nav visibility via `useState`; hamburger uses `aria-expanded` and `aria-controls`. Focus ring on all interactive elements per L2-001 §5.3. No hardcoded colours, sizes, or font stacks.
  - **Files**: `src/components/Header.tsx`
  - **Verify**: File created. `npm run build` passes. Header renders at top of viewport; skip link visible on Tab; active route link styled; hamburger appears below 768px and toggles nav.
  - **Brief ref**: §Approach step 8

- [ ] TASK-10: Footer component
  - **Goal**: Implement `src/components/Footer.tsx` — site footer with logo, tagline, navigation links, and copyright.
  - **Details**: Structure: `<footer>`. Logo at `size="md"` (72px). Tagline text: "Your stake. Their mission. Our planet." in `--color-text-muted` or `--color-text-secondary`. Nav links: Home / About / Contact using React Router `Link`. Copyright line: "© <year> Mars Mission Fund. All rights reserved." — year from `new Date().getFullYear()`. Layout: horizontal row on desktop (logo-tagline on left, links + copyright on right); single column stack on mobile. Background: `--color-surface-footer` or `--color-surface-dark`. All visual values via tokens only.
  - **Files**: `src/components/Footer.tsx`
  - **Verify**: File created. `npm run build` passes. Footer renders logo, tagline, links, and copyright; stacks vertically on narrow viewport.
  - **Brief ref**: §Approach step 9

- [ ] TASK-11: Layout wrapper and App.tsx integration
  - **Goal**: Implement `src/components/Layout.tsx` and update `src/App.tsx` to wrap all routes in the Layout via React Router v7 layout route pattern.
  - **Details**: `Layout.tsx`: renders `<Header />`, `<main id="main-content" tabIndex={-1}>` (skip-link target; `tabIndex={-1}` allows programmatic focus), `<Outlet />` inside `<main>`, `<Footer />`. The `<main>` element must have top padding/margin sufficient to clear the sticky header (use a `--header-height` token or a `pt-*` class referencing the token). `App.tsx`: import Layout and restructure routes so Layout is the parent layout route with `<Outlet>` and all page routes (Home, About, Contact — even if they are placeholder components) are children. Add `useEffect` + `useLocation` to update `document.title` on route change (title format: `"<Page> | Mars Mission Fund"`). If placeholder page components do not exist, create minimal ones (`src/pages/Home.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx`) that render a `<h1>` so the router has valid children.
  - **Files**: `src/components/Layout.tsx`, `src/App.tsx`, `src/pages/Home.tsx` (create if absent), `src/pages/About.tsx` (create if absent), `src/pages/Contact.tsx` (create if absent)
  - **Verify**: `npm run build` passes. Dev server shows Header + Footer on `/`, `/about`, and `/contact`. Active nav link highlights. Skip link Tab-focuses `#main-content`. `document.title` updates on route change.
  - **Brief ref**: §Approach step 10

- [ ] TASK-12: Final verification and token audit
  - **Goal**: Confirm the full implementation satisfies all brief requirements: build clean, all tokens Tier 2 only, accessibility checks, reduced-motion behaviour, mobile responsiveness.
  - **Details**: Run `npm run build` and confirm zero errors. Scan all created files with grep/read to verify no hardcoded hex colours, pixel font sizes, or raw font-family strings appear outside of `tokens.css`. Confirm each component file uses only `var(--…)` references. Check `ProgressBar.tsx` has both CSS media query and `matchMedia` reduced-motion handling. Check `Header.tsx` has `aria-expanded` on hamburger and skip link. Check `Logo.tsx` has `role="img"`. Review `App.tsx` for layout route structure and `document.title` update. Fix any issues found.
  - **Files**: All previously created files (read + patch as needed)
  - **Verify**: `npm run build` passes with zero TypeScript or Vite errors. No hardcoded visual values in component files. All ARIA requirements from brief §Accessibility met.
  - **Brief ref**: §Approach step 11, §Verification
