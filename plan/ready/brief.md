# Brief: Issue #55 — Unify ESLint, CI, and root config

## Goal

Since the frontend moved to `packages/client` (#61) and the backend moved to `packages/server` (#62), the root tooling has drifted: ESLint only covers client code (and still references the old `server/` ignore), root `package.json` scripts delegate to `@mmf/client` alone, and the CI pipeline validates only the frontend workspace.
This issue unifies ESLint into a single flat config covering both workspaces with appropriate per-package rule sets, updates root npm scripts to drive all workspaces via `--workspaces --if-present`, and updates the CI pipeline to validate build, test, and coverage across every package.
Prettier coverage is verified (no changes expected — the existing `.prettierrc` and `.prettierignore` already apply repo-wide).

## Scope

**In scope**:

- Update root `eslint.config.js` to cover `packages/client` (React + hooks rules) and `packages/server` (TypeScript-only rules, no React plugins) in a single flat config, removing the stale `server/` ignore
- Update root `package.json` scripts: `build`, `test`, `test:coverage` use `--workspaces --if-present`; `lint` and `lint:fix` run `eslint .` from root; remove now-redundant per-workspace delegation scripts
- Update `.github/workflows/ci.yml`: extend the `Type-check` step to also check `packages/server`; build and test:coverage steps automatically expand to all workspaces via the updated root scripts
- Confirm `.prettierrc` and `.prettierignore` are adequate for all packages (no source change expected)

**Out of scope**:

- Adding new ESLint rules beyond what already exist per package type
- Adding lint scripts to individual workspace `package.json` files (root `eslint .` covers all files)
- Consolidating per-package `vitest.config.ts` files
- Adding coverage thresholds to `packages/server/vitest.config.ts`
- Any feature or domain logic changes

## Approach

### 1. `eslint.config.js` (root)

Replace the current single-rule-set config (which ignores `server/`) with a multi-block flat config:

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['**/dist/', '**/node_modules/'] },
  // Base TypeScript rules for all packages
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  // Client-only: React rules applied only to packages/client
  {
    files: ['packages/client/**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  }
)
```

The server block is implicitly handled by the base TypeScript rules; no additional plugins are needed for Node.js files.

### 2. `package.json` (root)

Update scripts:

```json
{
  "build":         "npm run build --workspaces --if-present",
  "test":          "npm run test --workspaces --if-present",
  "test:coverage": "npm run test:coverage --workspaces --if-present",
  "lint":          "eslint .",
  "lint:fix":      "eslint . --fix"
}
```

Remove `lint: "npm run lint -w @mmf/client"` (replaced by root `eslint .`), `test:server` (subsumed by `--workspaces`). Keep `dev` and `dev:server` for local development convenience.
`format`, `format:check`, and `lint:md` remain unchanged.

### 3. `tsconfig.json` (root)

No change required. The root config already references `packages/client` (which has `composite: true`). Adding `packages/server` would require adding `composite: true` to the server tsconfig, which forces declaration emit and is unnecessary complexity. Instead, type-check the server separately in CI (see step 5).

### 3. `.github/workflows/ci.yml`

Two changes:

1. **Type-check step**: extend to also cover the server package:

   ```yaml
   - name: Type-check
     run: npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json
   ```

1. **Build and Test coverage steps**: no YAML changes needed — the updated root `package.json` scripts already use `--workspaces --if-present`, so CI automatically picks up all packages when it runs `npm run build` and `npm run test:coverage`.

### 4. Prettier verification

The existing `.prettierrc` (at repo root) and `.prettierignore` (excludes `node_modules/`, `dist/`, `build/`, `coverage/`, `.tsbuildinfo`, HTML brand file, and `*.md`) already apply to all files under `packages/`. No change required; this is a confirm-only step.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `eslint.config.js` | modify | Replace single-block config with multi-block flat config: base TS rules for all packages + React/hooks rules scoped to `packages/client/**`; remove stale `server/` ignore |
| `package.json` | modify | Update `build`, `test`, `test:coverage` to `--workspaces --if-present`; change `lint` to `eslint .`; remove `test:server` |
| `tsconfig.json` | no change | Root references only `packages/client`; server is type-checked separately in CI |
| `.github/workflows/ci.yml` | modify | Extend the `Type-check` step to also run `npx tsc --noEmit -p packages/server/tsconfig.json`; build and test:coverage steps automatically expand via updated root scripts |

## Dependencies

No new npm packages required. All ESLint plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `typescript-eslint`) are already in root `devDependencies`.

## Verification

- **Build**: `npm run build` from repo root succeeds and produces output for `packages/client`, `packages/server`, and `packages/shared`
- **Lint**: `npm run lint` from repo root passes with no errors across both packages
- **Type-check**: `npx tsc -b --noEmit` passes for client; `npx tsc --noEmit -p packages/server/tsconfig.json` passes for server
- **Tests**: `npm run test` from repo root passes for both `@mmf/client` and `@mmf/server`
- **Coverage**: `npm run test:coverage` from repo root produces coverage reports for both packages
- **Format**: `npm run format:check` still passes
- **CI**: All steps in `.github/workflows/ci.yml` pass on a clean checkout
