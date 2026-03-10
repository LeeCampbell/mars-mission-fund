# Brief: Issue #81 — Fix component bugs, routing, and HTML issues

## Goal

Resolve six UX-review findings across the client application:
wire dead `href="#"` homepage buttons to real routes (`/campaigns`), fix campaign descriptions
to render HTML markup instead of showing raw tags, pass the `complete` prop to `ProgressBar`
in `CampaignCard` so 100%-funded campaigns show the green gradient, remove nested `<main>`
elements from the `/about` and `/contact` pages, add descriptive alt text to the campaign
detail hero image, and set proper `document.title` values for the `/campaigns` and
`/campaigns/:id` routes.

## Scope

In scope:

- Fix 3 components that contain `href="#"` (renders as 5 dead links across the homepage):
  `HeroSection`, `ClosingCtaSection`, and `MissionCard` — all point to `/campaigns`
- Replace `{campaign.description}` plain-text render with `dangerouslySetInnerHTML` in
  `CampaignDetailPage` so the HTML content is parsed by the browser
- Pass `complete={fundingPct >= 100}` to `ProgressBar` in `CampaignCard`
- Replace `<main id="main-content">` root element in `AboutPage` and `ContactPage` with a
  React fragment (`<>`) — `Layout` already provides the outer `<main>`
- Change the hero `<img>` in `CampaignDetailPage` from `alt="" aria-hidden="true"` to a
  descriptive alt string using the campaign title
- Add `'/campaigns': 'Explore Missions — Mars Mission Fund'` to `routeTitles` in `Layout`
- Set `document.title` dynamically in `CampaignDetailPage` via `useEffect` once campaign
  data is loaded (`<campaign.title> — Mars Mission Fund`)

Out of scope:

- MissionCard "View Mission" links on the homepage are static placeholder data with no
  campaign IDs; they all route to `/campaigns` (not individual campaign pages)
- Changing the `dangerouslySetInnerHTML` content source or sanitisation — the description
  HTML originates from the server API and is trusted in the local demo context
- Any new UI components, styling changes, or data-fetching changes
- Server-side changes

## Approach

All changes are confined to the React client under `packages/client/src/`.
Work file-by-file in the order below.

1. **`HeroSection.tsx`** — change `href="#"` to `href="/campaigns"` on the "Explore Missions"
   button (line 105).

2. **`ClosingCtaSection.tsx`** — change `href="#"` to `href="/campaigns"` on the "Browse All
   Missions" button (line 44).

3. **`MissionCard.tsx`** — change `href="#"` to `href="/campaigns"` on the "View Mission"
   button (line 56).

4. **`CampaignCard.tsx`** — add `complete={fundingPct >= 100}` prop to the `<ProgressBar>`
   (line 76 area).
   `ProgressBar` already accepts `complete?: boolean` and uses it to switch to
   `var(--color-progress-complete)`.

5. **`CampaignDetailPage.tsx`** — three edits:
   a. Replace `<p style={descriptionStyle}>{campaign.description}</p>` with
      `<div style={descriptionStyle} dangerouslySetInnerHTML={{ __html: campaign.description }} />`
      (line 217).
   b. Replace `alt="" aria-hidden="true"` on the hero `<img>` with
      `alt={\`\${campaign.title} hero image\`}` and remove `aria-hidden` (line 195).
   c. Add a `useEffect` that sets `document.title` to
      `` `${campaign.title} — Mars Mission Fund` `` whenever `campaign` changes.
      Import `useEffect` from React (it is not yet imported in this file).

6. **`AboutPage.tsx`** — change the root `<main id="main-content">` to `<>` (React fragment).
   `Layout` already renders `<main id="main-content">` wrapping the `<Outlet>`.

7. **`ContactPage.tsx`** — same fix as `AboutPage.tsx`.

8. **`Layout.tsx`** — add `'/campaigns': 'Explore Missions — Mars Mission Fund'` to the
   `routeTitles` map (line 11 area).
   Note: `/campaigns/:id` titles are set dynamically by `CampaignDetailPage` via
   `useEffect`, so no static entry is needed for that route pattern.

## Files to Create/Modify

| File                                                             | Action | Description                                                           |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `packages/client/src/components/HeroSection.tsx`                | modify | Change `href="#"` to `href="/campaigns"`                              |
| `packages/client/src/components/ClosingCtaSection.tsx`          | modify | Change `href="#"` to `href="/campaigns"`                              |
| `packages/client/src/components/MissionCard.tsx`                | modify | Change `href="#"` to `href="/campaigns"`                              |
| `packages/client/src/components/campaigns/CampaignCard.tsx`     | modify | Pass `complete={fundingPct >= 100}` to `ProgressBar`                  |
| `packages/client/src/pages/CampaignDetailPage.tsx`              | modify | HTML description render, descriptive alt text, dynamic `document.title` |
| `packages/client/src/pages/AboutPage.tsx`                       | modify | Replace `<main id="main-content">` root with React fragment           |
| `packages/client/src/pages/ContactPage.tsx`                     | modify | Replace `<main id="main-content">` root with React fragment           |
| `packages/client/src/components/Layout.tsx`                     | modify | Add `/campaigns` entry to `routeTitles`                               |

## Dependencies

No new npm packages required.
All changes use existing React APIs (`useEffect`, `dangerouslySetInnerHTML`) and the
existing routing setup (`react-router` is already in use).

## Verification

- **Build**: `npm run build` (or `npm run build --workspace=packages/client`) succeeds with
  no TypeScript errors.
- **Visual — homepage**: Navigate to `http://localhost:5173/`.
  "Explore Missions" (hero) and "Browse All Missions" (footer CTA) buttons navigate to
  `/campaigns`. "View Mission" on each featured card navigates to `/campaigns`.
- **Visual — campaigns list**: Navigate to `http://localhost:5173/campaigns`.
  Page `<title>` reads "Explore Missions — Mars Mission Fund".
  Any campaign with `raisedAmount >= goalAmount` shows a green progress bar.
- **Visual — campaign detail**: Navigate to `http://localhost:5173/campaigns/<slug>`.
  Page `<title>` reads `<Campaign Title> — Mars Mission Fund`.
  Description renders formatted HTML paragraphs (not raw `<p>` tag strings).
  Hero image has non-empty alt text matching the campaign title.
- **HTML validity — /about and /contact**: View page source or inspect DOM;
  there is exactly one `<main>` element per page (provided by `Layout`).
- **Tests**: `npm test` (or `npm run test --workspace=packages/client`) passes without
  regressions.
