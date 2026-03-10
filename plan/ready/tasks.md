# Tasks: Issue #57 — Milestone housekeeping: npm-workspaces

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Create specs/adrs/ directory and write ADR-0001
  - **Goal**: Establish the `specs/adrs/` directory and document the npm workspaces architectural decision.
  - **Details**: Create `specs/adrs/0001-npm-workspaces-monorepo.md` using the ADR template from L3-001 Section 7.2. The ADR must have status `Accepted` (the decision is already implemented), explain why npm workspaces was chosen over Turborepo/Nx (simpler, no build orchestration overhead, sufficient for a monorepo of this size), and why `packages/` was chosen over `src/` (industry convention, clearer signal of publishable/installable units). Follow L3-007: one sentence per line, no trailing whitespace, proper heading levels, no bare URLs.
  - **Files**: `specs/adrs/0001-npm-workspaces-monorepo.md` (create new file and new directory)
  - **Verify**: File exists at `specs/adrs/0001-npm-workspaces-monorepo.md`; status is `Accepted`; ADR covers both decisions (npm workspaces vs Turborepo/Nx, and `packages/` vs `src/`); `npm run lint:md` passes on the file.
  - **Brief ref**: Step 1 of the Approach section.

- [ ] TASK-02: Update specs/tech/architecture.md — fix server/ path in Section 1
  - **Goal**: Correct the local demo scope note in Section 1 to reference the monorepo path and workspace-aware run command.
  - **Details**: In `specs/tech/architecture.md` Section 1 (Purpose), update the `> **Local demo scope**` blockquote. Change `the Express server (\`server/\`)` to `the Express server (\`packages/server/\`)`. Change the run command from `` `npm run dev` inside the `server/` directory `` to `` `npm run dev:server` from the repo root (or `npm run dev` inside `packages/server/`) ``. Bump the spec version from `0.4` to `0.5` in the frontmatter. Add a change log entry for today's date (2026-03-10) summarising the path correction.
  - **Files**: `specs/tech/architecture.md`
  - **Verify**: Section 1 blockquote contains `packages/server/` and `npm run dev:server`; no bare `server/` path reference remains in the modified text; version is `0.5`; change log entry present; `npm run lint:md` passes.
  - **Brief ref**: Step 2 of the Approach section.

- [ ] TASK-03: Update specs/tech/tech-stack.md — fix Local Development section
  - **Goal**: Update the Local Development section to reflect the monorepo directory structure.
  - **Details**: In `specs/tech/tech-stack.md`, make these changes to the Local Development section:
    1. DBMate invocation: change `-v "$(pwd)/server/db:/db"` to `-v "$(pwd)/packages/server/db:/db"` and update the prose line `DBMate applies migrations from \`server/db/migrations/\`.` to `DBMate applies migrations from \`packages/server/db/migrations/\`.`
    2. Express Server run command: change `cd server && npm run dev` to `npm run dev:server` (run from repo root).
    3. Server Directory Layout code block: change the root label from `server/` to `packages/server/`.
    Bump the spec version from `0.2.0` to `0.3.0` in the frontmatter. Add a change log entry for 2026-03-10 summarising the path updates.
  - **Files**: `specs/tech/tech-stack.md`
  - **Verify**: No occurrence of bare `server/` (without `packages/`) remains in the Local Development section; version is `0.3.0`; change log entry present; `npm run lint:md` passes.
  - **Brief ref**: Step 3 of the Approach section.

- [ ] TASK-04: Update specs/README.md — add specs/adrs/ to layout and tooling table
  - **Goal**: Make the specs index reflect the new `specs/adrs/` directory and link to the ADR tooling.
  - **Details**: In `specs/README.md`:
    1. File System Layout code block: add `├── adrs/` with a nested entry `│   └── 0001-npm-workspaces-monorepo.md  ← ADR-0001` after `├── README.md` and before `├── learnings.md` (or wherever it fits alphabetically / logically in the tree).
    2. Tooling table: add a new row for ADRs — document `adrs/` (or `adrs/0001-npm-workspaces-monorepo.md`), purpose "Architecture Decision Records capturing technology and structural choices."
  - **Files**: `specs/README.md`
  - **Verify**: `specs/README.md` File System Layout includes `adrs/` directory; Tooling table has an ADR row; `npm run lint:md` passes.
  - **Brief ref**: Step 4 of the Approach section.
