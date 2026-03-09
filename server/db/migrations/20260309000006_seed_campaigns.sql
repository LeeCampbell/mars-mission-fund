-- migrate:up

-- Seed 10 campaigns covering 5+ categories and multiple statuses
-- Using fixed UUIDs for FK references within this file

-- Campaigns
INSERT INTO campaigns (
  id, slug, title, summary, description, alignment_statement,
  category, tags, status, hero_image_url,
  min_funding_target_usd, max_funding_cap_usd, current_amount_usd,
  contributor_count, deadline, launched_at
) VALUES
  (
    '00000000-0001-0000-0000-000000000001',
    'open-source-climate-model',
    'Open Source Climate Prediction Model',
    'Building a free, community-driven climate prediction model accessible to all researchers worldwide.',
    '<p>Climate science should not be locked behind expensive proprietary software. We are building a fully open-source climate prediction model that any researcher, educator, or policymaker can use for free. Our team of climate scientists and software engineers will create a modular, well-documented codebase that runs on commodity hardware.</p>',
    'This project directly advances environmental research access and scientific transparency, empowering communities most vulnerable to climate change to model and plan for local impacts.',
    'Technology',
    ARRAY['climate', 'open-source', 'research', 'software'],
    'Live',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200',
    500000000, 2000000000, 1250000000,
    4200, '2026-09-30 23:59:59+00', '2026-01-15 09:00:00+00'
  ),
  (
    '00000000-0002-0000-0000-000000000002',
    'urban-vertical-farms',
    'Urban Vertical Farms Network',
    'Creating a network of community-owned vertical farms in food deserts across 10 US cities.',
    '<p>Food deserts affect 23.5 million Americans. Our urban vertical farm network will bring fresh produce directly into the communities that need it most. Each farm is designed to be community-owned, operated by local workers, and profitable within 18 months of launch.</p>',
    'Providing nutritious food access to underserved communities addresses a core human need and reduces health inequities rooted in systemic poverty.',
    'Environment',
    ARRAY['food', 'urban', 'sustainability', 'community'],
    'Funded',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200',
    300000000, 1000000000, 875000000,
    3100, '2026-03-01 23:59:59+00', '2025-10-01 09:00:00+00'
  ),
  (
    '00000000-0003-0000-0000-000000000003',
    'rural-coding-bootcamps',
    'Rural Coding Bootcamps Initiative',
    'Free 12-week coding bootcamps in rural communities, bridging the digital divide with job placement support.',
    '<p>Rural Americans are being left behind in the digital economy. Our initiative brings intensive, industry-aligned coding bootcamps to rural towns with populations under 10,000. We cover tuition, provide laptops, and guarantee job placement support for every graduate.</p>',
    'Economic mobility through tech education directly addresses geographic inequality and creates pathways out of poverty for rural Americans.',
    'Education',
    ARRAY['coding', 'rural', 'education', 'jobs', 'tech'],
    'Live',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
    200000000, 600000000, 310000000,
    1850, '2026-07-15 23:59:59+00', '2026-02-01 09:00:00+00'
  ),
  (
    '00000000-0004-0000-0000-000000000004',
    'mental-health-app-teens',
    'Teen Mental Health Support Platform',
    'A free, therapist-reviewed mental health app designed specifically for teenagers aged 13–18.',
    '<p>Teen mental health is at a crisis point. Our platform provides evidence-based CBT exercises, peer support communities moderated by licensed therapists, and direct connection to crisis resources. All features are free, with parental transparency controls built in.</p>',
    'Accessible mental health support for teenagers addresses an urgent public health crisis and prevents long-term harm to individuals and communities.',
    'Health',
    ARRAY['mental-health', 'teens', 'app', 'therapy', 'wellness'],
    'Complete',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
    150000000, 500000000, 498000000,
    5600, '2025-12-31 23:59:59+00', '2025-06-01 09:00:00+00'
  ),
  (
    '00000000-0005-0000-0000-000000000005',
    'community-arts-hub-detroit',
    'Detroit Community Arts Hub',
    'Transforming a vacant warehouse into a free community arts center in Detroit''s North End neighborhood.',
    '<p>Detroit''s North End has lost 80% of its arts venues in the past decade. We are converting a 15,000 sq ft vacant warehouse into a vibrant community arts hub featuring studio spaces, a performance venue, a gallery, and free after-school programs for youth.</p>',
    'Art and culture are essential to community identity and healing. This hub will restore creative infrastructure to a neighborhood rebuilding after decades of disinvestment.',
    'Arts',
    ARRAY['arts', 'community', 'detroit', 'renovation', 'youth'],
    'Live',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200',
    400000000, 800000000, 523000000,
    2700, '2026-06-30 23:59:59+00', '2026-01-20 09:00:00+00'
  ),
  (
    '00000000-0006-0000-0000-000000000006',
    'accessible-prosthetics-open-design',
    'Open Design Affordable Prosthetics',
    'Open-source 3D-printable prosthetic limb designs, cutting cost from $10,000 to under $100.',
    '<p>Prosthetic limbs cost $10,000–$70,000, putting them out of reach for billions worldwide. Our team of biomedical engineers and prosthetists is creating a full library of open-source, 3D-printable prosthetic designs certified for safety and effectiveness. Anyone with a 3D printer can manufacture them locally.</p>',
    'Democratizing access to prosthetic technology directly addresses disability-based inequality on a global scale, restoring mobility and independence to millions.',
    'Health',
    ARRAY['prosthetics', 'open-source', '3d-printing', 'accessibility', 'health'],
    'Funded',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200',
    250000000, 750000000, 720000000,
    4800, '2026-02-28 23:59:59+00', '2025-09-01 09:00:00+00'
  ),
  (
    '00000000-0007-0000-0000-000000000007',
    'indigenous-language-preservation',
    'Indigenous Language Preservation Archive',
    'Recording, digitising, and teaching 50 endangered indigenous languages with community-led teams.',
    '<p>Over 3,000 languages are at critical risk of extinction. We are partnering with 50 indigenous communities to record fluent elders, create learning materials, and build free online courses. All materials are owned by and controlled by the communities themselves.</p>',
    'Preserving indigenous languages maintains cultural diversity, transmits ecological knowledge, and upholds the rights of indigenous peoples to their heritage.',
    'Education',
    ARRAY['indigenous', 'language', 'preservation', 'culture', 'archive'],
    'Live',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200',
    180000000, 500000000, 195000000,
    1200, '2026-08-31 23:59:59+00', '2026-02-15 09:00:00+00'
  ),
  (
    '00000000-0008-0000-0000-000000000008',
    'solar-microgrids-rural-africa',
    'Solar Microgrids for Rural Africa',
    'Installing community-owned solar microgrids in 100 off-grid villages across sub-Saharan Africa.',
    '<p>600 million Africans live without reliable electricity. Our programme installs solar microgrids in villages of 500–2,000 people, trains local technicians for maintenance, and structures ownership so the community builds equity. Each installation powers homes, schools, and health clinics.</p>',
    'Energy access is foundational to education, health, and economic development. Community-owned infrastructure ensures benefits flow to local people rather than external investors.',
    'Environment',
    ARRAY['solar', 'energy', 'africa', 'microgrids', 'community'],
    'Complete',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200',
    1000000000, 3000000000, 2850000000,
    9200, '2025-11-30 23:59:59+00', '2025-01-01 09:00:00+00'
  ),
  (
    '00000000-0009-0000-0000-000000000009',
    'public-interest-investigative-news',
    'Public Interest Investigative Newsroom',
    'A reader-funded investigative newsroom covering corruption, environmental crimes, and corporate accountability.',
    '<p>Quality investigative journalism has been gutted by the collapse of ad-supported media. We are launching a fully independent, reader-funded newsroom with no advertising or corporate ownership. Our team of 15 investigative journalists will cover stories that matter to the public but that commercial media ignores.</p>',
    'An informed democracy requires independent journalism. Reader funding eliminates the conflicts of interest that prevent reporting on powerful institutions.',
    'Arts',
    ARRAY['journalism', 'investigative', 'media', 'democracy', 'accountability'],
    'Live',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
    120000000, 400000000, 118000000,
    890, '2026-05-31 23:59:59+00', '2026-02-20 09:00:00+00'
  ),
  (
    '00000000-0010-0000-0000-000000000010',
    'maternal-health-clinics-appalachia',
    'Appalachian Maternal Health Clinics',
    'Opening 5 free maternal health clinics in counties with no OB/GYN within 50 miles.',
    '<p>Appalachia has some of the worst maternal mortality rates in the developed world. Five counties in our target region have no OB/GYN provider within 50 miles. We are opening fully staffed maternal health clinics with telehealth connections to regional hospitals, serving low-income mothers regardless of insurance status.</p>',
    'Maternal mortality in the richest nation on earth is a moral failure. Providing free, local care addresses both geographic and economic barriers to health equity.',
    'Health',
    ARRAY['maternal-health', 'appalachia', 'clinics', 'rural', 'equity'],
    'Funded',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1b89?w=1200',
    600000000, 1500000000, 1420000000,
    6300, '2026-01-31 23:59:59+00', '2025-07-01 09:00:00+00'
  )
