# Scaffold frontend project

**Issue:** #2
**Branch:** feat/scaffold-frontend
**Depends on:** none
**Brief ref:** BRIEF.md Sections 2, 4

## Tasks

- [ ] **TASK-01: Initialise Vite + React + TypeScript project**
  - **Goal:** Create a new Vite project with React 19 and TypeScript in the repository root
  - **Brief ref:** BRIEF.md Section 4.1
  - **Files:** `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
  - **Details:**
    - Run `npm create vite@latest . -- --template react-ts` or equivalent manual setup
    - React 19.x, TypeScript strict mode (`strict: true` per L2-002)
    - Ensure `index.html` has proper `<meta>` tags, dark theme background (`#060A14`), and `<noscript>` fallback per L3-005 Section 7.2
    - Add `<link rel="preload">` hint for DM Sans font (per L3-005 Section 9.1)
  - **Verification:** `npm install` succeeds; `npm run dev` serves a blank React page

- [ ] **TASK-02: Install and configure Tailwind CSS v4**
  - **Goal:** Add Tailwind CSS v4 with CSS-first configuration
  - **Brief ref:** BRIEF.md Section 4.1
  - **Files:** `package.json` (updated), `src/index.css`
  - **Details:**
    - Install `tailwindcss @tailwindcss/vite` as dev dependencies
    - Add the Tailwind Vite plugin to `vite.config.ts`
    - Create `src/index.css` with `@import "tailwindcss"` directive
    - Import `index.css` in `src/main.tsx`
  - **Verification:** Tailwind utility classes (e.g., `className="text-red-500"`) render correctly in the browser

- [ ] **TASK-03: Install React Router v7**
  - **Goal:** Add React Router v7 and configure basic routing
  - **Brief ref:** BRIEF.md Section 4.3
  - **Files:** `package.json` (updated), `src/App.tsx` (updated)
  - **Details:**
    - Install `react-router` (v7)
    - Set up `BrowserRouter` in `src/App.tsx` with placeholder routes for `/`, `/about`, `/contact`
    - Each route renders a temporary placeholder component (text only)
  - **Verification:** Navigating to `/`, `/about`, `/contact` in the browser shows different placeholder text

- [ ] **TASK-04: Download and self-host web fonts**
  - **Goal:** Self-host Bebas Neue, DM Sans, and Space Mono as WOFF2 files
  - **Brief ref:** BRIEF.md Section 4.2, L3-005 Section 9.1
  - **Files:** `src/assets/fonts/*.woff2`, `src/fonts.css`
  - **Details:**
    - Download WOFF2 files for: Bebas Neue (400), DM Sans (400, 500, 600, 700), Space Mono (400)
    - Place in `src/assets/fonts/`
    - Create `src/fonts.css` with `@font-face` declarations
    - `font-display: swap` for DM Sans and Space Mono
    - `font-display: optional` for Bebas Neue
    - Import `fonts.css` in `src/index.css`
  - **Verification:** Text renders in the correct fonts in the browser; no Google Fonts network requests

- [ ] **TASK-05: Create design token CSS**
  - **Goal:** Define all Tier 1 identity tokens and Tier 2 semantic tokens as CSS custom properties
  - **Brief ref:** BRIEF.md Section 4.1, L2-001 Sections 1–2
  - **Files:** `src/tokens.css`
  - **Details:**
    - Define all Tier 1 identity tokens from L2-001 Section 1 (colours, gradients, typography, motion, radius) as CSS custom properties on `:root`
    - Define all Tier 2 semantic tokens from L2-001 Section 2 mapping to Tier 1 tokens
    - Include `prefers-reduced-motion` media query overriding motion tokens per L2-001 Section 5.2
    - Include breakpoint tokens from L3-005 Section 5.2
    - Import `tokens.css` in `src/index.css`
    - Configure Tailwind's `@theme` block in `src/index.css` to expose key semantic tokens as Tailwind utilities
  - **Verification:** Semantic token CSS custom properties are visible in browser DevTools on the `:root` element; all tokens from L2-001 Sections 1 and 2 are present

- [ ] **TASK-06: Set base styles and global reset**
  - **Goal:** Apply base styles consistent with the brand
  - **Brief ref:** L2-001 Section 2.3, L3-005 Section 8
  - **Files:** `src/index.css` (updated)
  - **Details:**
    - Set `body` background to `var(--color-bg-page)`, colour to `var(--color-text-secondary)`, font to `var(--font-body)`
    - Set default line-height to 1.7 per `--type-body`
    - Apply `box-sizing: border-box` globally
    - Set heading defaults to `var(--color-text-primary)`
    - Set link defaults to `var(--color-action-primary)` with hover `var(--color-action-primary-hover)`
    - Ensure `html { scroll-behavior: smooth }` with reduced-motion override
  - **Verification:** The page background is dark (`#060A14`), text is light, fonts are correct; `prefers-reduced-motion` disables smooth scrolling

- [ ] **TASK-07: Final verification**
  - **Goal:** Verify all scaffolding deliverables
  - **Verification:**
    - `npm install` succeeds with no errors
    - `npm run dev` starts the Vite dev server
    - Three routes (`/`, `/about`, `/contact`) render placeholder content
    - Fonts load from self-hosted WOFF2 files (no external requests)
    - CSS custom properties for all L2-001 tokens are present on `:root`
    - Page background is `--void` (`#060A14`), text colours match token definitions
    - `npm run build` produces a successful production build
