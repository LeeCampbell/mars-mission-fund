#!/usr/bin/env bash
set -euo pipefail

# Agent loop state machine for a single GitHub issue.
# Receives: ISSUE_NUMBER, ISSUE_TITLE, BRANCH, FORK_URL, UPSTREAM_REPO, UPSTREAM_BASE_BRANCH
# Exit codes: 0 = issue complete (PR created), 1 = needs another iteration, 2 = stuck

REPO_DIR="/workspace/repo"
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="${REPO_DIR}/.logs"
SCREENSHOT_DIR="/screenshots"

mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"
cd "$REPO_DIR"

TIMEOUT="${TIMEOUT_SECONDS:-1800}"

# ── Validate required env vars ───────────────────────────────
for var in ISSUE_NUMBER ISSUE_TITLE BRANCH FORK_URL UPSTREAM_REPO UPSTREAM_BASE_BRANCH; do
  if [ -z "${!var:-}" ]; then
    echo "!!! Missing required env var: ${var}"
    exit 2
  fi
done

FORK_OWNER=$(echo "$FORK_URL" | sed 's|github.com/||;s|/.*||')
if [ -z "$FORK_OWNER" ]; then
  echo "!!! Could not extract fork owner from FORK_URL: ${FORK_URL}"
  exit 2
fi

# ── State detection ──────────────────────────────────────────
# Uses plan/.state lock file as the primary indicator when present,
# falling back to filesystem inference for recovery.
determine_state() {
  if [ -f "plan/.state" ]; then
    cat "plan/.state"
    return
  fi

  if [ -d "plan/done" ]; then
    echo "done"
  elif [ -f "plan/ready/tasks.md" ]; then
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
    echo "create-brief"
  fi
}

set_state() {
  mkdir -p plan
  echo "$1" > plan/.state
}

clear_state() {
  rm -f plan/.state
}

STATE=$(determine_state)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUMBER}-${STATE}-${TIMESTAMP}.log"

echo ">>> State: ${STATE} for issue #${ISSUE_NUMBER}"
echo ">>> Log: ${LOG_FILE}"

case "$STATE" in

  create-brief)
    set_state "create-brief"
    mkdir -p plan/planning
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/create-brief.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}" \
      2>&1 | tee "$LOG_FILE" || true

    # Check if brief was created and approved (moved to ready)
    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Brief approved, ready for task creation"
      clear_state
    elif [ -f "plan/planning/brief.md" ]; then
      echo ">>> Brief written, needs review"
      clear_state
    else
      echo "!!! No brief produced"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  apply-review)
    set_state "apply-review"
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/apply-review.md")" \
      2>&1 | tee "$LOG_FILE" || true

    if [ -f "plan/ready/brief.md" ]; then
      echo ">>> Review applied, brief approved"
      clear_state
    else
      echo "!!! Review not applied"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  create-tasks)
    set_state "create-tasks"
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/create-tasks.md")" \
      2>&1 | tee "$LOG_FILE" || true

    if [ -f "plan/ready/tasks.md" ]; then
      echo ">>> Tasks created"
      clear_state
    else
      echo "!!! No tasks produced"
      clear_state
      exit 2
    fi
    exit 1
    ;;

  execute-tasks)
    set_state "execute-tasks"
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
      clear_state
      exit 2
    fi

    # Push progress — fail loudly so we know about conflicts
    if ! git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE"; then
      echo "!!! Push failed — branch may have diverged"
    fi

    clear_state

    # Check if more tasks remain
    if [ "$AFTER" -gt 0 ]; then
      exit 1
    fi

    # All tasks done — fall through to next iteration for create-pr
    exit 1
    ;;

  create-pr)
    set_state "create-pr"

    # Push the branch — fail loudly
    if ! git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE"; then
      echo "!!! Push failed — branch may have diverged"
    fi

    # Let Claude create the PR with a proper description
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

    # Archive plan (script owns this, not the prompt)
    mkdir -p plan/done
    if [ -d "plan/ready" ]; then
      mv plan/ready/* plan/done/ 2>/dev/null || true
    fi

    clear_state
    echo ">>> PR created for issue #${ISSUE_NUMBER}"
    exit 0
    ;;

  done)
    echo ">>> Issue #${ISSUE_NUMBER} already completed"
    exit 0
    ;;

esac
