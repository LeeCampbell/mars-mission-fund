# Brief: Issue #114 — Creator dashboard and campaign submission form

## Goal

Implement the creator-facing UI for the campaign lifecycle: a dashboard at `/dashboard` listing a creator's campaigns grouped by status, a 7-step multi-step creation form at `/campaigns/new`, a pre-populated draft editing page at `/campaigns/:id/edit`, a submit-for-review confirmation dialog, campaign-update posting and milestone-evidence submission panels on the campaign detail page, plus the API client functions and React Query hooks that back all of these.

## Scope

**In scope:**

- Creator dashboard page (`/dashboard`) — lists creator's own campaigns grouped by status with quick-action links (edit, submit, launch, delete)
- 7-step campaign creation form (`/campaigns/new`) with local state managed by `useReducer`; steps: Mission Objectives → Team → Funding → Milestones → Risks → Media → Review & Submit
- Draft editing page (`/campaigns/:id/edit`) — same form component, pre-populated via `GET /v1/campaigns/:id`
- Submit-for-review confirmation dialog on Step 7 (calls `POST /v1/campaigns/:id/submit`)
- Campaign update posting panel on `CampaignDetailPage` (visible to creator of Live/Funded campaigns)
- Milestone evidence submission panel on `CampaignDetailPage` (visible to creator of Settlement campaigns)
- Client-side validation matching server rules: milestone funding percentages sum to 100%, at least one team member, at least two milestones, at least one risk disclosure, deadline 1 week–1 year out, funding target $1 M–$1 B
- Extend `CreateCampaignRequestSchema` / `UpdateCampaignRequestSchema` in `@mmf/shared` to include `milestones` and `teamMembers` arrays (these fields are absent from the current schema but are required by the form)
- Update server `createCampaign` / `updateCampaign` in `packages/server/src/campaigns/queries.ts` to upsert milestone and team-member rows
- API client functions in `src/api/campaigns.ts`: `createCampaign`, `updateCampaign`, `deleteCampaign`, `submitCampaignForReview`, `launchCampaign`, `postCampaignUpdate`, `submitMilestoneEvidence`, `fetchMyCampaigns`
- `useCreatorCampaigns` hook in `src/hooks/useCreatorCampaigns.ts`
- `ProtectedRoute` extended with `requireCreator` prop; new routes added to `App.tsx`
- `routeTitles` in `Layout.tsx` updated for new routes
- Component tests for the dashboard and key form steps (80% coverage target)
- E2E test: `e2e/creator-dashboard.spec.ts` covering creator flow end-to-end

**Out of scope:**

- Stretch goal management UI (the schema supports stretch goals but the issue does not list a form step for them)
- Campaign cancellation UI
- Deadline extension request UI
- Reviewer/admin UI changes (handled by other issues)
- Backend route changes (all required routes — create, update, delete, submit, launch, post update, submit evidence — already exist in `packages/server/src/campaigns/routes.ts`)
- KYC verification flow (submission is blocked if KYC not verified; the UI shows the server error, no KYC redirect is built here)

## Approach

### Shared schema extension

Add two nested Zod schemas to `packages/shared/src/campaign.ts`:

```ts
const CreateMilestoneRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  targetDate: z.coerce.date().nullable().optional(),
  fundingPercentage: z.number().min(0).max(100),
  verificationCriteria: z.string().nullable().optional(),
  sortOrder: z.number().int(),
})

const CreateTeamMemberRequestSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().nullable().optional(),
  sortOrder: z.number().int(),
})
```

Extend `CreateCampaignRequestSchema` with `milestones` and `teamMembers` optional arrays (default `[]`). `UpdateCampaignRequestSchema` is derived via `.partial()` so it inherits the extension automatically.

Export `CreateMilestoneRequest` and `CreateTeamMemberRequest` types.

### Server query updates

In `packages/server/src/campaigns/queries.ts`, update `createCampaign` and `updateCampaign` to:

- After inserting/updating the campaign row, delete-then-reinsert any `milestones` and `teamMembers` provided in the payload (simple replace-all strategy is safe for drafts)
- No new routes are required

### Client API layer

