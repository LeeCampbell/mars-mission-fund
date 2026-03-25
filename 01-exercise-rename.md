# Exercise 01 — Refactor-Rename

## The challenge

Mars Mission Fund was built using the domain term *Campaign* throughout.
The product team has decided the correct term is *Proposal* — it better reflects the stage at which project teams submit their ideas for review and funding.

Your task: rename `Campaign` to `Proposal` across the entire codebase.

## Scope

Everything is in scope:

- TypeScript source files (shared types, server queries, client components)
- SQL database migrations (table renames, column renames, FK constraints)
- API routes (`/v1/campaigns` → `/v1/proposals`)
- Spec documentation (`specs/domain/campaign.md`)
- Test files

## Why this is hard without AI

`Campaign` appears approximately 1,500 times across 51 TypeScript files and 200+ SQL files.
A manual rename requires:

- Reading each file to decide what to change vs leave (e.g., URL slugs, external integrations)
- Writing SQL migrations in the correct order to respect foreign key constraints
- Updating TypeScript types and catching every downstream usage the compiler flags
- Verifying every test still passes

Estimated time without AI assistance: **4–8 hours**.

## Suggested prompt

Open Claude Code (or your AI assistant of choice) and type:

```text
Rename the domain term "Campaign" to "Proposal" across the entire codebase.
This includes TypeScript types, SQL table names, API routes, React components,
and the spec document at specs/domain/campaign.md.
Write a proper SQL migration for the table renames, respecting FK constraints.
Run the tests when done and fix anything that breaks.
```

## Success criteria

- `npm run build` passes with no TypeScript errors
- `npm run test` passes
- `git diff main --stat` shows 50+ files changed
- The server starts and `GET /v1/proposals` returns campaign data
- No occurrences of `Campaign` remain in TypeScript source (run: `grep -r "Campaign" packages/`)
