# Resolve Conflicts

Use the `/resolve-pr-conflicts __PR_NUMBER__` skill to resolve merge conflicts on this PR.

After the skill completes and the branch is pushed, also run E2E tests to verify nothing is broken:

## E2E Verification

```bash
cd /workspace/repo
./scripts/run-e2e.sh
```

If E2E tests fail, investigate and fix. Re-run `./scripts/ci-check.sh` then `./scripts/run-e2e.sh`.
