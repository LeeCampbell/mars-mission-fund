-- migrate:up

-- Seed demo notifications for reviewer, admin, and creator
INSERT INTO notifications (id, user_id, type, title, body, campaign_id, is_read) VALUES
  -- Reviewer gets "new campaign submission" notifications
  (
    'ffffffff-0001-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'CAMPAIGN_SUBMITTED',
    'New Campaign Submitted for Review',
    'Mars Deep-Drill Core Sampler has been submitted and is awaiting your review.',
    '00000000-0011-0000-0000-000000000011',
    false
  ),
  (
    'ffffffff-0002-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'CAMPAIGN_SUBMITTED',
    'New Campaign Submitted for Review',
    'Mars Dust Storm Early Warning Network has been submitted and is awaiting your review.',
    '00000000-0012-0000-0000-000000000012',
    false
  ),
  -- Admin gets "milestone submitted" notifications
  (
    'ffffffff-0003-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'MILESTONE_SUBMITTED',
    'Milestone Evidence Submitted',
    'The Orbital Demonstration Flight milestone for Adaptive Aeroshell Heat Shield is ready for admin verification.',
    '00000000-0002-0000-0000-000000000002',
    false
  ),
  (
    'ffffffff-0004-0000-0000-000000000004',
    '33333333-3333-3333-3333-333333333333',
    'MILESTONE_SUBMITTED',
    'Milestone Evidence Submitted',
    'The Rideshare Launch & Commissioning milestone for Laser Optical Relay Network is ready for admin verification.',
    '00000000-0010-0000-0000-000000000010',
    false
  ),
  -- Creator gets a "your campaign was submitted" notification
  (
    'ffffffff-0005-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'CAMPAIGN_SUBMITTED',
    'Your Campaign Has Been Submitted',
    'Mars Deep-Drill Core Sampler has been successfully submitted for review. You will be notified once a reviewer claims it.',
    '00000000-0011-0000-0000-000000000011',
    false
  ),
  (
    'ffffffff-0006-0000-0000-000000000006',
    '22222222-2222-2222-2222-222222222222',
    'CAMPAIGN_SUBMITTED',
    'Your Campaign Has Been Submitted',
    'Mars Dust Storm Early Warning Network has been successfully submitted for review. You will be notified once a reviewer claims it.',
    '00000000-0012-0000-0000-000000000012',
    false
  );

-- migrate:down
DELETE FROM notifications WHERE id IN (
  'ffffffff-0001-0000-0000-000000000001',
  'ffffffff-0002-0000-0000-000000000002',
  'ffffffff-0003-0000-0000-000000000003',
  'ffffffff-0004-0000-0000-000000000004',
  'ffffffff-0005-0000-0000-000000000005',
  'ffffffff-0006-0000-0000-000000000006'
);
