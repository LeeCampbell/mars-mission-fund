# Tasks: Issue #80 — Fix typography tokens and font compliance

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add `--type-*` font-family shorthand tokens to `tokens.css`
  - **Goal**: Define all 13 missing `--type-*` CSS custom properties so that component `fontFamily: 'var(--type-*)'` references resolve to the correct web font.
  - **Details**: In `packages/client/src/tokens.css`, locate the `/* --- 2.8 Typography --- */` section. After the existing per-property tokens, add the following shorthand aliases:
    - `--type-hero: var(--font-display)`
    - `--type-page-title: var(--font-display)`
    - `--type-section-heading: var(--font-display)`
    - `--type-stat-value: var(--font-display)`
    - `--type-stat-value-compact: var(--font-display)`
    - `--type-card-title: var(--font-body)`
    - `--type-body: var(--font-body)`
    - `--type-body-small: var(--font-body)`
    - `--type-button: var(--font-body)`
    - `--type-label: var(--font-data)`
    - `--type-section-label: var(--font-data)`
    - `--type-data: var(--font-data)`
    - `--type-input-label: var(--font-data)`
  - **Files**: `packages/client/src/tokens.css`
  - **Verify**: Open `tokens.css` and confirm all 13 `--type-*` properties are present and map to the correct Tier 1 token.
  - **Brief ref**: Step 1 — Add font-family shorthand tokens to `tokens.css`

- [x] TASK-02: Fix hardcoded section-heading font sizes in section components
  - **Goal**: Replace hardcoded `fontSize` values with the token reference so section headings are consistently 40 px and driven by the design system.
  - **Details**:
    - In `StatsSection.tsx`: change `headingStyle` `fontSize: '36px'` → `fontSize: 'var(--type-section-heading-size)'`
    - In `FeaturedMissionsSection.tsx`: change `headingStyle` `fontSize: '36px'` → `fontSize: 'var(--type-section-heading-size)'`
    - In `HowItWorksSection.tsx`: change `headingStyle` `fontSize: '36px'` → `fontSize: 'var(--type-section-heading-size)'`
    - In `ClosingCtaSection.tsx`: if `headingStyle` has `fontSize: '40px'`, update it to `fontSize: 'var(--type-section-heading-size)'` for consistency
  - **Files**:
    - `packages/client/src/components/StatsSection.tsx`
    - `packages/client/src/components/FeaturedMissionsSection.tsx`
    - `packages/client/src/components/HowItWorksSection.tsx`
    - `packages/client/src/components/ClosingCtaSection.tsx`
  - **Verify**: Search for `36px` in the listed files — none should remain. Search for `headingStyle` — all should reference `var(--type-section-heading-size)`.
  - **Brief ref**: Step 2 — Fix hardcoded section-heading font sizes

- [x] TASK-03: Fix `MissionCard` card-title font size
  - **Goal**: Replace the hardcoded `18px` font size in `MissionCard` with the correct token so card titles render at 24 px per the design spec.
  - **Details**: In `MissionCard.tsx`, find `titleStyle` and change `fontSize: '18px'` to `fontSize: 'var(--type-card-title-size)'`.
  - **Files**: `packages/client/src/components/MissionCard.tsx`
  - **Verify**: Open the file and confirm `titleStyle` no longer contains a hardcoded px value for `fontSize`.
  - **Brief ref**: Step 3 — Fix MissionCard card-title font size

- [ ] TASK-04: Fix hero H1 responsive sizing to prevent 375 px overflow
  - **Goal**: Replace the three-step px ladder in `HeroSection.tsx` with a fluid `clamp()` so the H1 is 96 px at desktop and does not overflow at 375 px mobile.
  - **Details**: In `HeroSection.tsx`, locate the injected CSS rule block for `.hero-heading`. Replace the existing `font-size` declarations (including any `@media` overrides) with:
    ```css
    font-size: clamp(2rem, 9vw, 6rem);
    ```
    Remove the hard-coded `@media` font-size overrides — `clamp` handles all sizes. Retain existing `line-height`, `letter-spacing`, and `text-transform` declarations.
  - **Files**: `packages/client/src/components/HeroSection.tsx`
  - **Verify**: The injected CSS contains `clamp(2rem, 9vw, 6rem)` (or an equivalent step-ladder starting at ≤32 px). No `48px` font-size value remains in the file.
  - **Brief ref**: Step 4 — Fix hero H1 responsive sizing

- [ ] TASK-05: Build verification and visual QA
  - **Goal**: Confirm the codebase builds cleanly, tests pass, and visual checks confirm correct fonts and layout at both desktop and 375 px mobile.
  - **Details**:
    1. Run `npm run build` from the repo root; confirm zero TypeScript or lint errors.
    2. Run `npm run test` from the repo root; confirm no regressions.
    3. Start the dev server (`npm run dev`) and open `http://localhost:5173`.
    4. Visually verify (using DevTools or the review-ux skill):
       - H1 "CROWDFUNDING THE NEXT GIANT LEAP" renders in Bebas Neue, 96 px at desktop width.
       - H1 does NOT overflow at 375 px (DevTools responsive mode).
       - Section headings render in Bebas Neue at 40 px.
       - Campaign card titles render in DM Sans at 24 px bold.
       - Section labels render in Space Mono.
       - Stat values render in Bebas Neue.
       - Each `MissionCard` on the homepage shows the 2 px orange-to-amber top accent bar.
    5. If the accent bar is missing, investigate `Card.tsx` CSS specificity and fix.
  - **Files**: No new files; read-only verification (fix `Card.tsx` only if accent bar is broken).
  - **Verify**: Build exits 0, tests pass, all visual items in step 4 are confirmed correct.
  - **Brief ref**: Step 5 — Verify card accent bars; Verification section
