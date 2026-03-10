# Tasks: Issue #66 — Add Playwright E2E tests

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Install @playwright/test and add test:e2e script
  - **Goal**: Add the Playwright dependency and npm script so the toolchain is available for subsequent tasks.
  - **Details**: In the root `package.json`, add `@playwright/test` as a devDependency (latest stable). Add `"test:e2e": "playwright test"` to the `scripts` section. Run `npm install` to update `package-lock.json`.
  - **Files**: `package.json`, `package-lock.json`
  - **Verify**: `npx playwright --version` prints a version number; `npm run test:e2e -- --help` exits without error.
  - **Brief ref**: Dependencies / Files to Create/Modify (`package.json`)

- [x] TASK-02: Create playwright.config.ts at repo root
  - **Goal**: Configure Playwright with the correct baseURL, single Chromium project, one `webServer` entry (Vite dev server), and `workers: 1`.
  - **Details**: Create `playwright.config.ts` in the repo root. Set `baseURL: 'http://localhost:5173'`, `use: { headless: true }`, `workers: 1`, no retries. Add a `webServer` entry: `command: 'npm run dev -w @mmf/client'`, `url: 'http://localhost:5173'`, `reuseExistingServer: !process.env.CI`. Ensure the config covers only Chromium. Do **not** add this file to the Vite build.
  - **Files**: `playwright.config.ts`
  - **Verify**: `npx tsc --noEmit -p tsconfig.json` (or a dedicated `tsconfig.e2e.json`) passes without errors on `playwright.config.ts`.
  - **Brief ref**: Approach / Playwright configuration

- [x] TASK-03: Add e2e TypeScript config coverage
  - **Goal**: Ensure `playwright.config.ts` and `e2e/**/*.spec.ts` are type-checked by TypeScript without breaking the existing client/server builds.
  - **Details**: Check the root `tsconfig.json` `include` array. If `e2e/**` and `playwright.config.ts` are not included, either extend the root tsconfig or create a `tsconfig.e2e.json` that includes them and references `@playwright/test` types. Confirm `@playwright/test` ships its own types (it does — no separate `@types` package needed).
  - **Files**: `tsconfig.json` (modify) or `tsconfig.e2e.json` (create)
  - **Verify**: `npx tsc --noEmit` succeeds after `e2e/campaigns.spec.ts` is created in TASK-04.
  - **Brief ref**: Verification / Type-check

- [x] TASK-04: Create e2e/campaigns.spec.ts with four tests
  - **Goal**: Implement all four E2E tests as specified in the brief.
  - **Details**:
    - **Test 1 (list happy path)**: Navigate to `/campaigns`; wait for `aria-label="Campaign listings"` grid; assert at least one campaign card link is visible; assert text "Open Source Climate Prediction Model" is present.
    - **Test 2 (detail happy path)**: Navigate to `/campaigns/00000000-0001-0000-0000-000000000001`; assert `<h1>` contains "Open Source Climate Prediction Model"; assert category label visible; assert funding progress section visible; if milestone section heading exists in seed, assert it too.
    - **Test 3 (404)**: Navigate to `/campaigns/00000000-dead-0000-0000-000000000000`; assert page shows "Failed to load campaign" text.
    - **Test 4 (server error / no mock fallback)**: Use `page.route('**/v1/campaigns', ...)` to fulfill with status 500 before navigating; navigate to `/campaigns`; assert `role="alert"` is visible and contains "couldn't load missions"; assert the campaign grid is **not** visible. Mark with `test.fail()` if mock-data fallback has not yet been removed (per brief note).
  - **Files**: `e2e/campaigns.spec.ts`
  - **Verify**: File parses without TypeScript errors (`npx tsc --noEmit`). Running `npm run test:e2e` against a live stack completes all four tests (Tests 1–3 pass; Test 4 result depends on integration-fix state).
  - **Brief ref**: Approach / Test file

- [ ] TASK-05: Update .github/workflows/ci.yml with E2E job steps
  - **Goal**: Add PostgreSQL service container, DBMate migration step, Playwright browser install, Express server start, and E2E test run to the CI workflow.
  - **Details**:
    - Add `services.postgres` block to the existing `ci` job (image `postgres:16-alpine`, env `POSTGRES_USER/PASSWORD/DB`, port `5432:5432`, health-check options as specified in brief).
    - After the `Install dependencies` step, insert in order:
      1. **Run DB migrations** step using `docker run --rm --network host ghcr.io/amacneil/dbmate up` with `DATABASE_URL: postgres://mmf:mmf@localhost:5432/mmf_test`.
      1. **Install Playwright browsers**: `npx playwright install --with-deps chromium`.
      1. **Start server**: `npm run dev:server &` with env `DATABASE_URL` and `PORT: 3000`.
      1. **E2E tests**: `npm run test:e2e` with env `DATABASE_URL`.
    - Place these steps after the existing `Test coverage` step and before `Audit`.
  - **Files**: `.github/workflows/ci.yml`
  - **Verify**: The YAML is valid (no syntax errors). CI run shows a passing `E2E tests` step.
  - **Brief ref**: CI integration / Files to Create/Modify
