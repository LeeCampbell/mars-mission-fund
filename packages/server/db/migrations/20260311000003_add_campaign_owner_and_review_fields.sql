-- migrate:up
ALTER TABLE campaigns
  ADD COLUMN creator_id  UUID REFERENCES accounts(id),
  ADD COLUMN reviewer_id UUID REFERENCES accounts(id),
  ADD COLUMN review_notes              TEXT,
  ADD COLUMN rejection_rationale       TEXT,
  ADD COLUMN rejection_guidance        TEXT,
  ADD COLUMN reviewed_at               TIMESTAMPTZ,
  ADD COLUMN cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN cancellation_reason       TEXT;

-- migrate:down
ALTER TABLE campaigns
  DROP COLUMN IF EXISTS creator_id,
  DROP COLUMN IF EXISTS reviewer_id,
  DROP COLUMN IF EXISTS review_notes,
  DROP COLUMN IF EXISTS rejection_rationale,
  DROP COLUMN IF EXISTS rejection_guidance,
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS cancellation_requested_at,
  DROP COLUMN IF EXISTS cancellation_reason;
