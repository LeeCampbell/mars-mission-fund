# Build Homepage, About, and Contact pages

**Issue:** #4
**Branch:** feat/marketing-pages
**Depends on:** #3
**Brief ref:** BRIEF.md Section 3

## Tasks

- [ ] **TASK-01: Build Homepage hero section**
  - **Goal:** Create the hero section for the homepage with display heading, subtext, and primary CTA
  - **Brief ref:** BRIEF.md Section 3.1
  - **Files:** `src/pages/HomePage.tsx`, `src/components/HeroSection.tsx`
  - **Details:**
    - Background: `--gradient-hero` (`--grad-night-launch`)
    - Display heading: "CROWDFUNDING THE NEXT GIANT LEAP" in `--type-hero` (Bebas Neue, 96px, always uppercase)
    - Responsive: scale heading down for mobile (e.g., 48px at base, 72px at `md`, 96px at `xl`)
    - Subtext: 1-2 sentences in `--type-body`, `--color-text-secondary` — e.g., "Mars Mission Fund channels collective capital toward the missions, technologies, and teams taking humanity to Mars."
    - Primary CTA Button: "Explore Missions" — links to `#` (placeholder)
    - Only one primary CTA per viewport (L2-001 rule)
    - Subtle ambient decorative element (e.g., radial glow) using `--motion-ambient` timing, disabled under reduced motion
    - Full viewport height (`min-height: 100vh` or `100dvh`)
  - **Verification:** Hero section fills the viewport, heading is Bebas Neue uppercase, CTA button is primary variant, ambient element respects reduced motion

- [ ] **TASK-02: Build Homepage stats section**
  - **Goal:** Create the platform statistics section with StatCard components
  - **Brief ref:** BRIEF.md Section 3.1
  - **Files:** `src/pages/HomePage.tsx` (updated), `src/components/StatsSection.tsx`
  - **Details:**
    - Section label: "01 — PLATFORM IMPACT" using SectionLabel component
    - Page section heading: "THE NUMBERS SO FAR" in `--type-section-heading`
    - 4 StatCards with placeholder data:
      - "MISSIONS FUNDED" → "47" (sub: "+12 this quarter", positive)
      - "CAPITAL RAISED" → "$3.1M" (sub: "across 20+ countries", neutral)
      - "MISSION BACKERS" → "12,400" (sub: "+2,100 this month", positive)
      - "SUCCESS RATE" → "84%" (sub: "milestones delivered on time", neutral)
    - Responsive grid: 1 column mobile, 2 columns at `sm`, 4 columns at `lg`
    - Max width container (~1200px) centred on page
  - **Verification:** Four stat cards render in responsive grid with correct typography and colours

- [ ] **TASK-03: Build Homepage "How It Works" section**
  - **Goal:** Create a 3-step explanation section
  - **Brief ref:** BRIEF.md Section 3.1
  - **Files:** `src/pages/HomePage.tsx` (updated), `src/components/HowItWorksSection.tsx`
  - **Details:**
    - Section label: "02 — HOW IT WORKS"
    - Section heading: "FROM BACKER TO MISSION PARTNER" in `--type-section-heading`
    - Three steps, each in a Card component:
      1. "DISCOVER" — "Browse vetted Mars-enabling projects. Every mission is reviewed and approved before going live."
      2. "BACK" — "Contribute from $50. Your funds are held in secure escrow until milestones are verified."
      3. "TRACK" — "Follow your missions. Get milestone updates, impact reports, and proof that your stake matters."
    - Step number displayed as `--type-stat-value-compact`, `--color-text-accent`
    - Step title as `--type-card-title`
    - Step description as `--type-body`, `--color-text-secondary`
    - Responsive: single column on mobile, 3 columns at `lg`
  - **Verification:** Three step cards render with correct numbering, typography, and responsive layout

- [ ] **TASK-04: Build Homepage featured missions section**
  - **Goal:** Create a section showcasing 3 placeholder campaign cards
  - **Brief ref:** BRIEF.md Section 3.1
  - **Files:** `src/pages/HomePage.tsx` (updated), `src/components/FeaturedMissionsSection.tsx`, `src/components/MissionCard.tsx`
  - **Details:**
    - Section label: "03 — ACTIVE MISSIONS"
    - Section heading: "MISSIONS SEEKING BACKERS" in `--type-section-heading`
    - 3 MissionCard composites, each containing:
      - Card component with accent bar
      - Badge component (one "active", one "new", one with custom % funded)
      - Mission title in `--type-card-title`
      - Short description in `--type-body`, `--color-text-secondary`
      - ProgressBar showing funding progress
      - Funding status text: e.g., "73% funded — 18 days left" per L2-001 Section 4.2
      - Placeholder data for three fictional missions:
        1. "Pressurised Habitat Module Alpha" — 73% funded, 18 days left, Active badge
        2. "Mars Regolith Water Extraction" — 41% funded, 32 days left, New Mission badge
        3. "Autonomous Landing Navigation System" — 100% funded, Funded badge
    - Ghost button on each card: "View Mission" (links to `#`)
    - Responsive: single column on mobile, 2 columns at `md`, 3 columns at `lg`
  - **Verification:** Three mission cards render with badges, progress bars, funding status, and correct responsive grid

