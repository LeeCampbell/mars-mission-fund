# Brief: Issue #80 — Fix typography tokens and font compliance

## Goal

Several components reference `var(--type-hero)`, `var(--type-body)`, `var(--type-section-heading)`, and other type-scale names as `font-family` values, but `tokens.css` never defines these as font-family shorthand tokens — they only exist as `--type-*-size`, `--type-*-weight`, etc. sub-property tokens. This means all font-family declarations that use these variables silently resolve to nothing, breaking font rendering across the app. Additionally, many components use hardcoded pixel sizes that don't match the closed type scale defined in L2-001 §2.8, and one undefined token (`--type-hero-heading-size`) is referenced in two pages. This issue adds the missing shorthand font-family tokens, replaces off-scale/hardcoded sizes with token variables, and fixes hero H1 responsive sizing.

## Scope

**In scope:**

- Add `--type-*` font-family shorthand tokens to `tokens.css` (Section 2.8) mapping each type-scale name to its Tier 1 font family
- Fix the non-existent `--type-hero-heading-size` token reference in `CampaignDetailPage.tsx` and `ContributePlaceholderPage.tsx` — replace with `--type-page-title-size`
- Replace hardcoded font-size values with their corresponding `--type-*-size` tokens across all client components and pages
- Fix hero H1 `font-size` values in `HeroSection.tsx` to use `var(--type-hero-size)` at desktop breakpoint; ensure mobile base size avoids overflow at 375px viewport
- Fix hero subtitle `font-family` (`var(--type-body)` → will resolve once token added) and `fontSize: '18px'` (off-scale) → `var(--type-body-size)` (16px)
- Replace off-scale values (`36px`, `18px`, `15px`, `20px`, `32px`, etc.) with the nearest on-scale token where they represent section headings, body text, etc.
- Visually verify homepage card accent bars render correctly (implementation already correct in `Card.tsx`)

**Out of scope:**

- Adding new type scale entries to L2-001 (no design changes)
- Changing component layout, spacing, or colour tokens
- Modifying server code or database
- Writing new tests (existing tests cover no typography assertions)
- Changes to `fonts.css` or `@font-face` rules

## Approach

### Step 1 — Add font-family shorthand tokens to `tokens.css`

In the Section 2.8 block, add a set of `--type-<name>` CSS custom properties that map each semantic type name to its Tier 1 font-family token. These are consumed by components as `fontFamily: 'var(--type-body)'` etc.

Mappings (per L2-001 §2.8):

| New token                   | Maps to          |
| --------------------------- | ---------------- |
| `--type-hero`               | `var(--font-display)` |
| `--type-page-title`         | `var(--font-display)` |
| `--type-section-heading`    | `var(--font-display)` |
| `--type-stat-value`         | `var(--font-display)` |
| `--type-stat-value-compact` | `var(--font-display)` |
| `--type-card-title`         | `var(--font-body)`    |
| `--type-body`               | `var(--font-body)`    |
| `--type-body-small`         | `var(--font-body)`    |
| `--type-button`             | `var(--font-body)`    |
| `--type-label`              | `var(--font-data)`    |
| `--type-section-label`      | `var(--font-data)`    |
| `--type-data`               | `var(--font-data)`    |
| `--type-input-label`        | `var(--font-data)`    |

Add these after the existing `--font-heading` / `--font-mono` aliases in Section 2.8.

### Step 2 — Fix `--type-hero-heading-size` (undefined token)

`CampaignDetailPage.tsx:92` and `ContributePlaceholderPage.tsx:21` both reference `var(--type-hero-heading-size)` which does not exist. The campaign detail page title should use `var(--type-page-title-size)` (56px, `--font-display`).

### Step 3 — Fix hardcoded font-size values to use token variables

For each component, replace the raw px value with the matching `--type-*-size` token. Where the hardcoded value is off-scale, adopt the nearest on-scale token that matches the semantic role:

