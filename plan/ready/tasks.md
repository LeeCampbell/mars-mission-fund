# Tasks: Issue #194 — Fix: React console error 'style property during rerender' on campaign edit page

Brief: plan/ready/brief.md

## Checklist

- [ ] TASK-01: Fix borderBottom shorthand conflict in Header.tsx
  - **Goal**: Eliminate the React warning by replacing `borderBottomColor` with the full `borderBottom` shorthand in `navLinkActiveStyle`
  - **Details**:
    1. Open `packages/client/src/components/Header.tsx`
    2. Locate `navLinkActiveStyle` (around line 65)
    3. Replace `borderBottomColor: 'var(--color-border-accent)'` with `borderBottom: '2px solid var(--color-border-accent)'`
    4. Scan the rest of the file to confirm no other style objects mix `borderBottom` shorthand with `borderBottomColor` / `borderBottomWidth` / `borderBottomStyle` sub-properties
    5. Run `npm run lint` and `npm run build` to confirm no errors
    6. Run `npm run test:coverage` to confirm existing Header tests still pass
  - **Files**: `packages/client/src/components/Header.tsx`
  - **Verify**: `npm run lint` passes, `npm run build` succeeds, `npm run test:coverage` passes, and opening the app in a browser shows no React style-conflict warnings in DevTools console
  - **Brief ref**: Approach section / Files to Create/Modify section
