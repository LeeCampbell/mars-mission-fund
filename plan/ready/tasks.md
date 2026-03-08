# Tasks: Issue #2 — Scaffold frontend project

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Initialise Vite + React 19 + TypeScript project
  - **Goal**: Bootstrap the project with Vite's `react-ts` template and confirm TypeScript strict mode is enabled.
  - **Details**:
    - Run `npm create vite@latest . -- --template react-ts` in the repo root (accept prompts/overwrite if needed).
    - Verify `tsconfig.app.json` has `"strict": true` under `compilerOptions`; add it if missing.
    - Remove boilerplate content from `src/App.tsx` and `src/App.css` (or delete `App.css`); replace `App.tsx` body with a minimal placeholder `<div>Mars Mission Fund</div>`.
    - Remove the default `src/index.css` content (keep the file — it will be populated later).
    - Run `npm install` to install generated dependencies.
  - **Files**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/index.css`
  - **Verify**: `npm run build` completes without errors. `npm run typecheck` (or `tsc --noEmit`) exits 0.
  - **Brief ref**: Approach step 1 — "Project init"

- [ ] TASK-02: Install and configure Tailwind CSS v4
  - **Goal**: Wire Tailwind CSS v4 into the Vite build via the `@tailwindcss/vite` plugin and CSS-first import.
  - **Details**:
    - `npm install -D tailwindcss @tailwindcss/vite`
    - Add `tailwindcss()` from `@tailwindcss/vite` to the `plugins` array in `vite.config.ts`.
    - Add `@import "tailwindcss";` as the first line of `src/index.css`.
    - Ensure `src/main.tsx` imports `./index.css`.
    - Add a temporary smoke-test class (e.g. `className="text-red-500"`) to the placeholder in `src/App.tsx` to confirm Tailwind is active (will be removed or left as-is for verification).
  - **Files**: `vite.config.ts`, `src/index.css`, `src/main.tsx`, `src/App.tsx`
  - **Verify**: `npm run build` passes. Dev server renders the placeholder text in red (Tailwind utility applied).
  - **Brief ref**: Approach step 2 — "Tailwind"

- [ ] TASK-03: Install React Router v7 and define placeholder routes
  - **Goal**: Set up client-side routing with three routes (`/`, `/about`, `/contact`), each showing distinct placeholder text.
  - **Details**:
    - `npm install react-router@7`
    - Rewrite `src/App.tsx` to use `BrowserRouter`, `Routes`, and `Route` from `react-router`.
    - Route `/` → inline element `<main>Home — Mars Mission Fund</main>`
    - Route `/about` → inline element `<main>About — Mars Mission Fund</main>`
    - Route `/contact` → inline element `<main>Contact — Mars Mission Fund</main>`
    - Keep the Tailwind smoke-test class (e.g. on the `<main>` element or a wrapper) so Tailwind verification still passes.
    - Add `"typecheck": "tsc --noEmit"` to `scripts` in `package.json` if not already present.
  - **Files**: `src/App.tsx`, `package.json`
  - **Verify**: `npm run build` and `npm run typecheck` both pass. Dev server at `/`, `/about`, `/contact` each shows distinct text.
  - **Brief ref**: Approach step 3 — "React Router"; Scope — "React Router v7"

- [ ] TASK-04: Download and place self-hosted WOFF2 font files
  - **Goal**: Obtain all required WOFF2 font files and store them in `src/assets/fonts/`.
  - **Details**:
    - Create directory `src/assets/fonts/`.
    - Download the following WOFF2 files from Fontsource npm packages or Google Fonts (use `npm install` from `@fontsource` or `curl`/`wget` if available):
      - **Bebas Neue**: weight 400 — save as `bebas-neue-400.woff2`
      - **DM Sans**: weights 400, 500, 600, 700 — save as `dm-sans-400.woff2`, `dm-sans-500.woff2`, `dm-sans-600.woff2`, `dm-sans-700.woff2`
      - **Space Mono**: weight 400 — save as `space-mono-400.woff2`
    - Recommended approach: install `@fontsource/bebas-neue`, `@fontsource/dm-sans`, `@fontsource/space-mono` as devDependencies, copy the WOFF2 files from `node_modules/@fontsource/*/files/` into `src/assets/fonts/`, then uninstall the packages (or leave as devDep — either is fine).
    - Alternatively use `curl` to fetch directly from Google Fonts CDN WOFF2 URLs.
  - **Files**: `src/assets/fonts/bebas-neue-400.woff2`, `src/assets/fonts/dm-sans-400.woff2`, `src/assets/fonts/dm-sans-500.woff2`, `src/assets/fonts/dm-sans-600.woff2`, `src/assets/fonts/dm-sans-700.woff2`, `src/assets/fonts/space-mono-400.woff2`
  - **Verify**: All six WOFF2 files exist in `src/assets/fonts/` and are non-zero bytes (`ls -lh src/assets/fonts/`).
  - **Brief ref**: Scope — "Self-hosted WOFF2 fonts"; Approach step 4 — "Fonts"

- [ ] TASK-05: Create `src/fonts.css` with @font-face declarations
  - **Goal**: Declare all three font families via `@font-face` so the browser loads them locally.
  - **Details**:
    - Create `src/fonts.css`.
    - Declare `@font-face` blocks for every font file placed in TASK-04, using relative paths (e.g. `url('./assets/fonts/dm-sans-400.woff2')`).
    - `font-display` values per brief:
      - Bebas Neue → `font-display: optional`
      - DM Sans → `font-display: swap`
      - Space Mono → `font-display: swap`
    - Each DM Sans weight (400/500/600/700) needs its own `@font-face` block with matching `font-weight`.
    - Add `@import "./fonts.css";` to `src/index.css` (after `@import "tailwindcss";`).
  - **Files**: `src/fonts.css`, `src/index.css`
  - **Verify**: `npm run build` passes. In the built `dist/assets/` directory, `.woff2` files appear, confirming Vite bundled them.
  - **Brief ref**: Scope — "`src/fonts.css`"; Approach step 4 — "Fonts"; L3-005 Section 9.1

- [ ] TASK-06: Create `src/tokens.css` with Tier 1 and Tier 2 design tokens
  - **Goal**: Define all L2-001 CSS custom properties (identity palette, semantic tokens, motion, radii, breakpoints) on `:root`.
  - **Details**:
    - Create `src/tokens.css`.
    - **Tier 1 — Identity tokens** (raw palette, on `:root`):
      - Colour palette (at minimum): `--void: #060A14`, `--deepspace: #0D1526`, `--nebula: #1A2640`, `--storm: #2D3F5C`, `--steel: #4A6080`, `--silver: #C8D0DC`, `--chrome: #E8EDF5`, `--stardust: #F5F7FA`, `--launchfire: #FF4D1C`, `--ember: #FF7A4D`, `--solar: #FFB347`, `--aurora: #00E5CC`, `--plasma: #7B61FF`, `--comet: #00B8D9`
      - Font families: `--font-brand: 'Bebas Neue', sans-serif`, `--font-body: 'DM Sans', sans-serif`, `--font-mono: 'Space Mono', monospace`
      - Base scale values (e.g. `--space-base: 4px`, `--radius-base: 4px`, etc.) — define whatever Tier 1 foundation values L2-001 specifies.
    - **Tier 2 — Semantic tokens** (on `:root`), mapping to Tier 1:
      - Colours: `--color-background: var(--void)`, `--color-surface: var(--deepspace)`, `--color-surface-raised: var(--nebula)`, `--color-border: var(--storm)`, `--color-text-primary: var(--chrome)`, `--color-text-secondary: var(--silver)`, `--color-text-muted: var(--steel)`, `--color-action-primary: var(--launchfire)`, `--color-action-primary-hover: var(--ember)`, `--color-accent: var(--aurora)`, `--color-accent-alt: var(--plasma)`
      - Radii: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 8px`, `--radius-xl: 16px`, `--radius-button: 2px`, `--radius-card: 8px`, `--radius-pill: 9999px`
      - Motion (enter/exit/emphasis durations and easing): `--motion-enter: 200ms`, `--motion-exit: 150ms`, `--motion-emphasis: 300ms`, `--motion-easing-default: cubic-bezier(0.4, 0, 0.2, 1)`, `--motion-easing-enter: cubic-bezier(0, 0, 0.2, 1)`, `--motion-easing-exit: cubic-bezier(0.4, 0, 1, 1)`
    - **Breakpoint tokens** (from L3-005 Section 5.2, on `:root`):
      - `--breakpoint-sm: 640px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`
    - **`prefers-reduced-motion` override** (per L2-001 Section 5.2):
      ```css
      @media (prefers-reduced-motion: reduce) {
        :root {
          --motion-enter: 0ms;
          --motion-exit: 0ms;
          --motion-emphasis: 0ms;
        }
      }
      ```
    - Add `@import "./tokens.css";` to `src/index.css` (after the fonts import).
  - **Files**: `src/tokens.css`, `src/index.css`
  - **Verify**: `npm run build` passes. DevTools `:root` computed styles show all listed custom properties.
  - **Brief ref**: Scope — "`src/tokens.css`"; Approach steps 5 — "Tokens"; L2-001 Sections 1–2 and 5.2; L3-005 Section 5.2

- [ ] TASK-07: Add `@theme` block and global reset/base styles to `src/index.css`
  - **Goal**: Expose key semantic tokens as Tailwind v4 utilities via `@theme`, and apply a brand-consistent global CSS reset.
  - **Details**:
    - **`@theme` block** (in `src/index.css`, after imports):
      ```css
      @theme {
        --color-background: var(--color-background);
        --color-surface: var(--color-surface);
        --color-action-primary: var(--color-action-primary);
        --color-action-primary-hover: var(--color-action-primary-hover);
        --color-accent: var(--color-accent);
        --color-text-primary: var(--color-text-primary);
        --color-text-secondary: var(--color-text-secondary);
        --color-text-muted: var(--color-text-muted);
        --color-border: var(--color-border);
        --radius-sm: var(--radius-sm);
        --radius-md: var(--radius-md);
        --radius-lg: var(--radius-lg);
        --radius-button: var(--radius-button);
        --radius-card: var(--radius-card);
        --font-family-brand: var(--font-brand);
        --font-family-body: var(--font-body);
        --font-family-mono: var(--font-mono);
      }
      ```
    - **Global reset / base styles** (after the `@theme` block):
      ```css
      *, *::before, *::after { box-sizing: border-box; }

      html {
        scroll-behavior: smooth;
      }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
      }

      body {
        background-color: var(--color-background);
        color: var(--color-text-primary);
        font-family: var(--font-body);
        font-size: 1rem;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        margin: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        color: var(--chrome);
        font-family: var(--font-brand);
        line-height: 1.1;
        margin: 0;
      }

      a {
        color: var(--color-action-primary);
        text-decoration: none;
      }
      a:hover {
        color: var(--color-action-primary-hover);
      }
      ```
  - **Files**: `src/index.css`
  - **Verify**: `npm run build` passes. Dev server shows dark background (`#060A14`), light body text, and confirms `box-sizing` reset applies.
  - **Brief ref**: Scope — "`src/index.css`", "Global reset / base styles", "Tailwind `@theme` block"; Approach step 6 — "Base styles"

- [ ] TASK-08: Update `index.html` with meta tags, dark background, noscript, and font preload
  - **Goal**: Produce a production-ready HTML entry point with correct metadata, a dark body background, a `<noscript>` fallback, and a `<link rel="preload">` for DM Sans.
  - **Details**:
    - Set `<html lang="en">`.
    - Add/update `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
    - Add `<meta name="description" content="Mars Mission Fund — Fueling humanity's journey to Mars">` (or equivalent brand description).
    - Add `<title>Mars Mission Fund</title>`.
    - Add `style="background-color:#060A14"` to `<body>` to prevent flash of white before CSS loads.
    - Add `<noscript>` fallback inside `<body>`: `<noscript>This application requires JavaScript to run.</noscript>`.
    - Add `<link rel="preload">` for DM Sans 400 WOFF2 in `<head>`:
      ```html
      <link rel="preload" href="/src/assets/fonts/dm-sans-400.woff2" as="font" type="font/woff2" crossorigin>
      ```
    - Keep the existing `<script type="module" src="/src/main.tsx"></script>` entry point.
  - **Files**: `index.html`
  - **Verify**: HTML validates (no obvious errors). Dev server page source shows all new tags. Background is dark on initial load (before JS hydrates).
  - **Brief ref**: Scope — "`index.html`"; Approach step 7 — "`index.html`"

- [ ] TASK-09: Final build verification and smoke test
  - **Goal**: Confirm all commands pass and the scaffold meets every verification criterion in the brief.
  - **Details**:
    - Run `npm install` (ensure clean install).
    - Run `npm run typecheck` (or `tsc --noEmit`) — must exit 0 with no errors.
    - Run `npm run build` — must complete with no TypeScript or Vite errors; inspect `dist/` to confirm WOFF2 files are present.
    - Run `npm run dev` and manually (or via Playwright if available) navigate to `/`, `/about`, `/contact` — each must show distinct placeholder text.
    - Confirm no requests to `fonts.googleapis.com` or `fonts.gstatic.com` in network tab (fonts served locally).
    - Confirm `--void`, `--launchfire`, `--color-action-primary`, `--motion-enter`, `--radius-button` appear on `:root` in DevTools.
    - Confirm Tailwind smoke-test class renders correctly.
    - Fix any remaining TypeScript errors, missing imports, or build failures found during this task.
  - **Files**: (no new files; fixes to any file as needed)
  - **Verify**: All three npm scripts exit 0. Visual/DevTools checks described above pass.
  - **Brief ref**: Verification section of brief
