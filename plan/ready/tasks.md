# Tasks: Issue #95 — Account demo documentation and cleanup

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Update L4-001 local demo scope note in specs/domain/account.md
  - **Goal**: Replace the outdated Clerk reference in the "Local demo scope" paragraph with an accurate description of the JWT stub.
  - **Details**: Open `specs/domain/account.md`. Find the paragraph that begins "Registration, authentication via Clerk…" and replace it with the exact text provided in the brief (section 1): describes JWT stub, localStorage, bcrypt, stateless tokens, and what is/isn't theatre.
  - **Files**: `specs/domain/account.md`
  - **Verify**: The word "Clerk" no longer appears in the local demo scope note. The replacement paragraph mentions JWT stub, localStorage, bcrypt, and lists theatre items.
  - **Brief ref**: Approach §1 "Update L4-001 local demo scope note"

- [x] TASK-02: Locate auth files and extract demo credentials from seed migration
  - **Goal**: Confirm the exact paths for auth middleware, login/logout routes, seed migration, and client AuthProvider; extract the plaintext email/password pairs from the seed file.
  - **Details**: Search the repo for the files created by #93 and #94. Specifically locate: (a) `packages/server/src/middleware/auth.ts`, (b) the auth routes file (e.g. `packages/server/src/auth/routes.ts` or `login.ts`), (c) the seed migration SQL file under `packages/server/src/db/migrations/` whose name contains "seed" or "demo_users", (d) the client-side AuthProvider under `packages/client/src/`. Read the seed migration to find the three seeded users (Backer, Creator, Administrator) with their emails and bcrypt-hashed passwords. Cross-reference with any known plaintext values in the seed or a companion fixture file.
  - **Files**: No files modified — research only; record findings for use in subsequent tasks.
  - **Verify**: All four file paths are confirmed to exist. The three demo user credentials (email + plaintext password) are identified.
  - **Brief ref**: Approach §2 and §3, note on verifying exact paths

- [ ] TASK-03: Add "## Demo accounts" section to README.md
  - **Goal**: Make demo credentials discoverable for workshop participants directly in the README.
  - **Details**: Insert a new `## Demo accounts` section in `README.md` (place it immediately after the "Getting Started" section or before it, whichever flows better). The section must: list all three seeded users in a markdown table (role, email, password); include a short login walkthrough paragraph (open app, click Login, enter credentials, observe role shown in nav); add a one-sentence note that credentials are for workshop/demo use only and that the JWT is stored in localStorage. Use the real credentials found in TASK-02.
  - **Files**: `README.md`
  - **Verify**: `README.md` contains a `## Demo accounts` heading, a table with three rows (Backer, Creator, Administrator), and a localStorage disclaimer sentence.
  - **Brief ref**: Approach §2 "Add demo credentials to README.md"

- [ ] TASK-04: Add DEMO STUB comments to server auth middleware and routes
  - **Goal**: Document the two largest deviations from spec (stateless JWT and no-op logout) at their source.
  - **Details**: Using the confirmed file paths from TASK-02:
    1. In `packages/server/src/middleware/auth.ts`, prepend a `// DEMO STUB:` block at the top of the middleware function explaining that it validates a stateless JWT rather than a Clerk session, and that production (L3-002) requires Clerk-managed sessions with revocation.
    2. In the auth routes file, add a `// DEMO STUB:` comment on the `POST /v1/auth/logout` handler explaining it is a no-op (client discards token) and that production requires server-side session revocation.
    3. In the same routes file, add a `// DEMO STUB:` comment near JWT issuance (typically inside a login handler) explaining that the token is signed with `JWT_SECRET` env var rather than a Clerk signing key, has no refresh token, and has no expiry revocation.
  - **Files**: `packages/server/src/middleware/auth.ts`, auth routes file (path confirmed in TASK-02)
  - **Verify**: Each of the three target locations contains a `// DEMO STUB:` comment that names the production alternative. Grep for `DEMO STUB` confirms at least three matches across these two files.
  - **Brief ref**: Approach §3, table rows 1–3

- [ ] TASK-05: Add DEMO STUB comments to seed migration and client AuthProvider
  - **Goal**: Document the remaining two deviations (hardcoded bcrypt passwords and localStorage JWT storage).
  - **Details**:
    1. In the seed migration SQL file (path confirmed in TASK-02), add a SQL comment block (`-- DEMO STUB: …`) near the INSERT statements explaining that passwords are bcrypt hashes of known demo values and that production requires breach-list checking and policy enforcement at registration.
    2. In `packages/client/src/context/AuthProvider.tsx` (or equivalent path confirmed in TASK-02), add a `// DEMO STUB:` comment near the code that stores the JWT in localStorage, explaining that production would use Clerk's SDK with `httpOnly` cookie storage.
  - **Files**: seed migration SQL file (path confirmed in TASK-02), client AuthProvider file (path confirmed in TASK-02)
  - **Verify**: The seed migration file contains a `-- DEMO STUB:` comment. The client AuthProvider contains a `// DEMO STUB:` comment. Grep for `DEMO STUB` across the repo returns five total hits.
  - **Brief ref**: Approach §3, table rows 4–5

- [ ] TASK-06: Run build and full test suite; verify campaign routes remain public
  - **Goal**: Confirm that all documentation and comment changes leave the codebase fully functional, and that campaign endpoints are still public.
  - **Details**:
    1. Run `npm run build` from the repo root. Confirm zero TypeScript errors.
    2. Run `npm test` (or `npm run test --workspaces`). Confirm all existing campaign and auth tests pass with no failures.
    3. If the build or tests fail due to auth middleware being applied globally: inspect `packages/server/src/app.ts` (or equivalent), move campaign routes to be mounted before the auth middleware, or scope the auth middleware only to `/v1/auth` and `/v1/users` routes.
    4. If tests fail for any other reason, diagnose and fix the root cause (limited to routing/middleware scope — do not rewrite auth logic).
  - **Files**: Possibly `packages/server/src/app.ts` if route ordering needs adjustment; no other new files.
  - **Verify**: `npm run build` exits 0. `npm test` exits 0 with all tests passing. The campaign list and detail endpoints do not require authentication (verified by test output or by a quick `curl` against a running server).
  - **Brief ref**: Approach §4 "Verify existing features"; Verification section
