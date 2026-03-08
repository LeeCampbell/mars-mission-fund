#!/usr/bin/env bash
set -euo pipefail

# ── Git identity ──────────────────────────────────────────────
git config --global user.name  "${GIT_USER_NAME}"
git config --global user.email "${GIT_USER_EMAIL}"

# ── Clone agent's fork ───────────────────────────────────────
REPO_DIR="/workspace/repo"
if [ ! -d "$REPO_DIR/.git" ]; then
  echo ">>> Cloning fork: ${FORK_URL}"
  git clone "https://x-access-token:${GH_TOKEN}@${FORK_URL}" "$REPO_DIR"
fi

cd "$REPO_DIR"

# ── Add upstream remote ──────────────────────────────────────
if ! git remote get-url upstream &>/dev/null; then
  git remote add upstream "https://x-access-token:${GH_TOKEN_UPSTREAM}@github.com/${UPSTREAM_REPO}"
fi

git fetch upstream
git checkout "${UPSTREAM_BASE_BRANCH}"
git merge "upstream/${UPSTREAM_BASE_BRANCH}" --no-edit

# ── Warm dependency cache ────────────────────────────────────
if [ -f package.json ]; then
  echo ">>> Installing dependencies"
  npm install
fi

# ── Fetch milestone issues ───────────────────────────────────
echo ">>> Fetching issues for milestone #${MILESTONE_NUMBER}"

ISSUES=$(GH_TOKEN="${GH_TOKEN_UPSTREAM}" gh issue list \
  --repo "${UPSTREAM_REPO}" \
  --milestone "${MILESTONE_NUMBER}" \
  --state open \
  --json number,title \
  --jq 'sort_by(.number) | .[] | "\(.number)\t\(.title)"')

if [ -z "$ISSUES" ]; then
  echo ">>> No open issues in milestone #${MILESTONE_NUMBER}. Done."
  exit 0
fi

echo ">>> Issues to process:"
echo "$ISSUES" | while IFS=$'\t' read -r num title; do
  echo "    #${num}: ${title}"
done

# ── Iterate issues ───────────────────────────────────────────
while IFS=$'\t' read -r ISSUE_NUMBER ISSUE_TITLE; do
  echo ""
  echo "=========================================="
  echo "  Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}"
  echo "=========================================="

  # Create a URL-safe slug from the title
  SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-' | sed 's/^-//;s/-$//' | head -c 40)
  BRANCH="feat/issue-${ISSUE_NUMBER}-${SLUG}"

  # Checkout or create feature branch
  git fetch upstream
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git checkout "$BRANCH"
    git merge "upstream/${UPSTREAM_BASE_BRANCH}" --no-edit || true
  else
    git checkout -b "$BRANCH" "upstream/${UPSTREAM_BASE_BRANCH}"
  fi

  # Export for agent-loop.sh
  export ISSUE_NUMBER
  export ISSUE_TITLE
  export BRANCH
  export FORK_URL

  # Clean any leftover plan state from a previous issue
  rm -rf plan/planning plan/ready plan/done

  # Run the agent loop for this issue
  echo ">>> Starting agent loop for issue #${ISSUE_NUMBER}"
  iteration=0
  max_iterations="${MAX_ITERATIONS:-10}"
  cooldown="${COOLDOWN_SECONDS:-30}"

  while [ "$iteration" -lt "$max_iterations" ]; do
    iteration=$((iteration + 1))
    echo "--- Iteration ${iteration}/${max_iterations} for issue #${ISSUE_NUMBER} ---"

    exit_code=0
    agent-loop.sh || exit_code=$?

    if [ "$exit_code" -eq 0 ]; then
      echo ">>> Issue #${ISSUE_NUMBER} completed successfully"
      break
    elif [ "$exit_code" -eq 2 ]; then
      echo "!!! Issue #${ISSUE_NUMBER} — agent stuck, moving to next issue"
      # Comment on the issue so the stuck state is visible in GitHub
      LAST_LOG=$(ls -t "${REPO_DIR}/.logs/issue-${ISSUE_NUMBER}-"* 2>/dev/null | head -1)
      STUCK_STATE=$(basename "${LAST_LOG:-unknown}" | sed 's/issue-[0-9]*-//;s/-[0-9]*\.log//')
      GH_TOKEN="${GH_TOKEN_UPSTREAM}" gh issue comment "${ISSUE_NUMBER}" \
        --repo "${UPSTREAM_REPO}" \
        --body "Agent stuck at stage \`${STUCK_STATE}\` after ${iteration} iterations. Manual intervention needed." \
        2>/dev/null || echo "!!! Failed to comment on issue"
      break
    fi

    # Cooldown between iterations
    if [ "$iteration" -lt "$max_iterations" ]; then
      echo ">>> Cooling down for ${cooldown}s..."
      sleep "$cooldown"
    fi
  done

done <<< "$ISSUES"

echo ""
echo "=== All milestone issues processed ==="