Add to `packages/client/src/api/campaigns.ts`:

```ts
fetchMyCampaigns()             // GET /v1/campaigns?createdBy=me
createCampaign(data)           // POST /v1/campaigns
updateCampaign(id, data)       // PUT /v1/campaigns/:id
deleteCampaign(id)             // DELETE /v1/campaigns/:id
submitCampaignForReview(id)    // POST /v1/campaigns/:id/submit
launchCampaign(id)             // POST /v1/campaigns/:id/launch
postCampaignUpdate(id, body)   // POST /v1/campaigns/:id/update
submitMilestoneEvidence(id, mid, data) // POST /v1/campaigns/:id/milestones/:mid/submit-evidence
```

All use `authedFetch` (already defined in the file) and throw on non-OK responses.

### Hooks

`src/hooks/useCreatorCampaigns.ts` — `useQuery` wrapping `fetchMyCampaigns`, `queryKey: ['my-campaigns']`, `staleTime: 0`.

No mutation hooks are needed as a standalone file; mutations live inline in the page components (following the pattern used in `ReviewQueuePage.tsx`).

### Creator Dashboard (`/dashboard`)

`src/pages/DashboardPage.tsx`:

- Uses `useCreatorCampaigns` to fetch all campaigns owned by the authenticated creator
- Groups them into sections by status (Draft, Submitted/Under Review/Approved, Live/Funded, Settlement/Complete, Rejected/Cancelled/Failed)
- Each campaign row shows: title, status badge, deadline, raised amount, and quick-action buttons:
  - Draft → Edit, Submit for Review, Delete
  - Approved → Launch, Edit
  - Live/Funded → View (links to detail page)
  - Rejected → Revise (calls resubmit + navigates to edit page)
- "New Campaign" button links to `/campaigns/new`
- Protected route: `requireCreator`

### Multi-step Form (`/campaigns/new` and `/campaigns/:id/edit`)

`src/pages/CampaignFormPage.tsx`:

- Uses `useReducer` to manage 7-step form state (draft campaign object built up incrementally)
- For `/campaigns/new`: starts with empty form state
- For `/campaigns/:id/edit`: fetches existing campaign via `useCampaign(id)` and initialises reducer state from it
- Step navigation: numbered step indicator, Back / Next buttons; steps are: 1 Mission, 2 Team, 3 Funding, 4 Milestones, 5 Risks, 6 Media, 7 Review & Submit
- Each step validates its own fields client-side before allowing Next
- Step 4 validates milestone funding percentages sum to 100% before allowing Next
- Step 7 shows a summary of all entered data plus a "Submit for Review" button that opens a `<dialog>` confirmation before calling `submitCampaignForReview(id)`
- "Save Draft" button (visible on all steps) saves to server: calls `createCampaign` if no ID yet, otherwise `updateCampaign`. On creation, updates the URL to `/campaigns/:id/edit` (via `navigate`) so the user doesn't create duplicates
- Inline `React.CSSProperties` style objects, semantic tokens only, consistent with the rest of the UI

`src/pages/CampaignEditPage.tsx` is a thin wrapper that reads `:id` from params, fetches the campaign, and renders `CampaignFormPage` in edit mode.

### Campaign Detail Page additions

`src/pages/CampaignDetailPage.tsx` — conditionally render new creator-only panels:

- **Post Update panel**: shown when `user.id === campaign.creatorId && (status === 'Live' || status === 'Funded')`. Contains a `<textarea>` for update body + "Post Update" button. Uses inline `useMutation` for `postCampaignUpdate`.
- **Submit Evidence panel**: shown when `user.id === campaign.creatorId && status === 'Settlement'`. Lists milestones in `Pending` or `Returned` state; each has fields for `evidenceDescription` and optional `evidenceUrl` + "Submit Evidence" button. Uses `useMutation` for `submitMilestoneEvidence`.

Both panels follow the inline mutation pattern from `ReviewActionsPanel.tsx`.

### Routing and auth

`src/components/ProtectedRoute.tsx`: add `requireCreator?: boolean` prop; redirect to `/` if `user?.role !== 'Creator'`.

