# Create design system primitives and layout shell

**Issue:** #3
**Branch:** feat/shared-ui
**Depends on:** #2
**Brief ref:** BRIEF.md Sections 3, 4.4, 4.5

## Tasks

- [ ] **TASK-01: Create Button component**
  - **Goal:** Implement the Button design system primitive per L2-001 Section 3.1
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.1
  - **Files:** `src/components/ui/Button.tsx`
  - **Details:**
    - Variants: `primary`, `secondary`, `ghost` (success variant deferred — not needed for marketing pages)
    - Primary uses `--gradient-action-primary` background, `--color-action-primary-text` text, `--color-action-primary-shadow` shadow
    - Secondary uses `--color-action-secondary-bg`, `--color-action-secondary-text`, `--color-action-secondary-border`
    - Ghost uses transparent bg, `--color-action-ghost-text`, `--color-action-ghost-border`
    - All variants: `--radius-button`, `--type-button`, padding 12px 24px
    - Hover states use `--motion-hover` timing
    - Focus states per L2-001 Section 5.3: `outline: 2px solid var(--color-action-primary-hover); outline-offset: 2px`
    - Supports `disabled` state with `--color-action-disabled`
    - Props: `variant`, `disabled`, `children`, `className`, `onClick`, plus native button props via `ComponentPropsWithoutRef<'button'>`
    - Supports rendering as `<a>` when `href` prop is provided (for CTA links)
  - **Verification:** All three button variants render with correct token-based styles; hover, focus, and disabled states work

- [ ] **TASK-02: Create Card component**
  - **Goal:** Implement the Card design system primitive per L2-001 Section 3.2
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.2
  - **Files:** `src/components/ui/Card.tsx`
  - **Details:**
    - Background: `--color-bg-surface`
    - Border: `1px solid var(--color-border-subtle)`
    - Border radius: `--radius-card`
    - Optional top accent bar: `2px` gradient from `--color-border-accent` to `--color-status-warning`
    - Padding: 32px
    - Props: `accent` (boolean for top bar), `children`, `className`
  - **Verification:** Card renders with dark surface background, subtle border, correct radius; accent variant shows top gradient bar

- [ ] **TASK-03: Create StatCard component**
  - **Goal:** Implement the StatCard design system primitive per L2-001 Section 3.4
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.4
  - **Files:** `src/components/ui/StatCard.tsx`
  - **Details:**
    - Background: `--gradient-surface-stat`
    - Border: `--color-border-subtle`
    - Border radius: `--radius-stat`
    - Label: `--type-body-small` weight 500, `--color-text-tertiary`
    - Value: `--type-stat-value`, `--color-text-primary`
    - Optional sub text with `positive` or `neutral` variant
    - Props: `label`, `value`, `subText`, `subVariant` (`'positive' | 'neutral'`), `className`
  - **Verification:** StatCard renders with gradient background, large display value, small label, and optional sub text in correct colours

- [ ] **TASK-04: Create SectionLabel component**
  - **Goal:** Implement the Section Label pattern per L2-001 Section 3.7
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.7
  - **Files:** `src/components/ui/SectionLabel.tsx`
  - **Details:**
    - Font: `--type-section-label` (Space Mono, 11px, 400, letter-spacing 0.3em, uppercase)
    - Colour: `--color-text-accent`
    - Format: "NUMBER — TITLE" (e.g., "01 — IDENTITY")
    - Margin bottom: 16px
    - Props: `number` (string, e.g., "01"), `title` (string), `className`
  - **Verification:** Section label renders in Space Mono, uppercase, with accent colour and correct spacing

- [ ] **TASK-05: Create Badge component**
  - **Goal:** Implement the Badge design system primitive per L2-001 Section 3.5
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.5
  - **Files:** `src/components/ui/Badge.tsx`
  - **Details:**
    - Variants: `funded`, `active`, `new`
    - Each variant uses its own bg/text/border/dot colour set per L2-001 Section 3.5
    - All badges: `--radius-badge`, `--type-button` at 12px, padding 6px 12px, 6px dot indicator
    - Dot is decorative: `aria-hidden="true"`; status conveyed via text
    - Props: `variant`, `children`, `className`
  - **Verification:** All three badge variants render with correct colours, dot indicator, and border

