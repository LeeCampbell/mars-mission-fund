# Tasks: Issue #40 — Add PostgreSQL infrastructure and campaign read model

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create `.env.example` and `docker-compose.dev.yml`
  - **Goal**: Provide local developer environment configuration for PostgreSQL.
  - **Details**: Create `.env.example` at the repo root with `DATABASE_URL=postgresql://mmf:mmf@localhost:5432/mmf`, `PORT=3001`, and `NODE_ENV=development`. Create `docker-compose.dev.yml` at repo root with a `postgres:16-alpine` service named `db`, named volume `pgdata`, healthcheck `pg_isready -U mmf`, environment vars `POSTGRES_USER=mmf`, `POSTGRES_PASSWORD=mmf`, `POSTGRES_DB=mmf`, and port mapping `5432:5432`.
  - **Files**:
    - `.env.example` (create)
    - `docker-compose.dev.yml` (create)
  - **Verify**: Both files exist and are syntactically valid YAML/env format. The `docker-compose.dev.yml` can be parsed with `docker compose -f docker-compose.dev.yml config`.
  - **Brief ref**: §7 `.env.example`, §1 Local developer Docker Compose

- [x] TASK-02: Update `autonomous/docker-compose.yml` with `db` and `migrate` services
  - **Goal**: Add PostgreSQL and DBMate migration runner services to the autonomous agent compose file so migrations run before the agent starts.
  - **Details**: Add two new services to `autonomous/docker-compose.yml`:
    - `db`: `postgres:16-alpine`, same env vars as dev compose, named volume `pgdata`, healthcheck `pg_isready -U mmf`, port `5432:5432`.
    - `migrate`: `ghcr.io/amacneil/dbmate:latest`, command `dbmate up`, `depends_on: db` with condition `service_healthy`, volume mount `../server/db:/db`, env `DATABASE_URL=postgresql://mmf:mmf@db:5432/mmf`.
    - Update the existing `agent` service to add `depends_on: [migrate]` (with condition `service_completed_successfully`).
    - Add `volumes: pgdata:` at the top level.
  - **Files**:
    - `autonomous/docker-compose.yml` (modify)
  - **Verify**: `docker compose -f autonomous/docker-compose.yml config` parses without errors. The agent service lists `migrate` in `depends_on`.
  - **Brief ref**: §2 Autonomous agent Docker Compose

- [x] TASK-03: Install DBMate binary in `autonomous/Dockerfile`
  - **Goal**: Make the `dbmate` CLI available inside the agent container so it can run migrations directly if needed.
  - **Details**: Add a `RUN` step (as root, before `USER agent`) that downloads `https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64` using `curl -fsSL`, writes it to `/usr/local/bin/dbmate`, and runs `chmod +x /usr/local/bin/dbmate`. Insert this step after the GitHub CLI installation and before the Claude Code install.
  - **Files**:
    - `autonomous/Dockerfile` (modify)
  - **Verify**: The `RUN` step appears in the Dockerfile with the correct download URL and `chmod +x` call.
  - **Brief ref**: §3 Dockerfile DBMate install

- [x] TASK-04: Create DBMate migration files (tables)
  - **Goal**: Create the five schema migration files that define the campaign read model tables.
  - **Details**: Create `server/db/migrations/` directory and the following files, each with `-- migrate:up` and `-- migrate:down` sections:
    - `20260309000001_create_campaigns.sql` — `campaigns` table with all columns listed in the brief (UUID PK, slug, title, summary, description, alignment_statement, category, tags TEXT[], status, hero_image_url, min/max/current funding in cents as BIGINT, contributor_count, deadline, launched_at, created_at, updated_at).
    - `20260309000002_create_campaign_team_members.sql` — `campaign_team_members` table (UUID PK, campaign_id FK → campaigns ON DELETE CASCADE, name, role, bio, sort_order).
    - `20260309000003_create_campaign_milestones.sql` — `campaign_milestones` table (UUID PK, campaign_id FK, title, description, target_date DATE, funding_pct INTEGER, verification_criteria, status DEFAULT 'Pending', sort_order).
    - `20260309000004_create_campaign_stretch_goals.sql` — `campaign_stretch_goals` table (UUID PK, campaign_id FK, target_usd BIGINT, description, deliverables, sort_order).
    - `20260309000005_create_campaign_updates.sql` — `campaign_updates` table (UUID PK, campaign_id FK, body, posted_at TIMESTAMPTZ DEFAULT now()).
    - Each `-- migrate:down` section must DROP the table in reverse dependency order.
  - **Files**:
    - `server/db/migrations/20260309000001_create_campaigns.sql` (create)
    - `server/db/migrations/20260309000002_create_campaign_team_members.sql` (create)
    - `server/db/migrations/20260309000003_create_campaign_milestones.sql` (create)
    - `server/db/migrations/20260309000004_create_campaign_stretch_goals.sql` (create)
    - `server/db/migrations/20260309000005_create_campaign_updates.sql` (create)
  - **Verify**: Each file contains `-- migrate:up` and `-- migrate:down` markers. `CREATE TABLE` statements match the column definitions in the brief. FK references to `campaigns(id)` use `ON DELETE CASCADE`.
  - **Brief ref**: §4 DBMate migrations (migrations 1–5)

