# Tasks: Issue #5 — Close milestone: Public Marketing Pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Read source material and current spec state
  - **Goal**: Understand the exact current content of `specs/tech/frontend.md` and `plan/public-marketing-pages/BRIEF.md` sections 4.1–4.5 before making any edits.
  - **Details**: Read `specs/tech/frontend.md` in full. Read `plan/public-marketing-pages/BRIEF.md` sections 4.1–4.5. Note exact line numbers for each section to be modified: Section 1.2, Section 2.1, Section 9, Section 9.1, and the change log. Also read `specs/README.md` to confirm current file list.
  - **Files**: None (read-only)
  - **Verify**: You can cite the current text of each section targeted for modification and know the exact line numbers.
  - **Brief ref**: Approach — all steps (prerequisite)

- [x] TASK-02: Add directory structure to Section 1.2 of frontend.md
  - **Goal**: Document the concrete three-tier directory mapping under the Component-Based Architecture section.
  - **Details**: In `specs/tech/frontend.md` Section 1.2, after the existing component tier description, add the directory mapping: design system primitives → `src/components/ui/`; composite components → `src/components/`; page components → `src/pages/`. Follow one-sentence-per-line rule (L3-007). Do not alter surrounding text beyond what is needed.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: Section 1.2 lists all three directory paths. No sentence has more than one sentence on a line. Surrounding text is unchanged.
  - **Brief ref**: Step 1, paragraph 1

- [ ] TASK-03: Add Tailwind v4 CSS-first configuration pattern
  - **Goal**: Document the `@import "tailwindcss"` / `@theme` pattern and the rule that components use `var()` directly.
  - **Details**: Add a new subsection to Section 2 (or Section 9, whichever is more appropriate after reading the file) documenting: `@import "tailwindcss"` activates the framework; a `@theme` block maps semantic tokens to Tailwind utilities; components consume tokens via `var()` not Tailwind utilities; `@theme` is additive. Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: All four bullet points from the brief are present. One sentence per line. No contradiction with existing content.
  - **Brief ref**: Step 1, paragraph 3

- [ ] TASK-04: Add CSS file organisation note to Section 9.1
  - **Goal**: Document that `src/tokens.css`, `src/fonts.css`, and `src/index.css` are the three CSS files and how they relate.
  - **Details**: In `specs/tech/frontend.md` Section 9.1 (Font Loading), add a note on CSS file organisation: design tokens live in `src/tokens.css`; `@font-face` declarations in `src/fonts.css`; both are imported into `src/index.css` alongside the Tailwind import. Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: Section 9.1 mentions all three CSS files and their roles. One sentence per line.
  - **Brief ref**: Step 1, paragraph 2

- [ ] TASK-05: Add font-display rationale to Section 9.1
  - **Goal**: Explain why each `font-display` value was chosen for each font.
  - **Details**: In `specs/tech/frontend.md` Section 9.1, add rationale for each font after the existing table: Bebas Neue uses `optional` (display-only large headings; system fallback acceptable; avoids layout shift); DM Sans uses `swap` (body text; FOIT worse than FOUT); Space Mono uses `swap` (label/data font; flash of fallback preferable to invisible labels). Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: All three rationale entries are present with the stated reasons. One sentence per line.
  - **Brief ref**: Step 2

- [ ] TASK-06: Add Success button variant deferral note
  - **Goal**: Record that the Success button variant is a planned phased rollout, not a contradiction of L2-001.
  - **Details**: In `specs/tech/frontend.md` Section 2 (or the Component Library section), add a note stating: Success button variant implementation follows L2-001 Section 3.1 and is introduced when the first workflow requiring it is built — it is not a requirement for marketing-only pages. Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: The note is present. It references L2-001 Section 3.1. It does not modify L2-001. One sentence per line.
  - **Brief ref**: Step 3

- [ ] TASK-07: Add "layout shell" vocabulary definition
  - **Goal**: Define "layout shell" in `specs/tech/frontend.md` so the term is formally specified.
  - **Details**: Add the definition to an appropriate location in `specs/tech/frontend.md` (e.g., a Glossary section or inline where layout shell is first discussed): *Layout shell: the shared structural wrapper rendered on every page, consisting of the Header component, a `<main id="main-content">` element (skip-link target), and the Footer component, composed by the Layout component.* Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: The exact definition from the brief is present. One sentence per line.
  - **Brief ref**: Step 4

- [ ] TASK-08: Bump change log to v0.4
  - **Goal**: Record a version bump in the change log of `specs/tech/frontend.md` reflecting the additions made in TASK-02 through TASK-07.
  - **Details**: In the change log section of `specs/tech/frontend.md`, add a v0.4 entry summarising: directory structure added to Section 1.2; Tailwind v4 CSS-first pattern documented; CSS file organisation note added; font-display rationale added; Success variant deferral note added; layout shell defined. Follow one-sentence-per-line rule.
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: Change log contains a v0.4 entry. One sentence per line.
  - **Brief ref**: Step 1, last line

- [ ] TASK-09: Verify specs/README.md index completeness
  - **Goal**: Confirm every `.md` file under `specs/` has a corresponding entry in `specs/README.md`.
  - **Details**: Run `find specs/ -name "*.md"` (or use Glob) to list all spec files. Compare against entries in `specs/README.md`. If no new files were created, no changes are needed. If a new file was added, add it to the correct tier section in the index.
  - **Files**: `specs/README.md` (modify only if a new file was added)
  - **Verify**: Every file returned by the directory listing has an entry in `specs/README.md`. No entries are missing.
  - **Brief ref**: Step 5

- [ ] TASK-10: Run markdownlint and fix any violations
  - **Goal**: Ensure all edited spec files have zero markdownlint violations.
  - **Details**: Run `npx markdownlint-cli2 "specs/**/*.md"`. Fix any violations found in `specs/tech/frontend.md` (and `specs/README.md` if modified). Re-run until zero violations. Also do a final one-sentence-per-line check on all edited sections.
  - **Files**: `specs/tech/frontend.md` (and `specs/README.md` if modified)
  - **Verify**: `npx markdownlint-cli2 "specs/**/*.md"` exits with zero violations.
  - **Brief ref**: Verification section
