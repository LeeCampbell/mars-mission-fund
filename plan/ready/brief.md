# Brief: Issue #95 — Account demo documentation and cleanup

## Goal

After the account backend (#93) and account frontend (#94) are merged, this issue
tidies up the surrounding documentation and code to accurately reflect that the
local demo uses a simplified JWT stub — not Clerk — and to make demo credentials
discoverable for workshop participants.
The four deliverables are: (1) update the L4-001 spec's local demo scope note,
(2) add demo credentials and login instructions to developer docs, (3) add
`// DEMO STUB:` comments at every place the implementation deviates from spec,
and (4) confirm existing campaign features are unbroken.

## Scope

**In scope**

- Update the "Local demo scope" paragraph in `specs/domain/account.md` to
  describe the JWT stub accurately (replacing the Clerk references).
- Add a "Demo accounts" section to `README.md` listing seeded user credentials
  and a short login walkthrough.
- Add `// DEMO STUB:` comments to the auth middleware, login route, JWT
  issuance/verification, and client-side JWT storage produced by #93 and #94.
- Run `npm run build` and the full test suite to confirm campaigns and other
  existing features still work after auth middleware is wired in.

**Out of scope**

- Implementing any new auth functionality (done in #93 and #94).
- Changing the stub architecture (localStorage JWT, bcrypt, stateless logout).
- Updating any spec other than the local demo scope note in L4-001.
- Adding or changing automated tests beyond confirming the existing suite passes.

## Approach

### 1. Update L4-001 local demo scope note

`specs/domain/account.md` line 14 currently reads:

> Registration, authentication via Clerk, role assignment, and profile
> management are **real** — they are implemented in the local demo.

Replace this with a note that accurately describes the stub:

> Authentication in the local demo uses a **JWT stub** (not Clerk): email/password
> login issues a signed JWT stored in `localStorage`; tokens are stateless with
> no refresh or revocation; passwords are bcrypt hashes of known demo values.
> Role assignment and profile management are implemented.
> Session elevation, MFA, account deactivation with GDPR erasure, data
> portability, and SSO provider integration are theatre (not implemented).

### 2. Add demo credentials to README.md

Insert a "## Demo accounts" section (before or after "Getting Started") that
lists the three seeded users by role, their email and password, and a
one-paragraph note explaining that these credentials are for workshop use only
and that the JWT is stored in localStorage.

The exact credentials depend on what seed migration #93 inserts.
The brief author expects them to follow the pattern established in the #93 issue
spec: one Backer, one Creator, one Administrator — each with a known plaintext
password matching the bcrypt hash in the seed file.

After #93 is merged, read
`packages/server/src/db/migrations/<timestamp>_seed_demo_users.sql` (or
equivalent) to extract the real email/password values before writing this
section.

### 3. Add DEMO STUB code comments

At each location below, prepend or inline a comment in the form:

```
// DEMO STUB: <one-line reason this deviates from spec>
// Production would use <what the spec requires>.
```

Target locations (created by #93 and #94):

| File (expected path) | Deviation to document |
| -------------------- | ---------------------- |
| `packages/server/src/middleware/auth.ts` | Stateless JWT validation — no Clerk session, no token revocation list. Production (L3-002) requires Clerk-managed sessions. |
| `packages/server/src/auth/routes.ts` (or `packages/server/src/auth/login.ts`) | `POST /v1/auth/logout` is a no-op (client discards token). Production requires server-side session revocation. |
| `packages/server/src/auth/routes.ts` | JWT issued with `JWT_SECRET` env var, not a Clerk signing key. No refresh token, no expiry revocation. |
| `packages/server/src/db/migrations/<seed file>` | Passwords are bcrypt hashes of known, hardcoded demo values. Production (L3-002) requires breach-list checking and policy enforcement at registration. |
| `packages/client/src/context/AuthProvider.tsx` (or equivalent) | JWT stored in `localStorage`. Production would use Clerk's SDK with `httpOnly` cookie storage. |

Exact file paths must be verified against what #93 and #94 actually produce
before writing comments.

### 4. Verify existing features

Run:

```bash
npm run build
npm test
```

Confirm that:

- The campaign list (`GET /v1/campaigns`) and detail (`GET /v1/campaigns/:slug`)
  endpoints are **not** protected by the auth middleware (they remain public).
- All campaign component and integration tests pass without modification.

If the auth middleware is accidentally applied globally in `app.ts`, adjust the
route registration order so campaign routes are mounted before the auth
middleware, or scope the middleware only to `/v1/auth` and `/v1/users` routes.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `specs/domain/account.md` | modify | Replace the "Local demo scope" paragraph to describe the JWT stub, removing Clerk references |
| `README.md` | modify | Add a "## Demo accounts" section listing seeded user credentials and a login walkthrough |
| `packages/server/src/middleware/auth.ts` | modify | Add `// DEMO STUB:` comment explaining stateless JWT vs. Clerk sessions |
| `packages/server/src/auth/routes.ts` (verify path) | modify | Add `// DEMO STUB:` comments on logout no-op and JWT issuance |
| `packages/server/src/db/migrations/<seed>` (verify path) | modify | Add `// DEMO STUB:` comment on hardcoded bcrypt passwords |
| `packages/client/src/context/AuthProvider.tsx` (verify path) | modify | Add `// DEMO STUB:` comment on localStorage JWT storage |

> **Note**: Exact file paths for server auth routes, seed migration, and client
> `AuthProvider` must be confirmed after #93 and #94 are merged to this branch.

## Dependencies

- **Issue #93** (Account backend) must be merged first — provides auth
  middleware, routes, seed migration, and JWT implementation.
- **Issue #94** (Account frontend) must be merged first — provides
  `AuthProvider` and client-side JWT storage.
- No new npm packages required.

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors.
- **Tests**: `npm test` (or `npm run test --workspaces`) passes — all campaign
  and auth tests green.
- **Visual** (at `http://localhost:5173`):
  - The "Demo accounts" section is visible in the README (rendered on GitHub /
    local markdown viewer).
  - Logging in with each seeded credential succeeds and shows the correct role
    in the navigation.
  - Campaign list and detail pages load without requiring login.
- **Spec**: `specs/domain/account.md` local demo scope note no longer references
  Clerk; it accurately describes the JWT stub.
- **Code comments**: Each deviating location has a `// DEMO STUB:` comment that
  names the production alternative.
