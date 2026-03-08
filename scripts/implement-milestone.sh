#!/usr/bin/env bash
set -euo pipefail

# Start the autonomous agent in Docker for a given milestone.
# Launches one container per issue, processing them in dependency order.
# Usage: ./scripts/implement-milestone.sh [milestone-title]
#
# Compatible with Bash 3.2+ (macOS default). No associative arrays.

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

# ── Require autonomous/.env ──────────────────────────────────
if [ ! -f "$REPO_ROOT/autonomous/.env" ]; then
  echo "ERROR: autonomous/.env not found. Copy .env.example and fill in values."
  exit 1
fi

# Source .env to get UPSTREAM_REPO for milestone queries
set -a
# shellcheck disable=SC1091
source "$REPO_ROOT/autonomous/.env"
set +a

# ── Milestone selection ──────────────────────────────────────
if [ -n "${1:-}" ]; then
  # Title provided — look up its number
  MILESTONE_NUMBER=$(gh api "repos/${UPSTREAM_REPO}/milestones" --jq ".[] | select(.title == \"$1\") | .number")
  if [ -z "$MILESTONE_NUMBER" ]; then
    echo "ERROR: No milestone found with title: $1"
    exit 1
  fi
  echo ">>> Milestone: $1 (#${MILESTONE_NUMBER})"
else
  # No arg — query open milestones
  MILESTONES=$(gh api "repos/${UPSTREAM_REPO}/milestones?state=open" --jq '.[] | "\(.number)\t\(.title)"')

  if [ -z "$MILESTONES" ]; then
    echo "ERROR: No open milestones found in ${UPSTREAM_REPO}"
    exit 1
  fi

  COUNT=$(echo "$MILESTONES" | wc -l | tr -d ' ')

  if [ "$COUNT" -eq 1 ]; then
    # Auto-select the only milestone
    MILESTONE_NUMBER=$(echo "$MILESTONES" | cut -f1)
    MILESTONE_TITLE=$(echo "$MILESTONES" | cut -f2)
    echo ">>> Auto-selected milestone: ${MILESTONE_TITLE} (#${MILESTONE_NUMBER})"
  else
    # Prompt user to choose
    echo "Multiple open milestones found:"
    echo ""
    i=1
    while IFS=$'\t' read -r num title; do
      echo "  ${i}) ${title} (#${num})"
      i=$((i + 1))
    done <<< "$MILESTONES"
    echo ""
    read -rp "Select milestone [1-${COUNT}]: " CHOICE

    if [ -z "$CHOICE" ] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$COUNT" ]; then
      echo "ERROR: Invalid selection"
      exit 1
    fi

    MILESTONE_NUMBER=$(echo "$MILESTONES" | sed -n "${CHOICE}p" | cut -f1)
    MILESTONE_TITLE=$(echo "$MILESTONES" | sed -n "${CHOICE}p" | cut -f2)
    echo ">>> Selected milestone: ${MILESTONE_TITLE} (#${MILESTONE_NUMBER})"
  fi
fi

# ── Fetch all milestone issues with bodies ───────────────────
echo ">>> Fetching issues for milestone #${MILESTONE_NUMBER}"

ISSUES_JSON=$(gh api "repos/${UPSTREAM_REPO}/issues?milestone=${MILESTONE_NUMBER}&state=open&per_page=100" \
  --jq '[.[] | {number: .number, title: .title, body: (.body // "")}]')

ISSUE_COUNT=$(echo "$ISSUES_JSON" | jq 'length')

if [ "$ISSUE_COUNT" -eq 0 ]; then
  echo ">>> No open issues in milestone #${MILESTONE_NUMBER}. Done."
  exit 0
fi

echo ">>> Found ${ISSUE_COUNT} issues"

# ── Build dependency graph ───────────────────────────────────
# Parse each issue body for dependency patterns (case-insensitive):
#   "depends on #N", "blocked by #N", "requires #N"

# Create temp files for the graph and state tracking
DEPS_FILE=$(mktemp)
ALL_ISSUES_FILE=$(mktemp)
BRANCHES_FILE=$(mktemp)   # "issue_number branch_name" per line
FAILED_FILE=$(mktemp)     # one failed issue number per line
trap 'rm -f "$DEPS_FILE" "$ALL_ISSUES_FILE" "$BRANCHES_FILE" "$FAILED_FILE"' EXIT

