# Tasks: Issue #3 — Create design system primitives and layout shell

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Audit existing project structure and assets
  - **Goal**: Confirm all scaffold outputs from issue #2 are present and understand current state before writing any code
  - **Details**: Read `src/App.tsx`, `src/index.css`, `src/tokens.css`, `src/fonts.css`, `vite.config.ts`, and `assets/logo.svg`. Note exact token names available (e.g. `--color-action-primary`, `--motion-hover`, `--breakpoint-md`). Confirm `src/components/` and `src/components/ui/` directories need to be created. Record any deviations from what the brief assumes.
  - **Files**: No files created or modified — read-only audit
  - **Verify**: List of confirmed existing files and token names is known; any gaps are noted
  - **Brief ref**: Approach → "Issue #2 will have produced the following files"

- [x] TASK-02: Create Logo component
  - **Goal**: Inline SVG React component rendering `assets/logo.svg` at three controlled sizes
  - **Details**: Create `src/components/ui/Logo.tsx`. Accept `size` prop typed as `'sm' | 'md' | 'lg'` mapping to heights 32/72/120px. Inline the SVG markup from `assets/logo.svg` directly (no `<img>` tag). Set `height` from the size map; set `width` to `auto` or derive proportionally from the `0 0 120 120` viewBox. Accept a `className` prop. Add `aria-label="Logo"` and `role="img"` on the SVG.
  - **Files**: `src/components/ui/Logo.tsx`
  - **Verify**: Component compiles with no TypeScript errors (`npm run build` or `tsc --noEmit`)
  - **Brief ref**: Scope → "Logo component"; Approach → "Logo component" section

- [x] TASK-03: Create Button component
  - **Goal**: Polymorphic button/anchor component with primary, secondary, and ghost variants
  - **Details**: Create `src/components/ui/Button.tsx`. When `href` prop is provided render `<a>`; otherwise render `<button>`. Variants: `primary` (filled `--color-action-primary` bg, dark text), `secondary` (border `--color-border-accent`, transparent bg), `ghost` (no border, transparent, hover bg). Disabled state: `--color-action-disabled` colour, `cursor-not-allowed`. Hover transition duration from `--motion-hover`. Focus outline: 2px solid `--color-action-primary-hover`, offset 2px. Accept `className`, `disabled`, `onClick`, standard anchor/button HTML attributes.
  - **Files**: `src/components/ui/Button.tsx`
  - **Verify**: Component compiles; all three variants, hover, disabled, and both element modes are handled
  - **Brief ref**: Scope → "Button component"; Verification → button variant checks

- [x] TASK-04: Create Card component
  - **Goal**: Surface card with dark background, subtle border, and optional top accent gradient bar
  - **Details**: Create `src/components/ui/Card.tsx`. Default: surface background (`--color-surface-card` or equivalent token), subtle border (`--color-border-subtle`), rounded corners, padding. Optional `accent` boolean prop: when true, render a thin top bar with orange-to-amber gradient (use `--color-accent-*` tokens or equivalent). Accept `className` and `children` props.
  - **Files**: `src/components/ui/Card.tsx`
  - **Verify**: Component compiles; accent and non-accent renders are handled
  - **Brief ref**: Scope → "Card component"; Verification → "Card renders with dark surface background…"

- [x] TASK-05: Create StatCard component
  - **Goal**: Stat display card with gradient background, Bebas Neue value, label, and optional sub text
  - **Details**: Create `src/components/ui/StatCard.tsx`. Props: `label: string`, `value: string | number`, `subText?: string`, `variant?: 'positive' | 'neutral'`. Background: deep-field gradient (use `--gradient-deep-field` or compose from tokens). Value: large Bebas Neue font (`--font-display`). Sub text colour varies by variant. Accept `className` prop.
  - **Files**: `src/components/ui/StatCard.tsx`
  - **Verify**: Component compiles; both variants handle the optional subText
  - **Brief ref**: Scope → "StatCard component"; Verification → "StatCard renders with deep-field gradient…"

- [x] TASK-06: Create SectionLabel component
  - **Goal**: Numbered section header in Space Mono uppercase with launchfire accent colour
  - **Details**: Create `src/components/ui/SectionLabel.tsx`. Props: `number: string | number`, `title: string`, optional `className`. Render formatted text: `"01 — TITLE"` pattern. Font: Space Mono (`--font-mono`). Colour: launchfire accent (`--color-accent-launchfire` or equivalent). Uppercase transform. Keep markup minimal — a single styled element or `<span>`.
  - **Files**: `src/components/ui/SectionLabel.tsx`
  - **Verify**: Component compiles; outputs correct formatted string at runtime
  - **Brief ref**: Scope → "SectionLabel component"; Verification → "SectionLabel renders in Space Mono…"

- [x] TASK-07: Create Badge component
  - **Goal**: Status badge with funded/active/new variants, each with a decorative dot indicator
  - **Details**: Create `src/components/ui/Badge.tsx`. Prop: `variant: 'funded' | 'active' | 'new'`. Each variant has its own bg, text, border, and dot colour from design tokens. Structure: `<span>` containing a `<span>` dot (small circle, `inline-block`) and the `children` text. Accept `className` prop.
  - **Files**: `src/components/ui/Badge.tsx`
  - **Verify**: Component compiles; all three variants map to distinct token-based colour sets
  - **Brief ref**: Scope → "Badge component"; Verification → "All three badge variants render…"

