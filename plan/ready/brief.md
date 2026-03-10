# Brief: Issue #66 — Add Playwright E2E tests

## Goal

Add Playwright end-to-end tests that exercise the complete Mars Mission Fund stack
(React client → Express server → PostgreSQL).
The suite covers the campaign list happy path, campaign detail happy path, 404 for a
non-existent campaign, server error state without mock-data fallback, and a GitHub
Actions CI job that spins up a real PostgreSQL service, runs DBMate migrations (with
seed data), and runs the tests.

## Scope

**In scope:**

- Install `@playwright/test` as a root devDependency.
- `playwright.config.ts` at the repo root (base URL, one `webServer` entry for the
  Vite dev server that already proxies `/v1` to Express).
- `e2e/campaigns.spec.ts` with four tests:
  1. Campaign list happy path — `/campaigns` loads real seeded data from the DB.
  1. Campaign detail happy path — `/campaigns/<seeded-uuid>` shows the full detail
     page including nested entities (milestones, team members) when they exist in the
     seed.
  1. 404 page — `/campaigns/00000000-dead-0000-0000-000000000000` (valid UUID, no
     matching row) navigates to a page that surfaces an error or not-found state.
  1. Server error state — Playwright route interception forces `/v1/campaigns` to
     return HTTP 500; the UI must show the error alert, not fall back to mock data.
     This test is a **prerequisite gate**: it verifies the mock-fallback removal that
     belongs to the "Fix client-server integration" issue.
- `npm run test:e2e` script at the repo root.
- `.github/workflows/ci.yml` updated: PostgreSQL service container, DBMate migration
  step, Playwright browser install, and an `E2E` job step.

**Out of scope:**

- Fixing the client-server data-shape mismatch (camelCase vs. snake_case, wrong
  category enum values). That belongs to the "Fix client-server integration" issue
  that this issue depends on.
- Removing the mock-data fallback in `packages/client/src/api/campaigns.ts`. Also
  in the integration-fix issue.
- Any new pages, routes, or API endpoints.
- Visual regression / screenshot diffing.
- Cross-browser matrix (Chromium only for CI).

## Approach

### Playwright configuration (`playwright.config.ts`)

Use a single `webServer` entry pointing at `npm run dev -w @mmf/client` (port 5173).
The Vite dev server already proxies `/v1 → http://localhost:3000`, so the test suite
only needs to manage one process via `webServer`.
The Express server must be running before Playwright starts; in CI this is handled by
the job step ordering.
In local development the developer starts the server separately with `npm run
dev:server`.

Set:

```ts
baseURL: 'http://localhost:5173'
use: { headless: true }
```

No retries in CI; keep `workers: 1` to avoid DB race conditions on a shared test DB.

### Test data

Rely on the existing seed migration
`packages/server/db/migrations/20260309000006_seed_campaigns.sql`.
The first seeded campaign has a fixed UUID
`00000000-0001-0000-0000-000000000001` and title
`Open Source Climate Prediction Model`.
Use this UUID and title as stable assertion anchors in the tests.

### Test file (`e2e/campaigns.spec.ts`)

**Test 1 — Campaign list happy path:**

1. Navigate to `/campaigns`.
1. Wait for the `aria-label="Campaign listings"` grid to be visible.
1. Assert at least one `CampaignCard` link is visible.
1. Assert the seeded campaign title "Open Source Climate Prediction Model" appears
   in the list.

**Test 2 — Campaign detail happy path:**

1. Navigate to `/campaigns/00000000-0001-0000-0000-000000000001`.
1. Assert the `<h1>` contains "Open Source Climate Prediction Model".
1. Assert the category label is visible.
1. Assert the funding progress section (`FundingProgressSection`) is visible.
   If the seed includes milestones for this campaign, also assert the milestones
   section heading is present.

**Test 3 — 404 for non-existent campaign:**

1. Navigate to `/campaigns/00000000-dead-0000-0000-000000000000`.
1. Assert the page shows the error state ("Failed to load campaign" text from
   `CampaignDetailPage`).

**Test 4 — Server error state (no mock fallback):**

