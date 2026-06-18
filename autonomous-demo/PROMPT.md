# Feature Request

> This is the request the **Planning Agent** turns into a structured plan, which
> the **Coding Agent** then executes step by step (see the README's "Plan-First
> Orchestration"). Replace it with your own — keep it concrete: what the user
> should be able to do, where it lives, and how to tell it works.
>
> The default below is **Exercise 03 — Trending Missions**: a full-stack feature
> that spans database → server → shared types → client → UI → tests, so the
> planner produces a multi-step `tasks.md` the loop executes one task at a time.

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
Other ready-made options — paste one in place of the section above:

  • SMALL VISUAL (fast, ~1-2 tasks, produces a UI screenshot):
    Add an always-visible site footer to the web app. Create a `Footer`
    component under packages/client/src/ (existing patterns + Tailwind design
    tokens) showing the tagline "Every dollar moves the launch window closer"
    and "© 2026 Mars Mission Fund", mounted at the bottom of the app layout so
    it appears on every page. No backend/DB/deps, no E2E — a screenshot is the
    verification. Done when ci-check passes and the footer is visible at
    http://localhost:5173.

  • UPGRADE / MIGRATION (best for showing Plan-First Orchestration — breaking
    changes, affected files, migration steps, verification criteria):
    Migrate the domain term "Campaign" to "Proposal" across the entire codebase
    — TypeScript types, SQL tables/columns, API routes (/v1/campaigns ->
    /v1/proposals), React components, and the spec at specs/domain/campaign.md.
    Write a proper SQL migration respecting FK constraints. Done when ci-check
    passes, the E2E/UI still works, and GET /v1/proposals returns the data.
    (This is workshop Exercise 01 — see ../01-exercise-rename.md.)

  • CROSS-CUTTING / BACKEND-ONLY (no screenshots):
    Add structured HTTP request logging to the server. Every request logs
    method, path, status code, response time (ms), and correlation ID as JSON
    using the existing pino logger. The middleware must sit AFTER the
    correlationId middleware in app.ts. Add tests asserting the log fields.
    (Workshop Exercise 02 — see ../02-exercise-olly.md.)
-->
