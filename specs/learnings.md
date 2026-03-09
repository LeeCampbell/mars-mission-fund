# Learnings

## Issue #5: Missing .markdownlint.jsonc config file

- L3-007 Section 11.3 specifies a `.markdownlint.jsonc` at the repo root, but the file was absent.
- Running `npx markdownlint-cli2 "specs/**/*.md"` produced 1745 MD013 errors (all pre-existing) because the config disabling MD013 didn't exist.
- Fix: create `.markdownlint.jsonc` with the exact config shown in L3-007 Section 11.3 (MD013 disabled; MD060 padded; all other rules per spec). Zero violations immediately after.
