# Tasks: Issue #31 — Add linting and formatting

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add devDependencies and npm scripts to package.json
  - **Goal**: Register all new packages and scripts in `package.json` before installation
  - **Details**: Add 6 devDependencies (`eslint ^9`, `typescript-eslint`, `eslint-plugin-react ^7`, `eslint-plugin-react-hooks ^5`, `prettier ^3`, `markdownlint-cli2 ^0.17`) and 5 scripts (`lint`, `lint:fix`, `format`, `format:check`, `lint:md`) exactly as specified in the brief
  - **Files**: `package.json`
  - **Verify**: `package.json` contains all 6 new devDependencies and all 5 new scripts with correct values
  - **Brief ref**: Section "1. Install packages" and "5. npm scripts"

- [x] TASK-02: Create eslint.config.js
  - **Goal**: Configure ESLint 9 flat config with TypeScript and React support
  - **Details**: Create `eslint.config.js` using ESM imports (project has `"type": "module"`). Apply `tseslint.configs.recommended`, `eslint-plugin-react`, `eslint-plugin-react-hooks`. Disable `react/react-in-jsx-scope`. Target only `**/*.{ts,tsx}`. Ignore `dist/` and `node_modules/`
  - **Files**: `eslint.config.js`
  - **Verify**: File exists at repo root; imports and structure are valid flat config format
  - **Brief ref**: Section "2. ESLint config"

- [x] TASK-03: Create .prettierrc.json and .prettierignore
  - **Goal**: Configure Prettier to match existing code style and exclude generated/build files
  - **Details**: `.prettierrc.json` with `singleQuote: true`, `semi: false`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`. `.prettierignore` excluding `node_modules/`, `dist/`, `build/`, `coverage/`, `*.tsbuildinfo`, and `specs/standards/mars-mission-fund-brand.html`
  - **Files**: `.prettierrc.json`, `.prettierignore`
  - **Verify**: Both files exist at repo root with correct contents
  - **Brief ref**: Section "3. Prettier config"

- [ ] TASK-04: Create .markdownlint.jsonc
  - **Goal**: Configure markdownlint to enforce L3-007 spec rules
  - **Details**: Copy the exact configuration from L3-007 Section 11.3 (`specs/tech/markdown.md`). Include all rules: MD013 disabled, MD004 dash, MD029 one, MD007 indent 2, MD003 atx, MD046 fenced, MD048 backtick, MD049/MD050 asterisk, MD035 `---`, MD033 true, MD026 `".,;:!"`, MD060 padded. Do not deviate from the spec
  - **Files**: `.markdownlint.jsonc`
  - **Verify**: File exists at repo root and contents match Section 11.3 of `specs/tech/markdown.md` exactly
  - **Brief ref**: Section "4. markdownlint config"

- [ ] TASK-05: Install packages
  - **Goal**: Install all new devDependencies into node_modules
  - **Details**: Run `npm install` to install the 6 new packages added in TASK-01. Confirm no peer dependency errors for the listed versions
  - **Files**: `package-lock.json` (updated)
  - **Verify**: `node_modules/eslint`, `node_modules/prettier`, and `node_modules/markdownlint-cli2` exist; `npm install` exits 0
  - **Brief ref**: Section "1. Install packages"

- [ ] TASK-06: Auto-fix ESLint and Prettier violations
  - **Goal**: Automatically fix all auto-fixable style and lint issues in `src/`
  - **Details**: Run `npm run lint:fix` to apply ESLint auto-fixes, then run `npm run format` to apply Prettier formatting to all `src/`, config, and root `.ts`/`.tsx`/`.js`/`.json` files. Re-run in that order
  - **Files**: `src/**/*.{ts,tsx}`, `eslint.config.js`, `.prettierrc.json`, `package.json`, and any other formatted files
  - **Verify**: `npm run lint` exits 0 (or has only non-auto-fixable errors remaining); `npm run format:check` exits 0
  - **Brief ref**: Section "6. Fix existing violations"

- [ ] TASK-07: Manually fix remaining ESLint errors
  - **Goal**: Resolve any ESLint violations that could not be auto-fixed
  - **Details**: Run `npm run lint` and inspect output. For each remaining error in `src/`: fix type errors, unused variables, or other violations by editing the source files directly. Do not use `// eslint-disable` comments unless the violation is a false positive with clear justification
  - **Files**: `src/**/*.{ts,tsx}` (whichever files have violations)
  - **Verify**: `npm run lint` exits 0 with no errors or warnings
  - **Brief ref**: Section "6. Fix existing violations"

- [ ] TASK-08: Fix markdownlint violations in all .md files
  - **Goal**: Bring all Markdown files into compliance with L3-007
  - **Details**: Run `npm run lint:md` and fix all violations in `specs/**/*.md`, `README.md`, and any other `.md` files. Common fixes: one sentence per line (split multi-sentence lines), heading hierarchy, blank lines around headings/lists/tables, list marker style (`-`), fenced code blocks with language identifiers, no bare URLs, no trailing spaces, single blank lines only. Do not break content, only reformat
  - **Files**: `README.md`, `specs/**/*.md` (any files with violations)
  - **Verify**: `npm run lint:md` exits 0
  - **Brief ref**: Section "6. Fix existing violations"

- [ ] TASK-09: Final verification
  - **Goal**: Confirm all quality gates pass and no regressions were introduced
  - **Details**: Run the full verification suite in order: `npm run build`, `npm run lint`, `npm run format:check`, `npm run lint:md`. All four commands must exit 0. If any fail, diagnose and fix before marking complete
  - **Files**: None (read-only verification)
  - **Verify**: All four commands exit 0; no TypeScript build errors; no ESLint errors; all files Prettier-formatted; no markdownlint violations
  - **Brief ref**: Section "Verification"
