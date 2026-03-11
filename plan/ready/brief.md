# Brief: Issue #94 — Account frontend — login, profile, protected routes

## Goal

Build the account frontend layer on top of the backend auth API delivered by the dependent issue
(#93 — Account backend — schema, seed, auth API).
This covers an `AuthProvider` React context that manages JWT auth state in localStorage, a login page
with a demo user selector for workshop use, a profile view/edit page, a `<ProtectedRoute>` component
that redirects unauthenticated users, an admin-only users list page, auth-aware navigation updates, and
TanStack Query hooks wiring the UI to the auth API endpoints.
All UI follows the existing `api → hooks → pages` layering convention and semantic token styling patterns.

## Scope

**In scope:**

- `AuthProvider` React context (`useReducer` pattern per L3-005 §1.3): `user`, `token`, `isAuthenticated`, `login()`, `logout()`; JWT stored in `localStorage` (documented demo stub)
- Session restoration on page load: read token from `localStorage`, call `GET /v1/auth/me` to rehydrate user; clear token if call fails
- `src/api/auth.ts`: plain fetch wrappers for `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me`, `PATCH /v1/auth/profile`, `GET /v1/users`
- TanStack Query hooks: `useLogin`, `useLogout`, `useCurrentUser`, `useUpdateProfile`, `useUsers`
- `<ProtectedRoute>` component: unauthenticated → redirect to `/login`; optional `requireAdmin` flag → redirect non-admins to `/`
- `LoginPage`: hardcoded demo user selector (cards or dropdown with seeded user name/email) + email/password form; pre-fills credentials on selection; post-login redirect to `state.from ?? '/'`
- `ProfilePage`: displays current user email, roles, display name, bio; inline edit form for display name + bio using `useUpdateProfile()`
- `AdminUsersPage`: list of all users from `useUsers()` with role `Badge` components; admin-only protected route
- `Header.tsx` updates: "Log in" link when unauthenticated; profile link + "Log out" button + role badge when authenticated
- `App.tsx` updates: lazy routes for `/login`, `/profile`, `/admin/users`; wrap profile and admin with `<ProtectedRoute>`
- `Layout.tsx` update: add route titles for new pages to `routeTitles` map
- `packages/shared/src/account.ts`: `User` Zod schema and type
- Frontend component tests for: login form flow, profile editing, `ProtectedRoute` redirect logic, admin users list

**Out of scope:**

- Backend auth implementation (Issue #93 prerequisite)
- Registration / email verification
- Password reset / MFA
- Session management UI (view/revoke active sessions)
- Account deactivation / GDPR export / data portability
- KYC integration
- SSO / OAuth providers
- Real JWT signature verification on the client (demo stub reads the token as opaque)

## Approach

### Shared types (`packages/shared/src/account.ts`)

Add a `User` Zod schema and infer the TypeScript type.
Export from `packages/shared/src/index.ts`.

```ts
// packages/shared/src/account.ts
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  roles: z.array(z.string()),
})
export type User = z.infer<typeof UserSchema>
```

### Auth API layer (`src/api/auth.ts`)

Follow the pattern in `src/api/campaigns.ts`.
A private `authedFetch` helper reads the token from `localStorage` and injects
`Authorization: Bearer <token>`.
All response payloads are validated with Zod schemas from `@mmf/shared`.

```ts
loginUser(email, password)  // POST /v1/auth/login → { token, user }
logoutUser()                // POST /v1/auth/logout (authenticated)
fetchCurrentUser()          // GET  /v1/auth/me (authenticated)
updateProfile(data)         // PATCH /v1/auth/profile (authenticated)
fetchUsers()                // GET  /v1/users (authenticated, admin)
```

### AuthContext (`src/context/AuthContext.tsx`)

`useReducer`-based context with actions `LOGIN` and `LOGOUT`.
State: `{ user: User | null, token: string | null }`.

On mount (`useEffect`), read token from `localStorage` and call `fetchCurrentUser()`.
If the call succeeds, dispatch `LOGIN`; if it fails, remove the token from `localStorage`.

Expose `login(token, user)` and `logout()` functions (called by hooks after API calls).
Export a `useAuthContext()` custom hook that throws if used outside the provider.

`AuthProvider` wraps the entire app in `main.tsx`, inside `QueryClientProvider`:

```tsx
// main.tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryClientProvider>
```

### TanStack Query hooks

`src/hooks/useAuth.ts` — groups auth-related mutations/queries:

- `useCurrentUser()` — `useQuery(['currentUser'], fetchCurrentUser)`, enabled when token exists; populates data separate from AuthContext state (used for profile display refresh)
- `useLogin()` — `useMutation(loginUser)`; `onSuccess`: stores token in `localStorage`, calls `authContext.login(token, user)`, invalidates `['currentUser']`
- `useLogout()` — `useMutation(logoutUser)`; `onSuccess`: removes token from `localStorage`, calls `authContext.logout()`, resets query cache
- `useUpdateProfile()` — `useMutation(updateProfile)`; `onSuccess`: invalidates `['currentUser']`

`src/hooks/useUsers.ts`:

- `useUsers()` — `useQuery(['users'], fetchUsers)`

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

```tsx
function ProtectedRoute({ requireAdmin?: boolean, children })
```

Reads `{ isAuthenticated, user }` from `useAuthContext()`.
- Not authenticated → `<Navigate to="/login" state={{ from: location }} replace />`
- `requireAdmin` and user lacks `admin` role → `<Navigate to="/" replace />`
- Otherwise → renders `children` (or `<Outlet />` if used as a layout route)

### Pages

**`LoginPage`** (`src/pages/LoginPage.tsx`):
Hardcoded demo user list (matching the users seeded by #93) displayed as clickable cards or a
`<select>` dropdown; selecting one pre-fills the email/password fields.
Below the selector, a standard email + password form.
Calls `useLogin()`; on success navigates to `location.state?.from ?? '/'`.
Displays error messages using semantic error token (`--color-status-error`).

**`ProfilePage`** (`src/pages/ProfilePage.tsx`):
Uses `useAuthContext()` for current user data.
Read-only fields: email, roles (rendered as `<Badge>` components).
Editable fields: display name, bio — shown in an inline form; saved via `useUpdateProfile()`.

**`AdminUsersPage`** (`src/pages/AdminUsersPage.tsx`):
Uses `useUsers()`.
Renders a list/table of users; each row shows email, display name, and role badges (`<Badge>`).
Loading and error states follow the existing `CampaignDetailPage` pattern.

### Navigation updates (`src/components/Header.tsx`)

Read `{ isAuthenticated, user }` from `useAuthContext()`.

Unauthenticated: replace the placeholder with a "Log in" `NavLink` pointing to `/login`.

Authenticated: add to both desktop and mobile nav:
- Profile link (display name or "Profile") → `/profile`
- Role badge (e.g. `<Badge variant="accent">Admin</Badge>`) if user has `admin` role
- "Log out" button that calls `useLogout()` mutation

### Routing (`src/App.tsx`)

Add lazy-loaded pages (follow existing `React.lazy` pattern):

```tsx
const LoginPage     = React.lazy(() => import('./pages/LoginPage')...)
const ProfilePage   = React.lazy(() => import('./pages/ProfilePage')...)
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage')...)
```

Add routes inside the existing `<Route element={<Layout />}>`:

```tsx
<Route path="/login" element={<LoginPage />} />
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<ProfilePage />} />
</Route>
<Route element={<ProtectedRoute requireAdmin />}>
  <Route path="/admin/users" element={<AdminUsersPage />} />
</Route>
```

`ProtectedRoute` used as a layout route renders `<Outlet />` when access is granted.

### Layout titles (`src/components/Layout.tsx`)

Add to `routeTitles`:

```ts
'/login':       'Log In — Mars Mission Fund',
'/profile':     'Profile — Mars Mission Fund',
'/admin/users': 'Users — Mars Mission Fund',
```

## Files to Create/Modify

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/shared/src/account.ts` | create | `User` Zod schema and TypeScript type |
| `packages/shared/src/index.ts` | modify | Re-export from `./account.js` |
| `packages/client/src/context/AuthContext.tsx` | create | `AuthProvider` + `useAuthContext` hook |
| `packages/client/src/api/auth.ts` | create | Fetch wrappers for all auth endpoints |
| `packages/client/src/hooks/useAuth.ts` | create | `useLogin`, `useLogout`, `useCurrentUser`, `useUpdateProfile` |
| `packages/client/src/hooks/useUsers.ts` | create | `useUsers` TanStack Query hook |
| `packages/client/src/components/ProtectedRoute.tsx` | create | Route guard component |
| `packages/client/src/pages/LoginPage.tsx` | create | Login page with demo selector + form |
| `packages/client/src/pages/ProfilePage.tsx` | create | Profile view + edit page |
| `packages/client/src/pages/AdminUsersPage.tsx` | create | Admin user list page |
| `packages/client/src/components/Header.tsx` | modify | Auth-aware nav items |
| `packages/client/src/components/Layout.tsx` | modify | Add route titles for new pages |
| `packages/client/src/App.tsx` | modify | Add lazy routes + ProtectedRoute wrappers |
| `packages/client/src/main.tsx` | modify | Add `AuthProvider` inside `QueryClientProvider` |
| `packages/client/src/pages/LoginPage.test.tsx` | create | Login flow component tests |
| `packages/client/src/pages/ProfilePage.test.tsx` | create | Profile view/edit tests |
| `packages/client/src/components/ProtectedRoute.test.tsx` | create | Redirect logic tests |
| `packages/client/src/pages/AdminUsersPage.test.tsx` | create | Admin user list tests |

## Dependencies

No new npm packages needed — all already installed:

- `@tanstack/react-query` v5 — mutations and queries
- `react-router` v7 — `Navigate`, `useLocation`, `Outlet`
- `zod` v3 — schema validation for `User` type (already in `@mmf/shared`)
- Vitest + React Testing Library — tests

**Prerequisite**: Issue #93 (Account backend — schema, seed, auth API) must be merged before live
integration can be verified.
The frontend can be built and unit-tested in isolation using mocked API responses.

The hardcoded demo user list in `LoginPage` must match the users seeded by #93.
Coordinate with the backend brief or seed file to confirm demo user emails/names.

## Verification

- **Build**: `npm run build` (repo root) succeeds with no TypeScript errors.
- **Tests**: `cd packages/client && npm test` — all new tests pass.
- **Visual** (browser at `http://localhost:5173`, backend running):
  - `/login`: demo user cards/dropdown visible; selecting a user pre-fills credentials; successful login redirects to home; JWT present in `localStorage`.
  - Header (unauthenticated): "Log in" link visible; no profile/logout items.
  - Header (authenticated): profile link and logout button visible; admin badge shown for admin users.
  - `/profile`: redirects to `/login` when not authenticated; shows user info and editable form when logged in; saving display name/bio succeeds.
  - `/admin/users`: redirects non-admin users to `/`; shows user table with role badges for admin users.
  - Logout clears JWT from `localStorage` and returns user to home with unauthenticated nav state.
