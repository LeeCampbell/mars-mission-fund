# Brief: Issue #2 — Scaffold frontend project

## Goal

Initialise the Mars Mission Fund frontend project from scratch with all tooling, design tokens,
and fonts required to build UI in subsequent issues.
This is the first issue in the Public Marketing Pages milestone and has no dependencies.
The output is a working Vite + React 19 + TypeScript SPA with Tailwind CSS v4, React Router v7,
self-hosted WOFF2 fonts, full Tier 1 + Tier 2 CSS design tokens, and base global styles.

## Scope

### In scope

- Vite + React 19 + TypeScript project initialisation (strict mode)
- Tailwind CSS v4 with CSS-first configuration (`@import "tailwindcss"` + `@theme`)
- React Router v7 with placeholder routes for `/`, `/about`, `/contact`
- Self-hosted WOFF2 fonts: Bebas Neue (400), DM Sans (400, 500, 600, 700), Space Mono (400)
- Full Tier 1 identity token CSS custom properties (L2-001 Sections 1.1–1.5)
- Full Tier 2 semantic token CSS custom properties (L2-001 Sections 2.1–2.10)
- `prefers-reduced-motion` media query overriding motion semantic tokens (L2-001 Section 5.2)
- Base global styles: `box-sizing`, `body` background/font/colour, heading defaults, link defaults
- `index.html` with dark background (`#060A14`), branded `<noscript>` fallback, DM Sans preload hint
- Successful `npm run dev` (dev server) and `npm run build` (production build)

### Out of scope

- Any design system component implementations (Button, Card, etc.) — those are Issue #3
- Page content / layouts (Homepage, About, Contact) — those are Issues #3 and #4
- ESLint, Prettier, markdownlint tooling setup — separate milestone
- Test setup (Vitest, Testing Library, MSW) — separate milestone
- Playwright E2E setup — separate milestone
- Backend, authentication, CI/CD, Docker, deployment

## Approach

The repository currently has no `package.json` or `src/` directory — only `assets/`, `plan/`,
`prompts/`, `scripts/`, and `specs/`.
The frontend project is scaffolded directly at the repository root.

**Step 1 — Vite project init**: Scaffold with `npm create vite@latest . -- --template react-ts`.
Edit `tsconfig.app.json` to ensure `strict: true`.
Update `index.html`: set `<meta name="color-scheme" content="dark">`, add inline dark background
style `background:#060A14` to `<body>`, add `<noscript>` message with brand-appropriate text,
and add `<link rel="preload">` for DM Sans WOFF2.

**Step 2 — Tailwind CSS v4**: Install `tailwindcss` and `@tailwindcss/vite` as dev dependencies.
Add the Tailwind Vite plugin to `vite.config.ts`.
Add `@import "tailwindcss"` to `src/index.css`.

**Step 3 — React Router v7**: Install `react-router` (v7).
Update `src/App.tsx` to use `<BrowserRouter>` with three `<Route>` entries — each renders a minimal
placeholder `<div>` with route name as text.

**Step 4 — Self-hosted fonts**: Download WOFF2 files from Google Fonts (Bebas Neue 400,
DM Sans 400/500/600/700, Space Mono 400).
Place in `src/assets/fonts/`.
Create `src/fonts.css` with `@font-face` declarations using `font-display: swap` for DM Sans and
Space Mono, `font-display: optional` for Bebas Neue.
Import `src/fonts.css` in `src/index.css`.

**Step 5 — Design tokens**: Create `src/tokens.css` defining all Tier 1 identity tokens
(colours, gradients, typography, motion durations/easings, radius) and all Tier 2 semantic tokens
(L2-001 Sections 2.1–2.10) on `:root`.
Include a `@media (prefers-reduced-motion: reduce)` block overriding motion tokens per L2-001
Section 5.2.
Import `src/tokens.css` in `src/index.css` after `@import "tailwindcss"`.
Add a `@theme` block in `src/index.css` to expose key semantic colour tokens as Tailwind
CSS variables where useful.

**Step 6 — Base styles**: In `src/index.css`, add base style rules:
- `*, *::before, *::after { box-sizing: border-box }`
- `body { background: var(--color-bg-page); color: var(--color-text-secondary); font-family: var(--font-body); line-height: 1.7; margin: 0; }`
- `h1, h2, h3, h4, h5, h6 { color: var(--color-text-primary); }`
- `a { color: var(--color-action-primary); }` with hover `var(--color-action-primary-hover)`
- `html { scroll-behavior: smooth; }` with reduced-motion override to `scroll-behavior: auto`

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `package.json` | create | Vite project manifest; React 19, react-router v7, tailwindcss deps |
| `tsconfig.json` | create | TypeScript project references config |
| `tsconfig.app.json` | create | App tsconfig with `strict: true` |
| `tsconfig.node.json` | create | Node tsconfig for Vite config |
| `vite.config.ts` | create | Vite config with React plugin and Tailwind plugin |
| `index.html` | create | Entry HTML: dark bg, noscript, DM Sans preload |
| `src/main.tsx` | create | React root mount |
| `src/App.tsx` | create | BrowserRouter + three placeholder routes |
| `src/vite-env.d.ts` | create | Vite type reference |
| `src/index.css` | create | Tailwind import, token imports, font imports, base styles, @theme |
| `src/tokens.css` | create | All L2-001 Tier 1 + Tier 2 CSS custom properties + reduced-motion overrides |
| `src/fonts.css` | create | @font-face declarations for all three brand fonts |
| `src/assets/fonts/*.woff2` | create | Self-hosted font files (Bebas Neue, DM Sans, Space Mono) |

## Dependencies

- `react` 19.x, `react-dom` 19.x — SPA framework (L3-008)
- `react-router` v7 — client-side routing (L3-008)
- `tailwindcss` v4 (dev), `@tailwindcss/vite` (dev) — utility CSS (L3-008)
- `@vitejs/plugin-react` (dev) — Vite React plugin
- `vite` (dev) — build tool (L3-008)
- `typescript` (dev) — type safety (L3-008)
- `@types/react`, `@types/react-dom` (dev) — React type definitions
- WOFF2 font files downloadable from Google Fonts (no npm package; downloaded and self-hosted)

## Verification

- **Build**: `npm run build` completes with no errors
- **Dev server**: `npm run dev` starts successfully at `http://localhost:5173`
- **Routes**: Navigating to `/`, `/about`, `/contact` renders distinct placeholder text
- **Fonts**: Browser DevTools Network tab shows font requests hitting `localhost` (not fonts.googleapis.com)
- **Tokens**: Browser DevTools Elements → `:root` shows all L2-001 semantic tokens
  (e.g., `--color-bg-page`, `--color-action-primary`, `--font-body`, `--motion-enter`)
- **Base styles**: Page background is `#060A14`, text is light, body uses DM Sans
- **Reduced motion**: DevTools emulate `prefers-reduced-motion: reduce` and motion tokens resolve
  to their reduced-motion alternatives
