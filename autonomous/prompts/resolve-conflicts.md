# Resolve Conflicts on PR #\_\_PR\_NUMBER\_\_

Use the `/resolve-pr-conflicts __PR_NUMBER__` skill to resolve merge conflicts on this PR.

After the skill completes and the branch is pushed, also run E2E tests to verify nothing is broken:

## E2E Verification

The database is already running (PostgreSQL at `db:5432`) with `DATABASE_URL` and `JWT_SECRET` set in the environment.

1. Start the backend server in the background:

```bash
cd /workspace/repo
npm run dev:server &
SERVER_PID=$!
sleep 5
```

1. Run E2E tests:

```bash
npx playwright test
```

1. Stop the backend:

```bash
kill $SERVER_PID 2>/dev/null || true
```

If E2E tests fail, investigate the failures and fix them. After fixing, re-run `./scripts/ci-check.sh` to confirm CI still passes, then push the fixes and re-run E2E tests.

**Important:** Do not skip E2E failures — they must pass before the task is complete.