# Extract issue numbers and their dependencies
echo "$ISSUES_JSON" | jq -r '.[] | .number | tostring' | sort -n > "$ALL_ISSUES_FILE"

echo "$ISSUES_JSON" | jq -r '.[] | "\(.number)\t\(.body)"' | while IFS=$'\t' read -r num body; do
  # Extract dependency issue numbers (case-insensitive matching)
  dep_numbers=$(echo "$body" | grep -ioE '(depends on|blocked by|requires) #[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' || true)
  for dep in $dep_numbers; do
    # Only record deps that are in our milestone
    if grep -qx "$dep" "$ALL_ISSUES_FILE"; then
      echo "${num} ${dep}" >> "$DEPS_FILE"
    fi
  done
done

# Ensure deps file exists even if empty
touch "$DEPS_FILE"

echo ">>> Dependencies found:"
if [ -s "$DEPS_FILE" ]; then
  while read -r child parent; do
    echo "    #${child} depends on #${parent}"
  done < "$DEPS_FILE"
else
  echo "    (none)"
fi

# ── Topological sort ─────────────────────────────────────────
# Kahn's algorithm using temp files (Bash 3.2 compatible — no associative arrays).
# Uses an in-degree file ("issue in_degree") and an adjacency file ("parent child").
topological_sort() {
  local all_issues_file="$1"
  local deps_file="$2"

  local indeg_file adj_file queue_file
  indeg_file=$(mktemp)
  adj_file=$(mktemp)
  queue_file=$(mktemp)

  # Initialise in-degree to 0 for all issues
  while read -r issue; do
    echo "$issue 0" >> "$indeg_file"
  done < "$all_issues_file"

  # Process edges: "child parent" means parent -> child
  if [ -s "$deps_file" ]; then
    while read -r child parent; do
      # Increment in-degree for child
      local old_deg new_deg
      old_deg=$(grep "^${child} " "$indeg_file" | awk '{print $2}')
      new_deg=$(( old_deg + 1 ))
      # Use a temp file for sed -i portability (macOS vs Linux)
      sed "s/^${child} ${old_deg}$/${child} ${new_deg}/" "$indeg_file" > "${indeg_file}.tmp"
      mv "${indeg_file}.tmp" "$indeg_file"
      # Record adjacency: parent -> child
      echo "$parent $child" >> "$adj_file"
    done < "$deps_file"
  fi
  touch "$adj_file"

  # Seed queue with in-degree 0 nodes (sorted by issue number)
  grep ' 0$' "$indeg_file" | awk '{print $1}' | sort -n > "$queue_file"

  local result=""
  local result_count=0

  while [ -s "$queue_file" ]; do
    # Take first (lowest issue number)
    local current
    current=$(head -1 "$queue_file")
    sed '1d' "$queue_file" > "${queue_file}.tmp"
    mv "${queue_file}.tmp" "$queue_file"

    if [ -n "$result" ]; then
      result="${result}
${current}"
    else
      result="$current"
    fi
    result_count=$((result_count + 1))

    # Reduce in-degree for dependents of current
    grep "^${current} " "$adj_file" | awk '{print $2}' | while read -r dependent; do
      local old_deg new_deg
      old_deg=$(grep "^${dependent} " "$indeg_file" | awk '{print $2}')
      new_deg=$(( old_deg - 1 ))
      sed "s/^${dependent} ${old_deg}$/${dependent} ${new_deg}/" "$indeg_file" > "${indeg_file}.tmp"
      mv "${indeg_file}.tmp" "$indeg_file"
      if [ "$new_deg" -eq 0 ]; then
        echo "$dependent" >> "$queue_file"
        # Re-sort to maintain issue-number order
        sort -n "$queue_file" > "${queue_file}.tmp"
        mv "${queue_file}.tmp" "$queue_file"
      fi
    done
  done

  local total
  total=$(wc -l < "$all_issues_file" | tr -d ' ')

  # Cycle detection
  if [ "$result_count" -ne "$total" ]; then
    echo "WARNING: Dependency cycle detected! Falling back to issue-number order." >&2
    cat "$all_issues_file"
  else
    echo "$result"
  fi

  rm -f "$indeg_file" "$adj_file" "$queue_file"
}

SORTED_ISSUES=$(topological_sort "$ALL_ISSUES_FILE" "$DEPS_FILE")

echo ">>> Processing order:"
while read -r num; do
  title=$(echo "$ISSUES_JSON" | jq -r ".[] | select(.number == ${num}) | .title")
  echo "    #${num}: ${title}"
