# Tasks: Issue #81 — Fix component bugs, routing, and HTML issues

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Fix dead `href="#"` links in HeroSection, ClosingCtaSection, and MissionCard
  - **Goal**: Replace all placeholder `href="#"` with `href="/campaigns"` on the three homepage components
  - **Details**:
    - In `HeroSection.tsx` (~line 105): change `href="#"` → `href="/campaigns"` on the "Explore Missions" button
    - In `ClosingCtaSection.tsx` (~line 44): change `href="#"` → `href="/campaigns"` on the "Browse All Missions" button
    - In `MissionCard.tsx` (~line 56): change `href="#"` → `href="/campaigns"` on the "View Mission" button
  - **Files**:
    - `packages/client/src/components/HeroSection.tsx`
    - `packages/client/src/components/ClosingCtaSection.tsx`
    - `packages/client/src/components/MissionCard.tsx`
  - **Verify**: All three files compile. Homepage buttons no longer have `href="#"`.
  - **Brief ref**: Approach steps 1–3; Scope item 1

- [x] TASK-02: Pass `complete` prop to `ProgressBar` in `CampaignCard`
  - **Goal**: Fully-funded campaigns display the green gradient progress bar
  - **Details**:
    - In `CampaignCard.tsx` (~line 76): add `complete={fundingPct >= 100}` to the `<ProgressBar>` JSX element
    - `ProgressBar` already accepts `complete?: boolean`; no changes needed to `ProgressBar` itself
  - **Files**:
    - `packages/client/src/components/campaigns/CampaignCard.tsx`
  - **Verify**: File compiles. Any campaign with `raisedAmount >= goalAmount` should show a green progress bar on the campaigns list page.
  - **Brief ref**: Approach step 4; Scope item 3

- [x] TASK-03: Fix nested `<main>` in AboutPage and ContactPage
  - **Goal**: Remove duplicate `<main>` elements — `Layout` already provides one
  - **Details**:
    - In `AboutPage.tsx`: change the root `<main id="main-content">` element to a React fragment `<>` (and close with `</>`)
    - In `ContactPage.tsx`: same change — replace `<main id="main-content">` root with `<>`
    - Do NOT remove `id="main-content"` from `Layout`; the fix is only in the page components
  - **Files**:
    - `packages/client/src/pages/AboutPage.tsx`
    - `packages/client/src/pages/ContactPage.tsx`
  - **Verify**: Files compile. DOM inspection of `/about` and `/contact` shows exactly one `<main>` element per page.
  - **Brief ref**: Approach steps 6–7; Scope item 4

- [x] TASK-04: Fix CampaignDetailPage — HTML description, alt text, and document.title
  - **Goal**: Campaign detail page renders HTML descriptions, has descriptive hero alt text, and sets the page title dynamically
  - **Details**:
    - Import `useEffect` from React (add to existing React import if not present)
    - Replace `<p style={descriptionStyle}>{campaign.description}</p>` (~line 217) with:
      `<div style={descriptionStyle} dangerouslySetInnerHTML={{ __html: campaign.description }} />`
    - On the hero `<img>` (~line 195): replace `alt="" aria-hidden="true"` with `alt={\`${campaign.title} hero image\`}` and remove the `aria-hidden` attribute
    - Add a `useEffect` that runs when `campaign` changes and sets:
      `document.title = \`${campaign.title} — Mars Mission Fund\`;`
  - **Files**:
    - `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: File compiles. On a campaign detail page: description renders as formatted HTML, hero image has non-empty alt text, and browser tab title shows `<Campaign Title> — Mars Mission Fund`.
  - **Brief ref**: Approach step 5; Scope items 2 and 5

- [x] TASK-05: Add `/campaigns` route title to Layout
  - **Goal**: The campaigns list page shows the correct document title
  - **Details**:
    - In `Layout.tsx` (~line 11): add `'/campaigns': 'Explore Missions — Mars Mission Fund'` to the `routeTitles` map
    - No entry needed for `/campaigns/:id` — that is handled dynamically by `CampaignDetailPage`
  - **Files**:
    - `packages/client/src/components/Layout.tsx`
  - **Verify**: File compiles. Navigating to `/campaigns` sets the page title to "Explore Missions — Mars Mission Fund".
  - **Brief ref**: Approach step 8; Scope item 6

- [x] TASK-06: Build verification and smoke test
  - **Goal**: Confirm all changes compile cleanly and no existing tests regress
  - **Details**:
    - Run `npm run build --workspace=packages/client` (or `npm run build`) and confirm zero TypeScript errors
    - Run `npm test` (or `npm run test --workspace=packages/client`) and confirm all tests pass
    - If the dev server is running, manually verify each fix by navigating to the affected routes
  - **Files**: none (verification only)
  - **Verify**: Build exits 0, test suite exits 0, no new errors introduced.
  - **Brief ref**: Verification section of the brief