- [x] TASK-05: Create seed data migration
  - **Goal**: Populate the database with 8–10 realistic campaigns covering multiple categories and statuses, each with milestones, some with stretch goals and updates.
  - **Details**: Create `server/db/migrations/20260309000006_seed_campaigns.sql` with `-- migrate:up` that inserts:
    - 8–10 campaigns spanning at least 5 different categories (e.g. Technology, Environment, Education, Health, Arts) and statuses including `Live`, `Funded`, and `Complete`.
    - Each campaign has 2–4 milestones with realistic titles, descriptions, target dates, funding_pct (summing to 100 per campaign), verification_criteria, and statuses.
    - 2–3 campaigns have 1–2 stretch goals with target_usd and descriptions.
    - 2–3 campaigns have 1–3 campaign updates with body text and posted_at dates.
    - Use explicit UUIDs (e.g. `gen_random_uuid()` inline or hard-coded UUIDs) so FK references work within the same SQL file.
    - All inserts use `INSERT … ON CONFLICT DO NOTHING` for idempotency.
    - The `-- migrate:down` section deletes all seed rows (DELETE by slug or by static UUID).
    - Funding amounts should vary: some campaigns near their min target, some well above it.
  - **Files**:
    - `server/db/migrations/20260309000006_seed_campaigns.sql` (create)
  - **Verify**: File contains `-- migrate:up` and `-- migrate:down`. There are 8–10 INSERT statements for campaigns. Related inserts reference valid campaign IDs. `ON CONFLICT DO NOTHING` is present on all campaign inserts.
  - **Brief ref**: §4 DBMate migrations (migration 6)

- [x] TASK-06: Create `server/package.json` and `server/tsconfig.json`
  - **Goal**: Establish the server sub-package with correct runtime and dev dependencies and TypeScript configuration.
  - **Details**:
    - `server/package.json`: `"name": "server"`, `"type": "module"`, `"main": "dist/index.js"`. Runtime deps: `express@^5`, `pg`, `dotenv`, `pino`, `pino-http`, `zod`, `swagger-jsdoc`, `swagger-ui-express`. Dev deps: `@types/express`, `@types/pg`, `@types/node`, `typescript`, `pino-pretty`, `vitest`, `supertest`, `@types/supertest`. Include `"scripts"`: `"build": "tsc"`, `"dev": "node --watch dist/index.js"`, `"test": "vitest"`.
    - `server/tsconfig.json`: `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"strict": true`, `"noUncheckedIndexedAccess": true`, `"outDir": "dist"`, `"rootDir": "src"`, `"skipLibCheck": true`.
  - **Files**:
    - `server/package.json` (create)
    - `server/tsconfig.json` (create)
  - **Verify**: `server/package.json` is valid JSON with all listed runtime and dev dependencies. `server/tsconfig.json` is valid JSON with `strict: true` and the correct `target`/`module`/`moduleResolution` values. Running `cd server && npm install` completes without errors.
  - **Brief ref**: §5 `server/package.json`, §6 `server/tsconfig.json`

- [ ] TASK-07: Verify frontend build and migrations SQL syntax
  - **Goal**: Confirm that all previous tasks' outputs are syntactically valid and the existing frontend build still passes.
  - **Details**:
    - Run `npm run build` from the repo root and confirm it exits 0.
    - Run `npm test` from the repo root and confirm existing frontend tests pass.
    - Manually review each migration file for SQL syntax correctness (matching parentheses, correct column types, all FKs reference the correct table and column).
    - Confirm `server/package.json` includes `"type": "module"` and all required deps from the brief.
    - Confirm `.env.example` exists with `DATABASE_URL`, `PORT`, and `NODE_ENV` keys.
  - **Files**: No new files; read-only verification.
  - **Verify**: `npm run build` exits 0. `npm test` exits 0. All 6 migration files exist under `server/db/migrations/`. Both `server/package.json` and `server/tsconfig.json` exist.
  - **Brief ref**: §Verification
