# Tasks: Issue #2 — Scaffold frontend project

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Initialise project config and entry files
  - **Goal**: Create all configuration files and minimal entry-point source files so the project has a valid structure that can be installed and type-checked.
  - **Details**:
    - Create `package.json` with scripts (`dev`, `build`, `preview`) and all runtime + dev dependencies at the exact versions specified in the brief.
    - Create `tsconfig.json` (root, references `tsconfig.app.json` + `tsconfig.node.json`).
    - Create `tsconfig.app.json` (`strict: true`, `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, includes `src`).
    - Create `tsconfig.node.json` (for `vite.config.ts`, `moduleResolution: "bundler"`).
    - Create `vite.config.ts` importing `react` from `@vitejs/plugin-react` and `tailwindcss` from `@tailwindcss/vite`.
    - Create `index.html` with `<meta charset="UTF-8">`, viewport meta, `theme-color` meta set to `#060A14`, `<noscript>` fallback message, DM Sans `<link rel="preload" as="font">` hint for `dm-sans-400.woff2`, and `<script type="module" src="/src/main.tsx">`.
    - Create `src/vite-env.d.ts` (`/// <reference types="vite/client" />`).
    - Create `src/App.tsx` as a bare placeholder returning a single `<p>Hello</p>`.
    - Create `src/main.tsx` importing `React`, `ReactDOM`, and `./App` then calling `ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)`.
  - **Files**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/vite-env.d.ts`, `src/App.tsx`, `src/main.tsx`
  - **Verify**: `npm install` completes without errors; `npx tsc --noEmit` passes (or produces only expected missing-module errors that will be resolved in later tasks).
  - **Brief ref**: Approach step 1; Files table rows for these files.

- [x] TASK-02: Create CSS entry file with Tailwind import
  - **Goal**: Wire up `src/index.css` as the single CSS entry point so Tailwind is active and the file is imported in `src/main.tsx`.
  - **Details**:
    - Create `src/index.css` with the following import order (stubs for files not yet created are acceptable):
      ```css
      @import "tailwindcss";
      @import "./fonts.css";
      @import "./tokens.css";
      ```
    - Add `import './index.css'` to `src/main.tsx` (before the `App` render call).
    - Create empty stub files `src/fonts.css` and `src/tokens.css` so imports resolve.
  - **Files**: `src/index.css`, `src/main.tsx` (edit), `src/fonts.css` (stub), `src/tokens.css` (stub)
  - **Verify**: `npm run build` succeeds (Tailwind classes are processed, no import errors).
  - **Brief ref**: Approach step 2; Import order section.

- [x] TASK-03: Add React Router with three placeholder routes
  - **Goal**: Replace the bare `App.tsx` placeholder with a `BrowserRouter` + `Routes` tree exposing `/`, `/about`, and `/contact`.
  - **Details**:
    - Update `src/App.tsx` to import `BrowserRouter`, `Routes`, `Route` from `react-router`.
    - Define three inline route elements (no separate page files needed):
      - `/` → `<p>Home — coming soon</p>`
      - `/about` → `<p>About — coming soon</p>`
      - `/contact` → `<p>Contact — coming soon</p>`
    - Wrap everything in `<BrowserRouter>`.
  - **Files**: `src/App.tsx`
  - **Verify**: `npm run build` succeeds; `npm run dev` + manual navigation to each route shows the correct placeholder text.
  - **Brief ref**: Approach step 3; Scope bullet on React Router.

- [ ] TASK-04: Download and register self-hosted WOFF2 fonts
  - **Goal**: Place all required WOFF2 font files under `src/assets/fonts/` and write `src/fonts.css` with complete `@font-face` declarations.
  - **Details**:
    - Create directory `src/assets/fonts/`.
    - Download from Google Fonts (or the fonts.gstatic.com CDN) the following WOFF2 files and save them with exactly these names:
      - `bebas-neue-400.woff2`
      - `dm-sans-400.woff2`
      - `dm-sans-500.woff2`
      - `dm-sans-600.woff2`
      - `dm-sans-700.woff2`
      - `space-mono-400.woff2`
    - Replace the stub `src/fonts.css` with full `@font-face` blocks:
      - Bebas Neue 400: `font-display: optional`
      - DM Sans 400, 500, 600, 700: `font-display: swap`
      - Space Mono 400: `font-display: swap`
    - Each block must include `font-family`, `src: url(...)`, `font-weight`, `font-style`, and `font-display`.
  - **Files**: `src/assets/fonts/*.woff2` (6 files), `src/fonts.css`
  - **Verify**: `npm run build` succeeds; built output in `dist/assets/` includes the WOFF2 files; no references to `fonts.googleapis.com` or `fonts.gstatic.com` appear in the output.
  - **Brief ref**: Approach step 4; Scope bullets on fonts; Files table rows for font assets.

- [ ] TASK-05: Define all CSS design tokens in `src/tokens.css`
  - **Goal**: Populate `src/tokens.css` with every Tier 1 identity token and Tier 2 semantic token from L2-001, plus breakpoint tokens, reduced-motion overrides, and a Tailwind `@theme` block.
  - **Details**:
    - Replace the stub `src/tokens.css` with content structured as follows:

      **Tier 1 — Identity tokens on `:root`** (L2-001 §1):
      - Colour palette: `--void: #060A14`, `--launchfire: #FF4500`, `--launchfire-dim: #CC3700`, `--launchfire-glow: rgba(255,69,0,0.25)`, `--stardust: #E8E0D0`, `--stardust-dim: #B0A898`, `--nebula: #1A2744`, `--orbit: #2D4A8A`, `--orbit-bright: #4169C8`, `--success: #22C55E`, `--warning: #F59E0B`, `--error: #EF4444`.
      - Gradients: `--gradient-hero`, `--gradient-card`, `--gradient-glow` (defined as linear/radial gradient values appropriate to the Mars Mission Fund brand).
      - Typography: `--font-display: 'Bebas Neue', sans-serif`, `--font-body: 'DM Sans', sans-serif`, `--font-mono: 'Space Mono', monospace`.
      - Motion: `--motion-enter: 0.3s ease-out`, `--motion-exit: 0.2s ease-in`, `--motion-bounce: 0.5s cubic-bezier(0.34,1.56,0.64,1)`.
      - Radius: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 16px`, `--radius-full: 9999px`, `--radius-button: 6px`, `--radius-card: 12px`.

      **Tier 2 — Semantic tokens on `:root`** (L2-001 §2):
      - Background: `--color-bg-page: var(--void)`, `--color-bg-surface: var(--nebula)`, `--color-bg-elevated: var(--orbit)`.
      - Text: `--color-text-primary: var(--stardust)`, `--color-text-secondary: var(--stardust-dim)`, `--color-text-inverse: var(--void)`.
      - Action: `--color-action-primary: var(--launchfire)`, `--color-action-primary-hover: var(--launchfire-dim)`, `--color-action-primary-glow: var(--launchfire-glow)`.
      - Border: `--color-border-default: var(--orbit)`, `--color-border-subtle: var(--nebula)`.
      - Status: `--color-status-success: var(--success)`, `--color-status-warning: var(--warning)`, `--color-status-error: var(--error)`.
      - Motion semantic aliases: `--motion-transition-enter: var(--motion-enter)`, `--motion-transition-exit: var(--motion-exit)`, `--motion-transition-bounce: var(--motion-bounce)`.

      **Breakpoints** (L3-005 §5.2):
      - `--breakpoint-sm: 640px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`.

      **Reduced-motion overrides** (L2-001 §5.2):
      ```css
      @media (prefers-reduced-motion: reduce) {
        :root {
          --motion-enter: 0s;
          --motion-exit: 0s;
          --motion-bounce: 0s;
          --motion-transition-enter: 0s;
          --motion-transition-exit: 0s;
          --motion-transition-bounce: 0s;
        }
      }
      ```

      **Tailwind `@theme` block** exposing key semantic tokens as Tailwind utilities:
      ```css
      @theme {
        --color-bg-page: var(--color-bg-page);
        --color-bg-surface: var(--color-bg-surface);
        --color-text-primary: var(--color-text-primary);
        --color-action-primary: var(--color-action-primary);
        --font-display: var(--font-display);
        --font-body: var(--font-body);
        --font-mono: var(--font-mono);
      }
      ```
  - **Files**: `src/tokens.css`
  - **Verify**: `npm run build` succeeds; browser DevTools on `:root` in the dev server shows `--void`, `--launchfire`, `--color-bg-page`, `--color-action-primary`, `--motion-enter`, `--radius-button`, and all other tokens defined above.
  - **Brief ref**: Approach step 5; Scope bullets on tokens and reduced-motion; Verification bullets for Tokens and Dark background.

- [ ] TASK-06: Add global base styles to `src/index.css`
  - **Goal**: Apply the foundational CSS rules (reset, body, headings, links, scroll behaviour) using the design tokens.
  - **Details**:
    - After the three `@import` lines in `src/index.css`, add the following base style blocks:
      ```css
      *, *::before, *::after {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }

      body {
        background-color: var(--color-bg-page);
        color: var(--color-text-primary);
        font-family: var(--font-body);
        line-height: 1.6;
        margin: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-display);
        line-height: 1.1;
        margin: 0 0 0.5em;
      }

      a {
        color: var(--color-action-primary);
        text-decoration: none;
      }

      a:hover {
        color: var(--color-action-primary-hover);
        text-decoration: underline;
      }
      ```
  - **Files**: `src/index.css`
  - **Verify**: `npm run dev` — page background is `#060A14`; body text uses DM Sans; headings would use Bebas Neue (visible in DevTools computed styles).
  - **Brief ref**: Approach step 6; Scope bullet on base styles.

- [ ] TASK-07: Final verification — install, build, dev server, and route smoke test
  - **Goal**: Confirm the entire scaffold works end-to-end: clean install, production build, dev server routing, font self-hosting, token presence, and dark background.
  - **Details**:
    - Run `npm install` and confirm zero errors.
    - Run `npm run build` and confirm zero errors; inspect `dist/` to verify WOFF2 files are present.
    - Run `npm run dev` and use the Playwright MCP to:
      1. Navigate to `http://localhost:5173/` — verify "Home — coming soon" is visible.
      2. Navigate to `http://localhost:5173/about` — verify "About — coming soon" is visible.
      3. Navigate to `http://localhost:5173/contact` — verify "Contact — coming soon" is visible.
      4. Check the Network panel (or page source) — confirm no requests go to `fonts.googleapis.com` or `fonts.gstatic.com`.
      5. Open DevTools console — confirm no errors.
      6. Inspect `:root` computed styles — confirm `--void`, `--color-bg-page`, `--color-action-primary`, `--motion-enter` are present.
      7. Confirm the page background colour resolves to `#060A14`.
    - Fix any issues found before marking this task complete.
  - **Files**: none (verification only; fixes may touch any file)
  - **Verify**: All seven checks above pass.
  - **Brief ref**: Verification section of the brief.
