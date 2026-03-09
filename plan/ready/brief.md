# Brief: Issue #31 — Add linting and formatting

## Goal

Install and configure ESLint 9 (flat config), Prettier, and markdownlint-cli2 for the project.
Add npm scripts (`lint`, `lint:fix`, `format`, `format:check`, `lint:md`) so all code and documentation quality gates can be run and enforced in CI.
Fix all existing violations so the repository starts green on every tool.

## Scope

**In scope**:

- Install ESLint 9 with TypeScript and React plugins (flat config format)
- Install Prettier with `.prettierrc.json` and `.prettierignore`
- Install markdownlint-cli2 with `.markdownlint.jsonc` matching L3-007 Section 11.3 exactly
- Add `lint`, `lint:fix`, `format`, `format:check`, `lint:md` scripts to `package.json`
- Fix all ESLint violations in `src/`
- Format all `src/`, config, and root `.ts`/`.tsx`/`.js`/`.json` files with Prettier
- Fix all markdownlint violations in `**/*.md` (specs and root docs)
- `node_modules/` and `dist/` are excluded from all tools

**Out of scope**:

- CI/CD pipeline integration (separate issue)
- Pre-commit hooks (e.g., husky/lint-staged)
- Vitest or testing setup
- Backend code (no backend exists yet)
- Editor configuration files (`.editorconfig`, `.vscode/`)

## Approach

### 1. Install packages

Add to `devDependencies` in `package.json`:

- `eslint` (^9)
- `typescript-eslint` (flat config helper + TS plugin + parser)
- `eslint-plugin-react` (^7, flat config support)
- `eslint-plugin-react-hooks` (^5, flat config support)
- `prettier`
- `markdownlint-cli2`

### 2. ESLint config (`eslint.config.js`)

Use ESLint 9 flat config format.
`package.json` has `"type": "module"` so use `.js` extension with ESM imports.
Apply `tseslint.configs.recommended` for TypeScript rules.
Add `eslint-plugin-react` and `eslint-plugin-react-hooks`.
Disable `react/react-in-jsx-scope` (React 19 uses automatic JSX transform).
Ignore `dist/`, `node_modules/`.
Only lint `**/*.{ts,tsx}` files.

### 3. Prettier config (`.prettierrc.json`)

Match existing code style observed in `src/`:

- `singleQuote: true`
- `semi: false` (existing source files omit semicolons)
- `tabWidth: 2`
- `trailingComma: "es5"`
- `printWidth: 100`

`.prettierignore` should exclude `node_modules/`, `dist/`, `build/`, `coverage/`, `*.tsbuildinfo`, and `specs/standards/mars-mission-fund-brand.html` (generated HTML brand file).

### 4. markdownlint config (`.markdownlint.jsonc`)

Copy the exact configuration from L3-007 Section 11.3.
This is authoritative — do not deviate from the spec.

### 5. npm scripts

Add to `package.json` `"scripts"`:

```json
"lint":           "eslint .",
"lint:fix":       "eslint . --fix",
"format":         "prettier --write .",
"format:check":   "prettier --check .",
"lint:md":        "markdownlint-cli2 \"**/*.md\" \"#node_modules\""
```

### 6. Fix existing violations

Run `npm run lint:fix` and `npm run format` after installation to auto-fix.
Manually fix any remaining ESLint errors that cannot be auto-fixed.
Run `npm run lint:md` and fix markdownlint violations in `specs/**/*.md` and `README.md`.
The one-sentence-per-line rule (MD013 is disabled; no line-length limit) is the key markdown convention.

## Files to Create/Modify

| File                  | Action | Description                                            |
| --------------------- | ------ | ------------------------------------------------------ |
| `package.json`        | modify | Add 6 devDependencies, add 5 npm scripts               |
| `eslint.config.js`    | create | ESLint 9 flat config: TypeScript + React + React Hooks |
| `.prettierrc.json`    | create | Prettier config matching existing code style           |
| `.prettierignore`     | create | Exclude node_modules, dist, brand HTML file            |
| `.markdownlint.jsonc` | create | markdownlint config per L3-007 Section 11.3            |
| `src/**/*.{ts,tsx}`   | modify | Auto-fix ESLint and Prettier violations                |
| `**/*.md`             | modify | Fix markdownlint violations                            |

## Dependencies

No prerequisite issues — this is a root issue per the issue description.

**New npm packages** (all devDependencies):

- `eslint` ^9
- `typescript-eslint` ^8 (bundles parser, plugin, and config helpers)
- `eslint-plugin-react` ^7
- `eslint-plugin-react-hooks` ^5
- `prettier` ^3
- `markdownlint-cli2` ^0.17

## Verification

- **Build**: `npm run build` succeeds (no regressions)
- **Lint**: `npm run lint` exits 0 — no ESLint errors
- **Format check**: `npm run format:check` exits 0 — all files formatted
- **Markdown lint**: `npm run lint:md` exits 0 — no markdownlint violations
- **Fix scripts work**: `npm run lint:fix` and `npm run format` run without error
