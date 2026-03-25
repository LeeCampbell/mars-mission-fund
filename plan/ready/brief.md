# Brief: Issue #192 — Improve: replace native date inputs in campaign editor with accessible custom date picker

## Goal

Replace the two native `<input type="date">` elements in `CampaignFormPage` (campaign deadline in Step 3, milestone target date in Step 4) with a reusable `DatePickerInput` UI component that delivers a consistent cross-browser date selection experience, surfaces inline validation errors tied to each field, and meets WCAG 2.1 AA requirements (SC 1.3.1 via `aria-describedby`, SC 2.5.5 via 44×44 px touch targets).

## Scope

**In scope**:
- New `DatePickerInput` component in `packages/client/src/components/ui/`
- Replace the campaign deadline `<input type="date">` in `StepFunding` (Step 3)
- Replace every milestone target date `<input type="date">` in `StepMilestones` (Step 4)
- Inline error display when a date is outside the allowed range (real-time, on change)
- `aria-describedby` wiring so screen readers announce error/helper text
- Minimum 44 px touch-target height on the input
- Unit tests for `DatePickerInput` (≥ 80% coverage gate)

**Out of scope**:
- A full custom calendar popup/popover widget — a styled `<input type="date">` wrapper with `min`/`max` constraints satisfies the acceptance criteria and avoids a heavy dependency
- Changes to server-side validation or API types
- Any date fields outside `CampaignFormPage`
- Dark/light theme switching (the app is dark-first throughout)

## Approach

### Component: `DatePickerInput`

Create `packages/client/src/components/ui/DatePickerInput.tsx` as a design-system primitive (L3-005 §1.2). Props:

```ts
interface DatePickerInputProps {
  id: string
  label: string
  value: string          // ISO date string "YYYY-MM-DD" or ""
  onChange: (value: string) => void
  min?: string           // ISO date string — passed as `min` attribute
  max?: string           // ISO date string — passed as `max` attribute
  helperText?: string    // static helper text (replaces current inline <span>)
  error?: string         // inline error message; triggers error styling when set
  required?: boolean
}
```

Implementation notes:
- Renders `<input type="date">` with the `min`/`max` attributes — this constrains the OS picker on mobile to gray out out-of-range dates (addresses the mobile UX complaint without a bespoke calendar)
- Sets `min-height: 44px` on the input via a semantic token-based inline style or class
- Error state: red/danger border using existing design-token colour (check `tokens.css` for a `--color-error` or equivalent); renders an `<span id="{id}-error" role="alert">` below the input
- `aria-describedby` points to `{id}-error` when error is set, otherwise `{id}-helper`; both `id`s rendered unconditionally so the attribute is stable
- No external dependencies — pure React + existing design tokens

### Integration in `CampaignFormPage`

**Step 3 — Campaign Deadline** (`StepFunding` component, ~line 1028):
- Compute `minDate` (today + 7 days) and `maxDate` (today + 1 year) as `YYYY-MM-DD` strings at render time
- Add local error state: `const [deadlineError, setDeadlineError] = useState('')`
- On `onChange`, validate immediately: if value is set and outside `[minDate, maxDate]`, set error; otherwise clear it
- Replace the existing `<input type="date">` + helper `<span>` with `<DatePickerInput>`, passing `min`, `max`, `helperText`, and `error`
- Remove the deadline-specific error check from `validateStep3` (or keep it as the authoritative gate but rely on the field to surface the message)

**Step 4 — Milestone Target Date** (`StepMilestones` component, ~line 1173):
- Each milestone row renders its own date input; add per-milestone error tracking (index-keyed object or array in local state, or inline via a small sub-component)
- Milestone target date is optional (no hard range constraint stated in the issue), but if a value is entered it must be a valid date — surface any invalid-date errors inline

### State / Validation interaction

The existing `validateStep3` function returns `false` and alerts the user via toast if the deadline is invalid. After this change:
- The field shows the error inline as the user interacts
- `validateStep3` still guards the "Next" button as the authoritative gate (belt-and-suspenders) — no change to its toast behaviour needed; the inline error will already have told the user what's wrong before they click Next

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/components/ui/DatePickerInput.tsx` | create | New accessible date input primitive |
| `packages/client/src/components/ui/DatePickerInput.test.tsx` | create | Unit tests (renders, error state, aria attributes, touch target) |
| `packages/client/src/pages/CampaignFormPage.tsx` | modify | Replace two `<input type="date">` usages with `<DatePickerInput>`; add inline error state for deadline and milestone dates |

## Dependencies

No new npm packages required. Uses existing React, design tokens, and Testing Library already present in the workspace.

## Verification

- **Build**: `npm run build` succeeds with no type errors
- **Type-check**: `npx tsc -b --noEmit` passes
- **Lint/format**: `npm run lint && npm run format:check` pass
- **Tests**: `npm run test:coverage` passes; `DatePickerInput.test.tsx` covers render, error prop, aria-describedby, min/max forwarding
- **Visual** (at `http://localhost:5173`):
  - Log in as a Creator, navigate to Create Campaign
  - Step 3 — Funding: date input renders; entering a date more than 1 year out shows a red inline error message below the field; entering a valid date clears the error; input is at least 44 px tall
  - Step 4 — Milestones: each milestone row date input shows the same inline error behaviour
  - On a narrow viewport (DevTools 375 px): tapping the date input opens the OS picker constrained to the valid range
  - Screen reader (VoiceOver / NVDA): error message is announced when an invalid date is entered
- **E2E** (user flows for Playwright):
  - Creator fills campaign form through Step 3, enters an out-of-range deadline, sees inline error, corrects it, advances to Step 4
  - Creator adds a milestone and sets a target date
