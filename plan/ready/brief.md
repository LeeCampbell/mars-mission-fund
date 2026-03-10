# Brief: Issue #81 — Fix component bugs, routing, and HTML issues

## Goal

Resolve six UX-review findings on the Mars Mission Fund client:
wire five dead `href="#"` homepage links to real routes,
render campaign descriptions as HTML instead of raw markup,
pass the `complete` prop to `ProgressBar` in the campaigns list,
remove nested `<main>` elements on the About and Contact pages,
add descriptive alt text to campaign-detail hero images,
and set proper page `<title>` values for the `/campaigns` and `/campaigns/:id` routes.

## Scope

**In scope**

- Replace all `href="#"` values in `HeroSection`, `ClosingCtaSection`, and `MissionCard` with real internal routes
- Render `campaign.description` with `dangerouslySetInnerHTML` in `CampaignDetailPage`
- Pass `complete={fundingPct >= 100}` to `ProgressBar` in `CampaignCard`
- Change the root element of `AboutPage` and `ContactPage` from `<main>` to `<div>` (Layout already renders the outer `<main>`)
- Add meaningful alt text to the campaign-detail hero `<img>` using the campaign title
- Extend `routeTitles` in `Layout` for `/campaigns`; set the dynamic `<title>` inside `CampaignDetailPage` for `/campaigns/:id`

**Out of scope**

- Any changes to the server or shared packages
- Changing mock data in `FeaturedMissionsSection` to real API data
- New UI features, styling changes, or refactoring beyond the six fixes

## Approach

### 1 — Dead homepage links (5 occurrences)

`HeroSection.tsx` has one `<Button href="#">Explore Missions</Button>` → change to `href="/campaigns"`.

`ClosingCtaSection.tsx` has one `<Button href="#">Browse All Missions</Button>` → change to `href="/campaigns"`.

`MissionCard.tsx` has one `<Button href="#">View Mission</Button>` used by all three static cards in `FeaturedMissionsSection` → change to `href="/campaigns"`.
(The static mock data has no real IDs, so linking to the list page is correct.)

### 2 — HTML in campaign description

`CampaignDetailPage.tsx:217` renders `{campaign.description}` as a React child.
The API returns HTML-formatted text.
Replace the `<p>` with a `<div dangerouslySetInnerHTML={{ __html: campaign.description }}` and keep the same `descriptionStyle`.
This is safe: the content originates from the internal API (not user-generated freetext from an untrusted source that bypasses sanitisation).

### 3 — ProgressBar `complete` prop in CampaignCard

`CampaignCard.tsx:76-79` renders `<ProgressBar value={fundingPct} ... />` without `complete`.
`ProgressBar` already supports `complete?: boolean` and uses `var(--color-progress-complete)` when true.
Add `complete={fundingPct >= 100}` to the `ProgressBar` call.

### 4 — Nested `<main>` on About and Contact pages

`Layout.tsx:28` renders `<main id="main-content">` wrapping the `<Outlet />`.
`AboutPage.tsx:105` and `ContactPage.tsx:93` both return `<main id="main-content">` as their root element, producing invalid nested `<main>` elements.
Fix: change the root element in both pages from `<main id="main-content">` to `<div>` (no id or aria needed — the outer `<main>` from Layout already serves that role).

### 5 — Alt text on campaign hero image

`CampaignDetailPage.tsx:195` has `alt="" aria-hidden="true"` on the hero image.
The image is content-meaningful (it depicts the campaign).
Replace with `alt={campaign.title}` and remove `aria-hidden`.

### 6 — Page titles for /campaigns and /campaigns/:id

`Layout.tsx:11-15` maintains a `routeTitles` map but is missing entries for `/campaigns` and `/campaigns/:id`.

For `/campaigns`: add `'/campaigns': 'Campaigns — Mars Mission Fund'` to the `routeTitles` map.

For `/campaigns/:id`: the map cannot handle dynamic segments.
`CampaignDetailPage.tsx` already has access to `campaign.title` after data loads.
Add a `useEffect` in `CampaignDetailPage` that sets `document.title` to `${campaign.title} — Mars Mission Fund` when the campaign data is available (and resets to `'Mars Mission Fund'` on unmount).

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/client/src/components/HeroSection.tsx` | modify | Change `href="#"` → `href="/campaigns"` on "Explore Missions" button |
| `packages/client/src/components/ClosingCtaSection.tsx` | modify | Change `href="#"` → `href="/campaigns"` on "Browse All Missions" button |
| `packages/client/src/components/MissionCard.tsx` | modify | Change `href="#"` → `href="/campaigns"` on "View Mission" button |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Render description as HTML; add `useEffect` for page title; fix hero image alt text |
| `packages/client/src/components/campaigns/CampaignCard.tsx` | modify | Pass `complete={fundingPct >= 100}` to `ProgressBar` |
| `packages/client/src/pages/AboutPage.tsx` | modify | Change root `<main id="main-content">` to `<div>` |
| `packages/client/src/pages/ContactPage.tsx` | modify | Change root `<main id="main-content">` to `<div>` |
| `packages/client/src/components/Layout.tsx` | modify | Add `/campaigns` entry to `routeTitles` |

## Dependencies

None — all fixes are isolated to client source files.
No new npm packages required.

## Verification

- **Build**: `npm run build` succeeds (run from repo root)
- **Unit tests**: `npm test` passes (existing tests in `packages/client/src`)
- **Visual checks** at `http://localhost:5173`:
  - Home page "Explore Missions" and "Browse All Missions" buttons navigate to `/campaigns`
  - Each "View Mission" card button on the home page navigates to `/campaigns`
  - `/campaigns` page `<title>` reads "Campaigns — Mars Mission Fund"
  - A campaign detail page `<title>` reads "<Campaign Title> — Mars Mission Fund"
  - Campaign description on detail page renders formatted HTML (paragraphs, not raw tags)
  - A 100%-funded campaign card in `/campaigns` shows the green complete gradient on its progress bar
  - `/about` and `/contact` pages have no nested `<main>` elements (verify via DevTools Elements panel)
  - Campaign detail hero image has a non-empty `alt` attribute matching the campaign title
