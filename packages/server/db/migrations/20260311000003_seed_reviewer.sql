-- migrate:up
-- Demo reviewer credentials (for local development only — never use in production):
--   reviewer@example.com  / reviewer-demo-pass

-- DEMO STUB: Password below is a bcrypt hash of a known, hardcoded demo value.
-- Production (L3-002) requires breach-list checking and policy enforcement at registration;
-- no user passwords should ever be pre-seeded with publicly known values.
INSERT INTO accounts (id, email, password_hash, display_name, bio, role) VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    'reviewer@example.com',
    '$2b$10$uDE/DURkgi3X2h5YwP8GQ.WpVTK2RaMeWbkjgakgSmIaEXop71gSe',
    'Demo Reviewer',
    'A demo reviewer account for local development.',
    'Reviewer'
  );

-- migrate:down
DELETE FROM accounts WHERE id = '44444444-4444-4444-4444-444444444444';
