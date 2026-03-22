# Tasks: Issue #117 — Milestone housekeeping — spec updates and cleanup

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create ADR-0002 (audit log demo simplification)
  - **Goal**: Document the three-table audit pattern and how it differs from the production event-sourcing spec
  - **Details**: Create `specs/adrs/0002-audit-log-demo-simplification.md` following the ADR-0001 structure (Status / Date / Deciders / Context / Decision / Rationale / Alternatives considered / Consequences). Cover: (1) Context — L3-006 describes production-grade immutable event stream with hash chains, tamper detection, retention tiers, anomaly detection; demo needs auditable trail without infrastructure burden. (2) Decision — three-table approach: `audit_log` (legacy JSONB append-only for settlement/milestone events), `campaign_audit_events` (structured events with previous/new state for workflow transitions), `audit_events` (spec-aligned table for campaign lifecycle events). (3) Rationale — tables added incrementally during milestone; demo value comes from event visibility, not hash-chain integrity. (4) What production requires: hash chaining (SHA-256), batch tamper verification, hot/warm/cold retention tiers, anomaly-detection rules, audit-access logging.
  - **Files**: `specs/adrs/0002-audit-log-demo-simplification.md`
  - **Verify**: File exists, follows ADR template, covers all five sections; `npm run lint:md` passes
  - **Brief ref**: Step 1 — New ADRs (ADR-0002)

- [x] TASK-02: Create ADR-0003 (stubbed integrations)
  - **Goal**: Document the KYC and payment stubs and what production integration would require
  - **Details**: Create `specs/adrs/0003-stubbed-integrations.md` following the ADR-0001 structure. Cover: (1) Context — L4-004 (Payments) and L4-005 (KYC) describe production Stripe and third-party KYC integrations. (2) Decision — both stubbed for demo: KYC is `const kycVerified = true` in `packages/server/src/campaigns/queries.ts` submitCampaign; Payments are `console.log('[STUB] ...')` at fund disbursement (milestone verification), refund (settlement cancellation), and admin notification (evidence submission). (3) Rationale — PCI DSS scope, Stripe API keys, and KYC provider onboarding are out of scope for local workshop demo. (4) What production requires: Stripe Connect integration, escrow account management, KYC document upload and provider API calls, webhook handling.
  - **Files**: `specs/adrs/0003-stubbed-integrations.md`
  - **Verify**: File exists, follows ADR template, covers all five sections; `npm run lint:md` passes
  - **Brief ref**: Step 1 — New ADRs (ADR-0003)

- [x] TASK-03: Update specs/tech/audit.md with demo scope note
  - **Goal**: Clarify which audit features are production requirements not implemented in the demo
  - **Details**: Read `specs/tech/audit.md`. Locate or add a "Local demo scope" / "Demo simplification" section. Add a note referencing ADR-0002 clarifying that hash chains, tamper detection, retention enforcement, and anomaly detection described in the spec are production requirements not implemented in the demo. The note should name the three tables actually in use.
  - **Files**: `specs/tech/audit.md`
  - **Verify**: File contains reference to ADR-0002 and lists unimplemented features; `npm run lint:md` passes
  - **Brief ref**: Step 2 — Spec updates (audit.md)

- [x] TASK-04: Update specs/domain/campaign.md with demo scope notes and Glossary
  - **Goal**: Mark unimplemented sections as out-of-scope for demo and add milestone vocabulary glossary
  - **Details**: Read `specs/domain/campaign.md`. (1) Add "Local demo scope" callout notes to: §6.3 (appeal process), §7.4 (deadline extension requests), §7.5 (milestone change requests), and near AC-CAMP-023 (KYC revocation handling). (2) Add a new Glossary section (§12, after existing §11 Interface Contracts, before the Change Log) with definitions for: **Review Queue**, **Settlement**, **Stretch Goal**, **Milestone Evidence**, **Cancellation Workflow**, **Deadline Enforcement** — use exact definitions from the brief.
  - **Files**: `specs/domain/campaign.md`
  - **Verify**: Four demo-scope callouts present, §12 Glossary section exists with all six terms; `npm run lint:md` passes
  - **Brief ref**: Step 2 — Spec updates (campaign.md)

- [x] TASK-05: Update specs/domain/payments.md and specs/domain/kyc.md with demo scope notes
  - **Goal**: Confirm stub behaviour in the payments and KYC domain specs, referencing ADR-0003
  - **Details**: Read both `specs/domain/payments.md` and `specs/domain/kyc.md`. For each file, add or update the existing "Local demo scope" note to reference ADR-0003 and explicitly confirm the stub behaviour (Payments: console.log stubs; KYC: always-verified stub). Keep changes minimal — update existing sections rather than duplicating content.
  - **Files**: `specs/domain/payments.md`, `specs/domain/kyc.md`
  - **Verify**: Both files reference ADR-0003 and describe their respective stub; `npm run lint:md` passes
  - **Brief ref**: Step 2 — Spec updates (payments.md, kyc.md)

- [ ] TASK-06: Update specs/README.md index and verify completeness
  - **Goal**: Add ADR-0002 and ADR-0003 to the README Tooling table and confirm every .md under specs/ is indexed
  - **Details**: Read `specs/README.md`. (1) Update the File System Layout listing under `adrs/` to include `0002-audit-log-demo-simplification.md` and `0003-stubbed-integrations.md`. (2) Update the `adrs/` row description to mention individual ADRs are listed in the directory. (3) Glob all `.md` files under `specs/` and cross-check that every file appears somewhere in `specs/README.md`; add any missing entries.
  - **Files**: `specs/README.md`
  - **Verify**: Both new ADR filenames appear in README; `npm run lint:md` passes; no .md file under specs/ is missing from the index
  - **Brief ref**: Step 3 — README index update

- [ ] TASK-07: Verify specs/learnings.md and run final CI check
  - **Goal**: Confirm learnings.md already covers the two known gotchas and ensure all markdown lint and build checks pass
  - **Details**: Read `specs/learnings.md`. Confirm that both the `dbmate --no-dump-schema` flag ordering issue (issue #115) and the Playwright browser binary issue (issue #111) are already present — do NOT duplicate them. If either is missing, add a concise entry. Then run `npm run lint:md` and `npm run build` to confirm the full documentation set passes CI. Also verify `git diff --name-only` shows only `specs/` and `plan/` files (no code changes).
  - **Files**: `specs/learnings.md` (only if an entry is missing)
  - **Verify**: `npm run lint:md` passes with zero errors; `npm run build` succeeds; `git diff --name-only` shows only `specs/` and `plan/` paths
  - **Brief ref**: Verification section
