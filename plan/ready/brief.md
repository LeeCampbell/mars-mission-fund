# Brief: Issue #185 — Add Notifications link to mobile nav

## Goal

The desktop header renders a `<NotificationBell />` component for authenticated users, giving them access to `/notifications`. The mobile hamburger menu has no equivalent — mobile users cannot navigate to their notifications at all. This issue asks for a "Notifications" `NavLink` to be added to the mobile nav for all authenticated users, with an optional unread count badge to match the desktop experience.

## Scope

**In scope:**
- Add a `NavLink` to `/notifications` in the mobile nav's authenticated block (`Header.tsx`)
- Link is visible to **all** authenticated users regardless of role
- Link closes the mobile menu on click (`setMobileOpen(false)`)
- Optionally display unread notification count alongside the link text (consistent with desktop bell)
- Unit tests covering: link appears for authenticated users (all roles), link is absent when unauthenticated
- Unit test covering: clicking the link closes the mobile nav

**Out of scope:**
- Changes to desktop nav (already has `<NotificationBell />`)
- Changes to `NotificationBell.tsx`, `NotificationsPage.tsx`, or API layer
- Notification badge as a standalone component (inline is fine for mobile)
- Push notifications, real-time updates, or new API endpoints

## Approach

**Single-file change** to `packages/client/src/components/Header.tsx`.

Insert a new `<li>` containing a `NavLink` to `/notifications` inside the `{isAuthenticated && (<>…</>)}` block (line 371), after the Profile link (line 403–415) and before the Admin link (line 416). This matches the exact pattern used by the Dashboard link (lines 388–401) added in PR #186.

For the unread count badge, `NotificationBell.tsx` already fetches notifications via `useNotifications()` (React Query). The same hook can be called inside `Header.tsx` — it is already used in `NotificationBell`. Calling it a second time will hit the same React Query cache, so there is no extra network request. The unread count can be inlined as `{unreadCount > 0 ? \`Notifications (${unreadCount})\` : 'Notifications'}`.

However, the issue says "ideally" for the badge — a plain text "Notifications" link is fully acceptable and simpler. **Start with the plain text link**; adding the badge is an enhancement that can be done if the hook is trivially accessible.

Styling pattern (copy exactly from Dashboard link):
```tsx
<li>
  <NavLink
    to="/notifications"
    className="mmf-mobile-nav-link"
    style={({ isActive }) => ({
      ...mobileNavLinkBase,
      ...(isActive ? mobileNavLinkActiveStyle : {}),
    })}
    onClick={() => setMobileOpen(false)}
  >
    Notifications
  </NavLink>
</li>
```

**Tests** follow the pattern in `Header.test.tsx` — a new `describe` block with:
- Shows link for authenticated Backer
- Shows link for authenticated Creator
- Shows link for authenticated Reviewer
- Shows link for authenticated Administrator
- Hides link when unauthenticated
- Clicking link closes mobile nav (fireEvent.click on hamburger, then link)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/client/src/components/Header.tsx` | modify | Add Notifications NavLink in mobile authenticated block (after Profile, before Admin) |
| `packages/client/src/components/Header.test.tsx` | modify | Add `describe('Header — Notifications link visibility')` test suite |

## Dependencies

No new npm packages. No new API endpoints. `useNotifications` hook is available if the unread count badge is desired (already imported in `NotificationBell.tsx`; check if it's exported from a hooks file or defined inline).

## Verification

- **Build**: `npm run build` succeeds with no TypeScript errors
- **Lint/format**: `npm run lint` and `npm run format:check` pass
- **Tests**: `npx vitest run packages/client/src/components/Header.test.tsx` — all new tests pass; no regressions
- **Visual** (at `http://localhost:5173`):
  - On mobile viewport (< 768 px), open hamburger menu while logged in → "Notifications" link appears in menu
  - Clicking "Notifications" navigates to `/notifications` and closes the menu
  - Hamburger menu while logged out → "Notifications" link does NOT appear
  - Desktop header unchanged (bell icon still present)
- **E2E**: Existing Playwright suite should cover authenticated flows; add or confirm a flow:
  - Resize to mobile, open hamburger, click Notifications → land on `/notifications` page
