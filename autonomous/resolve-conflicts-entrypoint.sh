#!/usr/bin/env bash
set -euo pipefail

# Resolve merge conflicts on a single PR inside Docker.
# Receives from environment: PR_NUMBER, FORK_URL, UPSTREAM_REPO, GH_TOKEN, GH_TOKEN_UPSTREAM

# ── Validate required env vars ──────────────────────────────
for var in PR_NUMBER FORK_URL UPSTREAM_REPO GH_TOKEN GH_TOKEN_UPSTREAM GIT_USER_NAME GIT_USER_EMAIL; do
  if [ -z "${!var:-}" ]; then
    echo "!!! Missing required env var: ${var}"
    exit 1
  fi
done

# ── Git identity ──────────────────────────────────────────────
git config --global user.name  "${GIT_USER_NAME}"
git config --global user.email "${GIT_USER_EMAIL}"

# ── Clone upstream repo ─────────────────────────────────────
# origin = upstream so `git rebase origin/main` works naturally in the skill
REPO_DIR="/workspace/repo"
if [ ! -d "$REPO_DIR/.git" ]; then
  echo ">>> Cloning upstream: ${UPSTREAM_REPO}"
  git clone "https://x-access-token:${GH_TOKEN_UPSTREAM}@github.com/${UPSTREAM_REPO}" "$REPO_DIR"
fi

cd "$REPO_DIR"

# ── Add fork remote ─────────────────────────────────────────
# The skill's push step checks `git remote -v` and gh pr checkout adds the
# fork remote automatically, but we add it explicitly so it's always available.
if ! git remote get-url fork &>/dev/null; then
  git remote add fork "https://x-access-token:${GH_TOKEN}@${FORK_URL}"
fi

git fetch origin
git fetch fork

# ── Warm dependency cache ────────────────────────────────────
if [ -f package.json ]; then
  echo ">>> Installing dependencies"
  npm ci
fi

# ── Set up database ─────────────────────────────────────────
export DATABASE_URL="postgresql://mmf:mmf@db:5432/mmf?sslmode=disable"
export JWT_SECRET="test-jwt-secret-for-conflict-resolution"

# ── Check PR status ─────────────────────────────────────────
echo ">>> Checking PR #${PR_NUMBER} status"
PR_STATUS=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr view "$PR_NUMBER" \
  --repo "$UPSTREAM_REPO" --json mergeable,state \
  --jq '{mergeable: .mergeable, state: .state}')

STATE=$(echo "$PR_STATUS" | jq -r '.state')
MERGEABLE=$(echo "$PR_STATUS" | jq -r '.mergeable')

if [ "$STATE" = "CLOSED" ] || [ "$STATE" = "MERGED" ]; then
  echo ">>> PR #${PR_NUMBER} is ${STATE} — nothing to do"
  exit 0
fi

if [ "$MERGEABLE" = "MERGEABLE" ]; then
  echo ">>> PR #${PR_NUMBER} is already mergeable — nothing to do"
  exit 0
fi

if [ "$MERGEABLE" = "UNKNOWN" ]; then
  echo ">>> PR #${PR_NUMBER} mergeable status is UNKNOWN (GitHub still computing), proceeding"
else
  echo ">>> PR #${PR_NUMBER} mergeable status: ${MERGEABLE}"
fi

# ── Invoke Claude ────────────────────────────────────────────
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="/workspace/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/resolve-conflicts-${PR_NUMBER}-${TIMESTAMP}.log"
TIMEOUT="${TIMEOUT_SECONDS:-1800}"

PROMPT_FILE="${LOG_DIR}/resolve-conflicts-prompt-${PR_NUMBER}.md"
sed "s/__PR_NUMBER__/${PR_NUMBER}/g" "${PROMPTS_DIR}/resolve-conflicts.md" > "$PROMPT_FILE"

echo ">>> Starting Claude to resolve conflicts on PR #${PR_NUMBER}"
timeout "$TIMEOUT" claude \
  --dangerously-skip-permissions \
  --print \
  --verbose \
  --output-format stream-json \
  -p "$(cat "$PROMPT_FILE")" \
  2>&1 | tee "$LOG_FILE"
