# Tasks: Issue #117 — Milestone housekeeping — spec updates and cleanup

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create ADR-0002 (simplified audit log)
  - **Goal**: Document the demo's simplified `audit_log` schema versus the production event-sourcing design specified in L3-006.
  - **Details**: Create `specs/adrs/0002-audit-log-simplified-approach.md` following the structure of `specs/adrs/0001-npm-workspaces-monorepo.md`. Include: Context (L3-006 full schema vs. demo simplification), Decision (minimal table: `event_type`, `actor_id`, `payload`, `campaign_id`, `milestone_id`, `created_at`; no hash chain, no `previous_state`/`new_state`, no correlation IDs), Consequences (demo demonstrates concept without production-grade immutability; divergence is explicitly documented), and Production Path (full L3-006 schema, hash chains, WAL replication, tiered archival). Reference the actual migration file `packages/server/db/migrations/20260311000004_create_audit_log.sql` and the `writeAuditEvent` helper in `packages/server/src/campaigns/queries.ts`.
  - **Files**: `specs/adrs/0002-audit-log-simplified-approach.md` (create)
  - **Verify**: File exists; ADR references the correct migration filename and `writeAuditEvent`; `npm run lint:md` passes on the new file.
  - **Brief ref**: Approach §1 — Create ADR-0002

- [x] TASK-02: Update L3-006 (audit.md) with ADR-0002 cross-reference
  - **Goal**: Add a note to `specs/tech/audit.md` Section 1 "Local demo scope" callout referencing ADR-0002 and stating that the demo uses the simplified table rather than the full event schema.
  - **Details**: Read `specs/tech/audit.md` first. Locate the existing "Local demo scope" callout or theatre/real distinction paragraph near the top. Append (or augment) it with one paragraph: "The local demo uses the simplified `audit_log` table documented in ADR-0002 (`specs/adrs/0002-audit-log-simplified-approach.md`) rather than the full event schema described in this spec. See ADR-0002 for the trade-offs and production path." Follow one-sentence-per-line and `*emphasis*` (not `_emphasis_`) markdown rules.
  - **Files**: `specs/tech/audit.md` (modify)
  - **Verify**: The ADR-0002 filename/path appears in `specs/tech/audit.md`; `npm run lint:md` passes.
  - **Brief ref**: Approach §2 — Update L3-006

- [x] TASK-03: Add "Demo Stub" callouts to payments.md and kyc.md
  - **Goal**: Make the demo scope explicit in L4-004 and L4-005 so readers know what is stubbed and what a production implementation requires.
  - **Details**: Read both `specs/domain/payments.md` and `specs/domain/kyc.md`. Near the top of each file (after any front-matter or opening heading), add a clearly labelled "Demo Stub" callout block (matching the "Local demo scope" style used elsewhere). **payments.md**: contributions are recorded as `current_amount_usd` and `contributor_count` increments on the `campaigns` table; no Stripe gateway, no escrow, no tokenisation, no PCI DSS processing; settlement workflow is state transitions only; production requires Stripe Connect + escrow. **kyc.md**: creator KYC status is a field in `accounts` table, not a live verification; no external KYC provider called; reviewer/admin can manually set status; production requires a real KYC provider (e.g., Onfido, Persona) with webhook callbacks. Follow one-sentence-per-line and `*emphasis*` rules.
  - **Files**: `specs/domain/payments.md` (modify), `specs/domain/kyc.md` (modify)
  - **Verify**: Both files contain a "Demo Stub" section; `npm run lint:md` passes.
  - **Brief ref**: Approach §3 — Update L4-004 and L4-005

- [x] TASK-04: Append "Campaign Lifecycle Patterns" section to specs/learnings.md
  - **Goal**: Record the four implementation patterns introduced during the Campaign Lifecycle milestone so future contributors can find them quickly.
  - **Details**: Read `specs/learnings.md` to understand its existing structure. Append a new top-level section "Campaign Lifecycle Patterns" with four entries: (1) **TanStack Query layering rule** — `src/api/` contains plain `fetch` wrappers; `src/hooks/` wraps them in `useQuery`/`useMutation`; pages import only from `src/hooks/`; API layer stays testable outside React. (2) **`requireRole` middleware now accepts arrays** — both `requireRole('Reviewer')` and `requireRole(['Reviewer', 'Admin'])` are valid; used for endpoints where multiple roles share access. (3) **Simplified audit log pattern** — `writeAuditEvent(pool, { eventType, actorId, campaignId, milestoneId, payload })` in `packages/server/src/campaigns/queries.ts` is the only mechanism for writing audit events in the demo; see ADR-0002. (4) **Multi-step form isolation** — each step is a standalone component receiving a `defaultValues` slice and calling `onNext(data)`; steps do not read from or write to global state; parent page assembles and submits the full payload. Follow one-sentence-per-line and `*emphasis*` rules.
  - **Files**: `specs/learnings.md` (modify)
  - **Verify**: The four entries are present under "Campaign Lifecycle Patterns"; `npm run lint:md` passes.
  - **Brief ref**: Approach §4 — Add new learnings

- [x] TASK-05: Add Glossary section to specs/domain/campaign.md
  - **Goal**: Define the 12 campaign states and key review-pipeline, milestone, and financial vocabulary introduced in this milestone.
  - **Details**: Read `specs/domain/campaign.md` to find the Acceptance Criteria section. Add a new "Glossary" section after it. **Campaign states** (one-sentence each): Draft, Submitted, Under Review, Approved, Rejected, Live, Funded, Suspended, Failed, Settlement, Complete, Cancelled. **Review pipeline terms**: FIFO queue, pull-based assignment, claim, recuse, curation criteria, 5-day SLA. **Milestone terms**: verification criteria, evidence submission, staged fund release, return for resubmission. **Financial terms**: minimum funding target, maximum funding cap, deadline enforcement, stretch goal, flexible funding. Follow one-sentence-per-line and `*emphasis*` rules.
  - **Files**: `specs/domain/campaign.md` (modify)
  - **Verify**: Glossary section exists after Acceptance Criteria; all 12 states are listed; `npm run lint:md` passes.
  - **Brief ref**: Approach §5 — Add Glossary to campaign.md

- [x] TASK-06: Update specs/README.md index — add ADR-0002 and verify completeness
  - **Goal**: Ensure every `.md` file under `specs/` has an entry in `specs/README.md`, including the newly created ADR-0002.
  - **Details**: Run `find specs/ -name "*.md" | sort` to get the full file list. Read `specs/README.md` and compare. Add ADR-0002 to the ADRs table (title, status, date, summary). Update the file-system layout diagram to include `0002-audit-log-simplified-approach.md`. Confirm every other `.md` file already has an entry; add any that are missing. Follow one-sentence-per-line and `*emphasis*` rules.
  - **Files**: `specs/README.md` (modify)
  - **Verify**: `find specs/ -name "*.md" | sort` output matches every entry in `specs/README.md`; ADR-0002 appears in the ADRs table and file-system layout; `npm run lint:md` passes.
  - **Brief ref**: Approach §6 — Verify and update specs/README.md

- [x] TASK-07: Run CI checks and confirm all pass
  - **Goal**: Verify that all documentation changes are clean and no CI check is broken.
  - **Details**: Run `./scripts/ci-check.sh`. If any check fails (type-check, lint, format, markdown lint, build, tests), fix the issue before marking this task complete. Pay particular attention to `npm run lint:md` since all new and modified files are Markdown.
  - **Files**: (none — verification only)
  - **Verify**: `./scripts/ci-check.sh` exits 0 with no errors or warnings.
  - **Brief ref**: Verification section