1. Intercept `**/v1/campaigns` via `page.route` and fulfill with status 500.
1. Navigate to `/campaigns`.
1. Assert the `role="alert"` element is visible and contains the error message
   ("couldn't load missions" from `CampaignsPage`).
1. Assert the campaign grid is **not** visible (i.e., mock data is not rendered).

> Note: Test 4 will only produce the correct assertion if the mock-data fallback has
> been removed from `fetchCampaigns` in `packages/client/src/api/campaigns.ts`.
> If it still falls back to mocks, this test should be marked `test.fail()` until
> the integration issue is resolved.

### CI integration (`.github/workflows/ci.yml`)

Add a `services:` block to the existing `ci` job:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: mmf
      POSTGRES_PASSWORD: mmf
      POSTGRES_DB: mmf_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
```

After the existing `Install dependencies` step, add:

1. **Run migrations** (including seed):

   ```yaml
   - name: Run DB migrations
     env:
       DATABASE_URL: postgres://mmf:mmf@localhost:5432/mmf_test
     run: >
       docker run --rm --network host
       -e DATABASE_URL=$DATABASE_URL
       -v ${{ github.workspace }}/packages/server/db:/db
       ghcr.io/amacneil/dbmate up
   ```

1. **Install Playwright browsers** (Chromium only):

   ```yaml
   - name: Install Playwright browsers
     run: npx playwright install --with-deps chromium
   ```

1. **Start Express server in background**:

   ```yaml
   - name: Start server
     env:
       DATABASE_URL: postgres://mmf:mmf@localhost:5432/mmf_test
       PORT: 3000
     run: npm run dev:server &
   ```

1. **Run E2E tests** (Playwright starts Vite via `webServer`):

   ```yaml
   - name: E2E tests
     env:
       DATABASE_URL: postgres://mmf:mmf@localhost:5432/mmf_test
     run: npm run test:e2e
   ```

Place the E2E job steps after the existing `Test coverage` step and before `Audit`.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `playwright.config.ts` | create | Playwright config: baseURL, webServer (Vite), headless Chromium |
| `e2e/campaigns.spec.ts` | create | Four E2E tests: list, detail, 404, server error |
| `package.json` | modify | Add `@playwright/test` devDependency; add `"test:e2e": "playwright test"` script |
| `.github/workflows/ci.yml` | modify | PostgreSQL service, DBMate migration step, Playwright install + run steps |

## Dependencies

- **npm package**: `@playwright/test` (latest stable) — root devDependency.
- **Playwright browsers**: Chromium only (`npx playwright install --with-deps chromium`).
- **Prerequisite issue**: "Fix client-server integration" must be merged first.
  That issue is expected to: (1) align the client Campaign type with `@mmf/shared`
  schemas, (2) map snake_case API responses to camelCase props the components expect,
  (3) remove the mock-data fallback from `fetchCampaigns` and `fetchCampaign` so
  server errors surface correctly to the UI.
- **DBMate**: invoked via Docker in CI (no local install needed; already documented
  in L3-008 `tech/tech-stack.md`).

## Verification

- **Build**: `npm run build` succeeds (Playwright config is not part of the Vite
  build; it does not affect TypeScript compilation of the client).
- **Type-check**: `npx tsc --noEmit` must include `playwright.config.ts` and
  `e2e/*.spec.ts` — add a `tsconfig.e2e.json` or include `e2e/**` in the root
  `tsconfig.json` `include` array if needed.
- **Tests**:
  - Unit/integration: `npm run test:coverage` still passes (no changes to existing
    test files).
  - E2E local: start Docker Compose DB, run migrations, start `npm run dev:server`,
    then run `npm run test:e2e`. All four tests should pass once the integration fix
    is in place.
- **Visual**: At `http://localhost:5173/campaigns`, the campaign list shows real DB
  data (seeded campaign titles visible). At
  `http://localhost:5173/campaigns/00000000-0001-0000-0000-000000000001`, the detail
  page shows "Open Source Climate Prediction Model" with category and funding
  progress.
- **CI**: The CI run includes a passing `E2E tests` step with all four assertions
  green.
