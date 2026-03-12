#!/usr/bin/env bash
set -euo pipefail

# Resolve merge conflicts on a single PR using the autonomous agent container.
# Usage: ./scripts/resolve-pr-conflicts.sh <pr-number>

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

# ── Require autonomous/.env ──────────────────────────────────
if [ ! -f "$REPO_ROOT/autonomous/.env" ]; then
  echo "ERROR: autonomous/.env not found. Copy .env.example and fill in values."
  exit 1
fi

# ── Validate argument ───────────────────────────────────────
if [ -z "${1:-}" ]; then
  echo "Usage: $0 <pr-number>"
  echo "Example: $0 123"
  exit 1
fi

PR_NUMBER="$1"

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "ERROR: PR number must be a positive integer, got: ${PR_NUMBER}"
  exit 1
fi

echo ">>> Resolving conflicts on PR #${PR_NUMBER}"

# ── Prepare log directory ────────────────────────────────────
mkdir -p "$REPO_ROOT/autonomous/logs/resolve-conflicts/${PR_NUMBER}"

# ── Launch container ─────────────────────────────────────────
export PR_NUMBER
cd "$REPO_ROOT/autonomous"
docker compose -f docker-compose.resolve.yml up --build --abort-on-container-exit
