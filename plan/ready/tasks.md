# Tasks: Issue #185 — Add Notifications link to mobile nav

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add Notifications NavLink to mobile nav and unit tests with E2E coverage
  - **Goal**: Add a "Notifications" NavLink inside the mobile nav authenticated block, write unit tests for visibility/close behaviour, and add an E2E flow verifying the link on a mobile viewport
  - **Details**:
    1. In `packages/client/src/components/Header.tsx`, locate the `{isAuthenticated && (<>…</>)}` block. After the Profile link and before the Admin link, insert a new `<li>` with a `NavLink` to `/notifications` following the exact styling pattern of the Dashboard link (copy `className`, `style` prop with `mobileNavLinkBase`/`mobileNavLinkActiveStyle`, and `onClick={() => setMobileOpen(false)}`).
    2. In `packages/client/src/components/Header.test.tsx`, add a `describe('Header — Notifications link visibility')` suite with tests:
       - Shows link for authenticated Backer
       - Shows link for authenticated Creator
       - Shows link for authenticated Reviewer (if role exists in test helpers)
       - Shows link for authenticated Administrator
       - Hides link when unauthenticated
       - Clicking the link closes the mobile nav (open hamburger, click link, assert `setMobileOpen` / menu closed)
    3. In `e2e/mobile-nav.spec.ts` (create if absent, or add to an existing mobile/nav spec), add a flow:
       - Resize viewport to mobile (e.g. 375×667)
       - Log in as a Backer
       - Click the hamburger menu
       - Assert "Notifications" link is visible
       - Click it → assert navigation to `/notifications`
       - Assert the mobile menu is closed after navigation
  - **Files**:
    - `packages/client/src/components/Header.tsx`
    - `packages/client/src/components/Header.test.tsx`
    - `e2e/mobile-nav.spec.ts`
  - **Verify**: `npx vitest run packages/client/src/components/Header.test.tsx` all pass AND `./scripts/run-e2e.sh e2e/mobile-nav.spec.ts` passes
  - **Brief ref**: Scope, Approach, Files to Create/Modify, Verification

- [x] TASK-02: Full E2E regression and CI verification
  - **Goal**: Run the complete E2E suite and CI checks to confirm nothing is broken
  - **Details**: No new code — run the full test suite as a final gate
  - **Files**: (none)
  - **Verify**: `./scripts/ci-check.sh` passes AND `./scripts/run-e2e.sh` (all tests) passes
  - **Brief ref**: Verification section
