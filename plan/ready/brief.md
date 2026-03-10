# Brief: Issue #82 — Replace forbidden language in page copy

## Goal

Replace all occurrences of investment-related language ("invest", "investment", "investing",
"investor") on the `/about` and `/contact` pages with spec-compliant alternatives
("contribution", "backing", "backer", "funding").
The brand spec (L2-001 §4.3) explicitly forbids "Investment (without legal caveat)" due to
regulatory risk, as contributions are not equity.

## Scope

- **IN scope**
  - `AboutPage.tsx`: replace 3 forbidden-language occurrences (lines 66, 94, 145)
  - `ContactPage.tsx`: replace 1 forbidden-language occurrence (line 144)
  - Replacement copy must maintain brand voice per L2-001 §4.1 (bold, human, mission-metaphor language)

- **OUT of scope**
  - Changes to any other pages (HomePage, CampaignsPage, CampaignDetailPage, etc.)
  - Styling, layout, or structural changes
  - Adding tests for page copy
  - Modifying spec documents

## Approach

All four violations are in static string/JSX copy — no logic changes needed.
Apply minimal, targeted replacements that preserve sentence structure and brand tone.

Specific replacements:

| File | Line | Current text (excerpt) | Replacement |
|------|------|------------------------|-------------|
| `AboutPage.tsx` | 66 | `Space investment is no longer reserved for billionaires` | `Space exploration funding is no longer reserved for billionaires` |
| `AboutPage.tsx` | 94 | `co-investing in breakthrough technologies` | `co-funding breakthrough technologies` |
| `AboutPage.tsx` | 145 | `Backers invest in outcomes they believe in` | `Backers fund outcomes they believe in` |
| `ContactPage.tsx` | 144 | `an investor seeking opportunities` | `a backer seeking opportunities` |

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/pages/AboutPage.tsx` | modify | Replace 3 forbidden-language strings in static copy |
| `packages/client/src/pages/ContactPage.tsx` | modify | Replace 1 forbidden-language string in static copy |

## Dependencies

None — pure copy changes, no npm packages or external services required.

## Verification

- **Build**: `npm run build` succeeds (no TypeScript or lint errors)
- **Visual**: At `http://localhost:5173/about` — confirm none of "invest", "investment",
  "investing", "investor" appear in page text; brand voice reads naturally
- **Visual**: At `http://localhost:5173/contact` — confirm "investor" is replaced with "backer"
  and the sentence still reads naturally
- **Search**: `grep -ri "invest" packages/client/src/pages/AboutPage.tsx packages/client/src/pages/ContactPage.tsx` returns no matches
