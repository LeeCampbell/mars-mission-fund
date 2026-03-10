-- migrate:up
CREATE TABLE campaign_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  posted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE campaign_updates;
