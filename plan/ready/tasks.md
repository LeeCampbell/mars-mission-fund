# Tasks: Issue #96 — Milestone housekeeping — account-demo-stub

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Verify auth package names from server package.json
  - **Goal**: Confirm the exact npm package names used for JWT and password hashing so tech-stack.md is updated with accurate names.
  - **Details**: Read `packages/server/package.json` and locate the JWT library (expected: `jsonwebtoken`) and password-hashing library (expected: `bcryptjs` or `bcrypt`). Note exact package names and versions for use in TASK-04.
  - **Files**: `packages/server/package.json` (read only)
  - **Verify**: Package names and versions are recorded; confirms whether it is `bcryptjs` or `bcrypt`.
  - **Brief ref**: Step 3 / Dependencies section ("Confirm the exact npm package names … before updating tech-stack.md")

- [x] TASK-02: Update specs/domain/account.md — local demo scope note + version bump
  - **Goal**: Replace the Clerk reference in the local demo scope note with the custom JWT/bcrypt stub description; increment version 0.2 → 0.3 and add a changelog entry.
  - **Details**: Read the file. On line 14 (local demo scope note) replace "authentication via Clerk" (or equivalent) with a description of the custom JWT stub: stateless, no refresh, no revocation, JWT in localStorage, bcrypt-hashed demo passwords, and that Clerk / SSO / session elevation / MFA are theatre for the demo. Increment the `Version` field from 0.2 to 0.3. Add a dated changelog row documenting the change.
  - **Files**: `specs/domain/account.md`
  - **Verify**: No "Clerk" references remain in the local demo scope note. `Version` field reads `0.3`. A new changelog entry dated today is present.
  - **Brief ref**: Step 1 — account.md (L4-001)

- [x] TASK-03: Update specs/tech/security.md — Clerk references + version bump
  - **Goal**: Remove all Clerk references from the local demo scope note, the "User impersonation" threat-control row, the IdP key-concept definition, and the PCI DSS 7.2 row; increment version and add changelog entry.
  - **Details**: Read the file. Make four targeted edits:
    1. Local demo scope note (≈line 14): replace "authentication via Clerk" with the custom JWT stub.
    2. Threat-control table row for "User impersonation": replace "OAuth 2.0 / OIDC authentication via Clerk with MFA" with stateless JWT validation with bcrypt credential check.
    3. IdP definition in key-concepts section (≈lines 141–142): replace Clerk-specific text with demo stub description.
    4. PCI DSS table row "7.2 — Unique ID for each person with access": replace "Clerk-managed user identities; no shared or generic accounts" with accounts table / JWT-based identity.
    Do NOT edit the existing historical changelog entry that records "Clerk selected as Identity Provider". Increment the version field and add a dated changelog row.
  - **Files**: `specs/tech/security.md`
  - **Verify**: No Clerk references remain outside the historical changelog entry. Version is incremented. New dated changelog entry present.
  - **Brief ref**: Step 2 — security.md (L3-002)

- [x] TASK-04: Update specs/tech/tech-stack.md — replace Clerk row with jwt + bcrypt
  - **Goal**: Replace the Clerk authentication row with entries for `jsonwebtoken` and the actual password-hashing library (confirmed in TASK-01); increment version and add changelog entry.
  - **Details**: Read the file. Find the Clerk entry in the authentication section and replace it with two rows: one for `jsonwebtoken` (stateless JWT generation/validation) and one for `bcryptjs` (or `bcrypt`, per TASK-01 finding) (password hashing). Use the exact package names and versions from TASK-01. Increment the version field and add a dated changelog row.
  - **Files**: `specs/tech/tech-stack.md`
  - **Verify**: No Clerk entry remains. `jsonwebtoken` and the confirmed bcrypt package appear in the auth section. Version incremented. New changelog entry present.
  - **Brief ref**: Step 3 — tech-stack.md (L3-008)

- [x] TASK-05: Update specs/tech/architecture.md — Section 6.3 Clerk/OIDC reference
  - **Goal**: Replace the "Clerk/OIDC infrastructure" footnote in Section 6.3 with a reference to the custom JWT implementation; increment version and add changelog entry.
  - **Details**: Read the file. Locate the Section 6.3 service-identity note that references "Clerk/OIDC infrastructure" and rewrite it to describe the custom stateless JWT approach. Increment the version field and add a dated changelog row.
  - **Files**: `specs/tech/architecture.md`
  - **Verify**: "Clerk/OIDC" no longer appears in Section 6.3. Version incremented. New changelog entry present.
  - **Brief ref**: Step 4 — architecture.md (L3-001)

- [x] TASK-06: Add auth-pattern entries to specs/learnings.md
  - **Goal**: Append four new learning entries under a new "Auth Patterns" heading covering: stateless JWT middleware, demo user selector UI, JWT in localStorage deviation, and bcrypt hashes in seed migrations.
  - **Details**: Read the file to find the correct insertion point (end of file or under a logical section). Append a new `## Auth Patterns` heading followed by four entries:
    1. **Stateless JWT auth middleware** — Express middleware, `req.user` injection, `JWT_SECRET` env var, `Authorization: Bearer` header.
    2. **Demo user selector on login page** — pre-populated email/password options for each demo role; workshop-only UI pattern, must not appear in production builds.
    3. **JWT stored in localStorage (demo deviation)** — production should use HttpOnly cookies; demo uses localStorage for transparency; annotated with "demo stub" comment in AuthProvider.
    4. **bcrypt hashes in seed migrations** — known passwords (e.g. `password123`) stored as bcrypt hashes in seed SQL; workshop-only; never use known seed passwords in production.
    Follow the one-sentence-per-line markdownlint rule (L3-007) and the MD049 asterisk-emphasis rule.
  - **Files**: `specs/learnings.md`
  - **Verify**: All four entries are present under "## Auth Patterns". File passes markdownlint rules (one sentence per line, asterisk emphasis).
  - **Brief ref**: Step 5 — learnings.md

- [ ] TASK-07: Verify specs/README.md spec index completeness
  - **Goal**: Confirm every `.md` file under `specs/` has a corresponding entry in `specs/README.md`; no changes expected but the check is required by the issue.
  - **Details**: List all `.md` files under `specs/` recursively. Cross-reference each against the entries in `specs/README.md`. Report any missing entries. No new spec files were added this milestone so the index should already be current. If a gap is found, add the missing entry; otherwise leave the file unchanged.
  - **Files**: `specs/README.md` (verify; modify only if gaps found)
  - **Verify**: Every `.md` file under `specs/` appears in `specs/README.md`. If no gaps, the file is unchanged and the check is recorded as passed.
  - **Brief ref**: Step 6 — README.md spec index verification

- [ ] TASK-08: Run build and lint to confirm all changes are clean
  - **Goal**: Ensure `npm run build` and `npm run lint` both pass with no errors after all spec edits.
  - **Details**: Run `npm run build` from the repo root; check exit code. Run `npm run lint` from the repo root; check exit code and output for markdownlint errors in any modified spec file. Fix any lint violations found (most likely one-sentence-per-line or emphasis style) before declaring done.
  - **Files**: None (verification only; fix any modified spec file if lint fails)
  - **Verify**: Both commands exit with code 0. No markdownlint errors in `specs/domain/account.md`, `specs/tech/security.md`, `specs/tech/tech-stack.md`, `specs/tech/architecture.md`, or `specs/learnings.md`.
  - **Brief ref**: Verification section of the brief