- [ ] **TASK-06: Create ProgressBar component**
  - **Goal:** Implement the ProgressBar design system primitive per L2-001 Section 3.3
  - **Brief ref:** BRIEF.md Section 4.4, L2-001 Section 3.3
  - **Files:** `src/components/ui/ProgressBar.tsx`
  - **Details:**
    - Track background: `--color-progress-track`
    - Fill (in progress): `--color-progress-fill` gradient
    - Fill (complete): `--color-progress-complete` gradient
    - Track radius: `--radius-progress`
    - Height: 8px
    - Endpoint indicator: 14px circle, `--color-progress-indicator`, `box-shadow: 0 0 12px`
    - ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label`
    - Respects `prefers-reduced-motion` — instant fill, no animation
    - Props: `value` (0-100), `complete` (boolean), `label` (string for aria-label), `className`
  - **Verification:** Progress bar renders with correct track/fill colours, endpoint dot, and proper ARIA attributes; reduced motion shows instant fill

- [ ] **TASK-07: Create Logo component**
  - **Goal:** Create a React component that renders the MMF coin logo as inline SVG
  - **Brief ref:** BRIEF.md Section 4.5, L2-001 Section 6.1, L3-005 Section 9.3
  - **Files:** `src/components/ui/Logo.tsx`
  - **Details:**
    - Convert `assets/logo.svg` content into a React component
    - Props: `size` (`'sm' | 'md' | 'lg'`) mapping to 32px / 72px / 120px height
    - Default size `'sm'` (32px for nav use per L2-001 Section 6.1)
    - Accepts `aria-label` prop; defaults to "Mars Mission Fund"
    - `role="img"` on the SVG element
  - **Verification:** Logo renders at correct sizes; accessible label present

- [ ] **TASK-08: Create Header component**
  - **Goal:** Build the shared site header with logo and navigation
  - **Brief ref:** BRIEF.md Section 4.4
  - **Files:** `src/components/Header.tsx`
  - **Details:**
    - Fixed or sticky header with `--color-bg-page` background (or transparent with backdrop blur)
    - Left: Logo component at `sm` size (32px) linking to `/`
    - Left: "MARS MISSION FUND" wordmark in `--font-display` next to logo (or omit if space is tight on mobile)
    - Right: Navigation links — Home, About, Contact — using React Router `NavLink`
    - Active link indicated with `--color-action-primary` / `--color-border-accent`
    - Mobile: hamburger menu or collapsed nav below `--breakpoint-md` (768px)
    - Skip-to-content link as first focusable element per L3-005 Section 4.3
    - Semantic `<header>` and `<nav>` elements with `aria-label="Main navigation"`
  - **Verification:** Header renders with logo, nav links, active state; skip-to-content link is first focusable element; mobile nav collapses

- [ ] **TASK-09: Create Footer component**
  - **Goal:** Build the shared site footer
  - **Brief ref:** BRIEF.md Section 4.4
  - **Files:** `src/components/Footer.tsx`
  - **Details:**
    - Background: `--color-bg-surface`
    - Border top: `1px solid var(--color-border-subtle)`
    - Logo at horizontal lockup size (72px coin per L2-001 Section 6.1)
    - Tagline: "Your stake. Their mission. Our planet." (from L1-001)
    - Navigation links: Home, About, Contact
    - Copyright: "2026 Mars Mission Fund. All rights reserved." (dummy)
    - Semantic `<footer>` element
    - Responsive: stacks vertically on mobile
  - **Verification:** Footer renders with logo, tagline, links, copyright; proper semantic markup

- [ ] **TASK-10: Create Layout component and wire routing**
  - **Goal:** Create the shared page layout wrapper and finalise routing
  - **Brief ref:** BRIEF.md Section 4.3, 4.4
  - **Files:** `src/components/Layout.tsx`, `src/App.tsx` (updated)
  - **Details:**
    - Layout component wraps pages with Header, `<main id="main-content">` (target of skip link), and Footer
    - `<main>` has appropriate padding/margin to clear fixed header
    - Update `src/App.tsx` to use Layout as the route wrapper via React Router's layout route or `<Outlet>`
    - Ensure page title updates on route change (document.title)
  - **Verification:** All routes show Header and Footer with page content between them; skip-to-content link jumps to `#main-content`

- [ ] **TASK-11: Final verification**
  - **Goal:** Verify all shared UI deliverables
  - **Verification:**
    - All six design system primitives (Button, Card, StatCard, SectionLabel, Badge, ProgressBar) render correctly
    - All primitives use only Tier 2 semantic tokens (no hardcoded colours, sizes, or fonts)
    - Header shows on all routes with working navigation and mobile responsive behaviour
    - Footer shows on all routes with correct content
    - Skip-to-content link works
    - Focus states visible on all interactive elements
    - Components respond correctly to all four breakpoints
    - `npm run build` succeeds
