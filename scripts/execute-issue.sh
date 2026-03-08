#!/usr/bin/env bash
set -euo pipefail

# Execute all tasks in a single task file, one at a time.
# Usage: ./scripts/execute-issue.sh plan/public-marketing-pages/tasks/01-scaffolding.tasks.md

TASK_FILE="${1:?Usage: execute-issue.sh <task-file>}"
LOG_DIR=".logs"
TIMEOUT="${TIMEOUT_SECONDS:-1800}"

mkdir -p "$LOG_DIR"

if [ ! -f "$TASK_FILE" ]; then
  echo "ERROR: Task file not found: ${TASK_FILE}"
  exit 1
fi

ISSUE_NAME=$(basename "$TASK_FILE" .tasks.md)
echo "=== Executing issue: ${ISSUE_NAME} ==="

iteration=0
max_stuck=3
stuck_count=0

while grep -q '^\- \[ \]' "$TASK_FILE"; do
  iteration=$((iteration + 1))
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  LOG_FILE="${LOG_DIR}/${ISSUE_NAME}-${TIMESTAMP}.log"

  REMAINING=$(grep -c '^\- \[ \]' "$TASK_FILE")
  echo "--- Iteration ${iteration}: ${REMAINING} tasks remaining (${TASK_FILE}) ---"

  # Snapshot before
  BEFORE=$(grep -c '^\- \[ \]' "$TASK_FILE")

  # Invoke Claude to execute one task
  timeout "$TIMEOUT" claude \
    --dangerously-skip-permissions \
    --print \
    --verbose \
    -p "Follow ./prompts/EXECUTE.md for ${TASK_FILE}" \
    2>&1 | tee "$LOG_FILE" || true

  # Snapshot after
  AFTER=$(grep -c '^\- \[ \]' "$TASK_FILE" || echo 0)

  if [ "$BEFORE" -eq "$AFTER" ]; then
    stuck_count=$((stuck_count + 1))
    echo "!!! No progress (stuck ${stuck_count}/${max_stuck})"
    if [ "$stuck_count" -ge "$max_stuck" ]; then
      echo "ERROR: Agent stuck after ${max_stuck} consecutive attempts. Aborting."
      exit 1
    fi
  else
    stuck_count=0
  fi

  echo ">>> Tasks: ${BEFORE} → ${AFTER} remaining"
done

echo "=== All tasks complete for ${ISSUE_NAME} ==="
