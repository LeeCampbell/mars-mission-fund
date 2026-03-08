Use the Playwright MCP server to:

1. Navigate to https://the-internet.herokuapp.com/
2. Verify the page contains the heading "Welcome to the-internet"
3. Verify the page contains the text "SHorizontal Slider"
4. Take a screenshot and save it to /screenshots/result.png

If there are errors attempting to take screenshots, log that to the /screenshots folder.

Report whether all checks passed or failed.

--------

<!-- PROMPTS_DIR="/usr/local/share/prompts"
echo "=========================================="
echo "  Using prompt: ${PROMPTS_DIR}/prompt.md"
echo "=========================================="
TIMEOUT="${TIMEOUT_SECONDS:-1800}"
# timeout "$TIMEOUT" claude \
claude \
      --dangerously-skip-permissions \
      --print --output-format stream-json --verbose \
      -p "$(cat "${PROMPTS_DIR}/prompt.md")"

exit 0 -->