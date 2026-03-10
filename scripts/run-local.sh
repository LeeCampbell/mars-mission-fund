#!/usr/bin/env bash
set -euo pipefail

# Start the full local development environment.
# Prerequisites: Node.js 22.x, Docker

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

# Run database migrations
docker run --rm --network host \
  -e DATABASE_URL="postgresql://mmf:mmf@localhost:5432/mmf?sslmode=disable" \
  -v "$(pwd)/packages/server/db:/db" \
  ghcr.io/amacneil/dbmate up

# Start the backend dev server in the background
npm run dev:server &

# Start the frontend dev server
npm run dev
