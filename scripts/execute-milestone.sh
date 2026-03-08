#!/usr/bin/env bash
set -euo pipefail

# Execute all issues in a milestone's task directory.
# Usage: ./scripts/execute-milestone.sh [plan/milestone-name]

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Auto-detect milestone if not specified
if [ -n "${1:-}" ]; then
  MILESTONE_DIR="$1"
else
  MILESTONE_DIR=$(find plan -mindepth 1 -maxdepth 1 -type d | head -1)
  if [ -z "$MILESTONE_DIR" ]; then
    echo "ERROR: No milestone directories found in plan/"
    exit 1
  fi
fi

TASKS_DIR="${MILESTONE_DIR}/tasks"
MILESTONE_NAME=$(basename "$MILESTONE_DIR")
UPSTREAM_BASE="${UPSTREAM_BASE_BRANCH:-main}"

echo "=== Executing milestone: ${MILESTONE_NAME} ==="
echo "=== Tasks directory: ${TASKS_DIR} ==="

if [ ! -d "$TASKS_DIR" ]; then
  echo "ERROR: Tasks directory not found: ${TASKS_DIR}"
  exit 1
fi

# Iterate task files in numbered order
PREV_BRANCH="$UPSTREAM_BASE"
for TASK_FILE in "$TASKS_DIR"/*.tasks.md; do
  [ -f "$TASK_FILE" ] || continue

  ISSUE_NAME=$(basename "$TASK_FILE" .tasks.md)
  BRANCH="feat/${MILESTONE_NAME}/${ISSUE_NAME}"

  echo ""
  echo "=========================================="
  echo "  Issue: ${ISSUE_NAME}"
  echo "  Branch: ${BRANCH}"
  echo "=========================================="

  # Create or checkout feature branch, stacking from previous
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git checkout "$BRANCH"
  else
    git checkout -b "$BRANCH" "$PREV_BRANCH"
  fi

  # Execute all tasks in this issue
  "$SCRIPTS_DIR/execute-issue.sh" "$TASK_FILE"

  # Push the branch
  git push origin "$BRANCH" --force-with-lease || true

  # Create PR if upstream config is available
  if [ -n "${UPSTREAM_REPO:-}" ]; then
    ISSUE_NUM=$(grep -oP '(?<=Issue:\s#)\d+' "$TASK_FILE" || echo "")
    PR_BODY="Automated PR for ${TASK_FILE}"
    if [ -n "$ISSUE_NUM" ]; then
      PR_BODY="${PR_BODY}\n\nCloses #${ISSUE_NUM}"
    fi

    GH_TOKEN="${GH_TOKEN_UPSTREAM:-$GH_TOKEN}" gh pr create \
      --repo "${UPSTREAM_REPO}" \
      --base "$UPSTREAM_BASE" \
      --head "${BRANCH}" \
      --title "feat: ${ISSUE_NAME}" \
      --body "$(echo -e "$PR_BODY")" \
      2>/dev/null || echo ">>> PR already exists or creation failed"
  fi

  PREV_BRANCH="$BRANCH"
done

echo ""
echo "=== Milestone ${MILESTONE_NAME} execution complete ==="
