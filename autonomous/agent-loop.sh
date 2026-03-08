#!/usr/bin/env bash
set -euo pipefail

# Agent loop state machine for a single GitHub issue.
# Receives: ISSUE_NUMBER, ISSUE_TITLE, BRANCH, UPSTREAM_REPO, UPSTREAM_BASE_BRANCH
# Exit codes: 0 = issue complete (PR created), 1 = needs another iteration, 2 = stuck

REPO_DIR="/workspace/repo"
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="${REPO_DIR}/.logs"
SCREENSHOT_DIR="/screenshots"

mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"
cd "$REPO_DIR"

TIMEOUT="${TIMEOUT_SECONDS:-1800}"

# ── State detection ──────────────────────────────────────────
determine_state() {
  if [ -d "plan/done" ]; then
    echo "done"
  elif [ -f "plan/ready/tasks.md" ]; then
    # Check if all tasks are checked
    if grep -q '^\- \[ \]' "plan/ready/tasks.md"; then
      echo "execute-tasks"
    else
      echo "create-pr"
    fi
  elif [ -f "plan/ready/brief.md" ]; then
    echo "create-tasks"
  elif [ -f "plan/planning/brief-review.md" ]; then
    echo "apply-review"
  else
    echo "review-brief"
  fi
}

STATE=$(determine_state)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUMBER}-${STATE}-${TIMESTAMP}.log"

echo ">>> State: ${STATE} for issue #${ISSUE_NUMBER}"
echo ">>> Log: ${LOG_FILE}"

case "$STATE" in

  review-brief)
    mkdir -p plan/planning
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/review-brief.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}" \
      2>&1 | tee "$LOG_FILE" || true

    # Check if brief was created and approved (moved to ready)
    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Brief approved, ready for task creation"
    elif [ -f "plan/planning/brief.md" ]; then
      echo ">>> Brief written, needs review"
    else
      echo "!!! No brief produced"
      exit 2
    fi
    exit 1
    ;;

  apply-review)
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/apply-review.md")" \
      2>&1 | tee "$LOG_FILE" || true

    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Review applied, brief approved"
    else
      echo "!!! Review not applied"
      exit 2
    fi
    exit 1
    ;;

  create-tasks)
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/create-tasks.md")" \
      2>&1 | tee "$LOG_FILE" || true

    if [ -f "plan/ready/tasks.md" ]; then
      echo ">>> Tasks created"
    else
      echo "!!! No tasks produced"
      exit 2
    fi
    exit 1
    ;;

  execute-tasks)
    # Count unchecked before
    BEFORE=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || echo 0)

    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/execute-tasks.md")" \
      2>&1 | tee "$LOG_FILE" || true

    # Count unchecked after
    AFTER=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || echo 0)
    echo ">>> Tasks remaining: ${BEFORE} → ${AFTER}"

    # Stuck detection
    if [ "$BEFORE" -eq "$AFTER" ]; then
      echo "!!! No progress made — agent may be stuck"
      exit 2
    fi

    # Push progress
    git push origin "$BRANCH" --force-with-lease 2>/dev/null || true

    # Check if more tasks remain
    if [ "$AFTER" -gt 0 ]; then
      exit 1
    fi

    # All tasks done — fall through to next iteration for create-pr
    exit 1
    ;;

  create-pr)
    # Push the branch
    git push origin "$BRANCH" --force-with-lease || true

    # Let Claude create the PR with a proper description
    FORK_OWNER=$(echo "$FORK_URL" | sed 's|github.com/||;s|/.*||')

    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/create-pr.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}
Base branch: ${UPSTREAM_BASE_BRANCH}
Head: ${FORK_OWNER}:${BRANCH}
Branch: ${BRANCH}" \
      2>&1 | tee "$LOG_FILE" || true

    # Archive plan
    mkdir -p plan/done
    if [ -d "plan/ready" ]; then
      mv plan/ready/* plan/done/ 2>/dev/null || true
    fi

    echo ">>> PR created for issue #${ISSUE_NUMBER}"
    exit 0
    ;;

  done)
    echo ">>> Issue #${ISSUE_NUMBER} already completed"
    exit 0
    ;;

esac
