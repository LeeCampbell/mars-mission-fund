# Tasks: Issue #32 — Add Vitest testing setup

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Install Vitest and testing dependencies
  - **Goal**: Add all required devDependencies to `package.json` and install them
  - **Details**: Run `npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom`. Verify the packages appear in `package.json` devDependencies and `node_modules`.
  - **Files**: `package.json`, `package-lock.json`
  - **Verify**: `node_modules/vitest` and `node_modules/@testing-library/react` exist; `npm ls vitest` exits 0
  - **Brief ref**: §Dependencies, §Approach step 1

- [x] TASK-02: Add npm test scripts to package.json
  - **Goal**: Expose `test`, `test:watch`, and `test:coverage` scripts
  - **Details**: Add to the `"scripts"` section of `package.json`:
    - `"test": "vitest run"`
    - `"test:watch": "vitest"`
    - `"test:coverage": "vitest run --coverage"`
  - **Files**: `package.json`
  - **Verify**: `npm run test --help` (or `cat package.json`) shows all three scripts present
  - **Brief ref**: §Approach step 5, §Files to Create/Modify

- [x] TASK-03: Configure Vitest in vite.config.ts
  - **Goal**: Wire Vitest into the existing Vite config with jsdom environment and v8 coverage thresholds
  - **Details**:
    1. Add `/// <reference types="vitest" />` as the very first line of `vite.config.ts`
    2. Add a `test` block inside `defineConfig` with: `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, and `coverage` block with `provider: 'v8'`, `include: ['src/**']`, `exclude: ['src/main.tsx', 'src/vite-env.d.ts']`, and thresholds of 80% for lines/functions/branches/statements
  - **Files**: `vite.config.ts`
  - **Verify**: `npm run build` still exits 0; `tsc -b` passes with no new type errors
  - **Brief ref**: §Approach step 2, §Verification

- [x] TASK-04: Create global jest-dom setup file
  - **Goal**: Register extended jest-dom matchers for all tests
  - **Details**: Create `src/test/setup.ts` containing a single line: `import '@testing-library/jest-dom'`. This file is referenced by `setupFiles` in `vite.config.ts`.
  - **Files**: `src/test/setup.ts` (create)
  - **Verify**: File exists at `src/test/setup.ts` with the import; `tsc -b` passes
  - **Brief ref**: §Approach step 3

- [ ] TASK-05: Write Button component smoke tests
  - **Goal**: Create passing tests covering all Button variants and edge cases
  - **Details**: Create `src/components/ui/Button.test.tsx` with explicit Vitest imports (`import { describe, it, expect } from 'vitest'`). Cover:
    1. Renders a `<button>` element with children (default `primary` variant)
    2. Renders an `<a>` element when `href` prop is provided
    3. Applies `disabled` attribute and `aria-disabled="true"` when `disabled` prop is set
    4. Renders `secondary` variant without throwing
    5. Renders `ghost` variant without throwing
    Use `render` and `screen` from `@testing-library/react`. Do not mock `document.createElement` — jsdom handles it.
  - **Files**: `src/components/ui/Button.test.tsx` (create)
  - **Verify**: `npm test` exits 0 with all 5 assertions green
  - **Brief ref**: §Approach step 4, §Verification

- [ ] TASK-06: Verify full test suite and coverage gate
  - **Goal**: Confirm all verification criteria from the brief pass end-to-end
  - **Details**: Run all four verification commands in sequence:
    1. `npm run build` — must exit 0
    2. `npm test` — all Button tests green, exits 0
    3. `npm run test:coverage` — exits 0 with ≥80% coverage on Button component
    4. `tsc -b` — no type errors
    Fix any issues discovered before marking complete.
  - **Files**: Any files needing fixes discovered during verification
  - **Verify**: All four commands exit 0 with no errors
  - **Brief ref**: §Verification
