#!/usr/bin/env bash
set -euo pipefail

# Start the autonomous agent in Docker.
# Usage: ./scripts/run.sh

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPTS_DIR/../autonomous"

if [ ! -f .env ]; then
  echo "ERROR: autonomous/.env not found. Copy .env.example and fill in values."
  exit 1
fi

docker compose up --build --abort-on-container-exit
