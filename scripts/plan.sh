#!/usr/bin/env bash
set -euo pipefail

# Start an interactive planning session for a milestone.
# The agent follows PLAN.md — Socratic elicitation, BRIEF.md,
# GitHub Milestone and Issues. No code is written.
#
# Usage:
#   ./scripts/plan.sh
#   ./scripts/plan.sh "Build the code review plugin"

REQUEST="${1:-}"

if [ -n "$REQUEST" ]; then
  echo "Follow ./scripts/PLAN.md — ${REQUEST}" \
    | claude 2>&1
else
  echo "Follow ./scripts/PLAN.md" \
    | claude 2>&1
fi

# Clean up local planning files — agents check out origin/main fresh
# and never see these, so they just clutter the host working tree.
if [ -d plan ]; then
  rm -rf plan
  echo "Cleaned up plan/ directory."
fi
