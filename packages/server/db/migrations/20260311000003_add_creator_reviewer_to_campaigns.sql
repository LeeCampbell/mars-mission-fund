-- migrate:up
ALTER TABLE campaigns
  ADD COLUMN creator_id  UUID REFERENCES accounts(id),
  ADD COLUMN reviewer_id UUID REFERENCES accounts(id);

-- Backfill creator_id for all existing seeded rows to the demo creator account
UPDATE campaigns SET creator_id = '22222222-2222-2222-2222-222222222222';

-- migrate:down
ALTER TABLE campaigns
  DROP COLUMN IF EXISTS creator_id,
  DROP COLUMN IF EXISTS reviewer_id;
