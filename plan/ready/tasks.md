# Tasks: Issue #93 — Account backend — schema, seed, auth API

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Install new npm dependencies
  - **Goal**: Add `bcryptjs`, `@types/bcryptjs`, `jsonwebtoken`, and `@types/jsonwebtoken` to `packages/server/package.json` and install them.
  - **Details**: Run `npm install bcryptjs jsonwebtoken` and `npm install -D @types/bcryptjs @types/jsonwebtoken` from `packages/server/`. Verify versions land at `bcryptjs ^2` and `jsonwebtoken ^9`.
  - **Files**: `packages/server/package.json`, `package-lock.json` (or workspace lock file)
  - **Verify**: `npm ls bcryptjs jsonwebtoken` from `packages/server/` shows both packages installed without errors.
  - **Brief ref**: Dependencies section

- [x] TASK-02: Create accounts DB migration
  - **Goal**: Add the `accounts` table migration file.
  - **Details**: Create `packages/server/db/migrations/20260311000001_create_accounts.sql` with the exact SQL from the brief (migrate:up / migrate:down blocks). Include a comment noting that multi-role support and account state machine are out of scope for this demo stub.
  - **Files**: `packages/server/db/migrations/20260311000001_create_accounts.sql`
  - **Verify**: File exists and contains valid SQL with `CREATE TABLE accounts` and `DROP TABLE accounts` in the down block.
  - **Brief ref**: DB migration section

- [x] TASK-03: Create seed migration with demo users
  - **Goal**: Insert three demo users (Backer, Creator, Administrator roles) with bcrypt-hashed passwords.
  - **Details**: Create `packages/server/db/migrations/20260311000002_seed_accounts.sql`. At the top of the file, document the known demo passwords in a comment. Use fixed UUIDs. Pre-compute bcrypt hashes (cost factor 10) for `backer-demo-pass`, `creator-demo-pass`, and `admin-demo-pass` — you can generate them with a small Node script or hard-code well-known hashes. Use parameterised-style `INSERT` with fixed literal values (no dynamic SQL needed in seed).
  - **Files**: `packages/server/db/migrations/20260311000002_seed_accounts.sql`
  - **Verify**: File exists, contains three `INSERT INTO accounts` rows with valid bcrypt hash strings (`$2b$...`), and the passwords are documented in a comment at the top.
  - **Brief ref**: Seed migration section

- [x] TASK-04: Add Zod schemas to `@mmf/shared`
  - **Goal**: Create `packages/shared/src/account.ts` with all required Zod schemas and export them from the shared package index.
  - **Details**: Define and export: `RoleSchema` (enum), `UserSchema` (id, email, displayName, bio, role, createdAt, updatedAt — no password_hash), `LoginRequestSchema` (email, password), `LoginResponseSchema` (token, user), `UpdateProfileRequestSchema` (displayName?, bio?). Add `export * from './account.js'` to `packages/shared/src/index.ts` following the existing export pattern.
  - **Files**: `packages/shared/src/account.ts` (create), `packages/shared/src/index.ts` (modify)
  - **Verify**: `npm run build` from `packages/shared/` (or repo root) succeeds and TypeScript compiles without errors. Importing `RoleSchema` from `@mmf/shared` resolves correctly.
  - **Brief ref**: Shared Zod schemas section

- [x] TASK-05: Create JWT auth middleware
  - **Goal**: Implement `authenticate` and `requireRole` middleware files under `packages/server/src/middleware/`.
  - **Details**:
    - `authenticate.ts`: reads `Authorization: Bearer <token>`, calls `jsonwebtoken.verify(token, process.env.JWT_SECRET)`, writes decoded payload to `res.locals.user`. Returns `401 UNAUTHORIZED` with `{ error: { code: 'UNAUTHORIZED' } }` if token is missing or invalid. Add a comment referencing the deviation from L4-001 §5.2 (no server-side session revocation in this demo stub).
    - `requireRole.ts`: exports a factory `requireRole(role: Role)` that returns middleware checking `res.locals.user.role`. Returns `403 FORBIDDEN` with `{ error: { code: 'FORBIDDEN' } }` if role does not match.
    - Follow the existing middleware pattern (correlationId.ts, errorHandler.ts) for code style.
  - **Files**: `packages/server/src/middleware/authenticate.ts` (create), `packages/server/src/middleware/requireRole.ts` (create)
  - **Verify**: TypeScript compilation succeeds. Both files export the expected function signatures.
  - **Brief ref**: Auth middleware pattern section

