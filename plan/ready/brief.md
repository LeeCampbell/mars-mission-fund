# Brief: Issue #191 — Fix: 'Submit for Review' confirmation dialog — position, backdrop, border, and button contrast

## Goal

The "Submit for Review" confirmation dialog in `CampaignFormPage` (Step 7 of the campaign editor) has four visual and accessibility defects: it renders anchored to the top-left of the viewport instead of centred, has no semi-transparent backdrop, has insufficient visual separation from the dark page background, and uses the wrong colour token for the "Confirm Submission" primary action button. Additionally, focus must be trapped within the open dialog and returned to the trigger button when it closes (WCAG 2.1 SC 2.1.2, per L3-005 §4.3).

## Scope

**In scope:**
- Centre the `<dialog>` element horizontally and vertically in the viewport
- Add a semi-transparent backdrop via `dialog::backdrop` CSS using `--color-bg-overlay`
- Strengthen the dialog's visual boundary with a box shadow
- Change "Confirm Submission" button to use `--color-action-primary` (and `--color-action-primary-text`) per L2-001 §3
- Change "Cancel" to use the secondary/ghost button style (already correct — verify)
- Focus return: on dialog close (Cancel click, Escape key, or post-submission), return focus to the "Submit for Review" trigger button
- Focus trap: verify the native `showModal()` focus trap is working correctly (modern browsers handle this natively)
- Update unit tests to cover focus-return behaviour
- Update E2E test to assert dialog is visually centred and buttons have correct roles/styles

**Out of scope:**
- Changes to other form buttons (`primaryButtonStyle` is also used for Next/Back navigation — do not change those)
- Refactoring the dialog into a shared `<Modal>` primitive
- Any campaign submission logic changes

## Approach

### 1. Dialog positioning (`CampaignFormPage.tsx` — `dialogStyle`)

The native `<dialog>` opened via `showModal()` is centred by the browser UA stylesheet in most browsers, but Tailwind's CSS reset (`@import 'tailwindcss'` in `index.css`) sets `dialog { margin: 0 }` which breaks the UA centring. Fix by explicitly adding positioning to `dialogStyle`:

```ts
const dialogStyle: React.CSSProperties = {
  // existing props...
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}
```

### 2. Backdrop (`index.css`)

Inline styles cannot target `::backdrop`. Add a rule to `packages/client/src/index.css`:

```css
dialog::backdrop {
  background: var(--color-bg-overlay);
}
```

`--color-bg-overlay` resolves to `--void / 90%` per L2-001 §2.3 (modal overlays token).

### 3. Box shadow (border visibility)

The existing `border: '1px solid var(--color-border-subtle)'` in `dialogStyle` is too subtle against the dark `--color-bg-page` background. Add a shadow using `--shadow-overlay` if available, otherwise compose from tokens. Check `tokens.css` for a suitable shadow token. If none exists, use:

```ts
boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
```

This is a one-time exception for a hardcoded shadow value (no shadow semantic token exists in the current token set). Verify `tokens.css` first — if `--shadow-overlay` or equivalent exists, use it.

### 4. Button hierarchy — "Confirm Submission"

The current `primaryButtonStyle` uses `var(--color-accent-primary)` for its background. Per L2-001 §3 the primary button token is `--color-action-primary` (background) and `--color-action-primary-text` (text). Create a new `dialogConfirmButtonStyle` scoped to the dialog rather than changing the shared `primaryButtonStyle` (which also drives form navigation buttons):

```ts
const dialogConfirmButtonStyle: React.CSSProperties = {
  background: 'var(--color-action-primary)',
  color: 'var(--color-action-primary-text)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-5)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  cursor: 'pointer',
}
```

Apply `dialogConfirmButtonStyle` only to the "Confirm Submission" button in the dialog. The "Cancel" button already uses `secondaryButtonStyle` — no change needed.

### 5. Focus return

The native `<dialog>` with `showModal()` traps focus automatically. To return focus to the trigger button on close:

1. Add `submitTriggerRef = useRef<HTMLButtonElement>(null)` next to `dialogRef` in `CampaignFormPage`
2. Add a `triggerRef` prop to `StepReview` (`triggerRef?: React.RefObject<HTMLButtonElement>`) and attach it to the "Submit for Review" button
3. Pass `submitTriggerRef` when rendering `<StepReview ... triggerRef={submitTriggerRef} />`
4. Add an `onClose` handler to the `<dialog>` element that calls `submitTriggerRef.current?.focus()`

```tsx
<dialog
  ref={dialogRef}
  style={dialogStyle}
  onClose={() => submitTriggerRef.current?.focus()}
>
```

The `onClose` event fires after the dialog closes regardless of how it was closed (Cancel click, post-submission `dialogRef.current?.close()`, or native Escape key), which covers all paths.

### 6. Tests

Update `CampaignFormPage.test.tsx` to add:
- A test that the dialog has `role="dialog"` with an accessible name (`aria-labelledby` pointing to the `<h2>`)
- A test that after calling `dialog.close()`, focus returns to the trigger button (use `fireEvent` or `userEvent` to open and close the dialog)

Note: jsdom does not implement `showModal()` — the existing test suite mocks `HTMLDialogElement.prototype.showModal`. Extend that mock to also fire an `onClose`-style event when `close()` is called, or test focus restoration separately.

Check the existing test file for how `showModal` is currently mocked before writing new tests.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/client/src/pages/CampaignFormPage.tsx` | modify | Add `position`/`transform` to `dialogStyle`; add `boxShadow`; create `dialogConfirmButtonStyle`; apply to "Confirm Submission" button; add `submitTriggerRef`; attach `ref` to trigger button; add `onClose` handler to `<dialog>`; add `aria-labelledby` to `<dialog>` and `id` to `<h2>` |
| `packages/client/src/index.css` | modify | Add `dialog::backdrop { background: var(--color-bg-overlay); }` |
| `packages/client/src/pages/CampaignFormPage.test.tsx` | modify | Add tests for: dialog has accessible name; focus returns to trigger after close |

## Dependencies

No new npm packages required. All tokens (`--color-bg-overlay`, `--color-action-primary`, `--color-action-primary-text`) are already defined in `tokens.css`.

## Verification

- **Build**: `npm run build` succeeds with no type errors
- **Type check**: `npx tsc -b --noEmit` passes
- **Lint**: `npm run lint` passes
- **Tests**: `npx vitest run packages/client/src/pages/CampaignFormPage.test.tsx` — all existing tests pass, new focus-return tests pass
- **Visual** (browser at `http://localhost:5173`):
  1. Log in as a Creator and navigate to `/campaigns/new`
  2. Fill Step 1 (title + category), save draft, advance to Step 7 (Review)
  3. Click "Submit for Review" — dialog should appear **centred** in the viewport
  4. The rest of the page should be **obscured** by a semi-transparent overlay
  5. The dialog should have a visible **shadow/border** distinguishing it from the background
  6. "Confirm Submission" should be a solid **orange** button; "Cancel" should be the ghost/secondary button
  7. Tabbing should be **trapped** within the dialog (Tab cycles between Cancel and Confirm Submission only)
  8. Pressing Escape or clicking Cancel should **return focus** to the "Submit for Review" button on the page
- **E2E**: The existing E2E test in `campaign-lifecycle.spec.ts` (`creator submits a draft campaign`) exercises the dialog — it should continue to pass unchanged. No new E2E test is required for this fix (the existing test covers the happy path; focus-return is covered by unit tests).
