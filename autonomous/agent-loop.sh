#!/usr/bin/env bash
set -euo pipefail

# Agent loop state machine for a single GitHub issue.
# Receives: ISSUE_NUMBER, ISSUE_TITLE, BRANCH, FORK_URL, UPSTREAM_REPO, UPSTREAM_BASE_BRANCH
# Exit codes: 0 = issue complete (PR merged-ready), 1 = needs another iteration, 2 = stuck

REPO_DIR="/workspace/repo"
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="/workspace/logs"
SCREENSHOT_DIR="/screenshots"
MAX_REMEDIATION_ATTEMPTS=3

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

FORK_OWNER=$(echo "$FORK_URL" | sed 's|.*github.com/||;s|/.*||')
if [ -z "$FORK_OWNER" ]; then
  echo "!!! Could not extract fork owner from FORK_URL: ${FORK_URL}"
  exit 2
fi

# ── Helpers ───────────────────────────────────────────────────

# Run Claude with standard flags. Caller supplies extra args (e.g. --output-format).
# Usage: run_claude [extra-flags...] -p "prompt text"
run_claude() {
  timeout "$TIMEOUT" claude \
    --dangerously-skip-permissions \
    --print \
    --verbose \
    "$@" \
    2>&1 | tee "$LOG_FILE" || true
}

# Increment the remediation attempt counter and exit 2 (stuck) if exhausted.
# Usage: check_remediation_attempts "description"
check_remediation_attempts() {
  local description="$1"
  local attempts_file="plan/.ci-attempts"
  local attempts
  attempts=$(cat "$attempts_file" 2>/dev/null || echo 0)

  if [ "$attempts" -ge "$MAX_REMEDIATION_ATTEMPTS" ]; then
    echo "!!! ${description} after ${MAX_REMEDIATION_ATTEMPTS} attempts"
    exit 2
  fi

  echo $((attempts + 1)) > "$attempts_file"
  echo ">>> ${description} — attempt $((attempts + 1))/${MAX_REMEDIATION_ATTEMPTS}"
}

# Classify CI status for a PR into: pending, passing, failing, or conflicting.
poll_ci_status() {
  local pr_number="$1"

  # Check for merge conflicts first (separate from CI checks)
  local mergeable
  mergeable=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr view "$pr_number" \
    --repo "$UPSTREAM_REPO" --json mergeable --jq '.mergeable' 2>/dev/null) || true

  if [ "$mergeable" = "CONFLICTING" ]; then
    echo "conflicting"
    return
  fi

  local ci_raw
  ci_raw=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr checks "$pr_number" \
    --repo "$UPSTREAM_REPO" --json state --jq '.[].state' 2>&1) || true

  if echo "$ci_raw" | grep -qiE 'IN_PROGRESS|QUEUED|PENDING'; then
    echo "pending"
  elif echo "$ci_raw" | grep -qiE 'FAILURE|ERROR|CANCELLED|ACTION_REQUIRED|TIMED_OUT|STARTUP_FAILURE'; then
    echo "failing"
  elif echo "$ci_raw" | grep -qiE 'SUCCESS|SKIPPED|NEUTRAL'; then
    echo "passing"
  else
    echo ">>> CI status unclear (raw: ${ci_raw}), treating as pending" >&2
    echo "pending"
  fi
}

