# Tasks: Issue #5 — Close milestone: Public Marketing Pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Update frontend.md Section 9.1 — document @fontsource font loading
  - **Goal**: Replace the manual WOFF2 download description in Section 9.1 with the `@fontsource` npm package approach that was actually implemented, plus decision rationale.
  - **Details**: In `specs/tech/frontend.md` Section 9.1 "Font Loading", the current text says "Font files served in WOFF2 format" and implies manual file management. Replace the font loading strategy bullet list with a description that: (1) states fonts are loaded via `@fontsource/bebas-neue`, `@fontsource/dm-sans`, and `@fontsource/space-mono` npm packages imported in `src/index.css`; (2) clarifies the files are still WOFF2 and self-hosted — bundled at build time via Vite, no runtime CDN request; (3) adds rationale: standardised font loading via npm avoids manual file management and provides controlled subsetting via the package's CSS imports. Preserve the `font-display` strategy for each font (swap/optional/swap) and the font preload hint for DM Sans. Follow one-sentence-per-line rule (L3-007).
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: Section 9.1 no longer references manually downloading files or "Font files served in WOFF2 format" as a bare bullet; it documents the @fontsource npm approach with rationale. No Tier 1 token or CDN references introduced. One sentence per line throughout.
  - **Brief ref**: Brief § Approach — Divergence 1; § Files to Create/Modify row 1.

- [x] TASK-02: Update frontend.md Section 2.1 — document inline CSSProperties styling pattern
  - **Goal**: Add a paragraph to Section 2.1 "Token Consumption" documenting that design system primitives and composite components use inline `React.CSSProperties` style objects with `var(--semantic-token)` references, and that Tailwind is not used for component-level styles.
  - **Details**: In `specs/tech/frontend.md` Section 2.1, after the existing lint rule list (after the `A build-time lint rule must enforce this constraint` paragraph and its bullet list), add a new paragraph block that: (1) states the implementation pattern — design system primitives define a `const xyzStyle: React.CSSProperties` object per visual state and apply it via the `style` prop; (2) states Tailwind is not used for component-level styles — it is imported for CSS reset and normalisation only; (3) adds rationale: inline style objects are co-located with the component, type-safe via `React.CSSProperties`, and structurally enforce the semantic token rule because the TypeScript type does not accept arbitrary strings that could be hardcoded colours. Follow one-sentence-per-line rule (L3-007).
  - **Files**: `specs/tech/frontend.md`
  - **Verify**: Section 2.1 contains explicit documentation of the inline `React.CSSProperties` pattern, a statement that Tailwind is not used for component-level styles, and the rationale paragraph. The existing token consumption rule and code block are untouched. No contradiction with L2-001 (Tier 2 token enforcement is preserved — the inline style approach is described as enforcing it).
  - **Brief ref**: Brief § Approach — Divergence 2; § Files to Create/Modify row 1.

- [x] TASK-03: Update tech-stack.md — clarify Tailwind CSS actual usage
  - **Goal**: Amend the Tailwind CSS row in the Frontend table of `specs/tech/tech-stack.md` to document the actual usage scope: CSS reset and global normalisation layer, not a component utility class system.
  - **Details**: In `specs/tech/tech-stack.md` in the Frontend table, the Tailwind CSS row currently says `Utility-first CSS framework` in the Purpose column. Add a clarifying note (either expand the Purpose cell inline or add a new Notes/Usage row immediately after) that states: Tailwind v4 is used as the CSS reset and normalisation layer only; component-level styling is done via inline CSS custom properties using `var()` references on Tier 2 semantic tokens, not Tailwind utility classes. Follow one-sentence-per-line rule (L3-007). The table must remain valid Markdown.
  - **Files**: `specs/tech/tech-stack.md`
  - **Verify**: The Tailwind CSS entry in the Frontend table no longer implies it is used for component styling. The clarification is legible in the rendered table. No other rows in the table are altered.
  - **Brief ref**: Brief § Approach — Divergence 2; § Files to Create/Modify row 2.

- [ ] TASK-04: Verify and update specs/README.md index accuracy
  - **Goal**: Confirm every `.md` file under `specs/` (excluding `README.md` itself) appears in the index tables with an accurate description; update any stale descriptions given the changes made in TASK-01 through TASK-03.
  - **Details**: Cross-check the full file list from the brief against the current index tables in `specs/README.md`: `product-vision-and-mission.md`, `standards/brand.md`, `standards/engineering.md`, `tech/architecture.md`, `tech/security.md`, `tech/reliability.md`, `tech/data-management.md`, `tech/frontend.md`, `tech/audit.md`, `tech/markdown.md`, `tech/tech-stack.md`, `tooling/github.md`, `domain/account.md`, `domain/campaign.md`, `domain/donor.md`, `domain/payments.md`, `domain/kyc.md`. For each file: verify it appears in the correct section table; verify the description still accurately reflects the file after TASK-01 through TASK-03 edits. In particular, check that the L3-005 (`tech/frontend.md`) description does not mention anything that would now be inaccurate (e.g., no explicit mention of manual font hosting), and that the L3-008 (`tech/tech-stack.md`) description still holds. Update any stale descriptions. Follow one-sentence-per-line rule (L3-007).
  - **Files**: `specs/README.md`
  - **Verify**: Running `find specs/ -name "*.md" | grep -v README.md` returns a list that is a subset of all entries in the README tables. No file is absent from the index. All descriptions accurately describe the current content of the referenced spec.
  - **Brief ref**: Brief § Scope — "Verify specs/README.md"; § Files to Create/Modify row 3.
