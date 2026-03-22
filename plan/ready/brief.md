# Brief: Issue #117 — Milestone housekeeping — spec updates and cleanup

## Goal

Close out the Campaign Lifecycle milestone by reconciling the spec ecosystem with the
implementation: add two new ADRs capturing architectural decisions made during the milestone
(audit log simplification, stubbed integrations), update relevant specs to match implemented
reality, add new domain vocabulary to the campaign spec, and update the spec index so every
`.md` file under `specs/` is listed in `specs/README.md`.

## Scope

**IN scope:**

- New ADR: `specs/adrs/0002-audit-log-demo-simplification.md` — explains the three-table audit
  pattern, how it differs from full production event sourcing, and what a production implementation
  would require.
- New ADR: `specs/adrs/0003-stubbed-integrations.md` — documents the KYC (always-verified stub)
  and Payments (console.log stub) integration points, why they are stubs, and what production
  integration requires.
- Update `specs/tech/audit.md` — add a "Local demo scope" / "Demo simplification" note
  referencing ADR-0002, clarifying that the hash-chain, tamper-detection, retention enforcement,
  and anomaly-detection features described in the spec are production requirements not implemented
  in the demo.
- Update `specs/domain/campaign.md` — note appeal process (§ 6.3), deadline extensions (§ 7.4
  extension requests), milestone change requests (§ 7.5), and KYC revocation handling (§ AC-CAMP-023)
  are out of scope for the demo; add "Local demo scope" notes to these sections.
  Add a Glossary section (§ 11) with new vocabulary introduced in this milestone.
- Update `specs/domain/payments.md` — add "Local demo scope" note referencing ADR-0003,
  confirming payment processing is fully stubbed.
- Update `specs/domain/kyc.md` — add "Local demo scope" note referencing ADR-0003, confirming
  KYC verification is fully stubbed (always returns verified).
- Update `specs/README.md` — add entries for the two new ADRs in the Tooling table, and confirm
  every `.md` file under `specs/` is listed.
- Update `specs/learnings.md` — capture any new gotchas discovered during the Campaign Lifecycle
  milestone (specifically the `dbmate --no-dump-schema` flag ordering issue from issue #115 if
  not already present, and the Playwright browser binary issue from issue #111 if not already
  present — these are already in learnings.md so confirm rather than duplicate).

**OUT of scope:**

- Implementing any missing features (appeal process, KYC revocation, deadline extensions, etc.).
- Modifying application code (no TypeScript/JavaScript changes).
- Changing the spec governance model or restructuring existing specs.
- Adding new L4 domain specs or splitting existing ones.
- Closing the GitHub milestone (handled by `scripts/execute-milestone.sh`).
- Deleting plan files (handled automatically).

## Approach

This is a **documentation-only** task. All changes are to `.md` files under `specs/`.

### Step 1 — New ADRs

Create `specs/adrs/0002-audit-log-demo-simplification.md` following the ADR-0001 pattern
(Status / Date / Deciders / Context / Decision / Rationale / Alternatives considered /
Consequences). Cover:

- Context: Spec L3-006 describes a production-grade immutable event stream with hash chains,
  tamper detection, retention tiers, and anomaly detection.
  The demo needs an auditable trail for the workshop without the infrastructure burden.
- Decision: Three-table approach used in practice:
  - `audit_log` (legacy JSONB append-only, used for settlement/milestone events)
  - `campaign_audit_events` (structured events with previous/new state, used for workflow
    transitions)
  - `audit_events` (spec-aligned table matching L3-006 schema, used for campaign lifecycle
    events introduced in later issues)
- Rationale: Each table was added incrementally during the milestone; no single refactor was
  made to unify them; the demo value comes from the visibility into events, not from hash-chain
  integrity.
- What production requires: hash chaining (SHA-256), batch tamper verification, hot/warm/cold
  retention tiers, anomaly-detection rules, and audit-access logging.

Create `specs/adrs/0003-stubbed-integrations.md`. Cover:

- Context: Spec L4-004 (Payments) and L4-005 (KYC) describe production Stripe integration and
  third-party KYC provider integration.
