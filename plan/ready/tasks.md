# Tasks: Issue #183 — Add Dashboard link to header for Creator role

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add Creator Dashboard NavLink to Header (desktop + mobile) with E2E coverage
  - **Goal**: Add the `isCreator` flag and conditional Dashboard NavLink to both desktop and mobile nav in `Header.tsx`, write unit tests in `Header.test.tsx`, and add an E2E test verifying the link for a Creator user
  - **Details**:
    1. Read `packages/client/src/components/Header.tsx` to locate the `isAdmin`/`isReviewer` declarations and the existing reviewer nav blocks
    2. Add `const isCreator = user?.role === 'Creator'` alongside the existing role flags
    3. In the desktop nav, insert the Creator Dashboard `NavLink` after the `{isReviewer && ...}` block and before the Profile link, mirroring the reviewer pattern with `mmf-nav-link`, `navLinkBase`, and `navLinkActiveStyle`
    4. In the mobile nav, insert the same conditional block after the `{isReviewer && ...}` mobile block and before the Profile mobile link, using `mobileNavLinkBase`, `mobileNavLinkActiveStyle`, `mmf-mobile-nav-link`, and `onClick={() => setMobileOpen(false)}`
    5. Create `packages/client/src/components/Header.test.tsx` using the `useAuthContext` mock pattern from `ProtectedRoute.test.tsx` and mock `useLogout` from `../hooks/useAuth`. Cover:
       - Dashboard link shown for Creator (desktop + mobile)
       - Dashboard link hidden for Backer
       - Dashboard link hidden for Reviewer
       - Dashboard link hidden when unauthenticated
    6. Write a Playwright E2E test in `e2e/creator-dashboard.spec.ts`:
       - Log in as a Creator user
       - Verify the "Dashboard" link is visible in the header nav
       - Click the Dashboard link
       - Verify navigation to `/dashboard`
       - Log in as a Backer and verify the Dashboard link is absent
  - **Files**:
    - `packages/client/src/components/Header.tsx`
    - `packages/client/src/components/Header.test.tsx`
    - `e2e/creator-dashboard.spec.ts`
  - **Verify**: `npx vitest run packages/client/src/components/Header.test.tsx` passes; `npm run test:coverage` stays above 80%; `npm run build` succeeds; `./scripts/run-e2e.sh e2e/creator-dashboard.spec.ts` passes
  - **Brief ref**: Full brief (Header.tsx modification + test coverage + visual/E2E verification)

- [ ] TASK-02: Full CI and E2E regression
  - **Goal**: Confirm the complete suite passes after the feature is in place
  - **Details**: No new code — run the full test suite and CI checks as a final gate
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh` (all tests) passes
  - **Brief ref**: Verification section
