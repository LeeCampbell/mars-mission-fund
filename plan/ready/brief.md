# Brief: Issue #80 — Fix typography tokens and font compliance

## Goal

The UX review (findings #3, #4, #5, #6, #7, #8, #13, #14) revealed that all headings,
section labels, and stat values render in DM Sans instead of their specified fonts, and that
several font sizes are hardcoded at wrong values.
The root cause is that `tokens.css` defines per-property tokens (`--type-hero-size`,
`--type-hero-weight`, etc.) but is missing the corresponding font-family shorthand tokens
(`--type-hero`, `--type-section-heading`, etc.) that component code references via
`fontFamily: 'var(--type-hero)'`.
This issue adds those missing shorthand tokens, corrects hardcoded font sizes across section
components, fixes the hero H1 mobile overflow at 375 px, and verifies homepage card accent
bars are rendering.

## Scope

**In scope:**

- Add `--type-*` font-family shorthand tokens to `tokens.css` so that
  `var(--type-hero)`, `var(--type-section-heading)`, `var(--type-card-title)`,
  `var(--type-body)`, `var(--type-body-small)`, `var(--type-button)`,
  `var(--type-label)`, `var(--type-section-label)`, `var(--type-data)`,
  `var(--type-stat-value)`, `var(--type-stat-value-compact)`, `var(--type-page-title)`,
  and `var(--type-input-label)` each resolve to the correct Tier 1 font-family identity
  token (`--font-display`, `--font-body`, or `--font-data`)
- Fix hardcoded `fontSize` values in section-heading styles to use
  `var(--type-section-heading-size)` (40 px) in `StatsSection`, `FeaturedMissionsSection`,
  and `HowItWorksSection`
- Fix the hardcoded `fontSize: '18px'` in `MissionCard` to use
  `var(--type-card-title-size)` (24 px)
- Fix the hero H1 responsive sizing so it is 96 px at desktop and does not overflow at 375 px
  mobile (reduce the smallest breakpoint value and/or use `clamp()`)
- Verify that the homepage `MissionCard` components render the 2 px top accent bar correctly
  (the `accent` prop is already passed; confirm the visual result is correct)

**Out of scope:**

- Fixing findings #1, #2, #9, #10, #11, #12, #15 (dead links, raw HTML, progress bar
  colour, forbidden copy, nested `<main>`, missing alt text, page titles) — those are
  separate issues
- Adding new components or pages
- Changing token values (colours, sizes, spacing) — only adding missing shorthand aliases

## Approach

### Step 1 — Add font-family shorthand tokens to `tokens.css`

In the `/* --- 2.8 Typography --- */` section, add one `--type-*` alias per type-scale
entry, each mapping to the correct Tier 1 font-family token:

| New token                   | Maps to          | Font loaded        |
| --------------------------- | ---------------- | ------------------ |
| `--type-hero`               | `--font-display` | Bebas Neue         |
| `--type-page-title`         | `--font-display` | Bebas Neue         |
| `--type-section-heading`    | `--font-display` | Bebas Neue         |
| `--type-stat-value`         | `--font-display` | Bebas Neue         |
| `--type-stat-value-compact` | `--font-display` | Bebas Neue         |
| `--type-card-title`         | `--font-body`    | DM Sans            |
| `--type-body`               | `--font-body`    | DM Sans            |
| `--type-body-small`         | `--font-body`    | DM Sans            |
| `--type-button`             | `--font-body`    | DM Sans            |
| `--type-label`              | `--font-data`    | Space Mono         |
| `--type-section-label`      | `--font-data`    | Space Mono         |
| `--type-data`               | `--font-data`    | Space Mono         |
| `--type-input-label`        | `--font-data`    | Space Mono         |

This unblocks all components that already use `fontFamily: 'var(--type-*)'` correctly —
no component code changes are needed for font-family once the tokens exist.

### Step 2 — Fix hardcoded section-heading font sizes

Four components hardcode `fontSize: '36px'` or `fontSize: '40px'` on their `headingStyle`.
Per L2-001 §2.8, section headings must be 40 px (`--type-section-heading-size`).

