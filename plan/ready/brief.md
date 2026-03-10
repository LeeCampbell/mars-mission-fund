# Brief: Issue #80 — Fix typography tokens and font compliance

## Goal

The UX review (findings #3–#8, #13, #14) identified that the `--type-*` semantic token names are used as `font-family` values in components but do **not** exist as CSS custom properties, so they silently fall back to the body font (DM Sans) rather than resolving to the correct brand typefaces (Bebas Neue for display, Space Mono for mono).
This issue adds font-family shorthand tokens to `tokens.css`, fixes hardcoded font sizes in section heading and card title components, corrects the hero H1 responsive scaling, and verifies the homepage card accent bars render correctly.

## Scope

**In scope:**

- Add 13 `--type-*` font-family shorthand tokens to `tokens.css` (Tier 2 semantic layer) so `var(--type-hero)` etc. correctly resolve to the corresponding font-family identity token
- Fix hardcoded `36px` section heading font sizes in `FeaturedMissionsSection`, `HowItWorksSection`, and `StatsSection` to use `var(--type-section-heading-size)` (40px per spec)
- Fix hardcoded `18px` card title font sizes in `MissionCard` and `CampaignCard` to use `var(--type-card-title-size)` (24px per spec)
- Fix hero H1 responsive sizing: reduce mobile base to prevent 375px overflow; keep 96px at desktop
- Fix hero H1 letter-spacing to match spec (`--type-hero-spacing` = 0.03em; currently 0.02em)
- Visually verify homepage campaign card accent bars render correctly

**Out of scope:**

- Findings #1, #2, #9, #10, #11, #12, #15 (dead links, raw HTML in description, progress bar colour, forbidden copy, nested `<main>`, missing alt text, page titles)
- Changes to the brand spec or token architecture
- Adding new type scale entries not already in the spec
- Modifying test files unless existing tests break from the font-size changes

## Approach

### 1. Add font-family shorthand tokens to `tokens.css`

In the Tier 2 section (§2.8 Typography), add shorthand tokens that map each `--type-*` name to its font-family identity token.
These names exactly match how components already reference them via `fontFamily: 'var(--type-hero)'` etc., so adding the tokens immediately fixes rendering without touching component `fontFamily` properties.

Mappings (derived from brand.md §2.8):

| Token | Maps To | Font |
|---|---|---|
| `--type-hero` | `var(--font-display)` | Bebas Neue |
| `--type-page-title` | `var(--font-display)` | Bebas Neue |
| `--type-section-heading` | `var(--font-display)` | Bebas Neue |
| `--type-stat-value` | `var(--font-display)` | Bebas Neue |
| `--type-stat-value-compact` | `var(--font-display)` | Bebas Neue |
| `--type-card-title` | `var(--font-body)` | DM Sans |
| `--type-body` | `var(--font-body)` | DM Sans |
| `--type-body-small` | `var(--font-body)` | DM Sans |
| `--type-button` | `var(--font-body)` | DM Sans |
| `--type-label` | `var(--font-data)` | Space Mono |
| `--type-section-label` | `var(--font-data)` | Space Mono |
| `--type-data` | `var(--font-data)` | Space Mono |
| `--type-input-label` | `var(--font-data)` | Space Mono |

Add them in the `/* --- 2.8 Typography --- */` block, immediately after the existing comment `/* These semantic aliases make component code intent-expressive. */`.

### 2. Fix section heading font sizes (finding #7)

`FeaturedMissionsSection.tsx`, `HowItWorksSection.tsx`, and `StatsSection.tsx` each have a `headingStyle` with `fontSize: '36px'`.
Change to `fontSize: 'var(--type-section-heading-size)'` which resolves to 40px via `--text-2xl`.

### 3. Fix card title font sizes (finding #8)

`MissionCard.tsx` and `CampaignCard.tsx` each have a `titleStyle` with `fontSize: '18px'`.
Change to `fontSize: 'var(--type-card-title-size)'` which resolves to 24px via `--text-lg`.

### 4. Fix hero H1 responsive sizing (findings #6, #13)

In `HeroSection.tsx`, the injected CSS for `.hero-heading` currently starts at 48px base.
The problem: "CROWDFUNDING THE NEXT GIANT LEAP" at 48px Bebas Neue overflows a 375px viewport (`375 - 48px padding = 327px usable`).
Fix the injected styles to use a smaller mobile base and add an intermediate breakpoint:

```
base (≤ 639px):  32px   ← prevents 375px overflow
640px+:          48px
768px+:          72px
1280px+:         96px   ← var(--type-hero-size) = var(--text-4xl) = 96px per spec
```

Also fix `letter-spacing` from `0.02em` to `var(--type-hero-spacing)` = `0.03em` to match spec.

### 5. Verify card accent bars (finding #14)

The `Card` component already implements the accent bar correctly (`position: absolute`, `top: 0`, `height: 2px`, correct gradient).
`MissionCard` and `CampaignCard` both already pass `accent` to `<Card>`.
The visual verification step is to open `http://localhost:5173` and confirm the 2px gradient bar appears at the top of homepage mission cards.
No code changes are expected here — the issue is included to close the UX finding.

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `packages/client/src/tokens.css` | modify | Add 13 `--type-*` font-family shorthand tokens in Tier 2 §2.8 block |
| `packages/client/src/components/HeroSection.tsx` | modify | Fix base font size to 32px, add 640px breakpoint at 48px, fix letter-spacing to 0.03em |
| `packages/client/src/components/FeaturedMissionsSection.tsx` | modify | Change `headingStyle.fontSize` from `'36px'` to `'var(--type-section-heading-size)'` |
| `packages/client/src/components/HowItWorksSection.tsx` | modify | Change `headingStyle.fontSize` from `'36px'` to `'var(--type-section-heading-size)'` |
| `packages/client/src/components/StatsSection.tsx` | modify | Change `headingStyle.fontSize` from `'36px'` to `'var(--type-section-heading-size)'` |
| `packages/client/src/components/MissionCard.tsx` | modify | Change `titleStyle.fontSize` from `'18px'` to `'var(--type-card-title-size)'` |
| `packages/client/src/components/campaigns/CampaignCard.tsx` | modify | Change `titleStyle.fontSize` from `'18px'` to `'var(--type-card-title-size)'` |

## Dependencies

None — no new npm packages required.
All fixes are pure CSS token additions and inline style property corrections.

## Verification

- **Build**: `npm run build` succeeds from the repo root (or `npm run build -w packages/client`)
- **Type-check**: `npm run typecheck -w packages/client` passes (no new TypeScript issues — the changes are string values in `CSSProperties` objects)
- **Visual — desktop** (`http://localhost:5173`):
  - Hero H1 renders in Bebas Neue at ~96px on 1280px+ viewport
  - Section headings ("THE NUMBERS SO FAR", "FROM BACKER TO MISSION PARTNER", "MISSIONS SEEKING BACKERS") render in Bebas Neue at 40px
  - Mission card titles ("Lunar Regolith Harvester" etc.) render in DM Sans bold at 24px
  - Stat values ($4.2M, 127, 18,400, 94%) render in Bebas Neue at 40px
  - Section labels ("01 — PLATFORM IMPACT" etc.) render in Space Mono
  - Homepage mission cards show the 2px orange-to-amber accent bar at top
- **Visual — mobile** (375px viewport via browser DevTools):
  - Hero H1 wraps onto multiple lines without clipping or horizontal scroll
  - No horizontal overflow visible on the hero section
- **Tests**: `npm test -w packages/client` (existing test suite must continue to pass; no tests exercise font sizes so no failures expected)
