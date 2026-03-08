#!/usr/bin/env bash
set -euo pipefail

# Start the autonomous agent in Docker for a given milestone.
# Launches one container per issue, processing them in dependency order.
# Usage: ./scripts/implement-milestone.sh [milestone-title]

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

# Create temp files for the graph
DEPS_FILE=$(mktemp)
ALL_ISSUES_FILE=$(mktemp)
trap 'rm -f "$DEPS_FILE" "$ALL_ISSUES_FILE"' EXIT

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
# Simple Kahn's algorithm for topological sort
topological_sort() {
  local all_issues_file="$1"
  local deps_file="$2"

  # Build in-degree map
  declare -A in_degree
  declare -A adj_list
  while read -r issue; do
    in_degree[$issue]=0
    adj_list[$issue]=""
  done < "$all_issues_file"

  # Process edges: "child parent" means parent -> child
  while read -r child parent; do
    in_degree[$child]=$(( ${in_degree[$child]} + 1 ))
    if [ -n "${adj_list[$parent]}" ]; then
      adj_list[$parent]="${adj_list[$parent]} ${child}"
    else
      adj_list[$parent]="$child"
    fi
  done < "$deps_file"

  # Collect nodes with in-degree 0, sorted by issue number
  local queue=()
  for issue in $(sort -n <<< "$(printf '%s\n' "${!in_degree[@]}")"); do
    if [ "${in_degree[$issue]}" -eq 0 ]; then
      queue+=("$issue")
    fi
  done

  local result=()
  while [ ${#queue[@]} -gt 0 ]; do
    # Take first element (lowest issue number among ready nodes)
    local current="${queue[0]}"
    queue=("${queue[@]:1}")
    result+=("$current")

    # Reduce in-degree for dependents
    for dependent in ${adj_list[$current]:-}; do
      in_degree[$dependent]=$(( ${in_degree[$dependent]} - 1 ))
      if [ "${in_degree[$dependent]}" -eq 0 ]; then
        queue+=("$dependent")
        # Re-sort queue to maintain issue-number order
        IFS=$'\n' read -r -d '' -a queue <<< "$(printf '%s\n' "${queue[@]}" | sort -n)" || true
      fi
    done
  done

  # Cycle detection
  if [ ${#result[@]} -ne "$(wc -l < "$all_issues_file" | tr -d ' ')" ]; then
    echo "WARNING: Dependency cycle detected! Falling back to issue-number order." >&2
    sort -n "$all_issues_file"
    return
  fi

  printf '%s\n' "${result[@]}"
}

SORTED_ISSUES=$(topological_sort "$ALL_ISSUES_FILE" "$DEPS_FILE")

echo ">>> Processing order:"
while read -r num; do
  title=$(echo "$ISSUES_JSON" | jq -r ".[] | select(.number == ${num}) | .title")
  echo "    #${num}: ${title}"
done <<< "$SORTED_ISSUES"

# ── Process each issue ───────────────────────────────────────
# Track branch names for dependency resolution
declare -A ISSUE_BRANCHES
FAILED_ISSUES=()

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
      if [ "$child" = "$ISSUE_NUMBER" ]; then
        for failed in "${FAILED_ISSUES[@]+"${FAILED_ISSUES[@]}"}"; do
          if [ "$failed" = "$parent" ]; then
            echo ">>> Skipping #${ISSUE_NUMBER} — depends on failed #${parent}"
            skip=true
            break 2
          fi
        done
      fi
    done < "$DEPS_FILE"
  fi

  if [ "$skip" = true ]; then
    FAILED_ISSUES+=("$ISSUE_NUMBER")
    continue
  fi

  # Determine base branch.
  # For diamond dependencies (issue depends on multiple parents), we use the
  # first parent found in the deps file. This is deterministic since deps are
  # written in issue-body parse order. Only one parent can be the base branch.
  BASE_BRANCH="main"
  if [ -s "$DEPS_FILE" ]; then
    while read -r child parent; do
      if [ "$child" = "$ISSUE_NUMBER" ] && [ -n "${ISSUE_BRANCHES[$parent]:-}" ]; then
        BASE_BRANCH="${ISSUE_BRANCHES[$parent]}"
        echo ">>> Stacking on #${parent}'s branch: ${BASE_BRANCH}"
        break
      fi
    done < "$DEPS_FILE"
  fi

  # Compute branch name (same logic as entrypoint.sh will use)
  SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-' | sed 's/^-//;s/-$//' | head -c 40)
  BRANCH="feat/issue-${ISSUE_NUMBER}-${SLUG}"
  ISSUE_BRANCHES[$ISSUE_NUMBER]="$BRANCH"

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

  echo ">>> Launching container for issue #${ISSUE_NUMBER} (base: ${BASE_BRANCH})"

  cd "$REPO_ROOT/autonomous"
  if docker compose up --build --abort-on-container-exit; then
    echo ">>> Container completed successfully for issue #${ISSUE_NUMBER}"
  else
    echo "!!! Container failed for issue #${ISSUE_NUMBER}"
    FAILED_ISSUES+=("$ISSUE_NUMBER")
  fi

done <<< "$SORTED_ISSUES"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo "=== All milestone issues processed ==="
if [ ${#FAILED_ISSUES[@]} -gt 0 ]; then
  echo ">>> Failed issues: ${FAILED_ISSUES[*]}"
fi