- `StatsSection.tsx` headingStyle: `36px` → `var(--type-section-heading-size)`
- `FeaturedMissionsSection.tsx` headingStyle: `36px` → `var(--type-section-heading-size)`
- `HowItWorksSection.tsx` headingStyle: `36px` → `var(--type-section-heading-size)`
- `ClosingCtaSection.tsx` headingStyle already has `40px` — leave as-is or update to the
  token; prefer the token for consistency

### Step 3 — Fix MissionCard card-title font size

`MissionCard.tsx` `titleStyle` has `fontSize: '18px'` — change to
`var(--type-card-title-size)` (24 px, per L2-001 §2.8).

### Step 4 — Fix hero H1 responsive sizing

`HeroSection.tsx` injects a CSS rule block.
The smallest breakpoint is currently `font-size: 48px`, which causes horizontal overflow at
375 px viewport width.
Replace the three-step ladder (`48px` / `72px` / `96px`) with a mobile-first approach that
prevents overflow.
Recommended approach — fluid clamp:

```css
.hero-heading {
  font-size: clamp(2rem, 9vw, 6rem);
  /* At 375px: 9vw = 33.75px → fits 'CROWDFUNDING' (≈ 33px wide in Bebas Neue) */
  /* At 1280px: 9vw = 115px → clamped to 6rem = 96px ✓ */
  /* keep existing line-height, letter-spacing, text-transform */
}
/* Remove the hard-coded @media font-size overrides — clamp handles all sizes */
```

Or if a step-ladder is preferred: `32px` mobile → `72px` at 768 px → `96px` at 1280 px.
Either option satisfies the deliverable; `clamp` is simpler and more fluid.
The implementing agent must visually verify the result does not overflow at exactly 375 px
(DevTools responsive mode).

### Step 5 — Verify card accent bars

`MissionCard.tsx` already passes `accent` to `Card`, and `Card.tsx` renders the accent bar
when `accent={true}`.
No code change is expected; run the dev server and visually confirm the orange-to-amber
gradient bar appears at the top of each mission card on the homepage.
If absent, investigate whether a CSS specificity issue or a rendering order problem is
hiding the bar and fix accordingly.

## Files to Create/Modify

| File                                                              | Action | Description                                                                        |
| ----------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `packages/client/src/tokens.css`                                  | modify | Add 13 `--type-*` font-family shorthand tokens in the §2.8 typography section     |
| `packages/client/src/components/HeroSection.tsx`                  | modify | Fix hero heading font-size to not overflow at 375 px mobile; use clamp or 32px    |
| `packages/client/src/components/MissionCard.tsx`                  | modify | Fix `titleStyle.fontSize` from `18px` to `var(--type-card-title-size)`             |
| `packages/client/src/components/StatsSection.tsx`                 | modify | Fix `headingStyle.fontSize` from `36px` to `var(--type-section-heading-size)`      |
| `packages/client/src/components/FeaturedMissionsSection.tsx`      | modify | Fix `headingStyle.fontSize` from `36px` to `var(--type-section-heading-size)`      |
| `packages/client/src/components/HowItWorksSection.tsx`            | modify | Fix `headingStyle.fontSize` from `36px` to `var(--type-section-heading-size)`      |

## Dependencies

No new npm packages required.
All three web fonts (Bebas Neue, DM Sans, Space Mono) are already installed via
`@fontsource/*` packages and imported in `src/index.css`.
The existing Tier 1 tokens `--font-display`, `--font-body`, and `--font-data` are already
defined in `tokens.css` with the correct `font-family` values.

## Verification

- **Build**: `npm run build` (from repo root) succeeds with no TypeScript or lint errors
- **Dev server**: `npm run dev` starts without errors
- **Visual checks at `http://localhost:5173`**:
  - Homepage H1 "CROWDFUNDING THE NEXT GIANT LEAP" renders in Bebas Neue, 96 px on desktop
  - Homepage H1 does not overflow the viewport at 375 px mobile (browser DevTools responsive
    mode)
  - Section headings ("THE NUMBERS SO FAR", "MISSIONS SEEKING BACKERS", etc.) render in
    Bebas Neue at 40 px
  - Campaign card titles render in DM Sans at 24 px (bold)
  - Section labels ("01 — PLATFORM IMPACT") render in Space Mono
  - Stat values ($4.2M, 127, etc.) render in Bebas Neue
  - Homepage MissionCard components show the 2 px orange-to-amber top accent bar
- **Tests**: `npm run test` (from repo root) passes with no regressions
