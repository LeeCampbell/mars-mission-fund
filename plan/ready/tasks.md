# Tasks: Issue #117 — Milestone housekeeping — spec updates and cleanup

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Verify ADR-0002 and ADR-0003 completeness
  - **Goal**: Confirm both ADR files cover all required sections and content per the brief
  - **Details**: Read `specs/adrs/0002-audit-log-demo-simplification.md` and verify it covers: three-table divergence, context, decision, rationale, alternatives considered, production requirements, and consequences. Read `specs/adrs/0003-stubbed-integrations.md` and verify it covers: KYC stub location, all three payment stub locations, context, decision, rationale, alternatives, production requirements, and consequences. Fix any missing sections or thin content.
  - **Files**: `specs/adrs/0002-audit-log-demo-simplification.md`, `specs/adrs/0003-stubbed-integrations.md`
  - **Verify**: Both files are non-empty, structurally complete, and `npm run lint:md` passes on them
  - **Brief ref**: Scope — ADR-0002 and ADR-0003 deliverables; Verification — ADR completeness

- [ ] TASK-02: Verify demo-scope callouts in audit.md, campaign.md, payments.md, and kyc.md
  - **Goal**: Confirm all four spec files contain the required demo-scope callouts referencing the correct ADRs
  - **Details**: Read each of the four files and check:
    - `specs/tech/audit.md` — demo-scope note with three-table detail and reference to ADR-0002
    - `specs/domain/campaign.md` — demo-scope callouts for appeal process, deadline extensions, milestone change requests, KYC revocation handling; also confirm §12 Glossary exists with all six terms: Review Queue, Settlement, Stretch Goal, Milestone Evidence, Cancellation Workflow, Deadline Enforcement
    - `specs/domain/payments.md` — stub detail with ADR-0003 reference
    - `specs/domain/kyc.md` — stub detail with ADR-0003 reference
    Fix any missing or incomplete callouts/glossary entries.
  - **Files**: `specs/tech/audit.md`, `specs/domain/campaign.md`, `specs/domain/payments.md`, `specs/domain/kyc.md`
  - **Verify**: All callouts and glossary entries present; `npm run lint:md` passes on all four files
  - **Brief ref**: Scope — demo-scope callouts, stub details, §12 Glossary

- [ ] TASK-03: Verify specs/README.md index is complete
  - **Goal**: Confirm the README Tooling table and File System Layout tree reference all three ADR files and every `.md` file under `specs/` has an entry
  - **Details**: Read `specs/README.md`. Check the Tooling table names ADR-0002 and ADR-0003. Check the File System Layout tree lists all three ADR files (`0001-*`, `0002-*`, `0003-*`). Then run `find specs/ -name "*.md" | sort` (via Bash) and compare the output against the tree in the README — every file must appear. Add any missing entries.
  - **Files**: `specs/README.md`
  - **Verify**: All `.md` files under `specs/` appear in the README tree; `npm run lint:md` passes
  - **Brief ref**: Scope — Update specs/README.md; Verification — Spec completeness

- [ ] TASK-04: Verify and update specs/learnings.md
  - **Goal**: Ensure `specs/learnings.md` captures all patterns from the Campaign Lifecycle milestone not yet documented
  - **Details**: Read `specs/learnings.md` and review the git log for Campaign Lifecycle milestone commits. Check whether any new server, auth, CQRS, or hexagonal-architecture patterns that emerged during the milestone are absent. Look for patterns around: CQRS event sourcing for campaigns, repository pattern usage, JWT role-based access, dbmate migration patterns, audit table design decisions, or stub/demo-scope boundary patterns. Add any missing entries following the existing style.
  - **Files**: `specs/learnings.md`
  - **Verify**: File updated (or confirmed already current); `npm run lint:md` passes on it
  - **Brief ref**: Scope — Verify specs/learnings.md; Approach — check for uncaptured Campaign Lifecycle patterns

- [ ] TASK-05: Full CI verification
  - **Goal**: Confirm all CI gates pass cleanly on the current branch state after all spec updates
  - **Details**: Run `./scripts/ci-check.sh` and confirm every check passes — specifically markdownlint (`npm run lint:md`), TypeScript compilation, ESLint, Prettier, build, and unit tests with coverage. Fix any lint or formatting issues surfaced by the run.
  - **Files**: (none — no new code; only fix issues surfaced by CI)
  - **Verify**: `./scripts/ci-check.sh` exits 0 with all gates green
  - **Brief ref**: Verification — CI must pass cleanly
