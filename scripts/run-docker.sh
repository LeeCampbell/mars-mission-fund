#!/usr/bin/env bash
set -euo pipefail

# Run the app entirely inside Docker (DB + backend + frontend).
# Only requirement: Docker (with Compose v2).
# Access the app at http://localhost:5173

cd "$(dirname "$0")/.."

cleanup() {
  echo ""
  echo "Tearing down…"
  docker compose down -v
  echo "Done."
}
trap cleanup EXIT

docker compose up --build
