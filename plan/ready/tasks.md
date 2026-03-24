# Tasks: Issue #184 — Make Admin badge a clickable link to /admin/users

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Replace decorative Admin badge with NavLink in Header.tsx
  - **Goal**: Convert the non-interactive Admin badge in both desktop and mobile nav into a `NavLink` navigating to `/admin/users`
  - **Details**:
    - In `Header.tsx`, locate the desktop nav block (around line 292) where `isAdmin` renders a `<Badge variant="accent">Admin</Badge>` inside a `<li>` and replace it with a `<NavLink to="/admin/users" className="mmf-nav-link" style={({ isActive }) => ({ ...navLinkBase, ...(isActive ? navLinkActiveStyle : {}) })}>Admin</NavLink>`
    - Locate the mobile nav block (around line 408) and replace the Badge with a `<NavLink to="/admin/users" className="mmf-mobile-nav-link" style={({ isActive }) => ({ ...mobileNavLinkBase, ...(isActive ? mobileNavLinkActiveStyle : {}) })} onClick={() => setMobileOpen(false)}>Admin</NavLink>`
    - After both replacements, check if `Badge` is still used anywhere else in `Header.tsx`; if not, remove it from the import statement
  - **Files**: `packages/client/src/components/Header.tsx`
  - **Verify**: `npm run build` succeeds with no TypeScript errors; `npm run lint && npm run format:check` pass
  - **Brief ref**: Approach section — Desktop nav and Mobile nav replacements

- [x] TASK-02: Add Admin link visibility unit tests in Header.test.tsx
  - **Goal**: Add a `describe` block covering Admin link visibility for all relevant roles and unauthenticated state
  - **Details**:
    - Mirror the existing "Dashboard link visibility" describe block pattern
    - Add tests for: Administrator sees Admin link (desktop), SuperAdministrator sees Admin link (desktop), Backer does NOT see Admin link, unauthenticated user does NOT see Admin link, Administrator sees Admin link in mobile nav (after clicking hamburger)
    - Ensure existing tests are unaffected
  - **Files**: `packages/client/src/components/Header.test.tsx`
  - **Verify**: `npx vitest run packages/client/src/components/Header.test.tsx` — all existing and new tests pass; `npm run test:coverage` meets 80% threshold
  - **Brief ref**: Files to Create/Modify — Header.test.tsx; Verification section

- [ ] TASK-03: Full CI verification
  - **Goal**: Confirm the complete CI pipeline passes with no regressions
  - **Details**: No new code — run the full CI check suite as a final gate
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes
  - **Brief ref**: Verification section
