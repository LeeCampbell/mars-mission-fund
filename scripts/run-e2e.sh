#!/usr/bin/env bash
set -euo pipefail

# Run E2E tests with clean database state.
# Requires: DATABASE_URL, JWT_SECRET in environment; dbmate installed.
# Usage: ./scripts/run-e2e.sh [playwright-args...]

SERVER_PID=""

cleanup() {
  echo ">>> Stopping backend..."
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  echo ">>> Tearing down database..."
  # dbmate down rolls back one migration at a time; loop until all are rolled back
  # --no-dump-schema is a global flag and must come before the subcommand
  while true; do
    output=$(timeout 30 dbmate --no-dump-schema -d packages/server/db/migrations -s packages/server/db/schema.sql down 2>&1) || true
    echo "$output"
    # Stop when there is nothing left to roll back
    if ! echo "$output" | grep -q "Rolled back:"; then
      break
    fi
  done
  echo ">>> dbmate down succeeded."
  echo ">>> E2E teardown complete."
}
trap cleanup EXIT

echo ">>> Migrating database..."
dbmate -d packages/server/db/migrations -s packages/server/db/schema.sql up

# Start server directly (not via npm) so kill sends SIGTERM to the node
# process, triggering graceful shutdown and DB pool cleanup.
npx tsx packages/server/src/index.ts &
SERVER_PID=$!

echo ">>> Waiting for backend..."
until curl -sf http://localhost:3001/v1/campaigns > /dev/null 2>&1; do
  sleep 1
done
echo ">>> Backend is ready."

npx playwright test "$@"
