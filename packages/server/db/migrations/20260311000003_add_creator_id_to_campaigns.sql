-- migrate:up
ALTER TABLE campaigns ADD COLUMN creator_id uuid REFERENCES accounts(id);

UPDATE campaigns
SET creator_id = '22222222-2222-2222-2222-222222222222'
WHERE status IN ('Approved', 'Live', 'Funded');

-- migrate:down
ALTER TABLE campaigns DROP COLUMN creator_id;
