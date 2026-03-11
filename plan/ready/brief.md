# Brief: Issue #117 — Milestone housekeeping — spec updates and cleanup

## Goal

Close out the Campaign Lifecycle milestone by capturing implementation decisions and patterns
that weren't recorded during the feature issues (#109–#116).
This is a documentation-only issue: no production code changes are expected.
All previous issues (#109–#116) must be merged before this issue is worked.

## Scope

**In scope**:

- Create a new ADR (`specs/adrs/0002-audit-log-simplified-approach.md`) documenting the
  simplified `audit_log` table schema used in the demo versus what a production event-sourcing
  implementation would require, and the trade-offs that drove the simplification.
- Add a "Demo Implementation Note" addendum to `specs/tech/audit.md` (L3-006) referencing
  ADR-0002 and clarifying which parts of L3-006 are theatre in the local demo.
- Add "Demo Stub" notes to `specs/domain/payments.md` (L4-004) and `specs/domain/kyc.md`
  (L4-005) describing what each stub covers and what a production implementation would require.
- Add new learnings to `specs/learnings.md` for patterns introduced during the Campaign
  Lifecycle milestone (TanStack Query layering, simplified audit log, `requireRole` array
  extension, multi-step form pattern).
- Add a Glossary section to `specs/domain/campaign.md` (L4-002) defining the 12 campaign
  states and key review-pipeline and milestone-verification vocabulary.
- Verify `specs/README.md` is complete — every `.md` file under `specs/` must have an entry.
  Update the index and file-system layout if any files are missing.
- Run `./scripts/ci-check.sh` and confirm all checks pass.

**Out of scope**:

- Code changes to server, client, or shared packages.
- New database migrations.
- New or modified E2E tests.
- Adding new ADRs beyond ADR-0002 (e.g., TanStack Query choice is adequately captured in
  learnings.md; a full ADR is not required).
- Updating L1–L2 specs or any spec that is not directly affected by the Campaign Lifecycle
  milestone.

## Approach

### 1 — Create ADR-0002: Simplified Audit Log

The `audit_log` table created in issue #113
(`packages/server/db/migrations/20260311000004_create_audit_log.sql`) has a minimal schema:

```
id           UUID PK
event_type   TEXT
campaign_id  UUID (FK, nullable)
milestone_id UUID (FK, nullable)
actor_id     TEXT
payload      JSONB
created_at   TIMESTAMPTZ
```

This diverges significantly from the L3-006 spec's full audit event schema (which requires
`correlation_id`, `actor_type`, `action`, `resource_type`, `resource_id`, `outcome`,
`ip_address`, `user_agent`, `previous_state`, `new_state`, `previous_hash`, etc.).

The ADR should follow the pattern established by `specs/adrs/0001-npm-workspaces-monorepo.md`:

- **Context**: L3-006 specifies a production-grade immutable event stream with tamper detection
  (hash chains), structured event types, and rich actor/resource metadata. Building the full
  schema for a workshop demo adds significant complexity without workshop value.
- **Decision**: Use a minimal `audit_log` table (`event_type`, `actor_id`, `payload`,
  `campaign_id`, `milestone_id`, `created_at`). All campaign state transitions and milestone
  verifications write to this table via the `writeAuditEvent` helper. No hash chain, no
  `previous_state`/`new_state` snapshots, no correlation ID propagation.
- **Consequences**: Audit log is visible and functional in the demo; the simplified schema
  demonstrates the concept without production-grade immutability guarantees. The spec
  divergence is explicitly documented so contributors understand the gap.
- **Production path**: A real implementation would use the full L3-006 schema with hash chains,
  a separate write path (never updated or deleted), WAL-based replication to read replicas, and
  tiered storage archival.

### 2 — Update L3-006 (audit.md) with demo scope note

After the ADR exists, add a one-paragraph note to the "Local demo scope" callout at the top of
`specs/tech/audit.md` (Section 1) referencing ADR-0002 and calling out that the local demo
uses the simplified table rather than the full event schema. The existing theatre/real
distinction paragraph already covers the high-level split; this note just adds the ADR
cross-reference.

### 3 — Update L4-004 (payments.md) and L4-005 (kyc.md) with stub notes

Both domains are fully stubbed in the demo. Add a clearly labelled "Demo Stub" callout
(matching the "Local demo scope" style used elsewhere) near the top of each spec:

- **payments.md**: Contributions are recorded as `current_amount_usd` and `contributor_count`
  increments on the `campaigns` table. No payment gateway (Stripe), no escrow account, no
  tokenisation, no PCI DSS processing. Settlement workflow disburses funds conceptually (state
  transitions only). Production requires Stripe Connect + escrow mechanics as specified.
