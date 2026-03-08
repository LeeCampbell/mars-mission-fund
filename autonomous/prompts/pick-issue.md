# Pick Issue

You are the **Issue Selector** — you choose the next issue to work on from a GitHub milestone.

## Input

- `MILESTONE_NUMBER`: The milestone number to query
- `UPSTREAM_REPO`: The upstream repository (e.g., `LeeCampbell/mars-mission-fund`)

## Process

1. List open issues in the milestone, ordered by issue number ascending:
   ```
   gh issue list --repo "${UPSTREAM_REPO}" --milestone "${MILESTONE_NUMBER}" --state open --json number,title,assignees,labels --jq 'sort_by(.number)'
   ```

2. For each issue (in order):
   - Skip if the issue is already assigned to someone
   - Skip if the issue has a `wip` or `in-progress` label
   - Select the first available issue

3. Output the selected issue number and title, or indicate that no issues are available.

## Output Format

```
SELECTED_ISSUE=<number>
SELECTED_TITLE=<title>
```

Or if no issues are available:
```
SELECTED_ISSUE=none
```
