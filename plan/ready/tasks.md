# Tasks: Issue #115 — Reviewer and Admin Campaign Management UI

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Backend — expose missing campaign fields and update shared schema
  - **Goal**: Make `cancellationRequestedAt` available in the campaign detail API and expose milestone evidence columns so the frontend can display them.
  - **Details**:
    1. In `packages/shared/src/campaign.ts`, add `cancellationRequestedAt: z.coerce.date().nullable()` to `CampaignDetailSchema`.
    2. In `packages/server/src/campaigns/queries.ts`, `getCampaignById`:
       - Add `cancellation_requested_at AS "cancellationRequestedAt"` to the main campaign SQL SELECT.
       - Add `evidence_description AS "evidenceDescription"`, `evidence_url AS "evidenceUrl"`, `evidence_submitted_at AS "evidenceSubmittedAt"`, `feedback` to the milestones SQL SELECT.
    3. Run `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json` to verify types.
  - **Files**:
    - `packages/shared/src/campaign.ts`
    - `packages/server/src/campaigns/queries.ts`
  - **Verify**: `npm run build -w @mmf/shared && npx tsc -b --noEmit && npx tsc --noEmit -p packages/server/tsconfig.json` passes with no errors.
  - **Brief ref**: "Backend: Expose missing campaign detail fields" section

- [x] TASK-02: Backend — `markNotificationRead` query and `PATCH /v1/notifications/:id/read` route
  - **Goal**: Add a backend endpoint that marks a single notification as read for the authenticated user.
  - **Details**:
    1. In `packages/server/src/campaigns/queries.ts`, add `markNotificationRead(pool, notificationId, userId)` — executes `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`.
    2. In `packages/server/src/notifications/routes.ts`, add `PATCH /:id/read` — authenticate middleware, call `markNotificationRead`, return 204 No Content.
    3. Type-check to confirm no errors.
  - **Files**:
    - `packages/server/src/campaigns/queries.ts`
    - `packages/server/src/notifications/routes.ts`
  - **Verify**: `npx tsc --noEmit -p packages/server/tsconfig.json` passes; `npm run lint` passes.
  - **Brief ref**: "Backend: PATCH /v1/notifications/:id/read" section

- [ ] TASK-03: Frontend — notifications API client and NotificationsPage
  - **Goal**: Create the notification API client functions and the `/notifications` page listing all notifications with per-item mark-as-read.
  - **Details**:
    1. Create `packages/client/src/api/notifications.ts` with:
       - `fetchNotifications()` — GET `/v1/notifications`.
       - `markNotificationRead(id)` — PATCH `/v1/notifications/${id}/read`.
       Use `authedFetch` (or the established fetch wrapper); import `Notification` type from `@mmf/shared`.
    2. Create `packages/client/src/pages/NotificationsPage.tsx`:
       - Uses `useQuery(['notifications'], fetchNotifications)` to fetch all notifications, sorted newest first.
       - Renders each notification: title, message, campaign link (if `campaignId`), formatted timestamp, and a "Mark as read" button for unread items.
       - "Mark as read" uses `useMutation` → `markNotificationRead(id)` then invalidates `['notifications']`.
       - Use existing page layout patterns (wrapper div, heading, loading/error states).
    3. Register the route in `packages/client/src/App.tsx` inside `<ProtectedRoute>`:
       `<Route path="/notifications" element={<NotificationsPage />} />`.
  - **Files**:
    - `packages/client/src/api/notifications.ts`
    - `packages/client/src/pages/NotificationsPage.tsx`
    - `packages/client/src/App.tsx`
  - **Verify**: `npm run build` passes; navigate to `/notifications` in the running app and confirm the page loads without errors.
  - **Brief ref**: "Frontend: Notification API client" and "Frontend: NotificationsPage" sections

