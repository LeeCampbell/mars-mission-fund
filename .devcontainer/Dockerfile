FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install PostgreSQL client for psql debugging access
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install dbmate for database migrations
ARG DBMATE_VERSION=2.24.2
RUN curl -fsSL -o /usr/local/bin/dbmate \
    "https://github.com/amacneil/dbmate/releases/download/v${DBMATE_VERSION}/dbmate-linux-amd64" \
    && chmod +x /usr/local/bin/dbmate
