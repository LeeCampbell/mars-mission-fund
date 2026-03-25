# Tasks: Issue #192 — Improve: replace native date inputs in campaign editor with accessible custom date picker

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Create `DatePickerInput` component with unit tests
  - **Goal**: Build the reusable `DatePickerInput` UI primitive and verify it with unit tests
  - **Details**:
    - Create `packages/client/src/components/ui/DatePickerInput.tsx` implementing the props interface from the brief
    - Render `<input type="date">` with forwarded `id`, `min`, `max`, `required` attributes
    - Set `minHeight: '44px'` on the input to meet WCAG 2.5.5 touch target requirement
    - Error state: apply red/danger border using existing design token (look up `--color-error` or equivalent in `tokens.css`); render `<span id="{id}-error" role="alert">` below the input
    - Helper text: render `<span id="{id}-helper">` unconditionally (even if empty) so `aria-describedby` is stable
    - `aria-describedby` always points to both `{id}-helper` and `{id}-error`
    - Label rendered as `<label htmlFor={id}>`
    - Create `packages/client/src/components/ui/DatePickerInput.test.tsx` covering:
      - Renders label, input, helper text
      - Forwards `min`/`max` to the input element
      - When `error` prop is set: error span appears with `role="alert"`, input gets error styling
      - When `error` prop is cleared: error span is empty / no alert
      - `aria-describedby` includes `{id}-helper` and `{id}-error`
      - Input has `min-height` of at least 44 px (check inline style or class)
    - Run `npx vitest run packages/client/src/components/ui/DatePickerInput.test.tsx` to confirm tests pass
  - **Files**:
    - `packages/client/src/components/ui/DatePickerInput.tsx` (create)
    - `packages/client/src/components/ui/DatePickerInput.test.tsx` (create)
  - **Verify**: `npx vitest run packages/client/src/components/ui/DatePickerInput.test.tsx` passes with all tests green
  - **Brief ref**: Component: `DatePickerInput` section

- [x] TASK-02: Integrate `DatePickerInput` into `CampaignFormPage` (Step 3 & Step 4) with E2E coverage
  - **Goal**: Replace both native `<input type="date">` usages in `CampaignFormPage` with `DatePickerInput`, add inline validation, and verify via E2E tests
  - **Details**:
    - Open `packages/client/src/pages/CampaignFormPage.tsx` and locate `StepFunding` (~line 1028) and `StepMilestones` (~line 1173)
    - **Step 3 — Campaign Deadline** (inside `StepFunding`):
      - Compute `minDate` = today + 7 days and `maxDate` = today + 1 year as `YYYY-MM-DD` strings at render time using `new Date()` arithmetic
      - Add `const [deadlineError, setDeadlineError] = useState('')` local state
      - On `onChange`: if value is outside `[minDate, maxDate]`, set an error message like `"Deadline must be between 7 days and 1 year from today"`; otherwise clear error
      - Replace the existing `<input type="date">` and its helper `<span>` with `<DatePickerInput>` passing `id`, `label`, `value`, `onChange`, `min={minDate}`, `max={maxDate}`, `helperText`, and `error={deadlineError}`
    - **Step 4 — Milestone Target Date** (inside `StepMilestones`):
      - Add per-milestone error tracking: `const [milestoneDateErrors, setMilestoneDateErrors] = useState<Record<number, string>>({})` (or a `string[]` keyed by milestone index)
      - On each milestone date `onChange`: if a non-empty value is not a parseable date, surface an error; otherwise clear
      - Replace each `<input type="date">` in the milestone row with `<DatePickerInput>` passing `id` (e.g. `milestone-date-{index}`), `label`, `value`, `onChange`, and `error={milestoneDateErrors[index] ?? ''}`
    - Import `DatePickerInput` at the top of `CampaignFormPage.tsx`
    - **E2E tests** — add to `e2e/campaign-date-picker.spec.ts`:
      - Log in as Creator, start Create Campaign flow
      - Complete Step 1 and Step 2 (minimal valid inputs) to reach Step 3
      - Enter a deadline date more than 1 year from today → assert inline error message is visible
      - Correct the deadline to a valid date → assert error message is gone
      - Advance to Step 4
      - Add a milestone, set a target date → assert no error shown for valid input
      - Follow patterns from existing E2E specs (e.g. `e2e/auth.spec.ts`) for login and navigation
  - **Files**:
    - `packages/client/src/pages/CampaignFormPage.tsx` (modify)
    - `e2e/campaign-date-picker.spec.ts` (create)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh e2e/campaign-date-picker.spec.ts` passes
  - **Brief ref**: Integration in `CampaignFormPage` section + E2E section

- [ ] TASK-03: Full E2E regression and CI verification
  - **Goal**: Run the complete test suite and CI checks to confirm nothing is broken
  - **Details**: No new code — run the full suite as a final gate
  - **Files**: (none)
  - **Verify**: `./scripts/run-e2e.sh` (all tests) AND `./scripts/ci-check.sh`
  - **Brief ref**: Verification section
