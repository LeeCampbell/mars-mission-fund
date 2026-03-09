# Tasks: Issue #41 — Create Express Campaign Read API

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Bootstrap server package with dependencies and TypeScript config
  - **Goal**: Create `server/` directory with `package.json`, `tsconfig.json`, and all required dependencies installed so subsequent tasks have a valid build environment.
  - **Details**:
    - Create `server/package.json` with `name`, `version`, `type: "module"`, and scripts: `dev` (`tsx watch src/index.ts`), `test` (`vitest run`), `test:coverage` (`vitest run --coverage`).
    - Add production deps: `express@^5`, `cors`, `helmet`, `pino`, `pino-http`, `zod`, `pg`.
    - Add dev deps: `pino-pretty`, `supertest`, `vitest`, `tsx`, `@types/express`, `@types/cors`, `@types/pg`, `@types/supertest`, `@types/node`, `@vitest/coverage-v8`.
    - Create `server/tsconfig.json` targeting `ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `outDir: dist`, `rootDir: src`.
    - Run `npm install` inside `server/`.
    - Add `dev:server` and `test:server` delegation scripts to root `package.json`.
  - **Files**: `server/package.json` (create), `server/tsconfig.json` (create), `package.json` (modify)
  - **Verify**: `cd server && npx tsc --version` exits 0; `ls server/node_modules/express` exists.
  - **Brief ref**: Dependencies section; Scripts section; Files table rows for `server/package.json` and `package.json`.

- [ ] TASK-02: Create db/pool.ts — pg connection pool singleton
  - **Goal**: Provide a single `pg.Pool` instance exported from `server/src/db/pool.ts`, reading `DATABASE_URL` from the environment.
  - **Details**:
    - Create `server/src/db/pool.ts`.
    - Import `pg` and create `new Pool({ connectionString: process.env.DATABASE_URL })`.
    - Export the pool as the default export and as a named export `pool`.
    - Do not call `pool.connect()` at module load time.
  - **Files**: `server/src/db/pool.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes after this file is added (with stub `app.ts` and `index.ts` if required by tsconfig).
  - **Brief ref**: Directory structure — `db/pool.ts`; Key design decisions — Pool injection.

