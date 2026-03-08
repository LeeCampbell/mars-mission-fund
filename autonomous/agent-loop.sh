#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/workspace/repo"
SCRIPTS_DIR="${REPO_DIR}/scripts"
LOG_DIR="${REPO_DIR}/.logs"
SCREENSHOT_DIR="/screenshots"

mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"
cd "$REPO_DIR"

iteration=0

while [ "$iteration" -lt "${MAX_ITERATIONS}" ]; do
  iteration=$((iteration + 1))
  echo "=== Iteration ${iteration}/${MAX_ITERATIONS} — $(date -Iseconds) ==="

  # ── State: pick-issue ──────────────────────────────────────
  # Find first task file with unchecked boxes
  TASK_FILE=""
  for f in plan/*/tasks/*.tasks.md; do
    [ -f "$f" ] || continue
    if grep -q '^\- \[ \]' "$f"; then
      TASK_FILE="$f"
      break
    fi
  done

  if [ -z "$TASK_FILE" ]; then
    echo ">>> All tasks complete. Nothing left to do."
    break
  fi

  echo ">>> Picked task file: ${TASK_FILE}"

  # Derive branch name from task file
  MILESTONE_DIR=$(basename "$(dirname "$(dirname "$TASK_FILE")")")
  ISSUE_NAME=$(basename "$TASK_FILE" .tasks.md)
  BRANCH="feat/${MILESTONE_DIR}/${ISSUE_NAME}"

  # ── State: execute-tasks ───────────────────────────────────
  # Checkout or create feature branch
  git fetch upstream
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git checkout "$BRANCH"
    git merge "upstream/${UPSTREAM_BASE_BRANCH}" --no-edit || true
  else
    git checkout -b "$BRANCH" "upstream/${UPSTREAM_BASE_BRANCH}"
  fi

  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  LOG_FILE="${LOG_DIR}/${ISSUE_NAME}-${TIMESTAMP}.log"

  echo ">>> Executing tasks in ${TASK_FILE} on branch ${BRANCH}"
  echo ">>> Log: ${LOG_FILE}"

  # Count unchecked before
  BEFORE=$(grep -c '^\- \[ \]' "$TASK_FILE" || echo 0)

  # Invoke Claude to execute one task
  timeout "${TIMEOUT_SECONDS}" claude \
    --dangerously-skip-permissions \
    --print \
    --verbose \
    -p "Follow ./prompts/EXECUTE.md for ${TASK_FILE}" \
    2>&1 | tee "$LOG_FILE" || true

  # Count unchecked after
  AFTER=$(grep -c '^\- \[ \]' "$TASK_FILE" || echo 0)

  echo ">>> Tasks remaining: ${BEFORE} → ${AFTER}"

  # Stuck detection
  if [ "$BEFORE" -eq "$AFTER" ]; then
    echo "!!! No progress made — agent may be stuck. Skipping to next iteration."
  fi

  # Push progress
  git push origin "$BRANCH" --force-with-lease 2>/dev/null || true

  # ── State: create-pr ───────────────────────────────────────
  # If all tasks in this file are done, verify build and create PR
  REMAINING=$(grep -c '^\- \[ \]' "$TASK_FILE" || echo 0)
  if [ "$REMAINING" -eq 0 ]; then
    echo ">>> All tasks done in ${TASK_FILE}. Running build verification..."

    # Build verification
    if [ -f package.json ]; then
      npm run build 2>&1 | tee -a "$LOG_FILE" || echo "!!! Build failed"
    fi

    # Screenshot capture (Playwright MCP handles this in Claude session)
    echo ">>> Creating PR for ${BRANCH}"

    # Extract issue number from task file header
    ISSUE_NUM=$(grep -oP '(?<=Issue:\s#)\d+' "$TASK_FILE" || echo "")
    PR_BODY="Automated PR for ${TASK_FILE}"
    if [ -n "$ISSUE_NUM" ]; then
      PR_BODY="${PR_BODY}\n\nCloses #${ISSUE_NUM}"
    fi

    GH_TOKEN="${GH_TOKEN_UPSTREAM}" gh pr create \
      --repo "${UPSTREAM_REPO}" \
      --base "${UPSTREAM_BASE_BRANCH}" \
      --head "$(echo "$FORK_URL" | sed 's|github.com/||;s|/.*||'):${BRANCH}" \
      --title "feat: ${ISSUE_NAME}" \
      --body "$(echo -e "$PR_BODY")" \
      2>&1 | tee -a "$LOG_FILE" || echo "!!! PR creation failed (may already exist)"
  fi

  # Cooldown
  if [ "$iteration" -lt "${MAX_ITERATIONS}" ]; then
    echo ">>> Cooling down for ${COOLDOWN_SECONDS}s..."
    sleep "${COOLDOWN_SECONDS}"
  fi
done

echo "=== Agent loop finished after ${iteration} iterations ==="
