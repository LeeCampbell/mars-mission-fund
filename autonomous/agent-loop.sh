#!/usr/bin/env bash
set -euo pipefail

# Agent loop state machine for a single GitHub issue.
# Receives: ISSUE_NUMBER, ISSUE_TITLE, BRANCH, FORK_URL, UPSTREAM_REPO, UPSTREAM_BASE_BRANCH
# Exit codes: 0 = issue complete (PR merged-ready), 1 = needs another iteration, 2 = stuck

REPO_DIR="/workspace/repo"
PROMPTS_DIR="/usr/local/share/prompts"
LOG_DIR="/workspace/logs"
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
    elif [ -f "plan/.pr-url" ]; then
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
  # Archive plan: move ready → done, then remove plan dir entirely.
  # Plans are preserved in git history but kept out of the current tree.
  mkdir -p plan/done
  if [ -d "plan/ready" ]; then
    mv plan/ready/* plan/done/ 2>/dev/null || true
  fi
  rm -rf plan/
  git add plan/ 2>/dev/null || true
  git commit -m "chore: remove plan files after PR creation" 2>/dev/null || true
  git push origin "$BRANCH" --force-with-lease 2>/dev/null || true
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

      # Push branch to fork so we can create a draft PR for visibility
      git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

      # Create draft PR (once — this state only runs once)
      PR_NUMBER=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr create \
        --repo "$UPSTREAM_REPO" \
        --base "$UPSTREAM_BASE_BRANCH" \
        --head "${FORK_OWNER}:${BRANCH}" \
        --title "feat: ${ISSUE_TITLE}" \
        --body "Work in progress for #${ISSUE_NUMBER}" \
        --draft --json number --jq '.number' 2>&1) || true

      if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" -eq "$PR_NUMBER" ] 2>/dev/null; then
        echo "$PR_NUMBER" > plan/.pr-number
        echo ">>> Draft PR #${PR_NUMBER} created"
      else
        echo "!!! Draft PR creation failed (non-fatal): ${PR_NUMBER}"
      fi

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
    BEFORE=$(grep -c '^\- \[ \]' "plan/ready/tasks.md" || true)
    BEFORE=${BEFORE:-0}

    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print --output-format stream-json --verbose \
      -p "$(cat "${PROMPTS_DIR}/execute-tasks.md")" \
      2>&1 | tee "$LOG_FILE" || true

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

    # Check if more tasks remain
    if [ "$AFTER" -gt 0 ]; then
      exit 1
    fi

    # All tasks done — fall through to next iteration for finalize-pr
    exit 1
    ;;

  finalize-pr)
    set_state "finalize-pr"

    # Push the branch — fail loudly
    if ! git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE"; then
      echo "!!! Push failed — branch may have diverged"
    fi

    # Resolve PR number: from plan file (created in create-tasks), or query upstream
    PR_NUMBER=""
    if [ -f "plan/.pr-number" ]; then
      PR_NUMBER=$(cat plan/.pr-number)
    fi
    if [ -z "$PR_NUMBER" ]; then
      PR_NUMBER=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr list --repo "$UPSTREAM_REPO" \
        --head "${FORK_OWNER}:${BRANCH}" --json number --jq '.[0].number' 2>/dev/null || true)
    fi

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

    # Let Claude update the PR title and description
    timeout "$TIMEOUT" claude \
      --dangerously-skip-permissions \
      --print \
      --verbose \
      -p "$(cat "${PROMPTS_DIR}/finalize-pr.md")

Issue number: #${ISSUE_NUMBER}
Issue title: ${ISSUE_TITLE}
Upstream repo: ${UPSTREAM_REPO}
PR number: ${PR_NUMBER}
Branch: ${BRANCH}" \
      2>&1 | tee "$LOG_FILE" || true

    # Mark PR as ready for review (deterministic — not delegated to Claude)
    GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr ready "$PR_NUMBER" \
      --repo "$UPSTREAM_REPO" 2>&1 | tee -a "$LOG_FILE" || true
    echo ">>> PR #${PR_NUMBER} marked ready for review"

    # Upload screenshots as a PR comment
    if ls /screenshots/ISSUE-${ISSUE_NUMBER}-*.png 1>/dev/null 2>&1; then
      COMMENT_BODY="## Screenshots\n\n"
      FORK_REPO=$(echo "$FORK_URL" | sed 's|.*github.com/||;s|\.git$||')

      # Ensure screenshots branch exists on fork
      if ! GH_TOKEN="$GH_TOKEN_FORK" gh api "repos/${FORK_REPO}/git/ref/heads/screenshots" &>/dev/null; then
        DEFAULT_SHA=$(GH_TOKEN="$GH_TOKEN_FORK" gh api "repos/${FORK_REPO}/git/ref/heads/main" --jq '.object.sha')
        GH_TOKEN="$GH_TOKEN_FORK" gh api "repos/${FORK_REPO}/git/refs" \
          -X POST -f ref="refs/heads/screenshots" -f sha="$DEFAULT_SHA" 2>/dev/null || true
      fi

      for img in /screenshots/ISSUE-${ISSUE_NUMBER}-*.png; do
        FNAME=$(basename "$img")
        # Upload to fork repo screenshots branch via contents API (uses fork token)
        # Pipe base64 via stdin to jq, then pipe JSON to gh api, to avoid
        # Linux MAX_ARG_STRLEN (128KB) limit on individual command-line args.
        (base64 -w0 "$img" 2>/dev/null || base64 "$img") \
        | tr -d '\n' \
        | jq -Rs \
          --arg msg "chore: add screenshot ${FNAME}" \
          --arg branch "screenshots" \
          '{message: $msg, content: ., branch: $branch}' \
        | GH_TOKEN="$GH_TOKEN_FORK" gh api \
          "repos/${FORK_REPO}/contents/screenshots/PR-${PR_NUMBER}/${FNAME}" \
          -X PUT --input - \
        || echo "!!! Failed to upload screenshot: ${FNAME}"

        RAW_URL="https://raw.githubusercontent.com/${FORK_REPO}/screenshots/screenshots/PR-${PR_NUMBER}/${FNAME}"
        COMMENT_BODY="${COMMENT_BODY}### ${FNAME}\n![${FNAME}](${RAW_URL})\n\n"
      done

      # Post comment on upstream PR with screenshots (uses upstream token)
      echo -e "$COMMENT_BODY" | GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr comment "$PR_NUMBER" \
        --repo "$UPSTREAM_REPO" --body-file - || true
    fi

    # Write PR number for await-ci state (do NOT archive plan yet — needed for remediation)
    echo "$PR_NUMBER" > plan/.pr-url
    clear_state
    echo ">>> PR #${PR_NUMBER} finalized for issue #${ISSUE_NUMBER}, transitioning to await-ci"
    exit 1  # iterate again into await-ci
    ;;

  await-ci)
    set_state "await-ci"

    PR_NUMBER=$(cat plan/.pr-url)
    echo ">>> Monitoring CI for PR #${PR_NUMBER}"

    # Check for merge conflicts first (separate from CI checks)
    MERGEABLE=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr view "$PR_NUMBER" \
      --repo "$UPSTREAM_REPO" --json mergeable --jq '.mergeable' 2>/dev/null) || true

    if [ "$MERGEABLE" = "CONFLICTING" ]; then
      echo ">>> PR has merge conflicts"
      CI_STATUS="conflicting"
    else
      # Poll CI status (using upstream token since PR is on upstream)
      # Map check states to pending/passing/failing
      CI_RAW=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr checks "$PR_NUMBER" \
        --repo "$UPSTREAM_REPO" --json state --jq '.[].state' 2>&1) || true

      if echo "$CI_RAW" | grep -qiE 'IN_PROGRESS|QUEUED|PENDING'; then
        CI_STATUS="pending"
      elif echo "$CI_RAW" | grep -qiE 'FAILURE|ERROR|CANCELLED|ACTION_REQUIRED|TIMED_OUT|STARTUP_FAILURE'; then
        # Only failing if nothing is still pending
        CI_STATUS="failing"
      elif echo "$CI_RAW" | grep -qiE 'SUCCESS|SKIPPED|NEUTRAL'; then
        CI_STATUS="passing"
      else
        # No checks found yet or unexpected output — treat as pending
        echo ">>> CI status unclear (raw: ${CI_RAW}), treating as pending"
        CI_STATUS="pending"
      fi
    fi

    echo ">>> CI status: ${CI_STATUS}"

    case "$CI_STATUS" in
      pending)
        # CI still running — exit 1, outer loop retries after cooldown
        echo ">>> CI still running, will retry after cooldown"
        exit 1
        ;;
      passing)
        # CI passed — archive plan and exit 0
        echo ">>> CI passed! Archiving plan."
        archive_plan
        echo ">>> Issue #${ISSUE_NUMBER} complete"
        exit 0
        ;;
      conflicting)
        # Track remediation attempts (shared counter with CI failures)
        ATTEMPTS_FILE="plan/.ci-attempts"
        ATTEMPTS=$(cat "$ATTEMPTS_FILE" 2>/dev/null || echo 0)
        MAX_CI_ATTEMPTS=3

        if [ "$ATTEMPTS" -ge "$MAX_CI_ATTEMPTS" ]; then
          echo "!!! Merge conflict remediation failed after ${MAX_CI_ATTEMPTS} attempts"
          exit 2  # stuck
        fi

        echo $((ATTEMPTS + 1)) > "$ATTEMPTS_FILE"
        echo ">>> Merge conflict — remediation attempt $((ATTEMPTS + 1))/${MAX_CI_ATTEMPTS}"

        # Fetch latest base branch so rebase has up-to-date refs
        git fetch origin "$UPSTREAM_BASE_BRANCH" 2>&1 | tee -a "$LOG_FILE" || true

        # Invoke Claude with remediate-ci prompt (merge conflict mode)
        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        timeout "$TIMEOUT" claude \
          --dangerously-skip-permissions \
          --print \
          --verbose \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}
Base branch: ${UPSTREAM_BASE_BRANCH}

Failure type: MERGE_CONFLICT
The PR has merge conflicts with the base branch (${UPSTREAM_BASE_BRANCH}). The base branch has already been fetched. Rebase onto origin/${UPSTREAM_BASE_BRANCH} and resolve all conflicts." \
          2>&1 | tee "$LOG_FILE" || true

        # Push rebased branch (force required after rebase)
        git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

        clear_state
        echo ">>> Conflict resolution pushed, will re-check after cooldown"
        exit 1  # re-enter await-ci after cooldown
        ;;
      failing)
        # Track remediation attempts
        ATTEMPTS_FILE="plan/.ci-attempts"
        ATTEMPTS=$(cat "$ATTEMPTS_FILE" 2>/dev/null || echo 0)
        MAX_CI_ATTEMPTS=3

        if [ "$ATTEMPTS" -ge "$MAX_CI_ATTEMPTS" ]; then
          echo "!!! CI remediation failed after ${MAX_CI_ATTEMPTS} attempts"
          exit 2  # stuck
        fi

        echo $((ATTEMPTS + 1)) > "$ATTEMPTS_FILE"
        echo ">>> CI failing — remediation attempt $((ATTEMPTS + 1))/${MAX_CI_ATTEMPTS}"

        # Get the failed run ID (filter to failing checks only)
        RUN_ID=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh pr checks "$PR_NUMBER" \
          --repo "$UPSTREAM_REPO" --json state,link \
          --jq '.[] | select(.state == "FAILURE") | .link' \
          | head -1 | grep -oE '[0-9]+$') || true

        # Get failure logs
        FAILED_LOG=""
        if [ -n "$RUN_ID" ]; then
          FAILED_LOG=$(GH_TOKEN="$GH_TOKEN_UPSTREAM" gh run view "$RUN_ID" \
            --repo "$UPSTREAM_REPO" --log-failed 2>&1 | tail -200) || true
        fi

        # Invoke Claude with remediate-ci prompt
        REMEDIATE_PROMPT=$(cat "${PROMPTS_DIR}/remediate-ci.md")
        timeout "$TIMEOUT" claude \
          --dangerously-skip-permissions \
          --print \
          --verbose \
          -p "${REMEDIATE_PROMPT}

PR number: #${PR_NUMBER}
Issue number: #${ISSUE_NUMBER}
Branch: ${BRANCH}

Failure type: CI_FAILURE
CI failure logs:
\`\`\`
${FAILED_LOG}
\`\`\`" \
          2>&1 | tee "$LOG_FILE" || true

        # Push fix
        git push origin "$BRANCH" --force-with-lease 2>&1 | tee -a "$LOG_FILE" || true

        clear_state
        echo ">>> Remediation pushed, will re-check CI after cooldown"
        exit 1  # re-enter await-ci after cooldown
        ;;
    esac
    ;;

  done)
    echo ">>> Issue #${ISSUE_NUMBER} already completed"
    exit 0
    ;;

esac