| File | Current hardcoded value | Correct token | Notes |
|------|------------------------|---------------|-------|
| `HeroSection.tsx` subtextStyle | `18px` | `var(--type-body-size)` | 18px is off-scale; body is 16px |
| `HeroSection.tsx` heroStyles desktop | `96px` | `var(--type-hero-size)` | |
| `HeroSection.tsx` heroStyles tablet | `72px` | keep as is (responsive step) | No token exists for this; acceptable intermediate |
| `HeroSection.tsx` heroStyles mobile | `48px` | keep as is (responsive step) | No token exists for this; acceptable intermediate |
| `MissionCard.tsx` titleStyle | `18px` | `var(--type-card-title-size)` | Spec: card title = 24px |
| `MissionCard.tsx` descriptionStyle | `14px` | `var(--type-body-size)` | body = 16px; 14px = button/data size. Current value is closest to `--text-base` but card body text should be body (16px) |
| `MissionCard.tsx` fundingStatusStyle | `12px` | `var(--type-data-size)` | data = 14px in spec |
| `StatsSection.tsx` | `36px` | `var(--type-section-heading-size)` | 36px off-scale; section heading = 40px |
| `HowItWorksSection.tsx` heading | `36px` | `var(--type-section-heading-size)` | |
| `HowItWorksSection.tsx` step heading | `24px` | `var(--type-card-title-size)` | ✓ same value, use token |
| `ClosingCtaSection.tsx` | `40px` | `var(--type-section-heading-size)` | ✓ same value, use token |
| `FeaturedMissionsSection.tsx` | `36px` | `var(--type-section-heading-size)` | |
| `Header.tsx` wordmark | `20px` | `var(--type-stat-value-compact-size)` | nav wordmark uses display font; 20px off-scale; closest is 28px compact. Alternatively keep `--font-display` and use a sensible size. Use `var(--type-stat-value-compact-size)` |
| `Header.tsx` nav links (14px) | `14px` | `var(--type-button-size)` | ✓ same value, use token |
| `Header.tsx` nav links (16px) | `16px` | `var(--type-body-size)` | |
| `StatCard.tsx` label | `11px` | `var(--type-label-size)` | ✓ same value, use token |
| `StatCard.tsx` value | `40px` | `var(--type-stat-value-size)` | ✓ same value, use token |
| `StatCard.tsx` sub lines | `12px` | `var(--type-input-label-size)` | closest on-scale for 12px |
| `SectionLabel.tsx` | `11px` | `var(--type-section-label-size)` | ✓ same value, use token |
| `Badge.tsx` | `12px` | keep (per spec §3.5: "type-button at 12px") | not a token value; leave as spec-directed exception |
| `CampaignsPage.tsx` heading | `32px` | `var(--type-page-title-size)` is 56px — too large. This is closer to `var(--type-section-heading-size)` = 40px for a page list heading | |
| `AboutPage.tsx` heading | `36px` | `var(--type-section-heading-size)` | |
| `AboutPage.tsx` body | `18px` | `var(--type-body-size)` | off-scale |
| `AboutPage.tsx` section heading | `20px` | `var(--type-card-title-size)` | off-scale |
| `AboutPage.tsx` body | `15px` | `var(--type-body-size)` | off-scale |
| `ContactPage.tsx` heading | `36px` | `var(--type-section-heading-size)` | |
| `ContactPage.tsx` label | `14px` | `var(--type-button-size)` | |
| `ContactPage.tsx` body | `16px` | `var(--type-body-size)` | ✓ use token |
| `ContactPage.tsx` body | `15px` | `var(--type-body-size)` | off-scale |
| `ContactPage.tsx` section heading | `18px` | `var(--type-card-title-size)` | off-scale |
| `ContactPage.tsx` small | `14px` | `var(--type-button-size)` | |
| `Footer.tsx` body | `14px` | `var(--type-button-size)` | |
| `Footer.tsx` label | `11px` | `var(--type-section-label-size)` | ✓ use token |
| `Footer.tsx` copyright | `13px` | `var(--type-body-small-size)` | ✓ same value, use token |
| `Button.tsx` | `14px` | `var(--type-button-size)` | ✓ same value, use token |

