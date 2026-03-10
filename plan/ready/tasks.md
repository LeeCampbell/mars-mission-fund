# Tasks: Issue #80 — Fix typography tokens and font compliance

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add font-family shorthand tokens to `tokens.css`
  - **Goal**: Define the 13 missing `--type-*` font-family CSS custom properties so component `fontFamily` declarations resolve correctly
  - **Details**: In `packages/client/src/tokens.css`, locate the Section 2.8 block (after `--font-heading` / `--font-mono` aliases). Add each token from the mapping table in the brief (e.g. `--type-hero: var(--font-display);`, `--type-body: var(--font-body);`, etc.) for all 13 entries.
  - **Files**: `packages/client/src/tokens.css`
  - **Verify**: Search the file for `--type-hero:` and confirm all 13 tokens are present with correct values.
  - **Brief ref**: Step 1

- [x] TASK-02: Fix undefined `--type-hero-heading-size` token references
  - **Goal**: Replace the two references to the non-existent `--type-hero-heading-size` token with `--type-page-title-size`
  - **Details**: In `CampaignDetailPage.tsx` (line ~92) and `ContributePlaceholderPage.tsx` (line ~21), find `var(--type-hero-heading-size)` and replace with `var(--type-page-title-size)`.
  - **Files**: `packages/client/src/pages/CampaignDetailPage.tsx`, `packages/client/src/pages/ContributePlaceholderPage.tsx`
  - **Verify**: `grep -r "type-hero-heading-size" packages/client/src` returns no results.
  - **Brief ref**: Step 2

- [x] TASK-03: Fix typography in `HeroSection.tsx`
  - **Goal**: Replace hardcoded `18px` subtitle font size and desktop `96px` hero H1 size with token variables
  - **Details**: In `subtextStyle`, change `fontSize: '18px'` → `fontSize: 'var(--type-body-size)'`. In heroStyles for desktop breakpoint (≥1280px), change `fontSize: '96px'` → `fontSize: 'var(--type-hero-size)'`. The `fontFamily: 'var(--type-hero)'` and `fontFamily: 'var(--type-body)'` references will now resolve correctly after TASK-01. Leave 72px (tablet) and 48px (mobile) as literals per brief.
  - **Files**: `packages/client/src/components/HeroSection.tsx`
  - **Verify**: File contains `var(--type-body-size)` for subtitle and `var(--type-hero-size)` for desktop; no `18px` or `96px` font-size literals remain.
  - **Brief ref**: Steps 3 & 4

- [x] TASK-04: Fix typography in `MissionCard.tsx`
  - **Goal**: Replace 3 hardcoded font-size values with token variables
  - **Details**: `titleStyle`: `18px` → `var(--type-card-title-size)`. `descriptionStyle`: `14px` → `var(--type-body-size)`. `fundingStatusStyle`: `12px` → `var(--type-data-size)`.
  - **Files**: `packages/client/src/components/MissionCard.tsx`
  - **Verify**: File contains all three token references; no `18px`, `14px`, or `12px` font-size literals in those styles.
  - **Brief ref**: Step 3

- [x] TASK-05: Fix typography in section-level components
  - **Goal**: Replace hardcoded font sizes in `StatsSection.tsx`, `HowItWorksSection.tsx`, `ClosingCtaSection.tsx`, and `FeaturedMissionsSection.tsx`
  - **Details**:
    - `StatsSection.tsx`: `36px` → `var(--type-section-heading-size)`
    - `HowItWorksSection.tsx` section heading: `36px` → `var(--type-section-heading-size)`; step heading: `24px` → `var(--type-card-title-size)`
    - `ClosingCtaSection.tsx`: `40px` → `var(--type-section-heading-size)`
    - `FeaturedMissionsSection.tsx`: `36px` → `var(--type-section-heading-size)`
  - **Files**: `packages/client/src/components/StatsSection.tsx`, `packages/client/src/components/HowItWorksSection.tsx`, `packages/client/src/components/ClosingCtaSection.tsx`, `packages/client/src/components/FeaturedMissionsSection.tsx`
  - **Verify**: None of these files contain raw `36px` or `40px` font-size literals; all use the appropriate token variables.
  - **Brief ref**: Step 3

