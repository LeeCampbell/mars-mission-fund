# Tasks: Issue #2 — Scaffold frontend project

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Initialise Vite + React 19 + TypeScript project
  - **Goal**: Create the base Vite project with React 19 and TypeScript strict mode
  - **Details**: Run `npm create vite@latest . -- --template react-ts` (or manually create `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`). Set `"strict": true` in `tsconfig.app.json`. Install deps with `npm install`. Ensure React version is 19.
  - **Files**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
  - **Verify**: `npm run build` succeeds; `src/main.tsx` and `src/App.tsx` exist; `tsconfig.app.json` has `"strict": true`
  - **Brief ref**: TASK-01 — Vite + React + TypeScript

- [x] TASK-02: Update index.html with meta tags, dark background, and noscript fallback
  - **Goal**: Produce a production-ready `index.html` entry point
  - **Details**: Edit `index.html` to include: `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `style="background:#060A14"` on the `<html>` element, a `<noscript>` block with a branded message using system-font fallbacks (DM Sans, sans-serif), and a `<link rel="preload" as="font" type="font/woff2" crossorigin>` tag pointing to `DM Sans 400` WOFF2 path (`/src/assets/fonts/dm-sans-400.woff2`).
  - **Files**: `index.html`
  - **Verify**: Open `index.html` source and confirm all five elements (charset, viewport, dark bg on `<html>`, noscript, preload link) are present
  - **Brief ref**: TASK-01 — index.html requirements

- [x] TASK-03: Install and configure Tailwind CSS v4
  - **Goal**: Wire Tailwind CSS v4 into the Vite build pipeline
  - **Details**: Run `npm install -D tailwindcss@4 @tailwindcss/vite`. Add `tailwindcss()` from `@tailwindcss/vite` to the plugins array in `vite.config.ts`. Create `src/index.css` with `@import "tailwindcss";` as the first line. Import `./index.css` in `src/main.tsx` (replace any existing CSS import).
  - **Files**: `vite.config.ts`, `src/index.css`, `src/main.tsx`
  - **Verify**: `npm run build` succeeds and the output CSS includes Tailwind reset/base styles; `src/index.css` starts with `@import "tailwindcss"`
  - **Brief ref**: TASK-02 — Tailwind CSS v4

- [x] TASK-04: Install React Router v7 and set up three placeholder routes
  - **Goal**: Enable client-side routing with placeholder pages for `/`, `/about`, `/contact`
  - **Details**: Run `npm install react-router`. Replace `src/App.tsx` with a component that uses `BrowserRouter` (from `react-router`) wrapping a `Routes` element containing three `Route` entries: path `/` → `<HomePage>`, path `/about` → `<AboutPage>`, path `/contact` → `<ContactPage>`. Define each page as a minimal functional component returning a single `<p>` with its name (e.g., `<p>Home page — coming soon</p>`). These can be co-located in `src/App.tsx` or in separate files in `src/pages/`.
  - **Files**: `src/App.tsx`, `src/pages/HomePage.tsx` (optional), `src/pages/AboutPage.tsx` (optional), `src/pages/ContactPage.tsx` (optional)
  - **Verify**: `npm run build` succeeds with no TypeScript errors; `src/App.tsx` uses `BrowserRouter` and has routes for `/`, `/about`, and `/contact`
  - **Brief ref**: TASK-03 — React Router v7

- [x] TASK-05: Download and place self-hosted WOFF2 font files
  - **Goal**: Add all required font files to the repo so no runtime CDN is needed
  - **Details**: Download Latin-subset WOFF2 files for: Bebas Neue 400, DM Sans 400, DM Sans 500, DM Sans 600, DM Sans 700, Space Mono 400. Use google-webfonts-helper (https://gwfh.mranftl.com/fonts) or the Google Fonts download ZIP. Name files with the convention `<family-kebab>-<weight>.woff2` (e.g., `bebas-neue-400.woff2`, `dm-sans-400.woff2`, `dm-sans-500.woff2`, `dm-sans-600.woff2`, `dm-sans-700.woff2`, `space-mono-400.woff2`). Place all files in `src/assets/fonts/`.
  - **Files**: `src/assets/fonts/bebas-neue-400.woff2`, `src/assets/fonts/dm-sans-400.woff2`, `src/assets/fonts/dm-sans-500.woff2`, `src/assets/fonts/dm-sans-600.woff2`, `src/assets/fonts/dm-sans-700.woff2`, `src/assets/fonts/space-mono-400.woff2`
  - **Verify**: All 6 WOFF2 files exist in `src/assets/fonts/` and are non-zero bytes; `ls -lh src/assets/fonts/` confirms this
  - **Brief ref**: TASK-04 — Self-hosted fonts

- [x] TASK-06: Create src/fonts.css with @font-face declarations
  - **Goal**: Declare all font families so the browser loads them from local files
  - **Details**: Create `src/fonts.css`. Add one `@font-face` block per font file (6 total). Use `font-display: optional` for Bebas Neue; `font-display: swap` for DM Sans (all 4 weights) and Space Mono 400. Each block must set `font-family`, `font-weight`, `font-style: normal`, `src: url('./assets/fonts/<filename>.woff2') format('woff2')`. Add `@import "./fonts.css";` at the top of `src/index.css` (after `@import "tailwindcss"` or as a separate import — order: tailwindcss → fonts.css → tokens.css).
  - **Files**: `src/fonts.css`, `src/index.css`
  - **Verify**: `src/fonts.css` contains 6 `@font-face` blocks; `src/index.css` imports it; `npm run build` succeeds
  - **Brief ref**: TASK-04 — Self-hosted fonts / fonts.css

- [x] TASK-07: Create src/tokens.css with all design tokens
  - **Goal**: Define all Tier 1 identity tokens, Tier 2 semantic tokens, breakpoints, and reduced-motion overrides as CSS custom properties
  - **Details**: Create `src/tokens.css` with clearly commented sections:
    - **Section 1.1 — Colour palette (Tier 1)**: `--void`, `--obsidian`, `--graphite`, `--mist`, `--white`, `--electric-cyan`, `--plasma-green`, `--solar-amber`, `--crimson-alert`, `--neutral-*` scale
    - **Section 1.2 — Gradients (Tier 1)**: `--gradient-brand`, `--gradient-hero`, `--gradient-cta`
    - **Section 1.3 — Typography (Tier 1)**: `--font-display`, `--font-body`, `--font-mono`; type-scale tokens `--text-xs` through `--text-7xl`; weight tokens `--weight-regular`, `--weight-medium`, `--weight-semibold`, `--weight-bold`
    - **Section 1.4 — Motion (Tier 1)**: `--motion-duration-instant`, `--motion-duration-fast`, `--motion-duration-base`, `--motion-duration-slow`, `--motion-duration-enter`; `--motion-easing-standard`, `--motion-easing-decelerate`, `--motion-easing-accelerate`, `--motion-easing-spring`
    - **Section 1.5 — Radius (Tier 1)**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`, `--radius-circle`
    - **Section 2.1 — Background colours (Tier 2)**: `--color-bg-page` → `var(--void)`, `--color-bg-surface` → `var(--obsidian)`, `--color-bg-elevated` → `var(--graphite)`
    - **Section 2.2 — Text colours (Tier 2)**: `--color-text-primary` → `var(--white)`, `--color-text-secondary` → `var(--mist)`, `--color-text-disabled` → `rgba()` of mist at 40%
    - **Section 2.3 — Border colours (Tier 2)**: `--color-border-subtle`, `--color-border-default`, `--color-border-strong`
    - **Section 2.4 — Action colours (Tier 2)**: `--color-action-primary` → `var(--electric-cyan)`, `--color-action-primary-hover`, `--color-action-primary-active`; equivalent for secondary action
    - **Section 2.5 — Status colours (Tier 2)**: `--color-status-success` → `var(--plasma-green)`, `--color-status-warning` → `var(--solar-amber)`, `--color-status-error` → `var(--crimson-alert)`, `--color-status-info` → `var(--electric-cyan)`
    - **Sections 2.6–2.10** (shadows, focus, overlay, etc.) as needed to cover all Tier 2 tokens from L2-001
    - **Breakpoints (L3-005 §5.2)**: `--breakpoint-sm: 640px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`
    - **Reduced motion block**: `@media (prefers-reduced-motion: reduce)` overriding all `--motion-duration-*` to `0ms` or `1ms` and `--motion-easing-*` to linear
    All tokens declared on `:root`. Import `tokens.css` in `src/index.css`.
  - **Files**: `src/tokens.css`, `src/index.css`
  - **Verify**: `src/tokens.css` contains all sections listed; `src/index.css` imports it; `npm run build` succeeds
  - **Brief ref**: TASK-05 — Design token CSS