- **kyc.md**: Creator KYC status is a field in the `accounts` table, not a live verification.
  No external KYC provider is called. Reviewer/admin can manually set verification status.
  Production requires a real KYC provider (e.g., Onfido, Persona) with webhook callbacks.

### 4 — Add new learnings to specs/learnings.md

Append a new section "Campaign Lifecycle Patterns" with:

- **TanStack Query layering rule**: `src/api/` contains plain `fetch` wrappers with no React
  dependency; `src/hooks/` wraps them in `useQuery`/`useMutation`; pages import only from
  `src/hooks/`. This pattern is enforced so the API layer stays testable outside React.
- **requireRole middleware now accepts arrays**: `requireRole('Reviewer')` and
  `requireRole(['Reviewer', 'Admin'])` are both valid. This is important for endpoints where
  multiple roles share access (e.g., admin cancellation endpoints).
- **Simplified audit log pattern**: The `writeAuditEvent(pool, { eventType, actorId, campaignId, milestoneId, payload })` helper in `packages/server/src/campaigns/queries.ts` is the only
  mechanism for writing audit events in the demo. All server-side state mutations call it
  directly. See ADR-0002 for the full context.
- **Multi-step form isolation**: Each step of the campaign creation form is a standalone
  component that receives a `defaultValues` slice and calls an `onNext(data)` callback. Steps
  do not read from or write to global state. The parent page assembles and submits the full
  payload.

### 5 — Add Glossary section to specs/domain/campaign.md

Add a new "Glossary" section (after the Acceptance Criteria section) defining the 12 campaign
states and key terminology introduced in this milestone:

**Campaign states**: Draft, Submitted, Under Review, Approved, Rejected, Live, Funded,
Suspended, Failed, Settlement, Complete, Cancelled — each with a one-sentence definition.

**Review pipeline terms**: FIFO queue, pull-based assignment, claim, recuse, curation criteria,
5-day SLA.

**Milestone terms**: verification criteria, evidence submission, staged fund release, return
for resubmission.

**Financial terms**: minimum funding target, maximum funding cap, deadline enforcement,
stretch goal, flexible funding.

### 6 — Verify and update specs/README.md index

After all the above changes, check that every `.md` file under `specs/` is listed in
`specs/README.md`. The new ADR-0002 file must be added to the ADRs table and the file-system
layout diagram. No other new spec files are expected from this milestone.

## Files to Create/Modify

| File                                       | Action | Description                                                                   |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| `specs/adrs/0002-audit-log-simplified-approach.md` | create | ADR documenting demo's simplified audit log vs production event sourcing      |
| `specs/tech/audit.md`                      | modify | Add ADR-0002 cross-reference to the demo scope note in Section 1              |
| `specs/domain/payments.md`                 | modify | Add "Demo Stub" callout near top describing what Payments stubs and what production needs |
| `specs/domain/kyc.md`                      | modify | Add "Demo Stub" callout near top describing what KYC stubs and what production needs |
| `specs/learnings.md`                       | modify | Append "Campaign Lifecycle Patterns" section with 4 new entries               |
| `specs/domain/campaign.md`                 | modify | Add Glossary section defining 12 campaign states and key vocabulary           |
| `specs/README.md`                          | modify | Add ADR-0002 to the ADRs table and file-system layout; verify all files indexed |

## Dependencies

- All Campaign Lifecycle issues #109–#116 must be merged to main before this issue begins.
  The implementing agent must read the merged code to verify divergences before editing specs.
- No new npm packages required.
- No database migrations required.

## Verification

- **Build**: `npm run build` succeeds.
- **Lint**: `npm run lint` passes with no new violations.
- **Markdown lint**: `npm run lint:md` passes (markdownlint governs all `.md` files; follow
  `specs/tech/markdown.md` one-sentence-per-line rule and use `*emphasis*` not `_emphasis_`).
- **Format check**: `npm run format:check` passes (`.md` files are in `.prettierignore` so
  Prettier does not touch them).
- **All CI**: `./scripts/ci-check.sh` exits 0.
- **Spec index completeness**: `find specs/ -name "*.md" | sort` output matches every entry in
  `specs/README.md`.
- **ADR-0002 consistency**: ADR-0002 references the actual `audit_log` migration
  (`20260311000004_create_audit_log.sql`) and the `writeAuditEvent` helper in
  `packages/server/src/campaigns/queries.ts`.
- **No E2E tests needed**: This issue produces documentation only; E2E coverage is handled by
  issue #116.