- [x] TASK-08: Create ProgressBar component
  - **Goal**: Accessible progress bar with track, fill, endpoint dot, and reduced-motion support
  - **Details**: Create `src/components/ui/ProgressBar.tsx`. Props: `value: number` (0–100), `max?: number` (default 100), `variant?: 'default' | 'complete'`, `className?: string`. ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax`. Structure: track div containing fill div with percentage width. Endpoint: small circle at the right edge of the fill. Complete variant: green gradient fill. `prefers-reduced-motion`: apply `transition: none` when reduced motion is active (use a CSS class or inline media query via a hook).
  - **Files**: `src/components/ui/ProgressBar.tsx`
  - **Verify**: Component compiles; ARIA attributes present; reduced-motion handling in place
  - **Brief ref**: Scope → "ProgressBar component"; Verification → ProgressBar checks including reduced-motion

- [ ] TASK-09: Create Header component
  - **Goal**: Site header with skip link, logo, wordmark, main nav with active link styling, and mobile collapse
  - **Details**: Create `src/components/Header.tsx`. Structure: `<header>` containing: (1) skip-to-content `<a href="#main-content">` visually hidden until focused (use clip/absolute positioning pattern); (2) `<nav aria-label="Main navigation">` with `Logo` (sm size), wordmark text, and `NavLink` items for Home `/`, About `/about`, Contact `/contact`. Active `NavLink` gets accent colour underline via `--color-action-primary` / `--color-border-accent`. Mobile collapse: `useState` toggle, hide nav links below `768px`, show hamburger `<button aria-expanded aria-controls>`. Import Logo from `./ui/Logo`.
  - **Files**: `src/components/Header.tsx`
  - **Verify**: Component compiles; skip link, nav, and mobile toggle logic are present
  - **Brief ref**: Scope → "Header component"; Approach → "Header" section; Verification → Header checks

- [ ] TASK-10: Create Footer component
  - **Goal**: Site footer with logo, tagline, navigation links, and copyright
  - **Details**: Create `src/components/Footer.tsx`. Structure: `<footer>` containing `Logo` (sm size), tagline text, navigation links (Home/About/Contact using React Router `Link` or plain anchors), and copyright text (e.g. `© {new Date().getFullYear()} Launchfire`). Use token-based colours for bg and text. Import Logo from `./ui/Logo`.
  - **Files**: `src/components/Footer.tsx`
  - **Verify**: Component compiles; logo, tagline, links, and copyright are rendered
  - **Brief ref**: Scope → "Footer component"; Verification → "Footer appears on all routes…"

- [ ] TASK-11: Create Layout component
  - **Goal**: Route wrapper that composes Header, main content area, and Footer for all routes
  - **Details**: Create `src/components/Layout.tsx`. Render: `<Header />`, `<main id="main-content">` containing `<Outlet />` from `react-router`, `<Footer />`. Add top padding to `<main>` to clear the fixed (or sticky) header height if the header is position-fixed. Import `Header` and `Footer` from the same directory.
  - **Files**: `src/components/Layout.tsx`
  - **Verify**: Component compiles; uses `Outlet`, wraps with Header and Footer
  - **Brief ref**: Scope → "Layout component"; Approach → "Layout" section

- [ ] TASK-12: Update App.tsx to use Layout as route wrapper
  - **Goal**: Wire Layout into the React Router tree so all routes render inside the shell
  - **Details**: Modify `src/App.tsx`. Wrap the existing three route elements (`/`, `/about`, `/contact`) under a parent route that renders `<Layout />` using React Router v7's nested route pattern (parent route with `element={<Layout />}` and child routes as `<Outlet>`). Add page title updates on route change: use `useEffect` + `useLocation` to update `document.title` based on the current path (simple switch or map from path to title string).
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` succeeds with no errors; dev server shows Header and Footer on all three routes
  - **Brief ref**: Scope → "Update `src/App.tsx`"; Approach → "Layout" and page title sections

- [ ] TASK-13: Final build and visual verification
  - **Goal**: Confirm the complete implementation builds cleanly and meets all visual acceptance criteria
  - **Details**: Run `npm run build` and confirm zero TypeScript and Vite errors. Start dev server (`npm run dev`) and verify each criterion from the brief's Verification section: all routes show Header + Footer, active nav link is styled, skip-to-content link works, mobile hamburger collapses nav at ≤768px, all Button variants and states are correct, Card accent bar renders, StatCard gradient renders, SectionLabel format is correct, all Badge variants render, ProgressBar ARIA and reduced-motion are correct, Logo renders at all three sizes. Fix any issues found.
  - **Files**: Any files requiring fixes identified during verification
  - **Verify**: `npm run build` exits 0; all visual criteria from the brief's Verification section are met
  - **Brief ref**: Verification section (all items)
