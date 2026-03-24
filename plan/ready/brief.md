# Brief: Issue #184 — Make Admin badge a clickable link to /admin/users

## Goal

The header currently shows a decorative `<Badge variant="accent">Admin</Badge>` for Administrator and SuperAdministrator users in both desktop and mobile nav. This badge is non-interactive. The issue asks us to convert it into a clickable link that navigates to `/admin/users`, consistent with how other role-specific nav links (e.g. Creator's "Dashboard", Reviewer's "Review") are handled.

## Scope

**In scope:**
- Replace the non-clickable Admin badge in the desktop nav with a `NavLink` to `/admin/users`
- Replace the non-clickable Admin badge in the mobile nav with a `NavLink` to `/admin/users`
- Mobile link must close the mobile menu on click (matching the pattern of all other mobile nav links)
- Add unit tests for Admin link visibility (Administrator, SuperAdministrator can see it; other roles and unauthenticated users cannot)

**Out of scope:**
- Changes to `AdminUsersPage.tsx` or any backend routes
- Changes to `ProtectedRoute` (admin route guard already exists)
- Any visual redesign beyond making the badge a link
- E2E tests (no user flow change complex enough to warrant new Playwright spec)

## Approach

In `Header.tsx`, two locations need updating:

**Desktop nav (around line 292):**
```tsx
// Before
{isAdmin && (
  <li>
    <Badge variant="accent">Admin</Badge>
  </li>
)}

// After
{isAdmin && (
  <li>
    <NavLink
      to="/admin/users"
      className="mmf-nav-link"
      style={({ isActive }) => ({
        ...navLinkBase,
        ...(isActive ? navLinkActiveStyle : {}),
      })}
    >
      Admin
    </NavLink>
  </li>
)}
```

**Mobile nav (around line 408):**
```tsx
// Before
{isAdmin && (
  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
    <Badge variant="accent">Admin</Badge>
  </li>
)}

// After
{isAdmin && (
  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
    <NavLink
      to="/admin/users"
      className="mmf-mobile-nav-link"
      style={({ isActive }) => ({
        ...mobileNavLinkBase,
        ...(isActive ? mobileNavLinkActiveStyle : {}),
      })}
      onClick={() => setMobileOpen(false)}
    >
      Admin
    </NavLink>
  </li>
)}
```

The `Badge` import may become unused after this change — remove it from Header.tsx imports if so (check if it's used elsewhere in the file first).

In `Header.test.tsx`, add a new `describe` block mirroring the existing "Dashboard link visibility" tests, covering:
- Administrator role sees Admin link (desktop)
- SuperAdministrator role sees Admin link (desktop)
- Backer role does NOT see Admin link
- Unauthenticated user does NOT see Admin link
- Administrator role sees Admin link in mobile nav (after clicking hamburger)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/components/Header.tsx` | modify | Replace decorative Badge with NavLink in desktop (line ~292) and mobile (line ~408) |
| `packages/client/src/components/Header.test.tsx` | modify | Add Admin link visibility tests |

## Dependencies

No new npm packages required. All components (`NavLink`, style variables) are already in scope within `Header.tsx`.

## Verification

- **Build:** `npm run build` succeeds with no TypeScript errors
- **Lint/format:** `npm run lint && npm run format:check` pass
- **Tests:** `npx vitest run packages/client/src/components/Header.test.tsx` — all existing and new tests pass
- **Coverage:** `npm run test:coverage` meets 80% threshold
- **Visual (browser):** Log in as an Administrator user (use demo selector on login page) → header shows "Admin" as a nav link → clicking it navigates to `/admin/users` page → link is not visible for Backer/Creator/Reviewer roles
- **Mobile:** Open mobile menu as Administrator → "Admin" link appears → clicking it navigates to `/admin/users` and closes the menu
- **E2E:** No new Playwright spec needed; the existing auth/nav flows are not broken
