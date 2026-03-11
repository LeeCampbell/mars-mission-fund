# Brief: Issue #93 — Account backend — schema, seed, auth API

## Goal

Implement the server-side account foundation for the Mars Mission Fund demo:
a `accounts` DB migration, a seed migration with demo users across all roles,
Zod schemas for auth and user types in `@mmf/shared`, Express routes for auth
(`POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me`) and user
management (`GET /v1/users`, `GET /v1/users/:id`, `PATCH /v1/users/:id`), a
JWT auth middleware that attaches user context to `req`, integration tests for
every endpoint, and `JWT_SECRET` wired into `.env.example` and
`docker-compose.dev.yml`.
This is a demo stub — production concerns (SSO, MFA, session revocation, GDPR
erasure) are out of scope and must be noted in code comments.

## Scope

**In scope**

- DB migration: `accounts` table with columns `id`, `email`, `password_hash`,
  `display_name`, `bio`, `role`, `created_at`, `updated_at`
- Seed migration: three demo users — one each for `Backer`, `Creator`,
  `Administrator` roles — with bcrypt-hashed passwords of known demo values
- Zod schemas in `packages/shared/src/`: `RoleSchema`, `UserSchema`,
  `LoginRequestSchema`, `LoginResponseSchema`, `UpdateProfileRequestSchema`
  — exported from `packages/shared/src/index.ts`
- Auth routes under `/v1/auth`: `POST /v1/auth/login`, `POST /v1/auth/logout`,
  `GET /v1/auth/me`
- User routes under `/v1/users`: `GET /v1/users` (admin only),
  `GET /v1/users/:id` (authenticated), `PATCH /v1/users/:id` (own profile only)
- JWT auth middleware (`authenticate`): validates `Authorization: Bearer <token>`,
  attaches decoded user payload to `res.locals.user`
- Role-guard helper (e.g. `requireRole`): used by admin-only routes
- Integration tests in `packages/server/src/__tests__/auth.test.ts` and
  `packages/server/src/__tests__/users.test.ts` covering all endpoint contracts
  and permission combinations (per L2-002 §4.2)
- `JWT_SECRET` added to `packages/server/.env.example` and
  `docker-compose.dev.yml` (as an environment variable under the `db` service or
  a separate `server` service comment)
- All SQL uses parameterised queries via `pg` (L2-002 §1.2)
- All API responses use `{ "data": ... }` envelope and camelCase field names
  (L3-001 §6.1)
- Deviations from L3-002/L4-001 (no MFA, stateless JWT, no session revocation,
  no email verification) documented in code comments

**Out of scope**

- Frontend login/profile UI (separate issue)
- Email verification flow
- SSO / OAuth 2.0 providers
- MFA / TOTP
- Session revocation / token store / refresh tokens
- GDPR erasure workflow
- Account state machine (Pending Verification → Active → Deactivated → Deleted)
- Avatar file upload
- KYC integration
- Notification preferences
- OpenAPI/Swagger doc additions (separate concern)

## Approach

Follow the existing campaign module structure exactly — each feature area gets
its own subdirectory under `packages/server/src/` with `routes.ts`, `queries.ts`,
and `types.ts`. Register new routers in `packages/server/src/app.ts` alongside
`/v1/campaigns`.

### New packages needed

- `bcryptjs` (pure-JS bcrypt, no native bindings) + `@types/bcryptjs` — for
  hashing and comparing passwords in seed and login
- `jsonwebtoken` + `@types/jsonwebtoken` — for signing and verifying JWTs

Both are well-maintained and avoid native build complexity in the demo environment.

### DB migration

`packages/server/db/migrations/20260311000001_create_accounts.sql`

```sql
-- migrate:up
CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  display_name   TEXT,
  bio            TEXT,
  role           TEXT NOT NULL DEFAULT 'Backer',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- migrate:down
DROP TABLE accounts;
```

`role` is a single TEXT column holding the primary role value (`Backer`,
`Creator`, `Administrator`, `Reviewer`, `SuperAdministrator`).
Multi-role support is out of scope for this demo stub.

### Seed migration

`packages/server/db/migrations/20260311000002_seed_accounts.sql`

Inserts three rows with pre-computed bcrypt hashes of known passwords (e.g.
`backer-demo-pass`, `creator-demo-pass`, `admin-demo-pass`) using fixed UUIDs.
The known passwords are documented in a comment at the top of the file.

### Shared Zod schemas

`packages/shared/src/account.ts` — defines and exports:

- `RoleSchema`: `z.enum(['Backer', 'Creator', 'Reviewer', 'Administrator', 'SuperAdministrator'])`
- `UserSchema`: `{ id, email, displayName, bio, role, createdAt, updatedAt }`
  (no `password_hash` — never exposed in API)
- `LoginRequestSchema`: `{ email, password }`
- `LoginResponseSchema`: `{ token, user }`
- `UpdateProfileRequestSchema`: `{ displayName?, bio? }` (both optional strings)

Export all from `packages/shared/src/index.ts`.

### Server layout

```
packages/server/src/
  auth/
    routes.ts     — POST /v1/auth/login, POST /v1/auth/logout, GET /v1/auth/me
    queries.ts    — findAccountByEmail, findAccountById
    types.ts      — local Zod re-exports and internal types
  users/
    routes.ts     — GET /v1/users, GET /v1/users/:id, PATCH /v1/users/:id
    queries.ts    — listAccounts, getAccountById, updateAccount
    types.ts      — route param / body schemas
  middleware/
    authenticate.ts — JWT validation middleware
    requireRole.ts  — role-guard factory
```

### Auth middleware pattern

