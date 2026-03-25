# Tasks: Issue #191 — Fix: 'Submit for Review' confirmation dialog — position, backdrop, border, and button contrast

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Fix dialog CSS — positioning, backdrop, and box shadow
  - **Goal**: Centre the dialog in the viewport, add a semi-transparent backdrop, and add a visible box shadow
  - **Details**:
    1. In `packages/client/src/index.css`, add `dialog::backdrop { background: var(--color-bg-overlay); }` rule
    2. In `CampaignFormPage.tsx`, extend `dialogStyle` with `position: 'fixed'`, `top: '50%'`, `left: '50%'`, `transform: 'translate(-50%, -50%)'` to override Tailwind's `margin: 0` reset
    3. Add `boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'` to `dialogStyle` (no `--shadow-overlay` token exists in `tokens.css`)
    4. Also add `aria-labelledby` to the `<dialog>` element and a matching `id` to the `<h2>` inside the dialog (required for TASK-03 accessible-name test and WCAG compliance)
  - **Files**: `packages/client/src/index.css`, `packages/client/src/pages/CampaignFormPage.tsx`
  - **Verify**: `npm run build` succeeds; `npm run lint` passes; visually confirm dialog is centred with backdrop when opened in browser
  - **Brief ref**: Approach §1, §2, §3; Files table

- [x] TASK-02: Fix "Confirm Submission" button colour and implement focus return
  - **Goal**: Apply correct primary action token to the confirm button and return focus to the trigger button on dialog close
  - **Details**:
    1. In `CampaignFormPage.tsx`, create a new `dialogConfirmButtonStyle` constant using `--color-action-primary` (background) and `--color-action-primary-text` (text) with the same radius/padding/font props as the brief — do NOT change the shared `primaryButtonStyle`
    2. Apply `dialogConfirmButtonStyle` only to the "Confirm Submission" button inside the dialog
    3. Add `submitTriggerRef = useRef<HTMLButtonElement>(null)` in `CampaignFormPage`
    4. Add a `triggerRef?: React.RefObject<HTMLButtonElement>` prop to `StepReview` and attach it to the "Submit for Review" `<button>` element
    5. Pass `submitTriggerRef` as `triggerRef` when rendering `<StepReview>` in `CampaignFormPage`
    6. Add `onClose={() => submitTriggerRef.current?.focus()}` to the `<dialog>` element (covers Cancel click, Escape key, and post-submission close)
  - **Files**: `packages/client/src/pages/CampaignFormPage.tsx`, `packages/client/src/pages/steps/StepReview.tsx`
  - **Verify**: `npm run build` and `npx tsc -b --noEmit` pass with no type errors; "Confirm Submission" button is visually orange; focus returns to trigger after cancel/escape
  - **Brief ref**: Approach §4, §5; Files table

- [x] TASK-03: Update unit tests — accessible name and focus-return behaviour
  - **Goal**: Add unit tests covering dialog accessible name and focus return to trigger on close
  - **Details**:
    1. Read `CampaignFormPage.test.tsx` first to understand the existing `showModal` mock pattern
    2. Extend the `HTMLDialogElement.prototype` mock to also fire `onclose`/call the `onClose` prop when `close()` is called, so focus-return can be verified in jsdom
    3. Add a test: dialog has `role="dialog"` with an accessible name (`aria-labelledby` pointing to the `<h2>`)
    4. Add a test: after opening the dialog (via "Submit for Review" click) and then closing it (via `dialog.close()` or Cancel button click), focus returns to the "Submit for Review" trigger button
  - **Files**: `packages/client/src/pages/CampaignFormPage.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/pages/CampaignFormPage.test.tsx` — all existing tests pass, both new tests pass
  - **Brief ref**: Approach §6; Verification §Tests

- [ ] TASK-04: Full CI verification
  - **Goal**: Confirm all checks pass and the existing E2E campaign-lifecycle test continues to pass
  - **Details**: No new code — run the full CI check suite and the existing E2E test that exercises the dialog (`creator submits a draft campaign` in `campaign-lifecycle.spec.ts`)
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh e2e/campaign-lifecycle.spec.ts` passes
  - **Brief ref**: Verification section
