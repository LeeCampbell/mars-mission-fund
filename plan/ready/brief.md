# Brief: Issue #193 — Fix: campaign deadline shown as raw ISO string on Step 7 review screen

## Goal

The Step 7 review screen in the campaign creation wizard displays the campaign deadline as a raw ISO date string (e.g. `2026-12-27`) instead of the human-readable format used elsewhere in the app (e.g. `Dec 27, 2026`). The fix is to format the deadline string before rendering it in the `StepReview` component inside `CampaignFormPage.tsx`.

## Scope

**In scope:**
- Format the `state.deadline` ISO string as `Dec 27, 2026` on the Step 7 review screen
- Use `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })` to match existing patterns in the app

**Out of scope:**
- Changing how `deadline` is stored in form state (keep as `YYYY-MM-DD` string for the date input)
- Changing date formatting in any other screen or component
- Centralising date-formatting utilities (not requested; three instances in the app don't warrant a shared helper yet)

## Approach

In `CampaignFormPage.tsx`, add a small helper `formatReviewDate` near the `StepReview` component (or inline the expression) that:

1. Returns `'—'` for a falsy value
2. Parses the `YYYY-MM-DD` string using `new Date(year, month - 1, day)` (splitting on `-`) to avoid UTC-to-local timezone shift that `new Date("YYYY-MM-DD")` causes in negative-offset zones
3. Formats with `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`

Then replace line 1425:
```tsx
// Before
<ReviewRow label="Deadline" value={state.deadline || '—'} />

// After
<ReviewRow label="Deadline" value={formatReviewDate(state.deadline)} />
```

The `DashboardPage.formatDeadline` function is the reference implementation but it accepts a `Date` object. The form state stores a `string`, so the parsing step is needed here.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/client/src/pages/CampaignFormPage.tsx` | modify | Add `formatReviewDate` helper and apply it to the Deadline `ReviewRow` at line 1425 |

## Dependencies

None. `Intl.DateTimeFormat` is a browser built-in; no new npm packages needed.

## Verification

- **Build:** `npm run build` succeeds with no TypeScript errors
- **Visual:** On the Step 7 review screen of campaign creation, the deadline field shows `Dec 27, 2026` (not `2026-12-27`)
- **Tests:** `npm run test:coverage` passes; add/update a unit test in `CampaignFormPage.test.tsx` (if it exists) or confirm the snapshot/integration test covers the review step
- **E2E:** Navigate the full campaign creation wizard to Step 7 and verify the formatted date appears in the review summary
