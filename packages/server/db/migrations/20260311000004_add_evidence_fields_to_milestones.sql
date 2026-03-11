-- migrate:up
ALTER TABLE campaign_milestones
  ADD COLUMN evidence_url   TEXT,
  ADD COLUMN evidence_notes TEXT,
  ADD COLUMN admin_feedback TEXT,
  ADD COLUMN verified_at    TIMESTAMPTZ,
  ADD COLUMN returned_at    TIMESTAMPTZ;

-- migrate:down
ALTER TABLE campaign_milestones
  DROP COLUMN IF EXISTS evidence_url,
  DROP COLUMN IF EXISTS evidence_notes,
  DROP COLUMN IF EXISTS admin_feedback,
  DROP COLUMN IF EXISTS verified_at,
  DROP COLUMN IF EXISTS returned_at;
