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

# ── Run agent loop ───────────────────────────────────────────
echo ">>> Starting agent loop (max ${MAX_ITERATIONS} iterations, ${COOLDOWN_SECONDS}s cooldown)"
exec agent-loop.sh
