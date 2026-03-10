# Tasks: Issue #81 — Fix component bugs, routing, and HTML issues

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Fix dead `href="#"` links in homepage components
  - **Goal**: Replace all five placeholder `href="#"` values with real `/campaigns` routes so homepage buttons navigate correctly.
  - **Details**:
    - In `HeroSection.tsx`, change `href="#"` → `href="/campaigns"` on the "Explore Missions" `<Button>`.
    - In `ClosingCtaSection.tsx`, change `href="#"` → `href="/campaigns"` on the "Browse All Missions" `<Button>`.
    - In `MissionCard.tsx`, change `href="#"` → `href="/campaigns"` on the "View Mission" `<Button>`.
  - **Files**:
    - `packages/client/src/components/HeroSection.tsx`
    - `packages/client/src/components/ClosingCtaSection.tsx`
    - `packages/client/src/components/MissionCard.tsx`
  - **Verify**: On the home page, clicking "Explore Missions", "Browse All Missions", and any "View Mission" card button navigates to `/campaigns`.
  - **Brief ref**: Section 1 — Dead homepage links

- [x] TASK-02: Fix nested `<main>` elements on About and Contact pages
  - **Goal**: Remove invalid nested `<main>` elements by changing the root element of `AboutPage` and `ContactPage` to `<div>`.
  - **Details**:
    - In `AboutPage.tsx`, change the outermost `<main id="main-content">` to `<div>` (remove the `id` attribute as well — Layout's `<main id="main-content">` already provides it).
    - In `ContactPage.tsx`, apply the same change: `<main id="main-content">` → `<div>`.
  - **Files**:
    - `packages/client/src/pages/AboutPage.tsx`
    - `packages/client/src/pages/ContactPage.tsx`
  - **Verify**: In browser DevTools on `/about` and `/contact`, confirm there is only one `<main>` element in the DOM tree (from Layout).
  - **Brief ref**: Section 4 — Nested `<main>` on About and Contact pages

- [x] TASK-03: Pass `complete` prop to `ProgressBar` in `CampaignCard`
  - **Goal**: Fully-funded campaigns display the green complete gradient on their progress bar.
  - **Details**:
    - In `CampaignCard.tsx`, locate the `<ProgressBar value={fundingPct} ...>` call (around line 76-79).
    - Add `complete={fundingPct >= 100}` as a prop.
  - **Files**:
    - `packages/client/src/components/campaigns/CampaignCard.tsx`
  - **Verify**: A campaign card where `fundingPct >= 100` shows the `var(--color-progress-complete)` gradient on the progress bar.
  - **Brief ref**: Section 3 — ProgressBar `complete` prop in CampaignCard

- [x] TASK-04: Fix CampaignDetailPage — HTML description, hero alt text, and dynamic page title
  - **Goal**: Campaign descriptions render as formatted HTML; hero image has meaningful alt text; the browser tab shows the campaign title.
  - **Details**:
    - **Description**: At line ~217, replace `<p style={descriptionStyle}>{campaign.description}</p>` with `<div style={descriptionStyle} dangerouslySetInnerHTML={{ __html: campaign.description }} />`. (Content comes from the internal API and is safe to render without additional sanitisation per the brief.)
    - **Alt text**: At line ~195, change `alt=""` to `alt={campaign.title}` and remove `aria-hidden="true"` from the hero `<img>`.
    - **Page title**: Import `useEffect` (if not already imported) and add a `useEffect` that runs when `campaign` is set: sets `document.title` to `` `${campaign.title} — Mars Mission Fund` `` and returns a cleanup function that resets it to `'Mars Mission Fund'`.
  - **Files**:
    - `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**:
    - On a campaign detail page, the description shows rendered paragraphs/formatting rather than raw HTML tags.
    - The hero image `alt` attribute in DevTools matches the campaign title.
    - The browser tab title reads `<Campaign Title> — Mars Mission Fund`.
  - **Brief ref**: Sections 2, 5, and 6 (dynamic title portion)

- [ ] TASK-05: Add `/campaigns` entry to `routeTitles` in Layout
  - **Goal**: The `/campaigns` list page has a proper `<title>` of "Campaigns — Mars Mission Fund".
  - **Details**:
    - In `Layout.tsx`, find the `routeTitles` map (around lines 11-15).
    - Add `'/campaigns': 'Campaigns — Mars Mission Fund'` as an entry.
  - **Files**:
    - `packages/client/src/components/Layout.tsx`
  - **Verify**: Navigating to `/campaigns` shows "Campaigns — Mars Mission Fund" in the browser tab.
  - **Brief ref**: Section 6 — Page titles (static `/campaigns` portion)

- [ ] TASK-06: Build and run tests to confirm no regressions
  - **Goal**: All six fixes integrate cleanly with no TypeScript errors or failing tests.
  - **Details**:
    - From the repo root, run `npm run build`. Confirm it exits without errors.
    - Run `npm test` (or the equivalent test command for the client package). Confirm all existing tests pass.
    - Fix any TypeScript or lint errors introduced by the changes before marking complete.
  - **Files**: No new files; any files edited in previous tasks if errors arise.
  - **Verify**: Both `npm run build` and `npm test` exit with code 0.
  - **Brief ref**: Verification section
