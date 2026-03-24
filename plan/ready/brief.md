# Brief: Issue #183 — Add Dashboard link to header for Creator role

## Goal

When a user is logged in with the `Creator` role, the header navigation (both desktop and mobile) should display a "Dashboard" link pointing to `/dashboard`. The link must use the existing NavLink active styling and must not appear for any other role (Backer, Reviewer, Administrator, SuperAdministrator) or when unauthenticated.

## Scope

**In scope:**
- Add `isCreator` boolean derived from `user?.role === 'Creator'` in `Header.tsx`
- Render a conditional "Dashboard" `NavLink` to `/dashboard` in the desktop nav
- Render the same conditional link in the mobile nav (with `onClick` to close the mobile menu)
- Create `Header.test.tsx` covering the new Creator-conditional branch to maintain 80% coverage threshold

**Out of scope:**
- Changes to routing, `ProtectedRoute`, or any backend code
- Changes to the `/dashboard` page itself
- Adding the link for any other role
- Admin or Reviewer navigation changes

## Approach

`Header.tsx` already follows a role-conditional pattern for the Reviewer nav link. Mirror that pattern exactly:

1. **Add role flag** alongside existing `isAdmin`/`isReviewer` declarations (~line 203):
   ```tsx
   const isCreator = user?.role === 'Creator'
   ```

2. **Desktop nav** — insert after the `{isReviewer && ...}` block and before the Profile link:
   ```tsx
   {isCreator && (
     <li>
       <NavLink
         to="/dashboard"
         className="mmf-nav-link"
         style={({ isActive }) => ({
           ...navLinkBase,
           ...(isActive ? navLinkActiveStyle : {}),
         })}
       >
         Dashboard
       </NavLink>
     </li>
   )}
   ```

3. **Mobile nav** — insert after the `{isReviewer && ...}` mobile block and before the Profile mobile link, using `mobileNavLinkBase` / `mobileNavLinkActiveStyle` / `mmf-mobile-nav-link` and `onClick={() => setMobileOpen(false)}`.

4. **Tests** — create `Header.test.tsx` using the `useAuthContext` mock pattern from `ProtectedRoute.test.tsx`. Mock `useLogout` from `../hooks/useAuth`. Cover:
   - Dashboard link shown for Creator (desktop + mobile)
   - Dashboard link hidden for Backer
   - Dashboard link hidden for Reviewer
   - Dashboard link hidden when unauthenticated

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/components/Header.tsx` | modify | Add `isCreator` flag; add Creator-conditional Dashboard NavLink in desktop and mobile nav |
| `packages/client/src/components/Header.test.tsx` | create | Unit tests covering Creator Dashboard link visibility across roles |

## Dependencies

No new npm packages or external services required. All patterns and utilities already exist in the codebase.

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors
- **Lint/format**: `npm run lint` and `npm run format:check` pass
- **Tests**: `npx vitest run packages/client/src/components/Header.test.tsx` passes; `npm run test:coverage` stays above 80%
- **Visual** (at `http://localhost:5173`):
  - Log in as a Creator → "Dashboard" link appears in the header nav
  - Click it → navigates to `/dashboard`
  - Active state styling applies when on `/dashboard`
  - Log in as a Backer → "Dashboard" link does not appear
  - Log in as a Reviewer → "Dashboard" link does not appear; "Review" link still appears
  - Log out → "Dashboard" link does not appear
- **E2E**: Log in as a Creator user, verify Dashboard link is present in header, click it, verify landing on `/dashboard`
