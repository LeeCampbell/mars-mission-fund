#!/usr/bin/env bash
set -euo pipefail

# Process a single issue inside Docker.
# Receives from environment: ISSUE_NUMBER, ISSUE_TITLE, MILESTONE_NUMBER

# ── Validate required env vars ──────────────────────────────
for var in ISSUE_NUMBER ISSUE_TITLE BRANCH FORK_URL UPSTREAM_REPO GH_TOKEN GH_TOKEN_UPSTREAM GIT_USER_NAME GIT_USER_EMAIL; do
  if [ -z "${!var:-}" ]; then
    echo "!!! Missing required env var: ${var}"
    exit 1
  fi
done

# ── Git identity ──────────────────────────────────────────────
git config --global user.name  "${GIT_USER_NAME}"
git config --global user.email "${GIT_USER_EMAIL}"

# ── Verify Playwright MCP server works ──────────────────────
# The MCP server is stdio-based (reads JSON-RPC from stdin), so we can't just
# background it — it exits immediately when stdin closes. Instead, we verify:
#   1. The CLI entry point loads without error
#   2. Chromium is installed for the correct playwright-core version
echo ">>> Smoke-testing Playwright MCP server..."

node -e "require('/usr/lib/node_modules/@playwright/mcp/cli.js')" 2>/dev/null \
  && echo ">>> MCP server module loads OK" \
  || { echo "!!! Playwright MCP cli.js failed to load"; exit 1; }

CHROMIUM_STATUS=$(node /usr/lib/node_modules/@playwright/mcp/node_modules/playwright-core/cli.js install --list 2>&1)
if echo "$CHROMIUM_STATUS" | grep -q "chromium-"; then
  echo ">>> Chromium installed: $(echo "$CHROMIUM_STATUS" | grep chromium- | head -1 | xargs)"
else
  echo "!!! Chromium not found for MCP's playwright-core"
  echo "$CHROMIUM_STATUS"
  exit 1
fi

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
git fetch origin

# ── Checkout feature branch from upstream/main ──────────────
# BRANCH is passed from implement-milestone.sh to avoid drift

if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  # Local branch exists (e.g. from a previous iteration in this container)
  git checkout "$BRANCH"
  if ! git merge upstream/main --no-edit; then
    echo "!!! Merge conflict with upstream/main"
    echo "!!! Aborting merge — manual conflict resolution needed"
    git merge --abort
    exit 1
  fi
elif git show-ref --verify --quiet "refs/remotes/origin/${BRANCH}"; then
  # Branch exists on fork remote — resume prior work
  echo ">>> Resuming from existing remote branch: origin/${BRANCH}"
  git checkout -b "$BRANCH" "origin/${BRANCH}"
  if ! git merge upstream/main --no-edit; then
    echo "!!! Merge conflict with upstream/main"
    echo "!!! Aborting merge — manual conflict resolution needed"
    git merge --abort
    exit 1
  fi
else
  # Fresh branch from upstream/main
  git checkout -b "$BRANCH" upstream/main
fi

# ── Warm dependency cache ────────────────────────────────────
if [ -f package.json ]; then
  echo ">>> Installing dependencies"
  npm ci
  # Install Chromium for the project's @playwright/test version.
  # The Docker image pre-installs Chromium for @playwright/mcp (different
  # playwright-core), but E2E tests use the project's own playwright which
  # may expect a different browser revision. Both coexist under /ms-playwright/.
  echo ">>> Installing Chromium for project Playwright"
  npx playwright install chromium
fi

# ── Database env for E2E tests ─────────────────────────────
export DATABASE_URL="postgresql://mmf:mmf@db:5432/mmf?sslmode=disable"
export JWT_SECRET="test-jwt-secret-for-agent"

# ── Run agent loop for this single issue ─────────────────────
echo ""
echo "=========================================="
echo "  Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}"
echo "=========================================="

export ISSUE_NUMBER
export ISSUE_TITLE
export BRANCH
export FORK_URL

# Plan state is preserved on the branch for restart-safety.
# The agent-loop state machine will detect the current stage and resume.

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
  elif [ "$exit_code" -eq 1 ]; then
    echo ">>> agent-loop exited 1 (iterate again)"
  elif [ "$exit_code" -eq 2 ]; then
    echo "!!! Issue #${ISSUE_NUMBER} — agent stuck (exit 2), exiting"
    LAST_LOG=$(ls -t "/workspace/logs/issue-${ISSUE_NUMBER}-"* 2>/dev/null | head -1)
    STUCK_STATE=$(basename "${LAST_LOG:-unknown}" | sed 's/issue-[0-9]*-//;s/-[0-9]*\.log//')
    GH_TOKEN="${GH_TOKEN_UPSTREAM}" gh issue comment "${ISSUE_NUMBER}" \
      --repo "${UPSTREAM_REPO}" \
      --body "Agent stuck at stage \`${STUCK_STATE}\` after ${iteration} iterations. Manual intervention needed." \
      2>/dev/null || echo "!!! Failed to comment on issue"
    exit 1
  else
    echo "!!! agent-loop crashed with unexpected exit code ${exit_code} (likely set -e)"
    echo "!!! Treating as iterate-again, but this indicates a bug in agent-loop.sh"
  fi

  # Cooldown between iterations
  if [ "$iteration" -lt "$max_iterations" ]; then
    echo ">>> Cooling down for ${cooldown}s..."
    sleep "$cooldown"
  fi
done

echo "=== Issue #${ISSUE_NUMBER} processing complete ==="