- [ ] TASK-03: Create campaigns/types.ts — Zod schemas and inferred TS types
  - **Goal**: Define all Zod schemas and derived TypeScript types used by the campaign routes and query functions.
  - **Details**:
    - Create `server/src/campaigns/types.ts`.
    - Define `CampaignSummarySchema` (fields returned by list query: `id`, `title`, `status`, `category`, `goal_amount`, `raised_amount`, `created_at`).
    - Define `CampaignSchema` (full campaign row: all columns from the read-model; inspect migration files from issue #40 on the `main` branch or infer from `specs/domain/campaign.md` for exact column names).
    - Define `RouteParamsSchema` (`{ id: z.string().uuid() }`).
    - Define `ListQuerySchema` with optional `status` and `category` Zod enums matching the DB constraint values.
    - Export inferred types: `Campaign`, `CampaignSummary`, `RouteParams`, `ListQuery`.
    - No duplicate manual type declarations — all types derived via `z.infer<>`.
  - **Files**: `server/src/campaigns/types.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; schemas can be imported and `.parse()` called in isolation.
  - **Brief ref**: Directory structure — `campaigns/types.ts`; Key design decisions — Zod validation.

- [ ] TASK-04: Create campaigns/queries.ts — parameterised SQL query functions
  - **Goal**: Implement `listCampaigns` and `getCampaignById` using parameterised `pool.query()` calls only — no string interpolation in SQL.
  - **Details**:
    - Create `server/src/campaigns/queries.ts`.
    - `listCampaigns(pool: Pool, filters: ListQuery): Promise<CampaignSummary[]>` — builds a SELECT on the campaign read-model view/table; applies optional `WHERE status = $1` and/or `AND category = $2` clauses based on filter presence; returns typed rows.
    - `getCampaignById(pool: Pool, id: string): Promise<Campaign | null>` — SELECT by `id = $1`; returns `null` when `rowCount === 0`.
    - Use column names exactly as defined in the migration from #40 (check `main` branch migration files if available, otherwise use `specs/domain/campaign.md` as reference).
    - Import `Pool` from `pg` and types from `./types`.
  - **Files**: `server/src/campaigns/queries.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; functions accept a typed pool and return typed promises.
  - **Brief ref**: Directory structure — `campaigns/queries.ts`; Key design decisions — Parameterised queries.

- [ ] TASK-05: Create middleware files — correlationId, requestLogger, errorHandler
  - **Goal**: Implement the three middleware modules used by the Express app.
  - **Details**:
    - `server/src/middleware/correlationId.ts`: reads `x-correlation-id` request header; if absent generates one via `crypto.randomUUID()`; sets `res.locals.correlationId` and writes the header on the response; calls `next()`.
    - `server/src/middleware/requestLogger.ts`: exports a factory that creates a `pino-http` middleware; uses `pino-pretty` transport when `process.env.NODE_ENV !== 'production'`.
    - `server/src/middleware/errorHandler.ts`: 4-argument Express 5 error handler `(err, req, res, next)`; maps any error to the L3-001 envelope `{ error: { code, message, correlation_id, details } }`; responds with appropriate HTTP status (default 500); uses `res.locals.correlationId` for the envelope.
  - **Files**: `server/src/middleware/correlationId.ts` (create), `server/src/middleware/requestLogger.ts` (create), `server/src/middleware/errorHandler.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; each file exports the expected symbol.
  - **Brief ref**: Directory structure — `middleware/`; Key design decisions — Correlation ID, Error envelope, Logging.

- [ ] TASK-06: Create campaigns/routes.ts — Express Router factory
  - **Goal**: Implement `createCampaignRouter(pool)` returning an Express Router with `GET /` and `GET /:id` handlers.
  - **Details**:
    - Create `server/src/campaigns/routes.ts`.
    - Export `createCampaignRouter(pool: Pool): Router`.
    - `GET /`: parse query string with `ListQuerySchema.safeParse(req.query)`; return 400 with `INVALID_QUERY_PARAMS` if invalid; call `listCampaigns(pool, filters)`; respond 200 with `{ data: [...] }`.
    - `GET /:id`: parse `req.params` with `RouteParamsSchema.safeParse(req.params)`; return 400 with `INVALID_CAMPAIGN_ID` if UUID invalid; call `getCampaignById(pool, id)`; return 404 with `CAMPAIGN_NOT_FOUND` if null; respond 200 with `{ data: campaign }`.
    - All error responses use the L3-001 error envelope (delegate to `next(err)` or construct inline — be consistent with the error handler).
    - Import pool type from `pg`, types and schemas from `./types`, query functions from `./queries`.
  - **Files**: `server/src/campaigns/routes.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; router exported correctly.
  - **Brief ref**: Directory structure — `campaigns/routes.ts`; Key design decisions — Pool injection, Zod validation.

- [ ] TASK-07: Create app.ts — Express app factory
  - **Goal**: Implement `createApp(pool)` that wires all middleware and routers into a fully configured Express 5 application (no `listen` call).
  - **Details**:
    - Create `server/src/app.ts`.
    - Export `createApp(pool: Pool): Express`.
    - Register in order: `helmet()`, `cors()`, `express.json()`, `correlationId` middleware, `requestLogger` middleware, campaign router at `/v1/campaigns`, global `errorHandler`.
    - Do not call `app.listen()` — that is the responsibility of `index.ts`.
  - **Files**: `server/src/app.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; `createApp` exported and importable.
  - **Brief ref**: Directory structure — `app.ts`; Key design decisions — App factory pattern.

- [ ] TASK-08: Create index.ts — server entry point
  - **Goal**: Wire pool, app factory, and HTTP listen into the server entry point.
  - **Details**:
    - Create `server/src/index.ts`.
    - Import `pool` from `./db/pool` and `createApp` from `./app`.
    - Read `PORT` from `process.env.PORT`, defaulting to `3000`.
    - Call `createApp(pool)` then `app.listen(PORT, ...)`.
    - Log a startup message with the port using pino (import the logger from a shared instance or create one inline).
  - **Files**: `server/src/index.ts` (create)
  - **Verify**: `cd server && npx tsc --noEmit` passes; file can be executed with `tsx src/index.ts` (exits after bind attempt without a real DB connection failing startup).
  - **Brief ref**: Directory structure — `index.ts`; Scripts section — `dev:server`.

- [ ] TASK-09: Create SuperTest integration tests for campaign routes
  - **Goal**: Achieve 100% SuperTest coverage of all documented route contracts — success, not-found, and invalid-param cases — with the pg pool mocked so no real database is needed.
  - **Details**:
    - Create `server/src/__tests__/campaigns.test.ts`.
    - Use `vi.mock('../db/pool')` (or mock path adjusted for resolution) so `pool.query` is a `vi.fn()`.
    - Import `createApp` from `../app` and inject the mocked pool; use `supertest(app)` for HTTP assertions.
    - Test cases:
      1. `GET /v1/campaigns` → 200 with `{ data: [...] }` when pool returns rows.
      2. `GET /v1/campaigns?status=active` → 200, filtered correctly.
      3. `GET /v1/campaigns?status=INVALID` → 400 with error envelope.
      4. `GET /v1/campaigns/:id` (valid UUID, found) → 200 with `{ data: {...} }`.
      5. `GET /v1/campaigns/:id` (valid UUID, not found) → 404 with `CAMPAIGN_NOT_FOUND` error code.
      6. `GET /v1/campaigns/:id` (non-UUID string) → 400 with `INVALID_CAMPAIGN_ID` error code.
    - Assert status code, `Content-Type: application/json`, and relevant body fields for each case.
    - Verify correlation ID header is present on responses.
  - **Files**: `server/src/__tests__/campaigns.test.ts` (create)
  - **Verify**: `cd server && npm test` runs and all tests pass with no real database.
  - **Brief ref**: `__tests__/campaigns.test.ts`; Key design decisions — Test strategy; Verification section.

- [ ] TASK-10: Wire ESLint config and verify full build, lint, and test pass
  - **Goal**: Ensure the root ESLint config excludes `server/src/**` from React-specific rules so `npm run lint` passes, and confirm all verification steps from the brief succeed.
  - **Details**:
    - Inspect `eslint.config.js` at repo root; add an ignore or override so React/JSX ESLint plugins are not applied to `server/src/**` files.
    - Run `npm run build` (root) — must pass.
    - Run `cd server && npx tsc --noEmit` — must pass with zero errors.
    - Run `npm run test:server` (root delegation) — all SuperTest tests must pass.
    - Run `npm run lint` — must pass.
    - Fix any TypeScript or lint errors discovered during this task.
  - **Files**: `eslint.config.js` (modify)
  - **Verify**: All four commands above exit 0 with no errors.
  - **Brief ref**: Verification section; Scope — npm scripts `dev:server` and `test:server`.
