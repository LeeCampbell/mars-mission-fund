# Tasks: Issue #44 — Close milestone: Public Campaign Pages

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create plan/public-campaign-pages/tasks/05-close.tasks.md
  - **Goal**: Produce the standard close-milestone task file for the Public Campaign Pages milestone, following the same 5-task pattern used for prior milestones.
  - **Details**: Create the directory `plan/public-campaign-pages/tasks/` if it does not exist. Write `05-close.tasks.md` with 5 tasks: (1) update specs, (2) capture rationale, (3) reconcile divergences, (4) add vocabulary, (5) update index. Model the structure on the established close-milestone pattern described in the brief's Approach section. Each task must list Goal, Details, Files, and Verify fields consistent with this project's task format.
  - **Files**: `plan/public-campaign-pages/tasks/05-close.tasks.md` (create)
  - **Verify**: File exists at the expected path; contains exactly 5 tasks with all required fields; markdownlint passes on the file.
  - **Brief ref**: Approach step 1; Files table row 1.

- [x] TASK-02: Update specs/tech/tech-stack.md — Local Development subsection
  - **Goal**: Document the local development environment details (Docker Compose, DBMate, server layout) that were implemented during issues #40–#43.
  - **Details**: Add a **Local Development** subsection under the Database & Data Access section (or immediately after the CI/CD section). Include: (a) `docker-compose.dev.yml` runs `postgres:16-alpine` on port 5432 for local development; (b) DBMate is invoked via `docker run` (or local install) to apply migrations from `server/db/migrations/`; (c) migration file naming convention is `YYYYMMDDHHMMSS_<snake_case_description>.sql`; (d) server directory layout: `server/src/` with sub-directories `campaigns/`, `db/`, `middleware/`, and `__tests__/`. Bump version from `0.1.0` to `0.2.0` and add a change-log entry dated 2026-03-09 summarising the Local Development additions.
  - **Files**: `specs/tech/tech-stack.md` (modify)
  - **Verify**: The new subsection is present with all four documented items; version header reads `0.2.0`; change log has a new entry; `npm run lint` (markdownlint) passes on the file.
  - **Brief ref**: Scope section, Update L3-008 bullet; Approach step 2.

- [ ] TASK-03: Update specs/tech/frontend.md — API/hooks layer, Vite proxy, lazy routes
  - **Goal**: Document the frontend patterns introduced during issues #40–#43: the api/hooks layering convention, Vite dev-server proxy, and route-level lazy loading.
  - **Details**: Extend **Section 1.5 (API Communication)** to document: (a) `src/api/<domain>.ts` contains plain fetch functions with TypeScript types inferred from Zod schemas; (b) `src/hooks/use<Domain>.ts` contains TanStack Query `useQuery` hooks wrapping the API layer; (c) page components import hooks only — never call fetch functions directly. Add a note that `vite.config.ts` has a `server.proxy` entry proxying `/v1` to `http://localhost:3000` in development so the frontend can call `/v1/campaigns` without CORS issues. Extend **Section 1.4 (Routing)** to record that non-marketing routes (campaign detail, contribute) use `React.lazy` + `Suspense` for route-level code splitting, and that a root `<Suspense>` wraps the `<Routes>` tree. Bump version from `0.3` to `0.4` and add a change-log entry dated 2026-03-09 summarising all three additions.
  - **Files**: `specs/tech/frontend.md` (modify)
  - **Verify**: Sections 1.4 and 1.5 contain the documented patterns; version header reads `0.4`; change log has a new entry; markdownlint passes.
  - **Brief ref**: Scope section, Update L3-005 bullets; Approach step 3.

- [ ] TASK-04: Update specs/tech/architecture.md — local Docker Compose topology
  - **Goal**: Correct the local demo scope note in Section 1 to accurately reflect the Docker Compose setup implemented in issues #40–#43.
  - **Details**: Amend the **Local demo scope** note in Section 1 (Purpose) to state that `docker-compose.dev.yml` starts the PostgreSQL database only; the Express server (`server/`) is run separately with `npm run dev` inside the `server/` directory — it is not part of the Docker Compose stack. The existing note says "The local demo runs as a single Docker Compose stack" which is no longer accurate. Also check Section 5.4 (Container & Orchestration Strategy) for any similar wording and update if needed. Bump version from `0.3` to `0.4` and add a change-log entry dated 2026-03-09 describing the topology clarification.
  - **Files**: `specs/tech/architecture.md` (modify)
  - **Verify**: The local demo scope note no longer states a single Docker Compose stack; the corrected topology (DB-only Compose + separate server process) is clearly stated; version reads `0.4`; change log updated; markdownlint passes.
  - **Brief ref**: Scope section, Update L3-001 bullet; Approach step 4.

- [ ] TASK-05: Verify specs/README.md index completeness
  - **Goal**: Confirm that the `specs/README.md` index table and file-system layout section accurately reflects every `.md` file currently under `specs/`.
  - **Details**: List all `.md` files under `specs/` (excluding `README.md` itself). Compare against the tables in `specs/README.md` (Specification Hierarchy tables and File System Layout section). No new spec files were added in this milestone, but check for drift from earlier milestones. If every file is accounted for and no entries are stale or missing, make no changes (document this in a code comment or simply leave the file untouched). If drift is found, correct the index and add a change-log-style note at the bottom of `specs/README.md`.
  - **Files**: `specs/README.md` (verify; modify only if drift found)
  - **Verify**: Every `.md` file under `specs/` appears in the README index; no stale entries reference non-existent files; markdownlint passes.
  - **Brief ref**: Scope section, Verify specs/README.md bullet; Approach step 5.

- [ ] TASK-06: Update specs/learnings.md with milestone gotchas
  - **Goal**: Capture any new gotchas discovered during issues #40–#43 so future agents can avoid the same pitfalls.
  - **Details**: Review the implemented code in the repository (particularly `server/`, `src/api/`, `src/hooks/`, `vite.config.ts`, and any Vitest configs under `server/`) for evidence of non-obvious configuration choices or workarounds. Add entries for any confirmed gotchas — for example: Vitest config for server-side tests with ESM (if a special `vitest.config.ts` or transform setting was needed), SuperTest + Express 5 specifics (e.g. async route handlers, error handling differences), or DBMate invocation quirks. Each entry should follow the existing format: a heading with the issue context, bullet points for the problem and resolution. If no new gotchas are found beyond what is already documented, add a brief entry noting that issues #40–#43 completed without new tooling surprises.
  - **Files**: `specs/learnings.md` (modify)
  - **Verify**: File has at least one new entry referencing the Public Campaign Pages milestone; markdownlint passes.
  - **Brief ref**: Scope section, Add entry to specs/learnings.md; Approach step 6.
