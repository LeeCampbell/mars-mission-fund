# Tasks: Issue #2 — Scaffold frontend project

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Initialise Vite + React 19 + TypeScript project
  - **Goal**: Create a working Vite/React/TS project at the repo root with all required npm dependencies installed
  - **Details**: Manually create `package.json` with `react@19`, `react-dom@19`, `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss@^4`, `@tailwindcss/vite`, and `react-router@^7` (runtime + dev deps correctly separated). Create `tsconfig.json` (project references), `tsconfig.app.json` (strict mode, `jsx: react-jsx`, paths targeting `src`), `tsconfig.node.json` (for `vite.config.ts`). Create `vite.config.ts` importing both `@vitejs/plugin-react` and `@tailwindcss/vite` plugins. Run `npm install` to verify resolution.
  - **Files**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`
  - **Verify**: `npm install` exits 0; `npx tsc --version` works; no peer-dependency errors
  - **Brief ref**: Dependencies table; Approach — project creation

- [x] TASK-02: Download and place WOFF2 font files
  - **Goal**: Self-host all required font weights as WOFF2 files under `src/assets/fonts/`
  - **Details**: Fetch WOFF2 subsets for: Bebas Neue 400, DM Sans 400/500/600/700 (latin subset), Space Mono 400. Use `curl` or `wget` to download from Google Fonts CSS API or a tool like `google-webfonts-helper`. Filenames should be descriptive (e.g. `bebas-neue-400.woff2`, `dm-sans-400.woff2`, etc.). No CDN runtime dependency — all files must be committed assets.
  - **Files**: `src/assets/fonts/bebas-neue-400.woff2`, `src/assets/fonts/dm-sans-400.woff2`, `src/assets/fonts/dm-sans-500.woff2`, `src/assets/fonts/dm-sans-600.woff2`, `src/assets/fonts/dm-sans-700.woff2`, `src/assets/fonts/space-mono-400.woff2`
  - **Verify**: All 6 WOFF2 files exist and are non-zero bytes (`ls -lh src/assets/fonts/`)
  - **Brief ref**: Scope — Self-hosted WOFF2 files; Approach — Font approach

- [x] TASK-03: Create `src/fonts.css` with `@font-face` declarations
  - **Goal**: Declare all font faces pointing to the local WOFF2 assets with correct `font-display` values
  - **Details**: Write `@font-face` rules for each weight. Use `font-display: optional` for Bebas Neue (decorative, non-critical). Use `font-display: swap` for DM Sans (body) and Space Mono (mono). Paths must be relative to `src/assets/fonts/`. Include `font-weight` and `font-style` descriptors for each variant.
  - **Files**: `src/fonts.css`
  - **Verify**: File contains 6 `@font-face` blocks; Bebas Neue uses `optional`, others use `swap`
  - **Brief ref**: Scope — `@font-face` declarations; Approach — Font approach (L3-005 §9.1)

- [x] TASK-04: Create `src/tokens.css` with Tier 1 + Tier 2 design tokens
  - **Goal**: Define all design system CSS custom properties on `:root` plus the `prefers-reduced-motion` override block
  - **Details**: **Tier 1 identity tokens** — colour palette (e.g. `--void: #060A14`, `--stellar-white`, `--mars-red`, `--ion-blue`, full scale), typography scale (font-size, line-height, letter-spacing primitives), spacing scale, border-radius primitives, motion duration/easing primitives (e.g. `--duration-fast`, `--duration-base`, `--easing-standard`). **Tier 2 semantic tokens** — map primitives to purpose: colours (`--color-bg-page`, `--color-bg-surface`, `--color-text-primary`, `--color-text-secondary`, `--color-accent-primary`, `--color-accent-secondary`, `--color-border-default`, etc.), typography (`--font-display`, `--font-body`, `--font-mono`), spacing (`--space-*`), radius (`--radius-*`), motion (`--motion-duration-*`, `--motion-easing-*`, `--motion-ambient`). **Breakpoint tokens** — `--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`, `--breakpoint-xl`. **`prefers-reduced-motion` block** — override all `--motion-duration-*` to `0ms`; set `--motion-ambient: static`; minimal easing overrides.
  - **Files**: `src/tokens.css`
  - **Verify**: File has `:root { ... }` with Tier 1 and Tier 2 vars; has `@media (prefers-reduced-motion: reduce)` block overriding motion tokens
  - **Brief ref**: Scope — `src/tokens.css`; Approach — Token strategy, Motion accessibility (L2-001 §1–2, §5.2; L3-005 §5.2, §6.3)

