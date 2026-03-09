# Learnings

Tips and gotchas discovered by previous agents. Read this before starting work.

## Issue #1: Frontend scaffold (Issue #2) was missing

- The `plan/ready/tasks.md` for Issue #3 starts at TASK-01 (Button), but the frontend scaffold from Issue #2 had not been completed.
- There was no `src/` directory, `package.json`, or any project files.
- Resolution: Created the full scaffold as preparation before TASK-01:
  - `package.json` with React 19, Vite, Tailwind v4, React Router v7, TypeScript (strict)
  - `src/tokens.css` with all Tier 1 and Tier 2 CSS custom properties from L2-001
  - `src/index.css` with Tailwind v4 `@import "tailwindcss"`, font imports, base styles
  - Self-hosted fonts via `@fontsource/bebas-neue`, `@fontsource/dm-sans`, `@fontsource/space-mono` npm packages (no external CDN)
  - `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- The `@fontsource` npm approach satisfies self-hosted font requirement (no Google CDN at runtime).

## Issue #3: Prettier and markdownlint MD049 conflict

- Prettier (default) normalises Markdown emphasis to `_text_` (underscores), but markdownlint MD049 (configured to "asterisk") requires `*text*`.
- Running `prettier --write .` on `.md` files after fixing MD049 violations will silently revert them.
- Resolution: add `**/*.md` to `.prettierignore` so Prettier never touches Markdown files. Markdownlint is the single source of truth for `.md` style.

## Issue #2: Vite rejects `<noscript>` inside `<head>`

- Placing `<noscript>` in the `<head>` of `index.html` causes a parse5 build error: "disallowed-content-in-noscript-in-head".
- Resolution: Move `<noscript>` to `<body>` instead.
