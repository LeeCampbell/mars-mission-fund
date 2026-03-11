# Tasks: Issue #83 — Milestone housekeeping: ux-review-fixes

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Update brand.md §2.8 — document split token convention and add -family column
  - **Goal**: Align the spec's typography token table with how `tokens.css` actually defines CSS variables (four property-specific suffixes: `-size`, `-weight`, `-leading`, `-spacing`) and add the new `-family` tokens introduced in Issue #80.
  - **Details**:
    - Read `specs/standards/brand.md` and `src/styles/tokens.css` (or equivalent) to confirm the exact token names in use.
    - In §2.8, add a prose rule explaining the split-property convention: each type-scale entry expands into `--type-*-size`, `--type-*-weight`, `--type-*-leading`, `--type-*-spacing`, and `--type-*-family`.
    - Extend the §2.8 typography table to include a `-family` column (or rows) for each scale entry, listing the 13 `--type-*-family` shorthand tokens.
    - Add a named exception block documenting the hero H1 responsive sizing ladder: 32px → 48px → 72px → 96px, noting this is an approved exception to the closed type-scale rule.
  - **Files**: `specs/standards/brand.md`
  - **Verify**: The §2.8 prose mentions all five suffixes; the table contains a `-family` entry for each scale; the hero H1 exception is documented by name.
  - **Brief ref**: Scope bullets 1–3; Approach step 1

- [x] TASK-02: Update brand.md §4.3 — expand "invest" forbidden-word family
  - **Goal**: Strengthen the forbidden-language vocabulary table so all inflected forms of "invest" are explicitly listed with spec-compliant alternatives.
  - **Details**:
    - Read `specs/standards/brand.md` §4.3 to see the current table structure.
    - Replace (or expand) the single `"Investment" (without legal caveat)` row with four rows covering: "invest", "investing", "investor", "investment".
    - Populate the "Use Instead" column for each row with the approved alternatives confirmed in Issue #82 (e.g. "donate", "donating", "donor", "donation" or similar copy used in that PR).
  - **Files**: `specs/standards/brand.md`
  - **Verify**: §4.3 table contains exactly four rows for the invest-family; each has a non-empty "Use Instead" value; no original row is deleted without replacement.
  - **Brief ref**: Scope bullet 4; Approach step 2

- [x] TASK-03: Update frontend.md — document dangerouslySetInnerHTML HTML rendering pattern
  - **Goal**: Record the security boundary rule and approved usage pattern for `dangerouslySetInnerHTML` so future developers know when it is and is not acceptable.
  - **Details**:
    - Read `specs/tech/frontend.md` to find §1.2 (component architecture) or §1.5 and determine the best insertion point for a new subsection.
    - Add a subsection (e.g. "Trusted HTML Rendering") that states:
      (a) `dangerouslySetInnerHTML` is permitted only for content sourced from the application's own API.
      (b) Raw user-supplied HTML must never be rendered this way (XSS risk).
      (c) Current usage: `campaign.description` in `CampaignDetailPage`.
    - Keep the security rationale concise but explicit.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: The new subsection exists under the correct parent section; it names `CampaignDetailPage` as the current usage; it explicitly forbids user-supplied HTML.
  - **Brief ref**: Scope bullet 5; Approach step 3

- [x] TASK-04: Update frontend.md §1.4 — document page-title management pattern
  - **Goal**: Capture the `routeTitles` map + `useEffect` pattern introduced in Issue #81 so it is discoverable and followed by future developers.
  - **Details**:
    - Read `specs/tech/frontend.md` §1.4 (routing) to find the right insertion point.
    - Add a note or sub-bullet describing:
      - A static `routeTitles` map in `Layout.tsx` maps known route paths to title strings.
      - Page components use a `useEffect` to set `document.title` for dynamic titles (e.g. a campaign's name).
      - Title format: `<Page Name> — Mars Mission Fund`.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: §1.4 contains the `routeTitles` map description; the `useEffect` pattern is mentioned; the title format string is present verbatim.
  - **Brief ref**: Scope bullet 6; Approach step 4

- [ ] TASK-05: Update learnings.md, bump versions, and add changelog entries
  - **Goal**: Close out the milestone by recording new insights in `learnings.md` and updating the `Version` field and changelog in every modified spec file.
  - **Details**:
    - Read `specs/learnings.md` and add entries for:
      - Split token naming convention (four property-specific suffixes per type-scale entry).
      - Responsive hero type scaling as a named exception pattern (not a violation of closed type-scale).
    - In `specs/standards/brand.md`: bump the `Version` field (patch increment) and append a changelog row dated 2026-03-10 summarising the §2.8 and §4.3 changes.
    - In `specs/tech/frontend.md`: bump the `Version` field (patch increment) and append a changelog row dated 2026-03-10 summarising the HTML rendering and page-title additions.
    - Run `npm run lint` and `npm run build` to confirm no regressions.
  - **Files**: `specs/learnings.md`, `specs/standards/brand.md`, `specs/tech/frontend.md`
  - **Verify**: `npm run lint` and `npm run build` both pass; each modified spec has an updated `Version` and a changelog entry dated 2026-03-10; `learnings.md` contains the two new entries.
  - **Brief ref**: Scope bullet 7–8; Approach step 5
