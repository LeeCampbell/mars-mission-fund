# Self-contained autonomous DEMO: Claude Code + Playwright MCP in Docker.
# Runs the full plan -> tasks -> build -> verify loop locally, no GitHub required.
# Base image includes browser deps + Node.js (Ubuntu Noble).
FROM mcr.microsoft.com/playwright:v1.58.2-noble

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    jq \
    lsof \
    sudo \
  && rm -rf /var/lib/apt/lists/*

# DBMate — database migration tool (applies the app's Postgres schema)
RUN curl -fsSL https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 \
      -o /usr/local/bin/dbmate \
  && chmod +x /usr/local/bin/dbmate

# Claude Code CLI + Playwright MCP server (global).
# Base image ships Node 20 + npm 10; npm workspaces (this monorepo) work fine.
RUN npm install -g @anthropic-ai/claude-code @playwright/mcp

# Non-root user — Claude Code refuses --dangerously-skip-permissions as root.
RUN useradd -m -s /bin/bash agent \
  && echo "agent ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Pre-create ~/.claude so any future volume mounts don't create it as root.
RUN mkdir -p /home/agent/.claude \
  && chown -R agent:agent /home/agent

WORKDIR /workspace
RUN chown agent:agent /workspace

USER agent

# Install Chromium using the MCP server's bundled playwright-core (revision must
# match what the MCP server looks for at runtime). Placed before the COPY steps
# so editing scripts/prompts doesn't bust this slow cache layer.
RUN node /usr/lib/node_modules/@playwright/mcp/node_modules/playwright-core/cli.js install chromium

# Copy scripts (after Chromium install so edits here don't trigger a re-download)
COPY --chown=agent:agent entrypoint.sh demo-loop.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/demo-loop.sh

# Copy the per-state prompts into the image
COPY --chown=agent:agent prompts/ /usr/local/share/prompts/

ENTRYPOINT ["entrypoint.sh"]
