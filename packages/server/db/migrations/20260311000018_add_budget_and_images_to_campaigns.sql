-- migrate:up
ALTER TABLE campaigns ADD COLUMN budget_breakdown text;
ALTER TABLE campaigns ADD COLUMN additional_image_urls text[] DEFAULT '{}';

-- migrate:down
ALTER TABLE campaigns DROP COLUMN additional_image_urls;
ALTER TABLE campaigns DROP COLUMN budget_breakdown;
