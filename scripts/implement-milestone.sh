#!/usr/bin/env bash
set -euo pipefail

# Start the autonomous agent in Docker for a given milestone.
# Usage: ./scripts/run.sh [milestone-title]

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

# ── Require autonomous/.env ──────────────────────────────────
if [ ! -f "$REPO_ROOT/autonomous/.env" ]; then
  echo "ERROR: autonomous/.env not found. Copy .env.example and fill in values."
  exit 1
fi

# Source .env to get UPSTREAM_REPO for milestone queries
set -a
# shellcheck disable=SC1091
source "$REPO_ROOT/autonomous/.env"
set +a

# ── Milestone selection ──────────────────────────────────────
if [ -n "${1:-}" ]; then
  # Title provided — look up its number
  MILESTONE_NUMBER=$(gh api "repos/${UPSTREAM_REPO}/milestones" --jq ".[] | select(.title == \"$1\") | .number")
  if [ -z "$MILESTONE_NUMBER" ]; then
    echo "ERROR: No milestone found with title: $1"
    exit 1
  fi
  echo ">>> Milestone: $1 (#${MILESTONE_NUMBER})"
else
  # No arg — query open milestones
  MILESTONES=$(gh api "repos/${UPSTREAM_REPO}/milestones?state=open" --jq '.[] | "\(.number)\t\(.title)"')

  if [ -z "$MILESTONES" ]; then
    echo "ERROR: No open milestones found in ${UPSTREAM_REPO}"
    exit 1
  fi

  COUNT=$(echo "$MILESTONES" | wc -l | tr -d ' ')

  if [ "$COUNT" -eq 1 ]; then
    # Auto-select the only milestone
    MILESTONE_NUMBER=$(echo "$MILESTONES" | cut -f1)
    MILESTONE_TITLE=$(echo "$MILESTONES" | cut -f2)
    echo ">>> Auto-selected milestone: ${MILESTONE_TITLE} (#${MILESTONE_NUMBER})"
  else
    # Prompt user to choose
    echo "Multiple open milestones found:"
    echo ""
    i=1
    while IFS=$'\t' read -r num title; do
      echo "  ${i}) ${title} (#${num})"
      i=$((i + 1))
    done <<< "$MILESTONES"
    echo ""
    read -rp "Select milestone [1-${COUNT}]: " CHOICE

    if [ -z "$CHOICE" ] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$COUNT" ]; then
      echo "ERROR: Invalid selection"
      exit 1
    fi

    MILESTONE_NUMBER=$(echo "$MILESTONES" | sed -n "${CHOICE}p" | cut -f1)
    MILESTONE_TITLE=$(echo "$MILESTONES" | sed -n "${CHOICE}p" | cut -f2)
    echo ">>> Selected milestone: ${MILESTONE_TITLE} (#${MILESTONE_NUMBER})"
  fi
fi

# ── Launch Docker ────────────────────────────────────────────
export MILESTONE_NUMBER
cd "$REPO_ROOT/autonomous"
docker compose up --build --abort-on-container-exit