`authenticate` reads `Authorization: Bearer <token>`, verifies with
`jsonwebtoken.verify(token, process.env.JWT_SECRET)`, and writes the decoded
payload to `res.locals.user`. Returns `401 UNAUTHORIZED` if the token is
missing or invalid. Import and apply in `app.ts` or inline in route files.

`requireRole(role)` returns a middleware that checks `res.locals.user.role`
and returns `403 FORBIDDEN` if the user lacks the required role.

### Login flow

1. Parse and validate `LoginRequestSchema` from `req.body`.
2. Run `findAccountByEmail(pool, email)` — parameterised query.
3. If not found, return `401 INVALID_CREDENTIALS` (same error for wrong
   password — no enumeration).
4. `bcryptjs.compare(password, account.password_hash)`.
5. If mismatch, return `401 INVALID_CREDENTIALS`.
6. Sign JWT with `{ id, email, role }` payload and `JWT_SECRET`.
   Use `expiresIn: '8h'` (sensible demo default).
7. Return `200 { "data": { token, user } }`.

### Logout

`POST /v1/auth/logout` — authenticated endpoint that returns `200 { "data":
{ "message": "Logged out" } }`. JWT is stateless; actual token discard is
client-side. Comment documents the deviation from L4-001 §5.2 (no server-side
session revocation in this demo stub).

### GET /v1/auth/me

Requires `authenticate` middleware. Returns `200 { "data": <User> }` from
`findAccountById(pool, res.locals.user.id)`. Returns `404` if account row is
gone (edge case).

### User routes

- `GET /v1/users` — requires `authenticate` + `requireRole('Administrator')`.
  Returns `200 { "data": [<User>] }`.
- `GET /v1/users/:id` — requires `authenticate`.
  Returns `200 { "data": <User> }` or `404 USER_NOT_FOUND`.
- `PATCH /v1/users/:id` — requires `authenticate`.
  Validates body against `UpdateProfileRequestSchema`.
  Returns `403 FORBIDDEN` if `res.locals.user.id !== req.params.id`.
  Returns `200 { "data": <User> }` with updated values.

All queries alias DB columns to camelCase in SQL `SELECT` clauses (matching the
existing campaign pattern).

### Integration tests

Mirror the campaign test pattern in `packages/server/src/__tests__/`:

- `auth.test.ts` — covers login success, wrong password, unknown email, logout,
  GET /me with valid token, GET /me with missing/invalid token.
- `users.test.ts` — covers GET /users as admin, GET /users as non-admin (403),
  GET /users/:id authenticated, PATCH /users/:id own profile, PATCH /users/:id
  other user (403), missing token (401).

Use `vi.fn()` mock pool pattern (same as `campaigns.test.ts`).
For JWT tests, sign a test token with a known `TEST_JWT_SECRET` set via
`vi.stubEnv` or a test setup block.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/server/db/migrations/20260311000001_create_accounts.sql` | create | `accounts` table migration |
| `packages/server/db/migrations/20260311000002_seed_accounts.sql` | create | Demo user seed with bcrypt hashes |
| `packages/shared/src/account.ts` | create | `RoleSchema`, `UserSchema`, `LoginRequestSchema`, `LoginResponseSchema`, `UpdateProfileRequestSchema` |
| `packages/shared/src/index.ts` | modify | Export `* from './account.js'` |
| `packages/server/src/auth/queries.ts` | create | `findAccountByEmail`, `findAccountById` |
| `packages/server/src/auth/types.ts` | create | Re-exports and internal route types |
| `packages/server/src/auth/routes.ts` | create | `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me` |
| `packages/server/src/users/queries.ts` | create | `listAccounts`, `getAccountById`, `updateAccount` |
| `packages/server/src/users/types.ts` | create | Route param / body schemas |
| `packages/server/src/users/routes.ts` | create | `GET /v1/users`, `GET /v1/users/:id`, `PATCH /v1/users/:id` |
| `packages/server/src/middleware/authenticate.ts` | create | JWT validation middleware |
| `packages/server/src/middleware/requireRole.ts` | create | Role-guard factory middleware |
| `packages/server/src/app.ts` | modify | Register `/v1/auth` and `/v1/users` routers |
| `packages/server/src/__tests__/auth.test.ts` | create | Integration tests for auth endpoints |
| `packages/server/src/__tests__/users.test.ts` | create | Integration tests for user endpoints |
| `packages/server/.env.example` | create | `DATABASE_URL`, `PORT`, `JWT_SECRET` |
| `docker-compose.dev.yml` | modify | Add `JWT_SECRET` env var note/comment |

## Dependencies

New npm packages to add to `packages/server/package.json`:

- `bcryptjs` ^2 (runtime dependency)
- `@types/bcryptjs` ^2 (dev dependency)
- `jsonwebtoken` ^9 (runtime dependency)
- `@types/jsonwebtoken` ^9 (dev dependency)

No new packages required in `@mmf/shared` (already has `zod`).

## Verification

- **Build**: `npm run build` succeeds from repo root (TypeScript compilation
  for both `packages/server` and `packages/shared`)
- **Tests**: `npm run test` from `packages/server/` — all integration tests pass
  including auth and user endpoint coverage
- **Lint**: `npm run lint` (or equivalent) passes with no errors
- **Manual smoke test** (with DB running via `docker-compose up`):
  - `POST http://localhost:3001/v1/auth/login` with demo credentials returns JWT
  - `GET http://localhost:3001/v1/auth/me` with the JWT in `Authorization` header
    returns the user object
  - `GET http://localhost:3001/v1/users` without admin role returns 403
  - `PATCH http://localhost:3001/v1/users/:id` with own ID updates display name
