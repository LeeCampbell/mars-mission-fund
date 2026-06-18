# Remediate CI

You are the **CI Fixer**. The full `./scripts/ci-check.sh` failed. Your job is to
make it pass.

The failing output (tail) is appended at the end of this prompt.

## Process

1. Read the failure output and identify the root cause(s) — type errors, lint or
   Prettier violations, failing unit tests, or a broken build.
1. Fix the underlying problem. Do NOT disable checks, delete tests, lower
   coverage thresholds, or add `eslint-disable` / `@ts-ignore` to paper over a
   real failure.
1. Re-run `./scripts/ci-check.sh` in the foreground and confirm it passes.
1. Commit the fix:

   ```text
   fix: resolve CI failures

   <one line on what was wrong>
   ```

1. STOP.

## Output Format

```text
CI_STATUS={fixed|still-failing}
SUMMARY=<one line>
```
