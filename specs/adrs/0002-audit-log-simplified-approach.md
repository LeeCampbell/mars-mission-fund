# ADR-0002: Simplified Audit Log for Local Demo

> **Status**: Accepted
> **Date**: 2026-03-11
> **Deciders**: Engineering team

## Context

L3-006 (`specs/tech/audit.md`) specifies a production-grade immutable event stream for the audit log.
The full schema requires rich fields: `correlation_id`, `actor_type`, `action`, `resource_type`, `resource_id`, `outcome`, `ip_address`, `user_agent`, `previous_state`, `new_state`, `previous_hash`, and more.
This schema is designed for tamper detection via hash chains, structured querying, and long-term archival.

Building the full L3-006 schema for a workshop demo adds significant complexity without corresponding workshop value.
The demo's goal is to illustrate the *concept* of an audit trail — that state transitions are recorded with actor, timestamp, and context — not to implement production-grade immutability guarantees.

## Decision

The local demo uses a minimal `audit_log` table created in migration `packages/server/db/migrations/20260311000004_create_audit_log.sql`:

```sql
id           UUID PRIMARY KEY,
event_type   TEXT NOT NULL,
campaign_id  UUID REFERENCES campaigns(id) ON DELETE SET NULL,
milestone_id UUID REFERENCES campaign_milestones(id) ON DELETE SET NULL,
actor_id     TEXT NOT NULL,
payload      JSONB NOT NULL DEFAULT '{}',
created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

All campaign state transitions and milestone verifications write to this table via the `writeAuditEvent` helper in `packages/server/src/campaigns/queries.ts`.

**What is omitted compared to L3-006**:

- No hash chain (`previous_hash` / chain integrity verification)
- No `previous_state` / `new_state` snapshots
- No `correlation_id` propagation across requests
- No `actor_type`, `resource_type`, `resource_id` structured fields
- No `ip_address` or `user_agent` capture
- No `outcome` field (success/failure enrichment)

## Consequences

**Positive**:

- The audit log is visible and functional in the demo; reviewers and admins can see a record of state transitions.
- Schema complexity stays minimal — a single insert helper (`writeAuditEvent`) is the entire write path.
- Workshop participants can inspect the `audit_log` table and understand *why* an audit trail exists without being overwhelmed by production concerns.

**Negative**:

- The simplified table provides no tamper detection; records can be deleted or modified without detection.
- There are no structured fields for querying by resource type or outcome, limiting ad-hoc investigation.
- The schema diverges from L3-006, so contributors who read only the demo code and not this ADR may assume the production design matches the simplified table.

**Neutral**:

- The `writeAuditEvent` helper is the only mechanism for writing audit events in the demo.
  Centralising all writes through one function makes it straightforward to swap in the full schema later.

## Production Path

A production implementation would use the full L3-006 schema:

- Hash-chained records (each row stores a SHA-256 hash of its own content plus the previous row's hash) for tamper detection.
- Structured `actor_type`, `resource_type`, `resource_id`, `action`, and `outcome` fields for queryability.
- `previous_state` / `new_state` JSONB snapshots embedded in each event.
- A dedicated write path that never updates or deletes rows; the table has no `UPDATE` or `DELETE` permissions granted to the application role.
- WAL-based replication to read replicas for audit querying without hitting the primary.
- Tiered storage archival (hot → warm → cold) for long-term retention without unbounded primary table growth.

## Compliance

- Satisfies [Engineering Standard](../standards/engineering.md) Section 3.1: architectural decisions that diverge from L-level specs are recorded as ADRs.
- Divergence from [L3-006 Audit](../tech/audit.md) is explicitly documented here and cross-referenced in that spec.