ON CONFLICT DO NOTHING;

-- Milestones for campaign 1: Open Source Climate Model
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0001-0001-0000-000000000001', '00000000-0001-0000-0000-000000000001', 'Core Engine & Data Pipeline', 'Build the core atmospheric simulation engine and data ingestion pipeline for NOAA/NASA datasets.', '2026-04-30', 25, 'GitHub repo with passing CI, benchmark report showing model runs on standard hardware, documented API.', 'Pending', 1),
  ('10000000-0001-0002-0000-000000000001', '00000000-0001-0000-0000-000000000001', 'Regional Calibration & Validation', 'Calibrate and validate the model against historical climate data for 5 global regions.', '2026-07-31', 35, 'Published validation report comparing model output to ERA5 reanalysis data; RMSE within accepted range.', 'Pending', 2),
  ('10000000-0001-0003-0000-000000000001', '00000000-0001-0000-0000-000000000001', 'Web Interface & Documentation', 'Launch a web-based interface and comprehensive documentation for non-technical users.', '2026-09-30', 40, 'Live website with at least 3 preset scenario templates; docs site passing link-checker; 50 beta testers confirmed.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 2: Urban Vertical Farms
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0002-0001-0000-000000000002', '00000000-0002-0000-0000-000000000002', 'Site Selection & Permitting', 'Identify and secure leases for 3 pilot farm locations; obtain all necessary permits.', '2025-11-30', 20, 'Signed leases for 3 locations, copies of issued permits from local authorities.', 'Verified', 1),
  ('10000000-0002-0002-0000-000000000002', '00000000-0002-0000-0000-000000000002', 'Equipment Installation & Staff Training', 'Install hydroponic systems and complete training of 30 local staff members.', '2026-01-31', 40, 'Photo/video documentation of installed systems; certificates of completion for all trainees.', 'Verified', 2),
  ('10000000-0002-0003-0000-000000000002', '00000000-0002-0000-0000-000000000002', 'First Harvest & Community Distribution', 'Complete first full harvest cycle and distribute produce to at least 500 households.', '2026-02-28', 40, 'Distribution records showing 500+ unique households; produce quality report; local news coverage.', 'Submitted', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 3: Rural Coding Bootcamps
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0003-0001-0000-000000000003', '00000000-0003-0000-0000-000000000003', 'Curriculum Development & Partnerships', 'Finalise 12-week curriculum and establish employer partnerships for job placement.', '2026-03-31', 30, 'Published curriculum syllabus; signed MOUs with at least 10 employers committing to interview graduates.', 'Pending', 1),
  ('10000000-0003-0002-0000-000000000003', '00000000-0003-0000-0000-000000000003', 'First Cohort Completion', 'Graduate first cohort of 50 students from 3 rural locations.', '2026-06-30', 40, 'Graduation ceremony documentation; roster of 50 graduates with contact info; assessment scores.', 'Pending', 2),
  ('10000000-0003-0003-0000-000000000003', '00000000-0003-0000-0000-000000000003', 'Job Placement Outcomes', 'Achieve 70% job placement rate within 90 days of graduation for cohort 1.', '2026-09-30', 30, 'Employment verification letters from graduates; aggregate salary data; third-party outcome audit.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 4: Teen Mental Health App (Complete)
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0004-0001-0000-000000000004', '00000000-0004-0000-0000-000000000004', 'Beta App Launch', 'Launch beta version with core CBT exercises and crisis resources to 1,000 test users.', '2025-08-31', 25, 'App store listing; 1,000 registered beta users; bug report showing <5 critical issues.', 'Verified', 1),
  ('10000000-0004-0002-0000-000000000004', '00000000-0004-0000-0000-000000000004', 'Therapist Review & Clinical Validation', 'Complete clinical review of all content by licensed therapists; publish validation report.', '2025-10-31', 35, 'Signed review from 5+ licensed therapists; published clinical advisory board statement.', 'Verified', 2),
  ('10000000-0004-0003-0000-000000000004', '00000000-0004-0000-0000-000000000004', 'Full Public Launch', 'Launch publicly on iOS and Android with peer community features and 24/7 crisis chat.', '2025-12-31', 40, '100,000+ downloads; App Store rating ≥ 4.5; 24/7 crisis response coverage confirmed.', 'Verified', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 5: Detroit Arts Hub
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0005-0001-0000-000000000005', '00000000-0005-0000-0000-000000000005', 'Building Acquisition & Architectural Plans', 'Secure purchase of the warehouse and complete architectural plans approved by the city.', '2026-03-31', 20, 'Signed deed of transfer; approved architectural drawings stamped by city planning dept.', 'Pending', 1),
  ('10000000-0005-0002-0000-000000000005', '00000000-0005-0000-0000-000000000005', 'Renovation Phase 1: Structure & Utilities', 'Complete structural repairs, electrical, plumbing, and HVAC installation.', '2026-05-31', 45, 'Building inspection certificates for structural, electrical, and plumbing; progress photo documentation.', 'Pending', 2),
  ('10000000-0005-0003-0000-000000000005', '00000000-0005-0000-0000-000000000005', 'Grand Opening & Programming Launch', 'Open to the public with inaugural exhibition, first performance, and youth programme enrolment.', '2026-06-30', 35, 'Grand opening event documentation; at least 200 attendees; 50 youth enrolled in after-school programme.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 6: Open Design Prosthetics
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0006-0001-0000-000000000006', '00000000-0006-0000-0000-000000000006', 'Design Library v1: Upper Limb', 'Release certified 3D-printable designs for 5 upper limb prosthetic variants.', '2025-11-30', 30, 'GitHub release with STL files; ISO 22523 conformance report; 3 independent print tests documented.', 'Verified', 1),
  ('10000000-0006-0002-0000-000000000006', '00000000-0006-0000-0000-000000000006', 'Design Library v2: Lower Limb', 'Release certified designs for 4 lower limb prosthetic variants including a walking prosthetic foot.', '2026-01-31', 35, 'GitHub release with STL files; gait analysis report; 50 test fittings in 3 countries documented.', 'Verified', 2),
  ('10000000-0006-0003-0000-000000000006', '00000000-0006-0000-0000-000000000006', 'Global Maker Network Launch', 'Launch a network of 200 maker spaces in 30 countries equipped and trained to produce prosthetics.', '2026-02-28', 35, 'Directory of 200 maker spaces; training completion records; 500 devices produced and fitted.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 7: Indigenous Language Preservation
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0007-0001-0000-000000000007', '00000000-0007-0000-0000-000000000007', 'Community Partnerships & Recording Phase', 'Establish partnerships with 50 communities and complete audio/video recordings with 150+ elders.', '2026-05-31', 35, 'Signed community agreements; archive of 1,000+ hours of recordings deposited with community trustees.', 'Pending', 1),
  ('10000000-0007-0002-0000-000000000007', '00000000-0007-0000-0000-000000000007', 'Learning Materials Development', 'Create beginner-to-intermediate learning materials (lessons, audio, exercises) for all 50 languages.', '2026-07-31', 35, 'Published lesson sets for all 50 languages; reviewed by community language coordinators.', 'Pending', 2),
  ('10000000-0007-0003-0000-000000000007', '00000000-0007-0000-0000-000000000007', 'Online Platform Launch', 'Launch a free online platform with courses, archive access, and community forums for all 50 languages.', '2026-08-31', 30, 'Live platform; 1,000 registered learners in first month; positive feedback from 80%+ of community partners.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 8: Solar Microgrids Africa (Complete)
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0008-0001-0000-000000000008', '00000000-0008-0000-0000-000000000008', 'Phase 1: 20 Villages Online', 'Install and commission microgrids in 20 villages, train local technicians.', '2025-04-30', 20, 'Commissioning reports for 20 villages; 20 technician certifications; 30-day uptime logs showing ≥95%.', 'Verified', 1),
  ('10000000-0008-0002-0000-000000000008', '00000000-0008-0000-0000-000000000008', 'Phase 2: 50 Villages Online', 'Scale to 50 villages with revised installation playbook from phase 1 lessons.', '2025-07-31', 30, 'Commissioning reports for 50 total villages; updated installation guide; independent energy audit.', 'Verified', 2),
  ('10000000-0008-0003-0000-000000000008', '00000000-0008-0000-0000-000000000008', 'Phase 3: 100 Villages & Community Ownership Transfer', 'Complete all 100 installations and transfer ownership documentation to village cooperatives.', '2025-11-30', 50, '100 villages commissioned; ownership transfer deeds; 6-month impact report with electricity access data.', 'Verified', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 9: Investigative Newsroom
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0009-0001-0000-000000000009', '00000000-0009-0000-0000-000000000009', 'Team Hiring & Legal Setup', 'Hire 15 journalists and support staff; complete 501(c)(3) incorporation.', '2026-03-31', 25, 'Published staff page with bios; IRS 501(c)(3) determination letter; editorial independence charter published.', 'Pending', 1),
  ('10000000-0009-0002-0000-000000000009', '00000000-0009-0000-0000-000000000009', 'Website Launch & First Stories', 'Launch news website and publish first 10 investigative pieces.', '2026-04-30', 35, 'Live website; 10 published investigations; 5,000 email subscribers; 3 story pickups by major outlets.', 'Pending', 2),
  ('10000000-0009-0003-0000-000000000009', '00000000-0009-0000-0000-000000000009', 'Year 1 Impact Report', 'Publish full-year impact report covering stories, reach, and policy outcomes influenced.', '2026-05-31', 40, 'Published impact report; at least 2 documented policy changes linked to investigations; 50,000+ readers.', 'Pending', 3)
ON CONFLICT DO NOTHING;

-- Milestones for campaign 10: Appalachian Maternal Health
INSERT INTO campaign_milestones (id, campaign_id, title, description, target_date, funding_pct, verification_criteria, status, sort_order) VALUES
  ('10000000-0010-0001-0000-000000000010', '00000000-0010-0000-0000-000000000010', 'Clinic Staffing & Equipment', 'Recruit and credential OB/GYN and midwifery staff for all 5 clinics; procure medical equipment.', '2025-09-30', 25, 'Credentialing certificates for all clinical staff; equipment delivery invoices and inspection records.', 'Verified', 1),
  ('10000000-0010-0002-0000-000000000010', '00000000-0010-0000-0000-000000000010', 'Clinic Openings (All 5)', 'Open all 5 clinics and begin seeing patients; establish telehealth connections to regional hospitals.', '2025-11-30', 40, 'Clinic opening records; first patient intake documentation; telehealth system test reports.', 'Verified', 2),
  ('10000000-0010-0003-0000-000000000010', '00000000-0010-0000-0000-000000000010', '6-Month Outcomes Report', 'Publish 6-month report on patients served, outcomes, and maternal mortality reduction.', '2026-01-31', 35, 'Published outcomes report; data showing ≥500 patients served per clinic; zero preventable maternal deaths.', 'Submitted', 3)
ON CONFLICT DO NOTHING;

-- Stretch goals for campaigns 1, 2, and 5
INSERT INTO campaign_stretch_goals (id, campaign_id, target_usd, description, deliverables, sort_order) VALUES
  ('20000000-0001-0001-0000-000000000001', '00000000-0001-0000-0000-000000000001', 1500000000, 'Mobile App for Field Scientists', 'Build a companion mobile app allowing field scientists to run localised simulations offline and sync results back to the main model.', 1),
  ('20000000-0001-0002-0000-000000000001', '00000000-0001-0000-0000-000000000001', 2000000000, 'Real-Time Data Integration', 'Integrate live satellite and sensor data feeds for real-time model updates, enabling nowcasting alongside projections.', 2),
  ('20000000-0002-0001-0000-000000000002', '00000000-0002-0000-0000-000000000002', 750000000, 'Expand to 5 Additional Cities', 'Scale the network from the initial 10 cities to 15, prioritising cities with the highest food insecurity rates.', 1),
  ('20000000-0005-0001-0000-000000000005', '00000000-0005-0000-0000-000000000005', 600000000, 'Outdoor Amphitheatre', 'Add an outdoor amphitheatre in the adjacent lot, expanding performance capacity and enabling free community concerts.', 1),
  ('20000000-0005-0002-0000-000000000005', '00000000-0005-0000-0000-000000000005', 750000000, 'Artist-in-Residence Programme', 'Fund 10 annual artist-in-residence positions, providing free studio space and a $20,000 stipend to local artists.', 2)
ON CONFLICT DO NOTHING;

-- Campaign updates for campaigns 2, 4, and 8
INSERT INTO campaign_updates (id, campaign_id, body, posted_at) VALUES
  ('30000000-0002-0001-0000-000000000002', '00000000-0002-0000-0000-000000000002',
   'We have signed leases for our first three farm locations in Chicago, Detroit, and Baltimore. The permitting process in Chicago took longer than expected but we received final approval this week. Equipment installation begins next month — stay tuned for photos!',
   '2025-11-15 14:00:00+00'),
  ('30000000-0002-0002-0000-000000000002', '00000000-0002-0000-0000-000000000002',
   'All three farms are now fully installed and our 30 staff members have completed their hydroponic cultivation training. First crops are in the ground — lettuce, spinach, and herbs. We expect first harvest in 6 weeks.',
   '2026-01-20 10:00:00+00'),
  ('30000000-0004-0001-0000-000000000004', '00000000-0004-0000-0000-000000000004',
   'Our beta launched with 1,200 users — above our target of 1,000! Early feedback has been overwhelmingly positive. The most-used feature is the guided breathing exercises. We''re working on three new CBT modules based on user requests.',
   '2025-09-05 09:00:00+00'),
  ('30000000-0004-0002-0000-000000000004', '00000000-0004-0000-0000-000000000004',
   'We hit 100,000 downloads in our first week of public launch — far beyond our expectations. Our clinical advisory board has issued a formal endorsement. We have partnered with 3 school districts to make the app available to all students.',
   '2026-01-07 11:00:00+00'),
  ('30000000-0008-0001-0000-000000000008', '00000000-0008-0000-0000-000000000008',
   'Phase 1 complete! All 20 villages are online and our technician training programme has been certified by the African Development Bank. Average uptime across all sites is 97.3% — exceeding our 95% target.',
   '2025-05-10 08:00:00+00'),
  ('30000000-0008-0002-0000-000000000008', '00000000-0008-0000-0000-000000000008',
   'We have reached all 100 villages ahead of schedule. Ownership transfer ceremonies have taken place in each village — these were incredibly moving events. Our final impact report will be published next month. Thank you to every contributor who made this possible.',
   '2025-11-01 12:00:00+00')
ON CONFLICT DO NOTHING;

-- migrate:down

DELETE FROM campaign_updates WHERE id IN (
  '30000000-0002-0001-0000-000000000002',
  '30000000-0002-0002-0000-000000000002',
  '30000000-0004-0001-0000-000000000004',
  '30000000-0004-0002-0000-000000000004',
  '30000000-0008-0001-0000-000000000008',
  '30000000-0008-0002-0000-000000000008'
);

DELETE FROM campaign_stretch_goals WHERE id IN (
  '20000000-0001-0001-0000-000000000001',
  '20000000-0001-0002-0000-000000000001',
  '20000000-0002-0001-0000-000000000002',
  '20000000-0005-0001-0000-000000000005',
  '20000000-0005-0002-0000-000000000005'
);

DELETE FROM campaign_milestones WHERE campaign_id IN (
  '00000000-0001-0000-0000-000000000001',
  '00000000-0002-0000-0000-000000000002',
  '00000000-0003-0000-0000-000000000003',
  '00000000-0004-0000-0000-000000000004',
  '00000000-0005-0000-0000-000000000005',
  '00000000-0006-0000-0000-000000000006',
  '00000000-0007-0000-0000-000000000007',
  '00000000-0008-0000-0000-000000000008',
  '00000000-0009-0000-0000-000000000009',
  '00000000-0010-0000-0000-000000000010'
);

DELETE FROM campaigns WHERE slug IN (
  'open-source-climate-model',
  'urban-vertical-farms',
  'rural-coding-bootcamps',
  'mental-health-app-teens',
  'community-arts-hub-detroit',
  'accessible-prosthetics-open-design',
  'indigenous-language-preservation',
  'solar-microgrids-rural-africa',
  'public-interest-investigative-news',
  'maternal-health-clinics-appalachia'
);
