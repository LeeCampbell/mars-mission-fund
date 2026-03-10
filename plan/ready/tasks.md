# Tasks: Issue #80 — Fix typography tokens and font compliance

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add font-family shorthand tokens to tokens.css
  - **Goal**: Add 13 `--type-*` CSS custom properties in the Tier 2 §2.8 Typography block so `var(--type-hero)` etc. resolve to the correct font families instead of falling back to body font.
  - **Details**: In `packages/client/src/tokens.css`, find the `/* --- 2.8 Typography --- */` block and immediately after the comment `/* These semantic aliases make component code intent-expressive. */`, add the 13 font-family shorthand tokens as listed in the brief (4 display tokens mapping to `var(--font-display)`, 4 body tokens mapping to `var(--font-body)`, 4 data tokens mapping to `var(--font-data)`).
  - **Files**: `packages/client/src/tokens.css`
  - **Verify**: Grep the file for `--type-hero` and confirm the property exists with value `var(--font-display)`. Confirm all 13 tokens are present.
  - **Brief ref**: §Approach 1 — Add font-family shorthand tokens

- [x] TASK-02: Fix section heading font sizes in three components
  - **Goal**: Replace hardcoded `36px` font sizes with the `--type-section-heading-size` token in `FeaturedMissionsSection`, `HowItWorksSection`, and `StatsSection`.
  - **Details**: In each of the three files, find the `headingStyle` object with `fontSize: '36px'` and change it to `fontSize: 'var(--type-section-heading-size)'`. This makes the headings render at 40px (via `--text-2xl`) per spec.
  - **Files**: `packages/client/src/components/FeaturedMissionsSection.tsx`, `packages/client/src/components/HowItWorksSection.tsx`, `packages/client/src/components/StatsSection.tsx`
  - **Verify**: Grep each file and confirm no `36px` remains in `headingStyle`. Confirm `var(--type-section-heading-size)` appears in each file.
  - **Brief ref**: §Approach 2 — Fix section heading font sizes

- [x] TASK-03: Fix card title font sizes in MissionCard and CampaignCard
  - **Goal**: Replace hardcoded `18px` font sizes with the `--type-card-title-size` token in `MissionCard` and `CampaignCard`.
  - **Details**: In each of the two files, find the `titleStyle` object with `fontSize: '18px'` and change it to `fontSize: 'var(--type-card-title-size)'`. This makes card titles render at 24px (via `--text-lg`) per spec.
  - **Files**: `packages/client/src/components/MissionCard.tsx`, `packages/client/src/components/campaigns/CampaignCard.tsx`
  - **Verify**: Grep each file and confirm no `18px` remains in `titleStyle`. Confirm `var(--type-card-title-size)` appears in each file.
  - **Brief ref**: §Approach 3 — Fix card title font sizes

- [x] TASK-04: Fix hero H1 responsive sizing and letter-spacing
  - **Goal**: Update `HeroSection.tsx` so the hero H1 uses a 32px base on mobile (prevents 375px overflow), adds a 48px breakpoint at 640px, keeps 72px at 768px and 96px at 1280px+, and corrects letter-spacing from `0.02em` to `var(--type-hero-spacing)` (0.03em).
  - **Details**: Find the injected CSS for `.hero-heading` in `HeroSection.tsx`. Change the base font-size to `32px`, add a `@media (min-width: 640px)` rule at `48px`, keep `@media (min-width: 768px)` at `72px` and `@media (min-width: 1280px)` at `96px` (or `var(--type-hero-size)`). Change `letter-spacing` from `0.02em` to `var(--type-hero-spacing)`.
  - **Files**: `packages/client/src/components/HeroSection.tsx`
  - **Verify**: Grep the file for `0.02em` and confirm it no longer appears. Confirm `32px` appears as the base and `640px` breakpoint is present.
  - **Brief ref**: §Approach 4 — Fix hero H1 responsive sizing

- [ ] TASK-05: Build, typecheck, and verify tests pass
  - **Goal**: Confirm all code changes are valid — TypeScript compiles, build succeeds, and existing tests are not broken.
  - **Details**: Run `npm run build -w packages/client` to build the client package. Run `npm run typecheck -w packages/client` to confirm no TypeScript errors introduced. Run `npm test -w packages/client` to confirm existing tests still pass.
  - **Files**: (no file changes — verification only)
  - **Verify**: All three commands exit with code 0.
  - **Brief ref**: §Verification — Build, Type-check, Tests