- [ ] **TASK-05: Build Homepage closing CTA section**
  - **Goal:** Create a final call-to-action section at the bottom of the homepage
  - **Brief ref:** BRIEF.md Section 3.1
  - **Files:** `src/pages/HomePage.tsx` (updated), `src/components/ClosingCtaSection.tsx`
  - **Details:**
    - Background: `--gradient-surface-card` (`--grad-deep-field`) or similar deep treatment
    - Heading: "EVERY DOLLAR MOVES THE LAUNCH WINDOW CLOSER" in `--type-page-title`
    - Subtext: "Join thousands of backers funding humanity's next giant leap. Your stake powers real missions." in `--type-body`
    - Secondary CTA Button: "Browse All Missions" (links to `#`)
    - Note: not primary CTA — the hero CTA is the primary for this page
    - Centred layout with generous padding
  - **Verification:** Closing section renders with correct heading, body text, and secondary button

- [ ] **TASK-06: Build About page**
  - **Goal:** Create the About page with mission, problem/solution, principles, and personas
  - **Brief ref:** BRIEF.md Section 3.2
  - **Files:** `src/pages/AboutPage.tsx`
  - **Details:**
    - **Hero area**: Page title "ABOUT MARS MISSION FUND" in `--type-page-title`, with brief intro line
    - **Section 1 — "01 — OUR MISSION"**: Vision statement adapted from L1-001 Section 1.1. 2-3 paragraphs in `--type-body`.
    - **Section 2 — "02 — THE PROBLEM WE SOLVE"**: Adapted from L1-001 Section 1.2. Frame the bottleneck (nation-states and billionaires gatekeep space funding) and the bridge (MMF democratises Mars funding). Two subsections or side-by-side layout.
    - **Section 3 — "03 — OUR PRINCIPLES"**: The five strategic principles from L1-001 Section 1.4. Display as a grid of 5 Cards. Each card has the principle name as `--type-card-title` and a short explanation as `--type-body`. Use the accent bar on cards.
    - **Section 4 — "04 — WHO WE SERVE"**: Four persona cards from L1-001 Section 1.3. Each card shows persona name, description, and primary need. Responsive grid: 1 column mobile, 2 at `md`, 4 at `lg`.
    - All section labels use SectionLabel component
    - Max width container centred
  - **Verification:** About page renders all four sections with correct content, typography, and responsive layout

- [ ] **TASK-07: Build Contact page**
  - **Goal:** Create the Contact page with static dummy contact information
  - **Brief ref:** BRIEF.md Section 3.3
  - **Files:** `src/pages/ContactPage.tsx`
  - **Details:**
    - Page title: "CONTACT US" in `--type-page-title`
    - Intro line: "Have a question about a mission, your account, or the platform? We'd love to hear from you." in `--type-body`
    - Section label: "01 — GET IN TOUCH"
    - Contact details in Card components:
      - **Email**: hello@marsmissionfund.com
      - **Address**: Level 12, 180 Collins Street, Melbourne VIC 3000, Australia
      - **Office hours**: Monday–Friday, 9:00 AM – 5:00 PM AEST
    - Section label: "02 — FOLLOW THE MISSION"
    - Social links (dummy, link to `#`): X / Twitter, LinkedIn, GitHub
    - Clean, minimal layout — no form
    - Responsive: single column on mobile, side-by-side at `md`
  - **Verification:** Contact page renders with all dummy information, proper typography, and responsive layout

- [ ] **TASK-08: Final verification**
  - **Goal:** Verify all marketing page deliverables
  - **Verification:**
    - Homepage renders all 5 sections (hero, stats, how it works, featured missions, closing CTA)
    - About page renders all 4 sections (mission, problem/solution, principles, personas)
    - Contact page renders contact info and social links
    - Navigation between all three pages works without full page reload
    - All pages use only Tier 2 semantic tokens
    - All pages are responsive at all four breakpoints (640/768/1024/1280px)
    - All interactive elements have visible focus states
    - `prefers-reduced-motion` disables all animations
    - Document title updates on each route
    - All text follows L2-001 Section 4 voice patterns (no forbidden language)
    - `npm run build` succeeds with no errors
