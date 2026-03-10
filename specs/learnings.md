# Learnings

Tips and gotchas discovered by previous agents. Read this before starting work.

## Issue #53: @mmf/shared package was not pre-created by issue #50

- TASK-05 says to import from `@mmf/shared` and notes it as a prerequisite from issue #50, but `packages/shared` did not exist when the task ran.
- `packages/client/package.json` already listed `"@mmf/shared": "*"` as a dependency (set in TASK-02), so the workspace was expecting it.
- Resolution: created a minimal `packages/shared/package.json` + `packages/shared/src/index.ts` exporting the five Campaign types. Used `"exports": { ".": "./src/index.ts" }` so bundler-mode TypeScript resolves the types directly from source without needing a separate compile step.
- Re-exporting the types from `packages/client/src/api/campaigns.ts` (`export type { ... }`) preserves backward compatibility for all components that import types from that module.

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

## Issue #54: Root vitest exclude must cover packages/**

- Moving server files from `server/` to `packages/server/` causes root vitest to pick up server tests (e.g. `packages/server/src/__tests__/campaigns.test.ts`) because `vite.config.ts` only excluded `server/**`.
- The root `vite.config.ts` `test.exclude` must include `packages/**` to prevent the frontend test runner from finding workspace package tests.
- Resolution: add `'packages/**'` to the `exclude` array in `vite.config.ts`.

## Issues #40–#43: Public Campaign Pages — Tooling Notes

- The `server/` directory is a **separate Node.js project** with its own `package.json`, `tsconfig.json`, and `vitest.config.ts`. It is entirely independent of the root frontend build and test commands; run `npm test` inside `server/` to execute server-side tests.
- The server `tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`. This requires **`.js` file extensions on all TypeScript import paths**, even though the actual source files are `.ts` (e.g. `import { createApp } from '../app.js'`). Omitting the extension causes a runtime `ERR_MODULE_NOT_FOUND`.
- The server `vitest.config.ts` only needs `environment: 'node'`; no special ESM transforms are required because `server/package.json` sets `"type": "module"`, which makes Node treat all `.js` output as ESM.
- **Express 5 + SuperTest testability**: the app is built as a factory function `createApp(pool: Pool): Express` that accepts the database pool via dependency injection. This pattern is required so tests can pass a mock pool without side effects from real DB connections or port binding.
- The `src/api/<domain>.ts` layer falls back to inline mock data when the API returns a non-OK response or is unreachable. This makes the frontend fully functional during local development even when the Express server is not running.

## Issues #65–#66: Port mismatch between Vite proxy and server

- Vite's `server.proxy` target port must exactly match the `PORT` value in `packages/server/.env`. During issues #65/#66 these drifted (proxy pointed to 3001, server listened on 3000), causing all API calls to silently fail.
- Resolution: always verify both values are identical before starting development. Prefer committing a `.env.example` with the canonical port so developers and CI stay in sync.

## Issues #65–#66: camelCase transformation for API responses

- DB columns use `snake_case` (e.g. `min_funding_target_usd`). All API JSON responses must use `camelCase`. The server aliases column names directly in SQL `SELECT` clauses (e.g. `min_funding_target_usd AS "minFundingTargetUsd"`).
- Shared Zod schemas in `@mmf/shared` must use camelCase field names to match the API responses; any `snake_case` field name in a Zod schema will fail to parse real API data at runtime.

## Issues #65–#66: Nested entity queries for campaign detail

- The campaign detail endpoint (`GET /api/campaigns/:slug`) fetches milestones, stretch goals, team members, and campaign updates via separate SQL queries, then assembles them into a single `CampaignDetail` object in application code.
- This avoids complex multi-table JOINs and keeps each query simple and independently testable. Future contributors should follow the same pattern rather than adding large JOIN queries.

## Issues #65–#66: Mock data removal enables reliable error-state testing

- The client API layer previously caught all fetch errors and returned inline mock data as a fallback. While convenient for local development, this masked real server errors and made E2E tests unable to verify error states.
- Resolution: remove the catch-block fallbacks and re-throw errors instead. The UI renders loading/error states using React state, and E2E tests can now reliably detect when the server returns an error.
