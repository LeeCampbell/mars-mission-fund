-- migrate:up
CREATE TABLE campaign_risks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  description text NOT NULL,
  mitigation text NOT NULL,
  sort_order integer DEFAULT 0,
  CONSTRAINT campaign_risks_pkey PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE campaign_risks;