### Step 4 — Hero H1 responsive sizing

`HeroSection.tsx` uses runtime style injection for responsive font sizes. The `font-family: var(--type-hero)` will work once Step 1 is done. For font sizes:

- Desktop (≥1280px): `var(--type-hero-size)` resolves to 96px ✓
- Tablet (≥768px): 72px — no token exists; acceptable intermediate; leave as literal
- Mobile (<768px): 48px — no token exists; acceptable intermediate; leave as literal

Ensure the mobile base (48px) does not cause overflow at 375px with the `maxWidth: '900px'` container. Since `Bebas Neue` is a display condensed font, 48px should be fine. No structural change needed — just replace the desktop `96px` literal with `var(--type-hero-size)`.

### Step 5 — Visual verification

After applying changes, the build must pass and the homepage at `http://localhost:5173` should show:

- Hero H1 in Bebas Neue (display font) at correct responsive sizes
- MissionCard titles in DM Sans bold at 24px
- Section headings in Bebas Neue at 40px
- Stat cards with Space Mono labels and display font values
- Card top accent bars as a 2px gradient (launchfire → afterburn)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/tokens.css` | modify | Add 13 `--type-*` font-family shorthand tokens in Section 2.8 |
| `packages/client/src/components/HeroSection.tsx` | modify | Fix `fontFamily` + `fontSize: '18px'` in subtextStyle; replace desktop `96px` with `var(--type-hero-size)` |
| `packages/client/src/components/MissionCard.tsx` | modify | Replace 3 hardcoded font sizes with tokens |
| `packages/client/src/components/StatsSection.tsx` | modify | Replace `36px` with `var(--type-section-heading-size)` |
| `packages/client/src/components/HowItWorksSection.tsx` | modify | Replace `36px` and `24px` with tokens |
| `packages/client/src/components/ClosingCtaSection.tsx` | modify | Replace `40px` with token |
| `packages/client/src/components/FeaturedMissionsSection.tsx` | modify | Replace `36px` with token |
| `packages/client/src/components/Header.tsx` | modify | Replace hardcoded font sizes with tokens |
| `packages/client/src/components/ui/SectionLabel.tsx` | modify | Replace `11px` with `var(--type-section-label-size)` |
| `packages/client/src/components/ui/StatCard.tsx` | modify | Replace hardcoded sizes with tokens |
| `packages/client/src/components/ui/Button.tsx` | modify | Replace `14px` with `var(--type-button-size)` |
| `packages/client/src/components/Footer.tsx` | modify | Replace hardcoded font sizes with tokens |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Replace `var(--type-hero-heading-size)` with `var(--type-page-title-size)` |
| `packages/client/src/pages/ContributePlaceholderPage.tsx` | modify | Replace `var(--type-hero-heading-size)` with `var(--type-page-title-size)` |
| `packages/client/src/pages/CampaignsPage.tsx` | modify | Replace hardcoded font sizes with tokens |
| `packages/client/src/pages/AboutPage.tsx` | modify | Replace hardcoded font sizes with tokens |
| `packages/client/src/pages/ContactPage.tsx` | modify | Replace hardcoded font sizes with tokens |

## Dependencies

None. No new npm packages required. No external services. No prerequisite PRs.

## Verification

- **Build**: `npm run build` succeeds with no TypeScript or lint errors
- **Visual** (browser at `http://localhost:5173`):
  - Homepage hero: H1 renders in Bebas Neue, large display font at desktop; scales down gracefully at 375px without horizontal overflow
  - Homepage hero: subtitle paragraph renders in DM Sans (not Bebas Neue or Space Mono)
  - MissionCard titles: render in DM Sans bold at 24px (larger than current broken 18px)
  - Section headings throughout: render in Bebas Neue at 40px
  - Stat cards on homepage: label in Space Mono, value in Bebas Neue
  - Card top accent bars: 2px gradient stripe visible on MissionCards
- **Tests**: `npm test` (runs Vitest in all packages) — existing tests must still pass; no new tests required for this issue
