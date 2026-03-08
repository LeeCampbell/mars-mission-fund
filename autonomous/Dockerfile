# Autonomous agent: Claude Code + Playwright MCP in Docker
# Base includes browser deps + Node.js (Ubuntu Noble)
FROM mcr.microsoft.com/playwright:v1.52.0-noble

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    jq \
    sudo \
  && rm -rf /var/lib/apt/lists/*

# GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Claude Code CLI + Playwright MCP server (global)
RUN npm install -g @anthropic-ai/claude-code @playwright/mcp

# Install Chromium for Playwright (Chrome is not available on ARM64)
RUN npx playwright install chromium

# Non-root user — Claude Code refuses --dangerously-skip-permissions as root
RUN useradd -m -s /bin/bash agent \
  && echo "agent ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Pre-create ~/.claude so Docker volume mounts don't create it as root.
# Without this, mounting .mcp.json to /home/agent/.claude/.mcp.json causes
# Docker to create the .claude/ directory owned by root, which blocks
# Claude Code's Bash tool (session-env) and MCP config reads.
RUN mkdir -p /home/agent/.claude \
  && chown -R agent:agent /home/agent

WORKDIR /workspace
RUN chown agent:agent /workspace

# Copy scripts
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY agent-loop.sh /usr/local/bin/agent-loop.sh
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/agent-loop.sh

# Copy prompts into container
COPY prompts/ /usr/local/share/prompts/

USER agent

ENTRYPOINT ["entrypoint.sh"]
