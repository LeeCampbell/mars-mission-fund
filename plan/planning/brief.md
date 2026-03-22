# Brief: Issue #117 — Milestone housekeeping — spec updates and cleanup

## Goal

Close out the Campaign Lifecycle milestone by updating specs to reflect what was actually built:
document the three-audit-table divergence and stubbed integrations as ADRs, add demo-scope
callouts to affected specs, extend the campaign glossary, and reconcile the spec index so every
`.md` file under `specs/` has an entry in `specs/README.md`. All CI checks must pass cleanly.

## Scope

**In scope**:

- Create ADR-0002 (`specs/adrs/0002-audit-log-demo-simplification.md`) documenting the
  three-table audit divergence and what production would require.
- Create ADR-0003 (`specs/adrs/0003-stubbed-integrations.md`) documenting the KYC and payment
  stubs and what production would require.
- Add demo-scope callouts to `specs/tech/audit.md` referencing ADR-0002.
- Add demo-scope callouts to `specs/domain/campaign.md` for: appeal process, deadline
  extensions, milestone change requests, KYC revocation handling.
- Add demo-scope stub details to `specs/domain/payments.md` and `specs/domain/kyc.md`
  referencing ADR-0003.
- Add a Glossary section (§12) to `specs/domain/campaign.md` with Campaign Lifecycle vocabulary:
  Review Queue, Settlement, Stretch Goal, Milestone Evidence, Cancellation Workflow, Deadline
  Enforcement.
- Update `specs/README.md` Tooling table to name ADR-0002 and ADR-0003, and update the File
  System Layout tree to list all three ADR files.
- Verify `specs/learnings.md` is current — add any new patterns from the Campaign Lifecycle
  milestone not yet captured.
- Verify all CI checks pass (`./scripts/ci-check.sh`).

**Out of scope**:

- Implementing any production features (real payments, real KYC, hash-chain audit).
- Unifying the three audit tables into one (deferred per ADR-0002).
- Changing any non-spec source code.
- Creating new L4 domain specs.
- Plan directory deletion and GitHub Milestone closure (handled by `scripts/execute-milestone.sh`).

## Approach

All deliverables are **documentation-only** — no TypeScript, SQL, or configuration changes.

The branch (`feat/issue-117-milestone-housekeeping-spec-updates-and-`) already contains commits
that have completed most deliverables:

| Deliverable | Status on branch |
| --- | --- |
| ADR-0002 created | Done (`a847f4b`) |
| ADR-0003 created | Done (`d5033c4`) |
| `specs/tech/audit.md` demo-scope note + ADR-0002 ref | Done (`5d9b594`) |
| `specs/domain/campaign.md` demo-scope notes + glossary | Done (`4468447`) |
| `specs/domain/payments.md` stub detail + ADR-0003 ref | Done (`b521fd7`) |
| `specs/domain/kyc.md` stub detail + ADR-0003 ref | Done (`b521fd7`) |
| `specs/README.md` index updated | Done (`157251a`) |
| CI clean | Done (`8d22131`) |

The remaining implementation task is to **verify completeness** by:

1. Reading the current state of each changed spec and comparing against the issue checklist.
2. Checking `specs/learnings.md` for any Campaign Lifecycle milestone patterns that should be
   captured but are not yet present.
3. Running `./scripts/ci-check.sh` (or individual checks) to confirm all CI gates pass
   cleanly on the current branch state.
4. If gaps are found (missing spec divergences, uncaptured learnings), add them.

Key files to verify for completeness:

- `specs/adrs/0002-audit-log-demo-simplification.md` — covers three-table divergence,
  alternatives considered, production requirements.
- `specs/adrs/0003-stubbed-integrations.md` — covers KYC stub location, three payment stub
  locations, production requirements.
- `specs/domain/campaign.md` §12 Glossary — six terms defined.
- `specs/README.md` — Tooling table and File System Layout tree both reference all three ADRs.
- `specs/learnings.md` — check for any new server, auth, or CQRS patterns from the milestone
  not yet documented.

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `specs/adrs/0002-audit-log-demo-simplification.md` | Create (done) | ADR documenting three-table audit divergence |
| `specs/adrs/0003-stubbed-integrations.md` | Create (done) | ADR documenting KYC and payment stubs |
| `specs/tech/audit.md` | Modify (done) | Demo-scope note extended with three-table detail + ADR-0002 ref |
| `specs/domain/campaign.md` | Modify (done) | Demo-scope callouts + §12 Glossary |
| `specs/domain/payments.md` | Modify (done) | Stub detail + ADR-0003 ref |
| `specs/domain/kyc.md` | Modify (done) | Stub detail + ADR-0003 ref |
| `specs/README.md` | Modify (done) | ADR entries in Tooling table + File System Layout tree |
| `specs/learnings.md` | Verify/modify | Add any uncaptured Campaign Lifecycle patterns |

## Dependencies

- No new npm packages.
- No external services.
- All previous Campaign Lifecycle milestone issues must be merged (branch depends on their
  implementation being present to verify stub locations and audit table schemas).

## Verification

- **Build**: `npm run build` succeeds (no source changes, so TypeScript compilation unchanged).
- **CI**: `./scripts/ci-check.sh` passes all gates — specifically `npm run lint:md` (markdownlint)
  must pass on all modified `.md` files.
- **Spec completeness**: every `.md` file under `specs/` appears in `specs/README.md` File
  System Layout — confirmed by comparing `find specs/ -name "*.md" | sort` against the README
  tree.
- **ADR completeness**: ADR-0002 covers the three-table divergence with context, decision,
  rationale, alternatives, and consequences. ADR-0003 covers KYC stub and all three payment
  stub locations similarly.
- **No E2E tests required**: this issue produces only documentation changes; no new UI flows or
  API endpoints are introduced.
