# Brief: Issue #96 — Milestone housekeeping — account-demo-stub

## Goal

Close out the "Account Demo Stub" milestone by reconciling spec files with
the actual implementation delivered by issues #93–#95.
The milestone replaced the Clerk-based auth described in the specs with a
custom stateless JWT system, so several spec files reference "Clerk" and
must be updated to match reality.
In addition, new implementation patterns and decision rationale must be
captured in `specs/learnings.md`, and the spec index must be verified.

## Scope

**In scope:**

- Update `specs/domain/account.md` (L4-001) local demo scope note to replace
  "authentication via Clerk" with the actual custom JWT/bcrypt stub description.
- Update `specs/tech/security.md` (L3-002) local demo scope note and control
  table row ("User impersonation") and IdP definition to remove/replace Clerk.
- Update `specs/tech/tech-stack.md` (L3-008) to replace the Clerk entry with
  `jsonwebtoken` + `bcrypt` (or `bcryptjs`) as the auth toolchain.
- Update `specs/tech/architecture.md` (L3-001) Section 6.3 service-identity note
  that references "Clerk/OIDC infrastructure" to reflect the custom JWT approach.
- Add entries to `specs/learnings.md` for:
  - Stateless JWT auth middleware pattern (Express, `req.user` context injection).
  - Demo user selector UI pattern (login page with pre-populated demo credentials).
  - JWT stored in localStorage — documented deviation from the HttpOnly-cookie
    production pattern.
  - bcrypt hashes in seed migrations (demo-only; known passwords for workshop use).
- Bump version numbers and add changelog entries in every modified spec file.
- Verify `specs/README.md` spec index is complete (no new spec files added this
  milestone, so the index should already be current — confirm only).

**Out of scope:**

- Any code changes to `packages/server` or `packages/client`.
- Changing the acceptance criteria or domain workflow sections of L4-001 — those
  describe the production target and are intentionally preserved.
- Adding a new ADR (no new architectural decision requires one beyond what is
  already captured in the specs).
- Changing L2-001 (Brand), L3-003 (Reliability), L3-004 (Data Management),
  L3-005 (Frontend), L3-006 (Audit), or L3-007 (Markdown) — none are touched
  by this milestone.

## Approach

This is a spec-only change set — identical in shape to the previous housekeeping
PRs (#71, #74, #92).

**Step 1 — account.md (L4-001)**

Replace the local demo scope note on line 14 to say that authentication uses a
custom JWT stub (stateless, no refresh, no revocation, JWT in localStorage) with
bcrypt-hashed demo passwords, and that Clerk / SSO / session elevation / MFA are
theatre for the demo.
Increment version from 0.2 → 0.3 and add a changelog entry.

**Step 2 — security.md (L3-002)**

- Update the local demo scope note (line 14) to replace "authentication via Clerk"
  with the custom JWT stub.
- Update the threat-control table row for "User impersonation" (currently cites
  "OAuth 2.0 / OIDC authentication via Clerk with MFA") to describe stateless JWT
  validation with bcrypt credential check.
- Update the IdP definition in the key-concepts section (line 141–142) to describe
  the demo stub rather than Clerk.
- Update the PCI DSS table row "7.2 — Unique ID for each person with access"
  (currently "Clerk-managed user identities; no shared or generic accounts") to
  reference the accounts table / JWT-based identity instead.
- Leave the existing changelog entry (line 519) that records "Clerk selected as
  Identity Provider" unchanged — historical records are not edited.
- Increment version and add a changelog entry.

**Step 3 — tech-stack.md (L3-008)**

Replace the Clerk row in the authentication section with entries for the
actual packages used in the implementation (to be confirmed when #93 is merged;
likely `jsonwebtoken` and `bcryptjs` — verify against the actual `package.json`
before writing the spec).
Increment version and add a changelog entry.

**Step 4 — architecture.md (L3-001)**

Update Section 6.3 footnote that references "Clerk/OIDC infrastructure" to
reference the custom JWT implementation.
Increment version and add a changelog entry.

**Step 5 — learnings.md**

Append four new entries under a new "Auth Patterns" heading:

1. **Stateless JWT auth middleware** — Express middleware attaches `req.user`
   (decoded JWT payload) so downstream route handlers can access the current user.
   Auth secrets go in `JWT_SECRET` env var; token is sent as `Authorization: Bearer`
   header.

2. **Demo user selector on login page** — The login page offers pre-populated
   options (email + known password) for each demo role so workshop participants can
   switch users without typing credentials.
   This is a workshop-only UI pattern; it must not appear in production builds.

3. **JWT stored in localStorage (demo deviation)** — Production auth should use
   HttpOnly cookies to prevent XSS token theft.
   The demo intentionally uses localStorage for transparency and ease of
   inspection during the workshop.
   This deviation is annotated with a "demo stub" comment in the AuthProvider.

4. **bcrypt hashes in seed migrations** — Demo accounts use known passwords
   (e.g. `password123`) stored as bcrypt hashes in seed SQL.
   These are workshop-only; never use known seed passwords in a production system.

**Step 6 — README.md spec index verification**

Read `specs/README.md` and confirm every `.md` file under `specs/` has an entry.
No new spec files were added this milestone, so no changes are expected, but the
issue requires the check.

## Files to Create/Modify

| File                        | Action | Description                                               |
| --------------------------- | ------ | --------------------------------------------------------- |
| `specs/domain/account.md`   | modify | Update local demo scope note; v0.2 → v0.3; changelog     |
| `specs/tech/security.md`    | modify | Update local demo scope + Clerk references; changelog     |
| `specs/tech/tech-stack.md`  | modify | Replace Clerk row with jsonwebtoken + bcryptjs; changelog |
| `specs/tech/architecture.md`| modify | Update Section 6.3 Clerk/OIDC reference; changelog        |
| `specs/learnings.md`        | modify | Add four new auth-pattern entries                         |
| `specs/README.md`           | verify | No changes expected; confirm index is current             |

## Dependencies

No npm packages.
No external services.
Issues #93, #94, and #95 must be complete before this housekeeping brief is
executed — the spec updates must reflect what was actually built.
Confirm the exact npm package names (auth library, password-hashing library)
from the merged `packages/server/package.json` before updating tech-stack.md.

## Verification

- **Build**: `npm run build` succeeds (no code changes, build stays green).
- **Lint**: `npm run lint` passes — includes markdownlint on all `.md` files.
  Pay special attention to the one-sentence-per-line rule (L3-007) and the
  MD049 asterisk-emphasis rule.
- **Spec index**: Every `.md` file under `specs/` appears in `specs/README.md`.
- **Version fields**: Every modified spec has an incremented `Version` field.
- **Changelog entries**: Every modified spec has a new dated changelog row.
- **No Clerk references remain** in local demo scope notes or implementation
  guidance sections of any spec file.