done <<< "$SORTED_ISSUES"

# ── Helper: look up branch for an issue number ───────────────
get_issue_branch() {
  grep "^${1} " "$BRANCHES_FILE" | awk '{print $2}' | head -1
}

# ── Process each issue ───────────────────────────────────────
while read -r ISSUE_NUMBER; do
  ISSUE_TITLE=$(echo "$ISSUES_JSON" | jq -r ".[] | select(.number == ${ISSUE_NUMBER}) | .title")

  echo ""
  echo "=========================================="
  echo "  Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}"
  echo "=========================================="

  # Check if any dependency failed
  skip=false
  if [ -s "$DEPS_FILE" ]; then
    while read -r child parent; do
      if [ "$child" = "$ISSUE_NUMBER" ] && grep -qx "$parent" "$FAILED_FILE"; then
        echo ">>> Skipping #${ISSUE_NUMBER} — depends on failed #${parent}"
        skip=true
        break
      fi
    done < "$DEPS_FILE"
  fi

  if [ "$skip" = true ]; then
    echo "$ISSUE_NUMBER" >> "$FAILED_FILE"
    continue
  fi

  # Determine base branch.
  # For diamond dependencies (issue depends on multiple parents), we use the
  # first parent found in the deps file. This is deterministic since deps are
  # written in issue-body parse order. Only one parent can be the base branch.
  BASE_BRANCH="main"
  if [ -s "$DEPS_FILE" ]; then
    while read -r child parent; do
      if [ "$child" = "$ISSUE_NUMBER" ]; then
        parent_branch=$(get_issue_branch "$parent")
        if [ -n "$parent_branch" ]; then
          BASE_BRANCH="$parent_branch"
          echo ">>> Stacking on #${parent}'s branch: ${BASE_BRANCH}"
          break
        fi
      fi
    done < "$DEPS_FILE"
  fi

  # Compute branch name
  SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-' | sed 's/^-//;s/-$//' | head -c 40)
  BRANCH="feat/issue-${ISSUE_NUMBER}-${SLUG}"
  echo "${ISSUE_NUMBER} ${BRANCH}" >> "$BRANCHES_FILE"

  # Check if a PR already exists for this branch (restart-safe)
  FORK_OWNER=$(echo "$FORK_URL" | sed 's|github.com/||;s|/.*||')
  EXISTING_PR=$(gh pr list --repo "${UPSTREAM_REPO}" --head "${FORK_OWNER}:${BRANCH}" --state open --json url --jq '.[0].url // empty' 2>/dev/null || true)
  if [ -n "$EXISTING_PR" ]; then
    echo ">>> Skipping #${ISSUE_NUMBER} — PR already exists: ${EXISTING_PR}"
    continue
  fi

  # Export env vars for Docker
  export MILESTONE_NUMBER
  export ISSUE_NUMBER
  export ISSUE_TITLE
  export BASE_BRANCH
  export BRANCH
  RUN_ID=$(date +%Y%m%d-%H%M%S)
  export CONTAINER_NAME="agent-iss${ISSUE_NUMBER}-${RUN_ID}"

  echo ">>> Launching container ${CONTAINER_NAME} for issue #${ISSUE_NUMBER} (base: ${BASE_BRANCH})"

  # Ensure log directory exists for this issue
  DOCKER_LOG_DIR="$REPO_ROOT/autonomous/logs/${ISSUE_NUMBER}"
  mkdir -p "$DOCKER_LOG_DIR"
  DOCKER_LOG_FILE="${DOCKER_LOG_DIR}/docker-${RUN_ID}.log"

  cd "$REPO_ROOT/autonomous"
  if docker compose up --build --abort-on-container-exit 2>&1 | tee "$DOCKER_LOG_FILE"; then
    echo ">>> Container completed successfully for issue #${ISSUE_NUMBER}"
  else
    echo "!!! Container failed for issue #${ISSUE_NUMBER}"
    echo ">>> Docker logs saved to: ${DOCKER_LOG_FILE}"
    echo "$ISSUE_NUMBER" >> "$FAILED_FILE"
  fi

done <<< "$SORTED_ISSUES"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo "=== All milestone issues processed ==="
if [ -s "$FAILED_FILE" ]; then
  echo ">>> Failed issues: $(tr '\n' ' ' < "$FAILED_FILE")"
fi
