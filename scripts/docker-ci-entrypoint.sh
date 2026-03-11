#!/bin/bash
set -euo pipefail

# --- CI checks (no DB required) ---

echo "=== Type-check ==="
npx tsc -b --noEmit
npx tsc --noEmit -p packages/server/tsconfig.json

echo "=== Lint ==="
npm run lint

echo "=== Format check ==="
npm run format:check

echo "=== Markdown lint ==="
npm run lint:md

echo "=== Build ==="
npm run build

echo "=== Unit tests ==="
npm run test:coverage

echo "=== All CI checks passed ==="

# --- E2E tests (DB required) ---

echo "=== E2E tests ==="

# Run database migrations
echo "Running database migrations…"
dbmate -d ./packages/server/db/migrations -s ./packages/server/db/schema.sql up
echo "Migrations complete."

# Start the backend dev server in the background
npm run dev:server &

# Wait for backend to accept connections
echo "Waiting for backend…"
until curl -sf http://localhost:3001/v1/campaigns > /dev/null 2>&1; do
  sleep 1
done
echo "Backend is ready."

# Run Playwright e2e tests (Playwright starts the Vite dev server itself)
npx playwright test

echo "=== All checks passed ==="