- [x] TASK-06: Create auth queries and types
  - **Goal**: Implement the DB query functions and local types for the auth module.
  - **Details**:
    - `queries.ts`: implement `findAccountByEmail(pool, email)` and `findAccountById(pool, id)` using parameterised queries (`$1`, `$2`). SELECT columns aliased to camelCase (id, email, password_hash AS "passwordHash", display_name AS "displayName", bio, role, created_at AS "createdAt", updated_at AS "updatedAt"). Return `null` when row not found.
    - `types.ts`: re-export relevant schemas from `@mmf/shared` and define any internal types (e.g. `AccountRow` including `passwordHash`).
  - **Files**: `packages/server/src/auth/queries.ts` (create), `packages/server/src/auth/types.ts` (create)
  - **Verify**: TypeScript compilation succeeds. Query functions accept `Pool` and string parameters and return typed results.
  - **Brief ref**: Server layout and Login flow sections

- [x] TASK-07: Create auth routes
  - **Goal**: Implement Express route handlers for `POST /v1/auth/login`, `POST /v1/auth/logout`, and `GET /v1/auth/me`.
  - **Details**:
    - Follow the existing campaigns route structure (Router, validation, query, response).
    - Login: validate body with `LoginRequestSchema`, call `findAccountByEmail`, bcrypt compare, sign JWT `{ id, email, role }` with `expiresIn: '8h'`, return `200 { "data": { token, user } }`. Use the same `INVALID_CREDENTIALS` error for both unknown email and wrong password to prevent enumeration.
    - Logout: apply `authenticate` middleware, return `200 { "data": { "message": "Logged out" } }`. Add comment: deviation from L4-001 §5.2 — no server-side session revocation in this demo stub.
    - GET /me: apply `authenticate`, call `findAccountById`, return `200 { "data": user }` or `404 USER_NOT_FOUND`.
    - All responses use `{ "data": ... }` envelope.
  - **Files**: `packages/server/src/auth/routes.ts` (create)
  - **Verify**: TypeScript compilation succeeds. Router exports `authRouter`.
  - **Brief ref**: Auth routes, Login flow, Logout, GET /v1/auth/me sections

- [x] TASK-08: Create user queries and types
  - **Goal**: Implement DB query functions and types for the users module.
  - **Details**:
    - `queries.ts`: implement `listAccounts(pool)`, `getAccountById(pool, id)`, `updateAccount(pool, id, data)`. All SELECT queries alias columns to camelCase. `updateAccount` accepts partial `{ displayName?, bio? }` and builds a safe parameterised UPDATE returning the updated row. Return `null` from `getAccountById` when not found.
    - `types.ts`: define route param schema (`{ id: z.string().uuid() }`) and re-export `UpdateProfileRequestSchema`.
  - **Files**: `packages/server/src/users/queries.ts` (create), `packages/server/src/users/types.ts` (create)
  - **Verify**: TypeScript compilation succeeds. All query functions are properly typed.
  - **Brief ref**: User routes and Server layout sections

- [x] TASK-09: Create user routes
  - **Goal**: Implement Express route handlers for `GET /v1/users`, `GET /v1/users/:id`, and `PATCH /v1/users/:id`.
  - **Details**:
    - `GET /v1/users`: apply `authenticate` + `requireRole('Administrator')`, return `200 { "data": [users] }`.
    - `GET /v1/users/:id`: apply `authenticate`, validate `req.params.id` as UUID, return `200 { "data": user }` or `404 USER_NOT_FOUND`.
    - `PATCH /v1/users/:id`: apply `authenticate`, validate params and body, return `403 FORBIDDEN` if `res.locals.user.id !== req.params.id`, call `updateAccount`, return `200 { "data": updatedUser }`.
    - All responses use `{ "data": ... }` envelope and camelCase field names.
  - **Files**: `packages/server/src/users/routes.ts` (create)
  - **Verify**: TypeScript compilation succeeds. Router exports `usersRouter`.
  - **Brief ref**: User routes section