- [x] TASK-08: Add Tailwind @theme block to src/index.css
  - **Goal**: Expose key semantic tokens as Tailwind utility classes
  - **Details**: In `src/index.css`, after all `@import` lines, add a `@theme { }` block mapping key design tokens. Include at minimum: colours (`--color-bg-page`, `--color-bg-surface`, `--color-bg-elevated`, `--color-text-primary`, `--color-text-secondary`, `--color-action-primary`, `--color-action-primary-hover`, `--color-status-*`), font families (`--font-display`, `--font-body`, `--font-mono`), and border-radius tokens (`--radius-sm` through `--radius-pill`). Use the Tailwind v4 CSS-variable syntax: `--color-bg-page: var(--color-bg-page)` inside `@theme { }`.
  - **Files**: `src/index.css`
  - **Verify**: `src/index.css` contains a `@theme { }` block with at least 10 custom property mappings; `npm run build` succeeds
  - **Brief ref**: TASK-05 — @theme block

- [x] TASK-09: Add global base styles and reset in src/index.css
  - **Goal**: Apply sensible global defaults using the design tokens
  - **Details**: In `src/index.css`, after the `@theme` block, add a `@layer base { }` block containing:
    - `*, *::before, *::after { box-sizing: border-box; }`
    - `html { scroll-behavior: smooth; }` + `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`
    - `body { background: var(--color-bg-page); color: var(--color-text-secondary); font-family: var(--font-body); line-height: 1.7; margin: 0; }`
    - `h1, h2, h3, h4, h5, h6 { color: var(--color-text-primary); font-family: var(--font-display); }`
    - `a { color: var(--color-action-primary); text-decoration: none; }` and `a:hover { color: var(--color-action-primary-hover); }`
  - **Files**: `src/index.css`
  - **Verify**: `src/index.css` contains a `@layer base` block with all rules listed; `npm run build` succeeds
  - **Brief ref**: TASK-06 — Base styles and global reset

- [ ] TASK-10: Final build verification
  - **Goal**: Confirm the complete scaffold meets every acceptance criterion from the brief
  - **Details**: Run `npm run build` and verify it exits 0 with no TypeScript or Vite errors. Check the following by inspecting files/output:
    1. `dist/` directory produced with `index.html` and assets
    2. `src/assets/fonts/` has all 6 WOFF2 files
    3. `src/fonts.css` has 6 `@font-face` blocks with correct `font-display` values
    4. `src/tokens.css` has all Tier 1 + Tier 2 sections plus breakpoints and reduced-motion block
    5. `src/index.css` has `@import "tailwindcss"`, font/token imports, `@theme` block, and `@layer base` block
    6. `src/App.tsx` uses `BrowserRouter` with routes for `/`, `/about`, `/contact`
    7. `index.html` has dark bg `#060A14`, charset, viewport, noscript, preload link
    If any check fails, fix it before marking this task complete.
  - **Files**: (none new — verification only)
  - **Verify**: `npm run build` exits 0; all 7 checks above pass
  - **Brief ref**: TASK-07 — Final verification / Verification section