`src/App.tsx`: add three lazy-loaded routes:

```tsx
<Route element={<ProtectedRoute requireCreator />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/campaigns/new" element={<CampaignFormPage />} />
  <Route path="/campaigns/:id/edit" element={<CampaignEditPage />} />
</Route>
```

`src/components/Layout.tsx`: add to `routeTitles`:

```ts
'/dashboard': 'Creator Dashboard — Mars Mission Fund',
'/campaigns/new': 'New Campaign — Mars Mission Fund',
```

(The edit page title is set dynamically once the campaign title loads, following the pattern in `CampaignDetailPage`.)

## Files to Create/Modify

| File | Action | Description |
| --- | --- | --- |
| `packages/shared/src/campaign.ts` | modify | Add `CreateMilestoneRequestSchema`, `CreateTeamMemberRequestSchema`; extend `CreateCampaignRequestSchema` with `milestones` and `teamMembers` arrays; export new types |
| `packages/server/src/campaigns/queries.ts` | modify | Update `createCampaign` and `updateCampaign` to upsert milestone and team-member rows in their respective tables |
| `packages/client/src/api/campaigns.ts` | modify | Add `fetchMyCampaigns`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `submitCampaignForReview`, `launchCampaign`, `postCampaignUpdate`, `submitMilestoneEvidence` |
| `packages/client/src/hooks/useCreatorCampaigns.ts` | create | `useQuery` hook for creator's campaign list |
| `packages/client/src/pages/DashboardPage.tsx` | create | Creator dashboard with grouped campaign list and quick actions |
| `packages/client/src/pages/DashboardPage.test.tsx` | create | Component tests for dashboard loading, error, empty, and populated states |
| `packages/client/src/pages/CampaignFormPage.tsx` | create | 7-step multi-step form (create and edit modes) |
| `packages/client/src/pages/CampaignFormPage.test.tsx` | create | Component tests covering step rendering, validation, and key mutations |
| `packages/client/src/pages/CampaignEditPage.tsx` | create | Thin wrapper: fetches campaign by ID and renders `CampaignFormPage` in edit mode |
| `packages/client/src/pages/CampaignDetailPage.tsx` | modify | Add Post Update panel and Submit Evidence panel (creator-only, conditionally rendered) |
| `packages/client/src/components/ProtectedRoute.tsx` | modify | Add `requireCreator` prop |
| `packages/client/src/App.tsx` | modify | Add lazy-loaded routes for dashboard, `/campaigns/new`, `/campaigns/:id/edit` |
| `packages/client/src/components/Layout.tsx` | modify | Add `routeTitles` entries for dashboard and new-campaign routes |
| `e2e/creator-dashboard.spec.ts` | create | E2E: log in as Creator, create a campaign draft, fill all 7 steps, submit for review, verify on dashboard |

## Dependencies

No new npm packages required. All dependencies (React Query, Zod, React Router) are already installed.

The server DB tables `campaign_milestones` and `campaign_team_members` already exist (confirmed by `CampaignDetail` response shape). No new migrations needed.

## Verification

- **Build**: `npm run build` succeeds; `npx tsc -b --noEmit` passes
- **Lint**: `npm run lint` passes
- **Tests**: `npm run test:coverage` passes at 80% threshold
- **Visual** (browser at `http://localhost:5173`):
  - Log in as a Creator demo user; verify `/dashboard` shows grouped campaigns
  - Navigate to `/campaigns/new`; step through all 7 steps; validate that Next is blocked when step fields are invalid (e.g. milestone % ≠ 100)
  - Click "Save Draft" and verify the campaign appears on the dashboard
  - Open a Draft campaign on the dashboard, click Edit, verify form is pre-populated
  - Submit a Draft for review from the dashboard quick-action button and from Step 7 dialog
  - On a Live campaign detail page logged in as creator: verify Post Update panel is visible; post an update and verify it appears in the updates list
  - On a Settlement campaign detail page logged in as creator: verify Submit Evidence panel is visible with Pending milestones
- **E2E**: `e2e/creator-dashboard.spec.ts` — creator login → new campaign form → fill all steps → save draft → submit for review → verify dashboard status change