- [x] TASK-10: Register routers in app.ts
  - **Goal**: Mount the auth and users routers in the Express app alongside the existing campaigns router.
  - **Details**: Import `authRouter` from `./auth/routes.js` and `usersRouter` from `./users/routes.js`. Mount at `/v1/auth` and `/v1/users` respectively in `packages/server/src/app.ts`, following the existing pattern for `/v1/campaigns`.
  - **Files**: `packages/server/src/app.ts` (modify)
  - **Verify**: `npm run build` from repo root succeeds. App factory still creates the app without errors.
  - **Brief ref**: Approach section (register new routers alongside /v1/campaigns)

- [x] TASK-11: Wire JWT_SECRET into environment config
  - **Goal**: Add `JWT_SECRET` to `.env.example` and `docker-compose.dev.yml`.
  - **Details**:
    - Create (or update) `packages/server/.env.example` to include `DATABASE_URL`, `PORT`, and `JWT_SECRET=change-me-in-production`.
    - In `docker-compose.dev.yml`, add a comment block (e.g. under the `db` service or at the top) noting that the server requires `JWT_SECRET` as an environment variable. If a `server` service already exists or is planned, add the env var there; otherwise add a comment near the db service.
  - **Files**: `packages/server/.env.example` (create/modify), `docker-compose.dev.yml` (modify)
  - **Verify**: Both files contain `JWT_SECRET`. The docker-compose file is valid YAML.
  - **Brief ref**: Files to Create/Modify table, JWT_SECRET section

- [x] TASK-12: Write auth integration tests
  - **Goal**: Create `packages/server/src/__tests__/auth.test.ts` covering all auth endpoint contracts.
  - **Details**: Mirror the `campaigns.test.ts` mock-pool pattern. Use `vi.stubEnv` to set `JWT_SECRET` to a known test value. Cover:
    - Login success (valid credentials → returns JWT + user)
    - Login with wrong password → 401 INVALID_CREDENTIALS
    - Login with unknown email → 401 INVALID_CREDENTIALS
    - Logout with valid token → 200
    - GET /me with valid token → 200 + user object
    - GET /me with missing token → 401
    - GET /me with invalid/expired token → 401
  - **Files**: `packages/server/src/__tests__/auth.test.ts` (create)
  - **Verify**: `npm run test` from `packages/server/` — all auth tests pass.
  - **Brief ref**: Integration tests section, auth.test.ts

- [x] TASK-13: Write users integration tests
  - **Goal**: Create `packages/server/src/__tests__/users.test.ts` covering all user endpoint permission combinations.
  - **Details**: Mirror the `campaigns.test.ts` mock-pool pattern with `vi.stubEnv` for `JWT_SECRET`. Cover:
    - GET /users as Administrator → 200 + array
    - GET /users as Backer → 403 FORBIDDEN
    - GET /users with no token → 401
    - GET /users/:id authenticated → 200 + user
    - GET /users/:id with no token → 401
    - GET /users/:id not found → 404 USER_NOT_FOUND
    - PATCH /users/:id own profile → 200 + updated user
    - PATCH /users/:id other user → 403 FORBIDDEN
    - PATCH /users/:id with no token → 401
  - **Files**: `packages/server/src/__tests__/users.test.ts` (create)
  - **Verify**: `npm run test` from `packages/server/` — all users tests pass.
  - **Brief ref**: Integration tests section, users.test.ts

- [ ] TASK-14: Final build and test verification
  - **Goal**: Confirm the full build and test suite passes end-to-end with no TypeScript errors or lint failures.
  - **Details**: Run `npm run build` from the repo root to verify both `packages/shared` and `packages/server` compile cleanly. Run `npm run test` from `packages/server/` to confirm all tests (campaigns + auth + users) pass. Run `npm run lint` (or equivalent) and fix any lint errors introduced by new files.
  - **Files**: No new files; fix any issues found in previously created files.
  - **Verify**: All three commands exit with code 0 and no errors.
  - **Brief ref**: Verification section
