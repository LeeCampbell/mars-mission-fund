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
  dbmate -d packages/server/db/migrations -s packages/server/db/schema.sql down
  echo ">>> E2E teardown complete."
}
trap cleanup EXIT

echo ">>> Migrating database..."
dbmate -d packages/server/db/migrations -s packages/server/db/schema.sql up

npm run dev:server &
SERVER_PID=$!

echo ">>> Waiting for backend..."
until curl -sf http://localhost:3001/v1/campaigns > /dev/null 2>&1; do
  sleep 1
done
echo ">>> Backend is ready."

npx playwright test "$@"
