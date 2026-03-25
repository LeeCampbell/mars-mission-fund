# Tasks: Issue #116 — Campaign lifecycle E2E tests

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Rebase feature branch onto main
  - **Goal**: Bring the feature branch up to date with main (commits #196–#202) so CI does not diverge
  - **Details**: Run `git fetch origin` then `git rebase origin/main`. Resolve any conflicts that arise — the only files touched by this branch are `e2e/campaign-lifecycle.spec.ts` and `packages/server/db/migrations/20260322000001_seed_lifecycle_test_campaigns.sql`, so conflicts should be minimal or absent. After the rebase, confirm both files are present and intact.
  - **Files**: *(no file changes — rebase only)*
  - **Verify**: `git log --oneline origin/main..HEAD` shows only the two branch commits; `git status` is clean
  - **Brief ref**: "What remains" section

- [ ] TASK-02: Run CI checks
  - **Goal**: Confirm type-check, lint, format, build, and unit tests all pass on the rebased branch
  - **Details**: Run `./scripts/ci-check.sh`. Fix any failures introduced by the rebase (e.g., import conflicts, type errors). Do NOT modify `e2e/campaign-lifecycle.spec.ts` or the seed migration unless a CI tool flags them directly.
  - **Files**: *(fix only if CI fails)*
  - **Verify**: `./scripts/ci-check.sh` exits 0
  - **Brief ref**: Verification section — CI checks

- [ ] TASK-03: Run full E2E suite including lifecycle tests
  - **Goal**: Verify all seven campaign-lifecycle tests pass against the full Docker stack
  - **Details**: Run `./scripts/e2e-check-docker.sh`. This starts a Dockerised Postgres, runs all migrations (including the seed migration), starts the backend + frontend, and executes all Playwright specs. All seven tests in `e2e/campaign-lifecycle.spec.ts` must pass:
    1. `creator submits a draft campaign`
    2. `reviewer approves a submitted campaign with notes`
    3. `creator launches an approved campaign`
    4. `reviewer rejects a campaign; creator sees Resubmit`
    5. `creator submits milestone evidence; admin verifies milestone`
    6. `creator requests cancellation; admin approves it`
    7. `creator can mark a notification as read`
  - **Files**: *(fix only if tests fail)*
  - **Verify**: `./scripts/e2e-check-docker.sh` exits 0; all 7 lifecycle tests reported as passed
  - **Brief ref**: Verification section — E2E