- [x] TASK-06: Fix typography in `Header.tsx`
  - **Goal**: Replace all hardcoded font sizes with token variables
  - **Details**: Wordmark `20px` → `var(--type-stat-value-compact-size)`. Nav links at `14px` → `var(--type-button-size)`. Nav links at `16px` → `var(--type-body-size)`.
  - **Files**: `packages/client/src/components/Header.tsx`
  - **Verify**: File references `var(--type-stat-value-compact-size)`, `var(--type-button-size)`, and `var(--type-body-size)` where font sizes were previously hardcoded.
  - **Brief ref**: Step 3

- [x] TASK-07: Fix typography in UI primitives (`SectionLabel.tsx`, `StatCard.tsx`, `Button.tsx`)
  - **Goal**: Replace hardcoded font sizes in shared UI components with token variables
  - **Details**:
    - `SectionLabel.tsx`: `11px` → `var(--type-section-label-size)`
    - `StatCard.tsx` label: `11px` → `var(--type-label-size)`; value: `40px` → `var(--type-stat-value-size)`; sub lines: `12px` → `var(--type-input-label-size)`
    - `Button.tsx`: `14px` → `var(--type-button-size)`
    - Leave `Badge.tsx` `12px` as-is per spec §3.5 exception noted in brief.
  - **Files**: `packages/client/src/components/ui/SectionLabel.tsx`, `packages/client/src/components/ui/StatCard.tsx`, `packages/client/src/components/ui/Button.tsx`
  - **Verify**: Each file contains the corresponding token variable; no raw `11px`, `40px`, `12px`, or `14px` font-size literals remain in the changed styles.
  - **Brief ref**: Step 3

- [x] TASK-08: Fix typography in `Footer.tsx`
  - **Goal**: Replace hardcoded font sizes in the footer with token variables
  - **Details**: Body text `14px` → `var(--type-button-size)`. Label `11px` → `var(--type-section-label-size)`. Copyright `13px` → `var(--type-body-small-size)`.
  - **Files**: `packages/client/src/components/Footer.tsx`
  - **Verify**: File contains token references for all three sizes; no raw `14px`, `11px`, or `13px` font-size literals remain in those styles.
  - **Brief ref**: Step 3

- [x] TASK-09: Fix typography in pages (`CampaignsPage.tsx`, `AboutPage.tsx`, `ContactPage.tsx`)
  - **Goal**: Replace all hardcoded font sizes in the three pages with token variables
  - **Details**:
    - `CampaignsPage.tsx` heading: `32px` → `var(--type-section-heading-size)`
    - `AboutPage.tsx` main heading: `36px` → `var(--type-section-heading-size)`; body `18px` → `var(--type-body-size)`; section heading `20px` → `var(--type-card-title-size)`; body `15px` → `var(--type-body-size)`
    - `ContactPage.tsx` heading: `36px` → `var(--type-section-heading-size)`; label `14px` → `var(--type-button-size)`; body `16px` → `var(--type-body-size)`; body `15px` → `var(--type-body-size)`; section heading `18px` → `var(--type-card-title-size)`; small `14px` → `var(--type-button-size)`
  - **Files**: `packages/client/src/pages/CampaignsPage.tsx`, `packages/client/src/pages/AboutPage.tsx`, `packages/client/src/pages/ContactPage.tsx`
  - **Verify**: No raw pixel font-size literals matching the above values remain in the changed styles; all use token variables.
  - **Brief ref**: Step 3

- [x] TASK-10: Build verification and visual check
  - **Goal**: Confirm the build succeeds with no TypeScript or lint errors and existing tests pass
  - **Details**: Run `npm run build` from the repo root. If build errors exist, fix them. Run `npm test` and confirm all existing tests pass. No new tests are required.
  - **Files**: (none new — only fixes if build fails)
  - **Verify**: `npm run build` exits 0. `npm test` exits 0. No TypeScript errors.
  - **Brief ref**: Verification section
