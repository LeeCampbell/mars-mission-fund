#!/usr/bin/env bash
set -euo pipefail

# Run the full local stack, execute Playwright e2e tests, then tear down.
# Exits 0 on success, non-zero on failure.

cleanup() {
  echo ""
  echo "Tearing down…"
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  docker compose -f docker-compose.dev.yml down
  echo "Done."
}
trap cleanup EXIT

# Install dependencies
npm ci

# Start local infrastructure (PostgreSQL)
docker compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until docker compose -f docker-compose.dev.yml exec -T db pg_isready -U mmf > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready."

# Database connection used by both dbmate and the server
export DATABASE_URL="postgresql://mmf:mmf@localhost:5432/mmf?sslmode=disable"

# Run database migrations
docker run --rm --network host \
  -e DATABASE_URL="${DATABASE_URL}" \
  -v "$(pwd)/packages/server/db:/db" \
  ghcr.io/amacneil/dbmate up

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