# Upload screenshots for an issue as a PR comment.
upload_screenshots() {
  local pr_number="$1"
  local gh_token_fork="$2"

  if ! ls "${SCREENSHOT_DIR}/ISSUE-${ISSUE_NUMBER}-"*.png 1>/dev/null 2>&1; then
    return
  fi

  local comment_body="## Screenshots\n\n"
  local fork_repo
  fork_repo=$(echo "$FORK_URL" | sed 's|.*github.com/||;s|\.git$||')

  # Ensure screenshots branch exists on fork
  if ! GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/ref/heads/screenshots" &>/dev/null; then
    local default_sha
    default_sha=$(GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/ref/heads/main" --jq '.object.sha')
    GH_TOKEN="$gh_token_fork" gh api "repos/${fork_repo}/git/refs" \
      -X POST -f ref="refs/heads/screenshots" -f sha="$default_sha" 2>/dev/null || true
  fi

  for img in "${SCREENSHOT_DIR}/ISSUE-${ISSUE_NUMBER}-"*.png; do
    local fname
    fname=$(basename "$img")
    # Upload via contents API. Pipe base64 through jq to avoid Linux MAX_ARG_STRLEN limit.
    (base64 -w0 "$img" 2>/dev/null || base64 "$img") \
    | tr -d '\n' \
    | jq -Rs \
      --arg msg "chore: add screenshot ${fname}" \
      --arg branch "screenshots" \
      '{message: $msg, content: ., branch: $branch}' \
    | GH_TOKEN="$gh_token_fork" gh api \
      "repos/${fork_repo}/contents/screenshots/PR-${pr_number}/${fname}" \
      -X PUT --input - \
    || echo "!!! Failed to upload screenshot: ${fname}"

    local raw_url="https://raw.githubusercontent.com/${fork_repo}/screenshots/screenshots/PR-${pr_number}/${fname}"
    comment_body="${comment_body}### ${fname}\n![${fname}](${raw_url})\n\n"
  done

  echo -e "$comment_body" | GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr comment "$pr_number" \
    --repo "$UPSTREAM_REPO" --body-file - || true
}

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
    elif [ -f "plan/.finalized" ]; then
      echo "await-ci"
    else
      echo "finalize-pr"
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

archive_plan() {
  # Remove plan files from the branch — they're preserved in git history.
  if git ls-files --error-unmatch plan/ &>/dev/null; then
    git rm -r plan/
    git commit -m "chore: remove plan files after PR merged"
    git push origin "$BRANCH" --force-with-lease
  fi
  # Clean up any untracked plan files left on disk
  rm -rf plan/
}

# Resolve PR number from plan file or by querying upstream.
resolve_pr_number() {
  local pr_number=""
  if [ -f "plan/.pr-number" ]; then
    pr_number=$(cat plan/.pr-number)
  fi
  if [ -z "$pr_number" ]; then
    pr_number=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr list --repo "$UPSTREAM_REPO" \
      --head "${FORK_OWNER}:${BRANCH}" --json number --jq '.[0].number' 2>/dev/null || true)
  fi
  echo "$pr_number"
}

# ── Main ─────────────────────────────────────────────────────

STATE=$(determine_state)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUMBER}-${STATE}-${TIMESTAMP}.log"

echo ">>> State: ${STATE} for issue #${ISSUE_NUMBER}"
echo ">>> Log: ${LOG_FILE}"

case "$STATE" in

  create-brief)
    set_state "create-brief"
    mkdir -p plan/planning
    run_claude \
      -p "$(cat "${PROMPTS_DIR}/create-brief.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}"

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
    run_claude -p "$(cat "${PROMPTS_DIR}/apply-review.md")"

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
    run_claude -p "$(cat "${PROMPTS_DIR}/create-tasks.md")"

    if [ -f "plan/ready/tasks.md" ]; then
      echo ">>> Tasks created"

      # Advance state before side-effects (push/PR) so a failure doesn't
      # leave us stuck in create-tasks.
      clear_state

      # Commit plan files so they're included in the push
      git add plan/
      git commit -m "chore: add plan for #${ISSUE_NUMBER}" || true

      # Push branch to fork so we can create a draft PR for visibility
      git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

      # Create draft PR (once — this state only runs once)
      PR_URL=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr create \
        --repo "$UPSTREAM_REPO" \
        --base "$UPSTREAM_BASE_BRANCH" \
        --head "${FORK_OWNER}:${BRANCH}" \
        --title "feat: ${ISSUE_TITLE}" \
        --body "Work in progress for #${ISSUE_NUMBER}" \
        --draft 2>&1) || true

      # Extract PR number from the URL (e.g. https://github.com/owner/repo/pull/123)
      PR_NUMBER=$(echo "$PR_URL" | grep -oE '/pull/[0-9]+' | grep -oE '[0-9]+' | tail -1 || true)

      if [ -n "$PR_NUMBER" ]; then
        echo "$PR_NUMBER" > plan/.pr-number
        echo ">>> Draft PR #${PR_NUMBER} created"
      else
        echo "!!! Draft PR creation failed (non-fatal): ${PR_URL}"
      fi
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
    BEFORE=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || true)
    BEFORE=${BEFORE:-0}

    run_claude --output-format stream-json \
      -p "$(cat "${PROMPTS_DIR}/execute-tasks.md")"

    # Count unchecked after
    AFTER=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || true)
    AFTER=${AFTER:-0}
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

    # More tasks or all done — either way, iterate again
    exit 1
    ;;

  finalize-pr)
    set_state "finalize-pr"

    # Push the branch — fail loudly
    if ! git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE"; then
      echo "!!! Push failed — branch may have diverged"
    fi

    PR_NUMBER=$(resolve_pr_number)
    if [ -z "$PR_NUMBER" ]; then
      echo "!!! No draft PR found — cannot finalize"
      clear_state
      exit 2
    fi

    echo ">>> Finalizing PR #${PR_NUMBER}"

    # Save fork token before overriding for PR operations
    GH_TOKEN_FORK="$GH_TOKEN"

    # Claude will run `gh pr edit --repo UPSTREAM_REPO` which needs upstream token
    export GH_TOKEN="$GH_TOKEN_UPSTREAM"

    run_claude \
      -p "$(cat "${PROMPTS_DIR}/finalize-pr.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}
