-- migrate:up
CREATE TABLE campaign_audit_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID NOT NULL REFERENCES campaigns(id),
  actor_id         UUID NOT NULL REFERENCES accounts(id),
  action           TEXT NOT NULL,
  previous_status  TEXT NOT NULL,
  new_status       TEXT NOT NULL,
  rationale        TEXT,
  correlation_id   UUID,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE campaign_audit_events;
