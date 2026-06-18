# Feature Request

> This is the brief the autonomous agent will build. Replace everything below
> with your own feature when you want — but keep it concrete: say what the user
> should be able to do, where it lives in the app, and how to tell it works.
>
> The example below is **Exercise 03 — Trending Missions**. It is a good demo
> because it spans the full stack (database → server → shared types → client →
> UI → tests), so the planner produces a multi-step `tasks.md` the loop then
> executes one task at a time.

## Trending Missions

Add a **"Trending Missions"** section to the Explore page. It shows the 3 most
popular live campaigns by contributor count, displayed as a horizontal row above
the main campaign grid.

### What to build

- **Database**: a query against the `campaigns` table, filtered to `Live`
  status, ordered by `contributor_count` descending, limited to 3.
- **Server**: a new endpoint `GET /v1/campaigns/trending` that returns the top 3
  as campaign summaries. Follow the existing route/query conventions.
- **Shared types**: a type for the trending response (or reuse `CampaignSummary`).
- **Client API**: a new fetch function in `packages/client/src/api/campaigns.ts`,
  following the existing pattern.
- **UI**: a new section at the top of the Explore page
  (`packages/client/src/pages/ExplorePage.tsx`), using existing component
  primitives and design tokens.
- **Tests**: server and client tests for the new endpoint and component, plus a
  Playwright E2E test for the Explore page.

### Done when

- `./scripts/ci-check.sh` passes (type-check, lint, format, build, unit tests).
- Visiting `/explore` shows a **Trending Missions** row above the main grid.
- `GET /v1/campaigns/trending` returns the top 3 live campaigns by contributor
  count.
- The change spans server, shared, and client packages.

<!--
Other ready-made exercises you can paste here instead:

  • Exercise 01 — Refactor-Rename:
    Rename the domain term "Campaign" to "Proposal" across the entire codebase
    (TypeScript types, SQL tables/columns, API routes, React components, and the
    spec at specs/domain/campaign.md). Write a proper SQL migration respecting FK
    constraints. Done when ci-check passes and GET /v1/proposals returns data.

  • Exercise 02 — Cross-Cutting Concern (Observability):
    Add structured HTTP request logging to the server. Every request logs method,
    path, status code, response time (ms), and correlation ID as JSON using the
    existing pino logger. The middleware must sit AFTER the correlationId
    middleware in app.ts. Add tests asserting the log fields. (Backend-only — no
    screenshots needed.)
-->
