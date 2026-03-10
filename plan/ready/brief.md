# Brief: Issue #83 — Milestone housekeeping: ux-review-fixes

## Goal

Close out the "UX Review Fixes" milestone by updating the spec files to reflect the three
implementation changes made in Issues #80, #81, and #82: split CSS type-scale token
convention, HTML content rendering, and dynamic page-title management. Reconcile spec
divergences, capture decision rationale, strengthen the forbidden-language vocabulary
table, and bump spec versions to mark the work complete.

## Scope

**IN scope:**

- Update `specs/standards/brand.md` §2.8 to document the split-property token pattern
  (`--type-*-size`, `--type-*-weight`, `--type-*-leading`, `--type-*-spacing`,
  `--type-*-family`) that `tokens.css` already uses but the spec does not describe
- Add the 13 `--type-*-family` shorthand tokens introduced in Issue #80 to the brand
  spec's Tier 2 §2.8 typography table
- Document the hero H1 responsive sizing exception (32px → 48px → 72px → 96px breakpoint
  ladder) as a named exception to the closed type-scale rule
- Update `specs/standards/brand.md` §4.3 to enumerate the full "invest" word family
  ("invest", "investing", "investor", "investment") as explicitly forbidden, not just the
  noun form; add the approved replacements used in Issue #82 copy
- Update `specs/tech/frontend.md` §1.5 (or new sub-section) to document the
  `dangerouslySetInnerHTML` pattern for trusted server-sourced HTML campaign descriptions,
  including the security rationale that limits it to API data only
- Update `specs/tech/frontend.md` §1.4 (routing) to document the `routeTitles` map +
  `useEffect` document-title pattern introduced in Issue #81
- Update `specs/learnings.md` with any new implementation insights from this milestone
- Bump version numbers and add changelog entries in all modified spec files

**OUT of scope:**

- Any frontend code changes (all code changes were made in Issues #80–#82)
- Introducing new spec sections not directly motivated by Issues #80–#82
- Updating L4 domain specs (account, campaign, donor, payments, KYC) — none were affected
- Closing/merging the PRs for Issues #80–#82 (human action)
- Closing the milestone on GitHub (human action)

## Approach

All work is spec-only: read each affected spec file, make targeted edits, and update
changelogs. No npm packages, database changes, or code changes are needed.

**Task order:**

1. **brand.md §2.8 — split token convention**: The current spec table implies each
   `--type-*` name is a single CSS variable, but `tokens.css` uses a family of four
   property-specific variables (`-size`, `-weight`, `-leading`, `-spacing`) plus a new
   `-family` token. Add a prose rule documenting the split convention and extend the
   table to show the `-family` column for each entry.

2. **brand.md §4.3 — forbidden vocabulary**: The existing table has `"Investment"
   (without legal caveat)` in one row. Expand it to list all inflected forms ("invest",
   "investing", "investor", "investment") that triggered real copy violations in Issue #82,
   and update the "Use Instead" column with the spec-compliant alternatives confirmed in
   that PR.

3. **frontend.md — HTML rendering pattern**: Add a subsection under §1.5 or §1.2
   (component architecture) documenting: (a) `dangerouslySetInnerHTML` is permitted only
   for content sourced from the application's own API, (b) raw user-supplied HTML must
   never be rendered this way (security boundary), (c) the pattern is currently used for
   `campaign.description` in `CampaignDetailPage`.

4. **frontend.md — page-title pattern**: Add to §1.4 (routing) a note on how page titles
   are managed: a static `routeTitles` map in `Layout.tsx` for known routes and a
   `useEffect` in page components for dynamic titles (e.g. campaign title). Document the
   title format: `<Page Name> — Mars Mission Fund`.

5. **learnings.md + spec changelogs**: Add any new learnings from the milestone (split
   token naming convention, responsive hero type scaling). Bump `Version` in brand.md and
   frontend.md and append changelog rows.

## Files to Create/Modify

| File                         | Action | Description                                                                                        |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `specs/standards/brand.md`   | modify | §2.8: document split token convention, add `-family` column; §4.3: expand "invest" word family    |
| `specs/tech/frontend.md`     | modify | Add HTML rendering pattern (security boundary); add page-title management pattern under §1.4      |
| `specs/learnings.md`         | modify | Add new implementation insights from this milestone                                                |

## Dependencies

None. All code changes were made in PRs #89, #90, #91. This issue is pure spec authoring.

## Verification

- **Build**: `npm run build` succeeds (no code changes; build must remain green)
- **Lint**: `npm run lint` passes (includes markdownlint on all `.md` files)
- **Visual**: No browser check required — spec-only changes
- **Spec consistency**: Each modified spec has an updated `Version` field and a changelog
  entry dated today (2026-03-10); the new prose matches the actual `tokens.css` and
  component implementation