PR number: ${PR_NUMBER}
Branch: ${BRANCH}"

    # Mark PR as ready for review (deterministic — not delegated to Claude)
    GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr ready "$PR_NUMBER" \
      --repo "$UPSTREAM_REPO" 2>&1 | tee -a "$LOG_FILE" || true
    echo ">>> PR #${PR_NUMBER} marked ready for review"

    upload_screenshots "$PR_NUMBER" "$GH_TOKEN_FORK"

    # Persist PR number for await-ci state (do NOT archive plan yet — needed for remediation)
    echo "$PR_NUMBER" > plan/.pr-number
    touch plan/.finalized
    clear_state
    echo ">>> PR #${PR_NUMBER} finalized for issue #${ISSUE_NUMBER}, transitioning to await-ci"
    exit 1  # iterate again into await-ci
    ;;

  await-ci)
    set_state "await-ci"

    PR_NUMBER=$(cat plan/.pr-number)
    echo ">>> Monitoring CI for PR #${PR_NUMBER}"

    CI_STATUS=$(poll_ci_status "$PR_NUMBER")
    echo ">>> CI status: ${CI_STATUS}"

    case "$CI_STATUS" in
      pending)
        echo ">>> CI still running, will retry after cooldown"
        exit 1
        ;;
      passing)
        echo ">>> CI passed! Merging PR #${PR_NUMBER}"
        GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr merge "$PR_NUMBER" \
          --repo "$UPSTREAM_REPO" --squash 2>&1 | tee -a "$LOG_FILE" || {
          echo "!!! Merge failed for PR #${PR_NUMBER}"
          exit 2
        }
        archive_plan
        echo ">>> Issue #${ISSUE_NUMBER} complete — PR merged"
        exit 0
        ;;
      conflicting)
        check_remediation_attempts "Merge conflict remediation failed"

        git fetch origin "$UPSTREAM_BASE_BRANCH" 2>&1 | tee -a "$LOG_FILE" || true

        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        run_claude \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}
Base branch: ${UPSTREAM_BASE_BRANCH}

Failure type: MERGE_CONFLICT
The PR has merge conflicts with the base branch (${UPSTREAM_BASE_BRANCH}). The base branch has already been fetched. Rebase onto origin/${UPSTREAM_BASE_BRANCH} and resolve all conflicts."

        git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

        clear_state
        echo ">>> Conflict resolution pushed, will re-check after cooldown"
        exit 1
        ;;
      failing)
        check_remediation_attempts "CI remediation failed"

        # Get the failed run ID
        RUN_ID=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr checks "$PR_NUMBER" \
          --repo "$UPSTREAM_REPO" --json state,link \
          --jq '.[] | select(.state == "FAILURE") | .link' \
          | head -1 | grep -oE '[0-9]+$') || true

        FAILED_LOG=""
        if [ -n "$RUN_ID" ]; then
          FAILED_LOG=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh run view "$RUN_ID" \
            --repo "$UPSTREAM_REPO" --log-failed 2>&1 | tail -200) || true
        fi

        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        run_claude \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}

Failure type: CI_FAILURE
CI failure logs:
\`\`\`
${FAILED_LOG}
\`\`\`"

        git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

        clear_state
        echo ">>> Remediation pushed, will re-check CI after cooldown"
        exit 1
        ;;
    esac
    ;;

  done)
    echo ">>> Issue #${ISSUE_NUMBER} already completed"
    exit 0
    ;;

esac
