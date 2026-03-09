# Tasks: Issue #2 — Scaffold frontend project

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Scaffold Vite + React 19 + TypeScript project
  - **Goal**: Initialise the Vite project at the repo root with React 19 and TypeScript, then harden TypeScript config to strict mode.
  - **Details**:
    - Run `npm create vite@latest . -- --template react-ts` at `/workspace/repo` (accept overwrite prompts).
    - In `tsconfig.app.json`, confirm `"strict": true` is present under `compilerOptions`. Add it if missing.
    - Delete the default Vite boilerplate content in `src/App.tsx` and `src/index.css` (replace with minimal stubs — actual content comes in later tasks).
    - Delete `src/App.css` and `public/vite.svg` (unused boilerplate).
    - Run `npm install` to ensure a clean `node_modules`.
  - **Files**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx` (stub), `src/index.css` (stub), `src/vite-env.d.ts`
  - **Verify**: `npm run build` exits 0 with no TypeScript errors.
  - **Brief ref**: Approach — Step 1 (Vite project init); Dependencies section.

- [x] TASK-02: Update index.html with brand metadata and preload hints
  - **Goal**: Configure `index.html` with dark background colour, dark colour-scheme, branded noscript fallback, and DM Sans WOFF2 preload hint.
  - **Details**:
    - Set `<meta name="color-scheme" content="dark">` in `<head>`.
    - Add `style="background:#060A14"` to the `<body>` tag (inline so the dark bg is visible before CSS loads).
    - Add `<noscript>` inside `<body>` with brand-appropriate text, e.g.: `<noscript>Mars Mission Fund requires JavaScript to launch. Please enable it in your browser settings.</noscript>`
    - Add `<link rel="preload" as="font" type="font/woff2" crossorigin href="/src/assets/fonts/DMSans-Regular.woff2">` (path will resolve once fonts are added in TASK-05; add the tag now so the HTML is final).
    - Update `<title>` to `Mars Mission Fund`.
  - **Files**: `index.html`
  - **Verify**: Open `index.html` source and confirm the meta tag, inline body style, noscript, preload link, and title are present.
  - **Brief ref**: Approach — Step 1 (Update index.html).

- [x] TASK-03: Install and configure Tailwind CSS v4
  - **Goal**: Add Tailwind CSS v4 as a dev dependency and wire it into the Vite build pipeline.
  - **Details**:
    - Run `npm install -D tailwindcss @tailwindcss/vite`.
    - In `vite.config.ts`, import `tailwindcss` from `@tailwindcss/vite` and add it to the `plugins` array (alongside the existing React plugin).
    - In `src/index.css`, add `@import "tailwindcss";` as the first line (replacing any existing content from the stub).
  - **Files**: `package.json`, `vite.config.ts`, `src/index.css`
  - **Verify**: `npm run build` exits 0 and the output `dist/assets/*.css` contains Tailwind's reset/base rules.
  - **Brief ref**: Approach — Step 2 (Tailwind CSS v4).

- [x] TASK-04: Install React Router v7 and set up placeholder routes
  - **Goal**: Add client-side routing with three placeholder routes: `/`, `/about`, `/contact`.
  - **Details**:
    - Run `npm install react-router` (installs v7).
    - Rewrite `src/App.tsx` to use `BrowserRouter`, `Routes`, and `Route` from `react-router`. Each route renders a minimal placeholder `<div>` with the route name as text content, e.g.:
      ```tsx
      import { BrowserRouter, Routes, Route } from 'react-router'

      function App() {
        return (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/about" element={<div>About</div>} />
              <Route path="/contact" element={<div>Contact</div>} />
            </Routes>
          </BrowserRouter>
        )
      }

      export default App
      ```
  - **Files**: `package.json`, `src/App.tsx`
  - **Verify**: `npm run build` exits 0 with no TypeScript errors. `npm run dev` starts; navigating to `/`, `/about`, `/contact` renders distinct placeholder text.
  - **Brief ref**: Approach — Step 3 (React Router v7).

- [ ] TASK-05: Download and configure self-hosted WOFF2 fonts
  - **Goal**: Self-host all three brand fonts (Bebas Neue, DM Sans, Space Mono) as WOFF2 files and declare them via `@font-face`.
  - **Details**:
    - Create directory `src/assets/fonts/`.
    - Download WOFF2 files from Google Fonts for:
      - Bebas Neue: weight 400
      - DM Sans: weights 400, 500, 600, 700
      - Space Mono: weight 400
    - Place downloaded files in `src/assets/fonts/` with descriptive names, e.g. `BebasNeue-Regular.woff2`, `DMSans-Regular.woff2`, `DMSans-Medium.woff2`, `DMSans-SemiBold.woff2`, `DMSans-Bold.woff2`, `SpaceMono-Regular.woff2`.
    - To download from Google Fonts API, use a User-Agent that returns WOFF2. Example curl command:
      ```
      curl -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
      ```
      Parse the returned CSS to extract the WOFF2 `src` URLs, then download each with `curl -L`.
    - Create `src/fonts.css` with `@font-face` declarations for each font file:
      - Bebas Neue: `font-display: optional` (decorative display font)
      - DM Sans all weights: `font-display: swap`
      - Space Mono: `font-display: swap`
    - Example declaration:
      ```css
      @font-face {
        font-family: 'Bebas Neue';
        src: url('./assets/fonts/BebasNeue-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: optional;
      }
      ```
    - Import `src/fonts.css` in `src/index.css` (add after `@import "tailwindcss"`).
    - Update the `index.html` preload `href` to match the actual filename used for `DMSans-Regular.woff2`.
  - **Files**: `src/assets/fonts/*.woff2`, `src/fonts.css`, `src/index.css`, `index.html`
  - **Verify**: `npm run build` exits 0. In `npm run dev`, the browser Network tab shows font requests to `localhost` (not `fonts.googleapis.com`).
  - **Brief ref**: Approach — Step 4 (Self-hosted fonts).

- [ ] TASK-06: Create design tokens CSS file (Tier 1 + Tier 2 + reduced-motion)
  - **Goal**: Define all L2-001 brand CSS custom properties — Tier 1 identity tokens and Tier 2 semantic tokens — in a single `src/tokens.css` file, plus the `prefers-reduced-motion` overrides.
  - **Details**:
    - Create `src/tokens.css` with a single `:root` block containing:
      **Tier 1 — Identity Tokens** (Sections 1.1–1.5 from brand.md):
      - Colour identity tokens (Deep Space, Launch Fire, Metallic Silver, Mission Outcomes)
      - Gradient identity tokens (6 gradients)
      - Typography identity tokens (`--font-display`, `--font-body`, `--font-data` — use actual font-family stacks)
      - Motion identity tokens (durations and easings)
      - Radius identity tokens
      **Tier 2 — Semantic Tokens** (Sections 2.1–2.10 from brand.md), mapping to Tier 1 values:
      - Section 2.1: Action colours (use actual rgba values derived from identity tokens where opacity is specified)
      - Section 2.2: Status colours
      - Section 2.3: Surface colours
      - Section 2.4: Text colours
      - Section 2.5: Border colours
      - Section 2.6: Progress & data visualisation colours
      - Section 2.7: Gradient semantic tokens
      - Section 2.8: Typography semantic tokens (font-family references; size/weight are for documentation — implement as comments)
      - Section 2.9: Motion semantic tokens (using `var()` references to Tier 1 duration/easing tokens)
      - Section 2.10: Layout radius semantic tokens
    - For opacity-derived values (e.g. `--launchfire / 35%`), write out the resolved `rgba()` — e.g. `rgba(255, 92, 26, 0.35)`.
    - After the `:root` block, add a `@media (prefers-reduced-motion: reduce)` block overriding motion tokens per L2-001 Section 5.2:
      - `--motion-enter`: set duration to `0ms`
      - `--motion-enter-emphasis`: set duration to `150ms` (fast fade)
      - `--motion-ambient`: set duration to `0ms`
      - `--motion-urgency`: keep static glow only
    - Import `src/tokens.css` in `src/index.css` after `@import "tailwindcss"` and after `@import "./fonts.css"`.
  - **Files**: `src/tokens.css`, `src/index.css`
  - **Verify**: `npm run build` exits 0. In `npm run dev`, DevTools Elements panel on `:root` shows all tokens (e.g. `--color-bg-page`, `--color-action-primary`, `--font-body`, `--motion-enter`). DevTools emulate `prefers-reduced-motion: reduce` and the motion token values change.
  - **Brief ref**: Approach — Step 5 (Design tokens); brand.md Sections 1.1–1.5, 2.1–2.10, 5.2.

- [ ] TASK-07: Add Tailwind @theme integration and base global styles
  - **Goal**: Expose key semantic tokens to Tailwind via `@theme`, and add the base global CSS rules for box-sizing, body, headings, links, and scroll behaviour.
  - **Details**:
    - In `src/index.css`, after the token and font imports, add a Tailwind `@theme` block that maps key semantic colour tokens as Tailwind CSS variables, for example:
      ```css
      @theme {
        --color-bg-page: var(--color-bg-page);
        --color-bg-surface: var(--color-bg-surface);
        --color-action-primary: var(--color-action-primary);
        --color-text-primary: var(--color-text-primary);
        --color-text-secondary: var(--color-text-secondary);
      }
      ```
      (Expose the most frequently needed surface, text, action, and border tokens.)
    - After the `@theme` block, add base style rules:
      ```css
      *, *::before, *::after {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        background: var(--color-bg-page);
        color: var(--color-text-secondary);
        font-family: var(--font-body);
        line-height: 1.7;
        margin: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        color: var(--color-text-primary);
      }

      a {
        color: var(--color-action-primary);
      }

      a:hover {
        color: var(--color-action-primary-hover);
      }
      ```
    - Add a `@media (prefers-reduced-motion: reduce)` override for scroll behaviour:
      ```css
      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }
      ```
  - **Files**: `src/index.css`
  - **Verify**: `npm run build` exits 0. In `npm run dev`, the page background is `#060A14`, body text is light (`#C8D0DC`), and the DM Sans font is applied to body text.
  - **Brief ref**: Approach — Step 5 (@theme block) and Step 6 (Base styles).

- [ ] TASK-08: Final verification — build, dev server, and visual checks
  - **Goal**: Confirm the complete scaffold builds without errors, the dev server runs, all routes are reachable, fonts are self-hosted, all tokens are visible in DevTools, and base styles are applied correctly.
  - **Details**:
    - Run `npm run build` — must complete with exit code 0 and no errors or warnings (TypeScript strict errors, missing imports, etc.).
    - Run `npm run dev` and verify:
      - Dev server starts at `http://localhost:5173`.
      - Navigating to `/` shows "Home", `/about` shows "About", `/contact` shows "Contact".
      - Browser Network tab: font requests go to `localhost`, not `fonts.googleapis.com`.
      - DevTools Elements → `:root`: all L2-001 semantic tokens are present (spot-check `--color-bg-page`, `--color-action-primary`, `--font-body`, `--motion-enter`, `--radius-button`).
      - Page background is `#060A14`, body text is light, body font-family resolves to DM Sans.
      - Emulate `prefers-reduced-motion: reduce` in DevTools — motion token values change to reduced alternatives.
    - Fix any issues found during verification before marking complete.
  - **Files**: No new files — verification only; fix any files as needed.
  - **Verify**: All checklist items above pass. `npm run build` exits 0.
  - **Brief ref**: Verification section of the brief.