- Decision: Both are stubbed for the demo.
  - KYC: `const kycVerified = true` in `packages/server/src/campaigns/queries.ts` submitCampaign
    function.
  - Payments: `console.log('[STUB] ...')` at fund disbursement (milestone verification),
    refund (settlement cancellation), and admin notification (evidence submission).
- Rationale: PCI DSS scope, Stripe API keys, and KYC provider onboarding are out of scope for
  a local workshop demo.
- What production requires: Stripe Connect integration, escrow account management, KYC document
  upload and provider API calls, webhook handling.

### Step 2 — Spec updates

For `specs/tech/audit.md`: locate the "Local demo scope" section (or add one) and reference
ADR-0002. Clarify that hash chains, tamper detection, and anomaly detection are not implemented.

For `specs/domain/campaign.md`: add "Local demo scope" callouts to §6.3 (appeal process),
§7.4 (deadline extension requests), §7.5 (milestone change requests), and near the end noting
KYC revocation (AC-CAMP-023) is not implemented. Add a new §12 Glossary section (before the
existing Change Log, after the existing §11 Interface Contracts) with:

- **Review Queue** — FIFO set of Submitted campaigns available for Reviewers to claim; Reviewers
  self-assign (pull model), not assigned by admins.
- **Settlement** — post-deadline fund disbursement workflow; triggered when a Funded campaign
  passes its deadline; Admin verifies each milestone and releases escrowed funds.
- **Stretch Goal** — an optional funding tier above the minimum target that unlocks additional
  deliverables when crossed.
- **Milestone Evidence** — documentation submitted by a Creator to prove a milestone is complete;
  reviewed by an Admin before funds for that milestone are released.
- **Cancellation Workflow** — immediate cancellation if no contributions have been made;
  admin-approval required if contributions exist (to trigger refunds).
- **Deadline Enforcement** — automatic system transition from Live to Funded (minimum met) or
  Failed (minimum not met) when the campaign deadline passes; triggered lazily on next
  contribution attempt or explicitly by a scheduled check.

For `specs/domain/payments.md` and `specs/domain/kyc.md`: add or update the existing "Local
demo scope" note to reference ADR-0003 and confirm stub behaviour.

### Step 3 — README index update

Read `specs/README.md`. The Tooling section has a single row for `adrs/` directory.
Update the File System Layout listing (currently shows only `0001-npm-workspaces-monorepo.md`)
to add the two new ADR files. Also update the `adrs/` row description to mention that individual
ADRs are listed in the directory. Verify every `.md` file under `specs/` appears somewhere in
the index.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `specs/adrs/0002-audit-log-demo-simplification.md` | create | ADR documenting three-table audit vs production event sourcing |
| `specs/adrs/0003-stubbed-integrations.md` | create | ADR documenting KYC and payment stubs and production requirements |
| `specs/tech/audit.md` | modify | Add/update Local demo scope note referencing ADR-0002 |
| `specs/domain/campaign.md` | modify | Add Local demo scope notes to unimplemented sections; add §11 Glossary |
| `specs/domain/payments.md` | modify | Add/update Local demo scope note referencing ADR-0003 |
| `specs/domain/kyc.md` | modify | Add/update Local demo scope note referencing ADR-0003 |
| `specs/README.md` | modify | Add ADR-0002 and ADR-0003 to Tooling table |

## Dependencies

- No npm packages required.
- No external services required.
- All previous Campaign Lifecycle milestone issues (109–115) must be merged — the audit and
  stub patterns documented here come from that implementation.

## Verification

- **Build**: `npm run build` succeeds (no TypeScript changes, so this validates no `.md` lint
  regressions in CI configuration).
- **Markdown lint**: `npm run lint:md` passes with no errors across all modified `.md` files.
- **Spec index completeness**: manually verify every `.md` under `specs/` appears in
  `specs/README.md`.
- **ADR completeness**: each ADR covers Context / Decision / Rationale / Alternatives /
  Consequences.
- **No code changes**: `git diff --name-only` shows only `specs/` and `plan/` files.
- **E2E**: no E2E tests required (documentation-only change).
