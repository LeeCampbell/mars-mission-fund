-- migrate:up

-- Insert 2 campaigns in Submitted status created by the demo creator
INSERT INTO campaigns (
  id, slug, title, summary, description, alignment_statement,
  category, tags, status, hero_image_url,
  min_funding_target_usd, max_funding_cap_usd, current_amount_usd,
  contributor_count, deadline, creator_id
) VALUES
  (
    '00000000-0011-0000-0000-000000000011',
    'mars-drill-core-sampler',
    'Mars Deep-Drill Core Sampler',
    'Developing a 10-metre percussion drill for extracting ice and rock core samples from the Martian subsurface.',
    '<p>Understanding the Martian subsurface is critical for locating water ice deposits and potential biosignatures. Our percussion drill system targets 10 m depth in a single deployment, using minimal power while storing cores in sealed tubes for return or on-site analysis. This campaign funds the prototype build and analog field test.</p>',
    'Subsurface access is the gateway to both water resources and the most promising environments for past or present life on Mars.',
    'Robotics & Automation',
    ARRAY['drilling', 'subsurface', 'ice', 'sampling', 'robotics'],
    'Submitted',
    'https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=1200',
    80000000, 250000000, 0,
    0, '2026-12-31 23:59:59+00',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '00000000-0012-0000-0000-000000000012',
    'dust-storm-early-warning',
    'Mars Dust Storm Early Warning Network',
    'Deploying a network of 12 autonomous weather stations across Mars to predict regional dust storms 48 hours in advance.',
    '<p>Dust storms on Mars can reduce solar power output by 99% and last for months, posing an existential threat to surface crews and solar-powered equipment. Our network of 12 micro-weather stations, deployed by a single lander, uses distributed atmospheric pressure, temperature, and opacity sensors with AI-based forecasting to provide 48-hour storm warnings. This campaign funds design, fabrication, and Earth-analog validation.</p>',
    'Accurate dust storm forecasting is a crew safety essential — without it, surface operations face unpredictable, potentially fatal power outages.',
    'Communications & Navigation',
    ARRAY['weather', 'dust-storm', 'sensors', 'safety', 'forecasting'],
    'Submitted',
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200',
    60000000, 180000000, 0,
    0, '2026-12-31 23:59:59+00',
    '22222222-2222-2222-2222-222222222222'
  );

-- Update one Live campaign to request cancellation (Kilopower Reactor Array)
UPDATE campaigns
SET
  cancellation_requested_at = now(),
  cancellation_reason = 'Funding partner withdrew due to regulatory delays on nuclear launch approval. Project cannot proceed without their contribution.',
  creator_id = '22222222-2222-2222-2222-222222222222'
WHERE id = '00000000-0003-0000-0000-000000000003';

-- Update the two already-Submitted milestones with evidence data
-- Campaign 2, milestone 3: Orbital Demonstration Flight
UPDATE campaign_milestones
SET
  evidence_url = 'https://example.com/evidence/aeroshell-orbital-demo-flight-report.pdf',
  evidence_notes = 'Full flight telemetry logs, recovered hardware photos, and TPS recession measurements are linked above. Post-flight analysis confirms all design margins were met.'
WHERE id = '10000000-0002-0003-0000-000000000002';

-- Campaign 10, milestone 3: Rideshare Launch & Commissioning
UPDATE campaign_milestones
SET
  evidence_url = 'https://example.com/evidence/laser-relay-commissioning-report.pdf',
  evidence_notes = 'On-orbit checkout complete. All three satellites achieved 100 Mbps link rates in end-to-end Earth relay test. UHF surface relay validated. Full commissioning report attached.'
WHERE id = '10000000-0010-0003-0000-000000000010';

-- migrate:down
DELETE FROM campaigns WHERE id IN (
  '00000000-0011-0000-0000-000000000011',
  '00000000-0012-0000-0000-000000000012'
);

UPDATE campaigns
SET
  cancellation_requested_at = NULL,
  cancellation_reason = NULL,
  creator_id = NULL
WHERE id = '00000000-0003-0000-0000-000000000003';

UPDATE campaign_milestones
SET evidence_url = NULL, evidence_notes = NULL
WHERE id IN (
  '10000000-0002-0003-0000-000000000002',
  '10000000-0010-0003-0000-000000000010'
);