- [ ] TASK-04: Frontend — NotificationBell component and Header updates
  - **Goal**: Add a notification bell with unread-count badge to the Header, plus the Reviewer "Review" nav link and update `/review-queue` references to `/review`.
  - **Details**:
    1. Create `packages/client/src/components/NotificationBell.tsx`:
       - Renders nothing if user is not authenticated.
       - Uses `useQuery(['notifications'], fetchNotifications, { refetchInterval: 30000 })`.
       - Shows a bell SVG button with an unread-count badge (use existing `Badge` component) when count > 0.
       - On click, toggles an inline dropdown listing up to 10 notifications (newest first).
       - Each unread item has a "Mark as read" button using `useMutation` → `markNotificationRead(id)`, invalidates `['notifications']` on success.
       - Dropdown footer: "View all" link to `/notifications`.
    2. In `packages/client/src/components/Header.tsx`:
       - Import and render `<NotificationBell />` in the authenticated section (right side of nav).
       - Add a "Review" nav link to `/review` visible only when `user.role === 'Reviewer'`.
       - Update any existing `/review-queue` href/`to` references to `/review`.
    3. Create `packages/client/src/components/NotificationBell.test.tsx` with unit tests:
       - Renders nothing when unauthenticated.
       - Shows badge with correct unread count when notifications exist.
       - Clicking the bell toggles the dropdown.
       - "Mark as read" mutation is called on button click.
       Mock `useQuery`/`useMutation` following patterns in existing test files.
  - **Files**:
    - `packages/client/src/components/NotificationBell.tsx`
    - `packages/client/src/components/NotificationBell.test.tsx`
    - `packages/client/src/components/Header.tsx`
  - **Verify**: `npm run test:coverage` passes; `npm run build` passes.
  - **Brief ref**: "Frontend: NotificationBell component" and "Frontend: Header update" sections

- [ ] TASK-05: Frontend — admin API functions, AdminActionsPanel component, and CampaignDetailPage integration
  - **Goal**: Add admin campaign action API helpers, build the `AdminActionsPanel` with milestone verification and cancellation approval sub-sections, and embed it in `CampaignDetailPage`.
  - **Details**:
    1. In `packages/client/src/api/campaigns.ts`, add:
       - `verifyMilestone(campaignId, milestoneId)` — POST `/v1/campaigns/${campaignId}/milestones/${milestoneId}/verify`.
       - `returnMilestone(campaignId, milestoneId, feedback: string)` — POST `/v1/campaigns/${campaignId}/milestones/${milestoneId}/return` with `{ feedback }`.
       - `approveCancel(id)` — POST `/v1/campaigns/${id}/approve-cancel`.
    2. Create `packages/client/src/components/campaigns/AdminActionsPanel.tsx`:
       - Accepts `campaign` (typed as `CampaignDetail`) and `user` props.
       - **Milestone Verification sub-section** (shown when `campaign.status === 'Settlement'`):
         - Iterates `campaign.milestones` filtered to `status === 'Submitted'`.
         - Each item shows: title, `evidenceDescription`, `evidenceUrl` (as `<a>` link), formatted `evidenceSubmittedAt`.
         - "Verify" button → `useMutation(verifyMilestone)`, invalidates `['campaign', id]` on success.
         - "Return" link → expands a feedback `<textarea>` + submit button → `useMutation(returnMilestone)`, invalidates `['campaign', id]` on success.
       - **Cancellation Approval sub-section** (shown when `campaign.status === 'Live'` and `campaign.cancellationRequestedAt` is non-null):
         - Shows formatted date of `cancellationRequestedAt`.
         - "Approve Cancellation" button → `useMutation(approveCancel)`, invalidates `['campaign', id]` on success.
       - Renders nothing if neither condition is met.
    3. In `packages/client/src/pages/CampaignDetailPage.tsx`:
       - Import `AdminActionsPanel`.
       - Render `<AdminActionsPanel campaign={campaign} user={user} />` below `ReviewActionsPanel` in the sidebar/actions area, only when `user.role === 'Administrator' || user.role === 'SuperAdministrator'`.
    4. Create `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx` with unit tests:
       - Does not render when no relevant conditions apply.
       - Shows milestone verification section for `Settlement` campaigns with submitted milestones.
       - Shows cancellation approval section for `Live` campaigns with `cancellationRequestedAt` set.
       - Verify and Return mutation calls fire correctly.
  - **Files**:
    - `packages/client/src/api/campaigns.ts`
    - `packages/client/src/components/campaigns/AdminActionsPanel.tsx`
    - `packages/client/src/components/campaigns/AdminActionsPanel.test.tsx`
    - `packages/client/src/pages/CampaignDetailPage.tsx`
  - **Verify**: `npm run test:coverage` passes; `npm run build` passes; `npm run lint` passes.
  - **Brief ref**: "Frontend: AdminActionsPanel component" and "Frontend: CampaignDetailPage update" sections

