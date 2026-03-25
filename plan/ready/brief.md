# Brief: Issue #194 — Fix: React console error 'style property during rerender' on campaign edit page

## Goal

Remove the React warning `"a style property during rerender (borderBottomColor) when a conflicting property is set (borderBottom)"` that fires on any page containing the `Header` component (including the campaign create/edit form). The root cause is in `Header.tsx`: `navLinkBase` sets the `borderBottom` shorthand while `navLinkActiveStyle` overrides only the `borderBottomColor` sub-property — React flags this as a shorthand/non-shorthand conflict during rerender.

## Scope

**In scope:**
- Fix the shorthand/non-shorthand conflict in `navLinkBase` / `navLinkActiveStyle` in `Header.tsx`
- Verify no other style objects in `Header.tsx` have the same pattern

**Out of scope:**
- Refactoring `Header.tsx` beyond the targeted style fix
- Any other component (e.g. `DatePickerInput`, `CampaignFormPage`) — the warning is in the Header, not the campaign form itself
- CSS-in-JS migration or Tailwind class migration

## Approach

Replace `borderBottomColor` in `navLinkActiveStyle` with the full `borderBottom` shorthand so both the base and active states use the same CSS property form:

```ts
// Before (causes warning)
const navLinkActiveStyle: React.CSSProperties = {
  color: 'var(--color-text-accent)',
  borderBottomColor: 'var(--color-border-accent)',   // non-shorthand conflicts with shorthand in base
}

// After (no conflict)
const navLinkActiveStyle: React.CSSProperties = {
  color: 'var(--color-text-accent)',
  borderBottom: '2px solid var(--color-border-accent)',  // matches shorthand form in navLinkBase
}
```

The `logoutButtonStyle` object already has its own `borderBottom: '2px solid transparent'` override and is not used with conditional active styles, so it is unaffected. No other style objects in the file mix shorthand and non-shorthand border properties.

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/client/src/components/Header.tsx` | modify | Change `borderBottomColor` → `borderBottom: '2px solid var(--color-border-accent)'` in `navLinkActiveStyle` (line 65) |

## Dependencies

None — this is a pure style-object change with no new packages or migrations required.

## Verification

- **Build:** `npm run build` succeeds with no TypeScript errors
- **Lint:** `npm run lint` passes
- **Tests:** `npm run test:coverage` passes (existing Header tests should continue to pass)
- **Visual (browser):** Open `http://localhost:5173`, navigate between pages, open DevTools console — no React style-conflict warnings appear. Verify active nav links still show the accent underline colour.
- **Visual (campaign edit):** Navigate to the campaign create/edit page at any step — no console errors or warnings.
- **E2E:** No dedicated E2E test is needed for this fix; existing navigation E2E tests (if any) cover the Header indirectly.
