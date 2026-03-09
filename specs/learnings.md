# Learnings

Tips and gotchas discovered by previous agents. Read this before starting work.

## Issue #1: Frontend scaffold (Issue #2) was missing

- The `plan/ready/tasks.md` for Issue #3 starts at TASK-01 (Button), but the frontend scaffold from Issue #2 had not been completed.
- There was no `src/` directory, `package.json`, or any project files.
- Resolution: Created the full scaffold as preparation before TASK-01:
  - `package.json` with React 19, Vite, Tailwind v4, React Router v7, TypeScript (strict)
  - `src/tokens.css` with all Tier 1 and Tier 2 CSS custom properties from L2-001
  - `src/index.css` with Tailwind v4 `@import "tailwindcss"`, font imports, base styles
  - Self-hosted fonts via `@fontsource/bebas-neue`, `@fontsource/dm-sans`, `@fontsource/space-mono` npm packages (no external CDN)
  - `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- The `@fontsource` npm approach satisfies self-hosted font requirement (no Google CDN at runtime).

## Issue #3: Prettier and markdownlint MD049 conflict

- Prettier (default) normalises Markdown emphasis to `_text_` (underscores), but markdownlint MD049 (configured to "asterisk") requires `*text*`.
- Running `prettier --write .` on `.md` files after fixing MD049 violations will silently revert them.
- Resolution: add `**/*.md` to `.prettierignore` so Prettier never touches Markdown files. Markdownlint is the single source of truth for `.md` style.

## Issue #4: Vitest v4 requires `defineConfig` from `vitest/config`

- Using `/// <reference types="vitest" />` alone with `defineConfig` from `vite` causes TS2769 in `vite.config.ts` ("test does not exist in type 'UserConfigExport'").
- Resolution: Import `defineConfig` from `vitest/config` instead of `vite`. This pulls in Vitest's module augmentation that adds `test` to Vite's `UserConfig` interface.

## Issue #5: @testing-library/jest-dom v6 with Vitest requires `/vitest` import

- Importing `@testing-library/jest-dom` in a Vitest setup file causes `ReferenceError: expect is not defined` because the default entry tries to extend Jest's global `expect`.
- Resolution: Use `import '@testing-library/jest-dom/vitest'` instead, which uses Vitest's `expect` API. This entry point is available in v6+.

## Issue #41: Vitest in server/ picks up root vite.config.ts

- Running `vitest run` from `server/` picks up the root `vite.config.ts` which sets `environment: 'jsdom'` and `setupFiles: ['src/test/setup.ts']` — causing failures in the server test suite.
- Resolution: Create `server/vitest.config.ts` with `environment: 'node'` to override the root config.

## Issue #41: Mocking pg QueryResult in Vitest

- Casting `{ rows: [], rowCount: 0 }` as `QueryResult` causes TS2352 because the partial object doesn't overlap enough with the full type.
- Resolution: Remove the cast entirely — `mockResolvedValueOnce` accepts `unknown`, so no cast is needed. The mock return value does not need to satisfy the full `QueryResult` interface.

## Issue #2: Vite rejects `<noscript>` inside `<head>`

- Placing `<noscript>` in the `<head>` of `index.html` causes a parse5 build error: "disallowed-content-in-noscript-in-head".
- Resolution: Move `<noscript>` to `<body>` instead.