- [ ] TASK-06: Frontend — ReviewDetailPage, route updates, and E2E reviewer flow test
  - **Goal**: Build the `/review/:id` page for reviewers, register routes, update ReviewQueuePage navigation, and write the E2E test for the claim → review detail → approve flow.
  - **Details**:
    1. Create `packages/client/src/pages/ReviewDetailPage.tsx`:
       - Reads `:id` from `useParams`.
       - Fetches campaign via `useCampaign(id)` (or the established campaign query hook).
       - Redirects to `/review` if the authenticated user is not the assigned reviewer for this campaign (check `campaign.reviewerId === user.id` or equivalent).
       - Renders the full proposal using existing section components: `MilestonesSection`, `StretchGoalsSection`, `TeamSection`, `FundingProgressSection`, `CampaignUpdatesSection`.
       - Embeds `ReviewActionsPanel` (already exists) for approve/reject actions.
       - Handle loading and error states.
    2. In `packages/client/src/App.tsx`:
       - Add `<Route path="/review" element={<ReviewQueuePage />} />` inside `<ProtectedRoute requireReviewer>`.
       - Add `<Route path="/review/:id" element={<ReviewDetailPage />} />` inside `<ProtectedRoute requireReviewer>`.
       - Remove or keep `/review-queue` route — prefer clean removal since the brief specifies rename.
    3. In `packages/client/src/pages/ReviewQueuePage.tsx`:
       - Update the claim `onSuccess` navigate call from `/campaigns/${campaign.id}` (or `/review-queue`) to `/review/${campaign.id}`.
    4. Create `packages/client/src/pages/ReviewDetailPage.test.tsx` with unit tests:
       - Renders full campaign proposal sections.
       - Redirects to `/review` when user is not the assigned reviewer.
       - Shows `ReviewActionsPanel`.
    5. Write `e2e/reviewer.spec.ts` — Playwright test covering the claim → review detail → approve flow:
       - Log in as a Reviewer demo user.
       - Navigate to `/review` — verify queue loads.
       - Claim a submitted campaign — verify redirect to `/review/:id`.
       - Verify the review detail page shows campaign proposal sections.
       - Approve the campaign (or reject) with required text — verify success state.
       Follow patterns in `e2e/review-pipeline.spec.ts` and `e2e/auth.spec.ts`.
  - **Files**:
    - `packages/client/src/pages/ReviewDetailPage.tsx`
    - `packages/client/src/pages/ReviewDetailPage.test.tsx`
    - `packages/client/src/pages/ReviewQueuePage.tsx`
    - `packages/client/src/App.tsx`
    - `e2e/reviewer.spec.ts`
  - **Verify**: `npm run test:coverage` passes AND `./scripts/run-e2e.sh e2e/reviewer.spec.ts` passes.
  - **Brief ref**: "Frontend: ReviewDetailPage" and "Frontend: Header update" sections

- [ ] TASK-07: Full E2E regression and CI verification
  - **Goal**: Run the complete E2E suite and CI checks to confirm nothing is broken end-to-end.
  - **Details**: No new code. Run the full test suite as a final gate. Fix any failures found before marking complete.
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh` (all tests) passes.
  - **Brief ref**: Verification section