- [x] TASK-05: Create `src/index.css` with Tailwind import chain, `@theme` block, and base styles
  - **Goal**: Wire Tailwind v4, tokens, and fonts; expose key tokens as Tailwind utilities; apply dark-theme base styles
  - **Details**: File structure in order: (1) `@import "tailwindcss"` — Tailwind v4 CSS-first entry. (2) `@import "./tokens.css"`. (3) `@import "./fonts.css"`. (4) `@theme { ... }` block — map semantic colour tokens to `--color-*` Tailwind theme vars (e.g. `--color-bg-page: var(--color-bg-page)` after renaming or using inline values), map `--font-*` tokens to Tailwind `--font-*`, map `--radius-*`. (5) Base/reset styles in `@layer base` — `html` and `body` reset (margin 0, box-sizing border-box); `body` background `var(--color-bg-page)`, colour `var(--color-text-secondary)`, font-family `var(--font-body)`, line-height from token; `*` universal box-sizing reset; basic `a` colour; `h1–h6` font-family `var(--font-display)`.
  - **Files**: `src/index.css`
  - **Verify**: File starts with `@import "tailwindcss"`; contains `@theme { }` block; `@layer base` sets body bg and font
  - **Brief ref**: Scope — `src/index.css`; Approach — Token strategy

- [ ] TASK-06: Create `index.html` entry point
  - **Goal**: Produce an `index.html` with correct meta tags, dark background, preload hints, and branded noscript fallback
  - **Details**: `<html lang="en">`. `<head>`: `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `<meta name="description" content="Mars Mission Fund — ...">`, `<meta name="theme-color" content="#060A14">`, `<title>Mars Mission Fund</title>`. Background colour on `<html>` via `style="background:#060A14"` to prevent flash. `<link rel="preload">` for DM Sans 400 woff2 with `as="font" type="font/woff2" crossorigin`. `<link rel="stylesheet" href="/src/index.css">` (dev; Vite injects in prod). `<noscript>` with a meaningful message, e.g. "Mars Mission Fund requires JavaScript to be enabled." `<div id="root"></div>`. `<script type="module" src="/src/main.tsx"></script>`.
  - **Files**: `index.html`
  - **Verify**: File has `<meta charset>`, `<meta viewport>`, preload link for DM Sans woff2, `<noscript>` tag, `<div id="root">`
  - **Brief ref**: Scope — `index.html` (L3-005 §9.1)

- [ ] TASK-07: Create `src/main.tsx` and `src/vite-env.d.ts`
  - **Goal**: React entry point that mounts the app and the Vite environment type reference
  - **Details**: `src/main.tsx` — `import './index.css'`; `import React from 'react'`; `import { createRoot } from 'react-dom/client'`; `import App from './App'`; `createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)`. `src/vite-env.d.ts` — standard `/// <reference types="vite/client" />` triple-slash directive.
  - **Files**: `src/main.tsx`, `src/vite-env.d.ts`
  - **Verify**: Both files exist; `main.tsx` imports `index.css` and renders `<App />`
  - **Brief ref**: Files table — `src/main.tsx`, `src/vite-env.d.ts`

- [ ] TASK-08: Create `src/App.tsx` with React Router v7 routes
  - **Goal**: Set up client-side routing with BrowserRouter and three placeholder routes
  - **Details**: Import `BrowserRouter`, `Routes`, `Route` from `react-router`. Define inline placeholder components: `HomePage` returning `<main><h1>Home</h1></main>`, `AboutPage` returning `<main><h1>About</h1></main>`, `ContactPage` returning `<main><h1>Contact</h1></main>`. `App` component returns `<BrowserRouter><Routes><Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /></Routes></BrowserRouter>`. Export `App` as default.
  - **Files**: `src/App.tsx`
  - **Verify**: File imports from `react-router`; has three `<Route>` definitions for `/`, `/about`, `/contact`
  - **Brief ref**: Scope — React Router v7; Approach — Routing

- [ ] TASK-09: Verify production build succeeds
  - **Goal**: Confirm the full project compiles cleanly with no TypeScript or Vite errors
  - **Details**: Run `npm run build` from the repo root. Inspect output — `dist/` directory should be created with `index.html` and hashed JS/CSS assets. Check for any TypeScript type errors or missing module errors. Fix any errors found (missing types, incorrect imports, etc.).
  - **Files**: No new files; fixes to any file as needed
  - **Verify**: `npm run build` exits 0; `dist/` contains `index.html` and at least one JS bundle
  - **Brief ref**: Verification — Build

- [ ] TASK-10: Visual smoke-test via dev server
  - **Goal**: Confirm the dev server starts, routes work, dark theme is applied, and fonts load from local assets
  - **Details**: Start `npm run dev` and use the Playwright browser tool to navigate to `http://localhost:5173`. Check: (1) Page background is `#060A14`. (2) Navigating to `/about` and `/contact` shows different placeholder headings. (3) No requests to `fonts.googleapis.com` or `fonts.gstatic.com` in Network tab. (4) Browser console has no errors. Take a screenshot as evidence.
  - **Files**: No files changed (fix any issues discovered)
  - **Verify**: Screenshot shows dark background; routes render; no external font requests; console clean
  - **Brief ref**: Verification — Dev server, Routes, Fonts, Dark theme
