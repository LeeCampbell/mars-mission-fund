# Tasks: Issue #94 — Account frontend — login, profile, protected routes

Brief: plan/ready/brief.md

## Checklist

- [x] TASK-01: Add shared `User` Zod schema and type
  - **Goal**: Define the `User` type in shared so all packages can import it
  - **Details**: Create `packages/shared/src/account.ts` with `UserSchema` (id, email, displayName, bio, roles). Add `export * from './account.js'` to `packages/shared/src/index.ts`.
  - **Files**: `packages/shared/src/account.ts` (create), `packages/shared/src/index.ts` (modify)
  - **Verify**: `cd packages/shared && npm run build` succeeds; `User` type importable from `@mmf/shared`
  - **Brief ref**: §Shared types

- [x] TASK-02: Create auth API fetch wrappers (`src/api/auth.ts`)
  - **Goal**: Thin fetch layer for all five auth endpoints, following the campaigns.ts pattern
  - **Details**: Add `authedFetch` private helper that reads `localStorage.getItem('token')` and injects `Authorization: Bearer` header. Implement and export: `loginUser(email, password)` → `POST /v1/auth/login`, `logoutUser()` → `POST /v1/auth/logout`, `fetchCurrentUser()` → `GET /v1/auth/me`, `updateProfile(data)` → `PATCH /v1/auth/profile`, `fetchUsers()` → `GET /v1/users`. Validate responses with Zod using `User` from `@mmf/shared`.
  - **Files**: `packages/client/src/api/auth.ts` (create)
  - **Verify**: TypeScript compiles with no errors (`npm run build` in repo root or `tsc --noEmit` in client)
  - **Brief ref**: §Auth API layer

- [x] TASK-03: Create `AuthContext` with `useReducer` and session restoration
  - **Goal**: Provide global auth state (user, token, isAuthenticated) to the entire app
  - **Details**: Create `packages/client/src/context/AuthContext.tsx`. Use `useReducer` with `LOGIN` and `LOGOUT` actions. State shape: `{ user: User | null, token: string | null }`. Derive `isAuthenticated` from `token !== null`. On mount (`useEffect`), read token from `localStorage`; if present, call `fetchCurrentUser()` — on success dispatch `LOGIN`, on failure remove token from `localStorage`. Expose `login(token, user)` and `logout()` functions via context value. Export `useAuthContext()` hook that throws if used outside the provider.
  - **Files**: `packages/client/src/context/AuthContext.tsx` (create)
  - **Verify**: No TypeScript errors; context exports `AuthProvider`, `useAuthContext`
  - **Brief ref**: §AuthContext

- [x] TASK-04: Create TanStack Query auth hooks (`useAuth.ts`, `useUsers.ts`)
  - **Goal**: Wrap API calls in TanStack Query v5 mutations/queries for UI consumption
  - **Details**: `packages/client/src/hooks/useAuth.ts` — `useCurrentUser()`: `useQuery({ queryKey: ['currentUser'], queryFn: fetchCurrentUser, enabled: !!token })`; `useLogin()`: `useMutation` on `loginUser`, `onSuccess` stores token in `localStorage`, calls `authContext.login()`, invalidates `['currentUser']`; `useLogout()`: `useMutation` on `logoutUser`, `onSuccess` removes token from `localStorage`, calls `authContext.logout()`, resets query cache; `useUpdateProfile()`: `useMutation` on `updateProfile`, `onSuccess` invalidates `['currentUser']`. `packages/client/src/hooks/useUsers.ts` — `useUsers()`: `useQuery({ queryKey: ['users'], queryFn: fetchUsers })`.
  - **Files**: `packages/client/src/hooks/useAuth.ts` (create), `packages/client/src/hooks/useUsers.ts` (create)
  - **Verify**: No TypeScript errors; hooks export correct names
  - **Brief ref**: §TanStack Query hooks

- [x] TASK-05: Create `ProtectedRoute` component
  - **Goal**: Route guard that redirects unauthenticated or unauthorised users
  - **Details**: Create `packages/client/src/components/ProtectedRoute.tsx`. Props: `{ requireAdmin?: boolean }`. Read `{ isAuthenticated, user }` from `useAuthContext()`. If not authenticated → `<Navigate to="/login" state={{ from: location }} replace />`. If `requireAdmin` and user lacks `admin` role → `<Navigate to="/" replace />`. Otherwise render `<Outlet />` (layout-route usage). Use `useLocation` from `react-router`.
  - **Files**: `packages/client/src/components/ProtectedRoute.tsx` (create)
  - **Verify**: No TypeScript errors; component exported correctly
  - **Brief ref**: §ProtectedRoute

- [x] TASK-06: Create `LoginPage`
  - **Goal**: Login page with demo user selector and email/password form
  - **Details**: Create `packages/client/src/pages/LoginPage.tsx`. Hardcode demo user list (at minimum: `admin@example.com / password`, `alice@example.com / password` — confirm from backend seed if available). Display demo users as clickable cards; clicking one pre-fills email + password fields. Standard email + password form below. On submit call `useLogin()`; on success navigate to `location.state?.from ?? '/'`. Display server errors using `--color-status-error` semantic token. If already authenticated, redirect to `/`.
  - **Files**: `packages/client/src/pages/LoginPage.tsx` (create)
  - **Verify**: Component renders without errors; form state management works correctly
  - **Brief ref**: §Pages — LoginPage

- [x] TASK-07: Create `ProfilePage`
  - **Goal**: Authenticated profile view/edit page
  - **Details**: Create `packages/client/src/pages/ProfilePage.tsx`. Read current user from `useAuthContext()`. Read-only display: email, roles (rendered as `<Badge>` components matching existing badge variants). Inline edit form for display name and bio fields; on submit call `useUpdateProfile()`; show success/error feedback. Wrap with loading/error states following the `CampaignDetailPage` pattern.
  - **Files**: `packages/client/src/pages/ProfilePage.tsx` (create)
  - **Verify**: Component renders without TypeScript errors; edit form calls mutation correctly
  - **Brief ref**: §Pages — ProfilePage

- [x] TASK-08: Create `AdminUsersPage`
  - **Goal**: Admin-only page listing all users with role badges
  - **Details**: Create `packages/client/src/pages/AdminUsersPage.tsx`. Use `useUsers()` hook. Render a list or table with columns: email, display name, roles (as `<Badge>` components). Follow loading/error pattern from `CampaignDetailPage`. No edit functionality needed.
  - **Files**: `packages/client/src/pages/AdminUsersPage.tsx` (create)
  - **Verify**: Component renders without TypeScript errors; uses `useUsers` hook
  - **Brief ref**: §Pages — AdminUsersPage

- [x] TASK-09: Wire routing, layout titles, and `AuthProvider` into the app shell
  - **Goal**: Connect all new pages into the router and wrap app with AuthProvider
  - **Details**: `packages/client/src/App.tsx` — add `React.lazy` imports for `LoginPage`, `ProfilePage`, `AdminUsersPage`. Inside the `<Route element={<Layout />}>` block add: `<Route path="/login" element={<LoginPage />} />`, layout route `<Route element={<ProtectedRoute />}>` containing `/profile`, layout route `<Route element={<ProtectedRoute requireAdmin />}>` containing `/admin/users`. `packages/client/src/components/Layout.tsx` — add to `routeTitles`: `'/login': 'Log In — Mars Mission Fund'`, `'/profile': 'Profile — Mars Mission Fund'`, `'/admin/users': 'Users — Mars Mission Fund'`. `packages/client/src/main.tsx` — add `<AuthProvider>` inside `<QueryClientProvider>`, wrapping `<App />`.
  - **Files**: `packages/client/src/App.tsx` (modify), `packages/client/src/components/Layout.tsx` (modify), `packages/client/src/main.tsx` (modify)
  - **Verify**: `npm run build` in repo root passes; dev server navigates to `/login` without error
  - **Brief ref**: §Routing, §Layout titles

- [ ] TASK-10: Update `Header.tsx` with auth-aware navigation
  - **Goal**: Header shows "Log in" when unauthenticated; profile link, role badge, and logout button when authenticated
  - **Details**: `packages/client/src/components/Header.tsx` — import `useAuthContext` and `useLogout`. When unauthenticated: render a "Log in" `NavLink` pointing to `/login` in both desktop and mobile nav. When authenticated: render a profile `NavLink` (display name or "Profile") pointing to `/profile`, an `<Badge variant="accent">Admin</Badge>` badge if user has `admin` role, and a "Log out" `<button>` that calls `useLogout().mutate()`. Apply changes to both desktop and mobile nav sections.
  - **Files**: `packages/client/src/components/Header.tsx` (modify)
  - **Verify**: No TypeScript errors; header renders auth state correctly in browser
  - **Brief ref**: §Navigation updates

- [ ] TASK-11: Write component tests
  - **Goal**: Cover login flow, profile editing, ProtectedRoute redirects, and admin user list
  - **Details**: Use Vitest + React Testing Library, mocking API modules with `vi.mock`. Follow patterns of existing tests if any; otherwise mock `AuthContext` and TanStack Query. `ProtectedRoute.test.tsx` — test redirect to `/login` when unauthenticated; test redirect to `/` when authenticated but not admin with `requireAdmin`; test renders children when authenticated. `LoginPage.test.tsx` — test demo user cards pre-fill credentials; test form submission calls `useLogin`; test error message displayed on failed login. `ProfilePage.test.tsx` — test user info is displayed; test edit form submission calls `useUpdateProfile`. `AdminUsersPage.test.tsx` — test renders user list from `useUsers`; test loading/error states.
  - **Files**: `packages/client/src/components/ProtectedRoute.test.tsx` (create), `packages/client/src/pages/LoginPage.test.tsx` (create), `packages/client/src/pages/ProfilePage.test.tsx` (create), `packages/client/src/pages/AdminUsersPage.test.tsx` (create)
  - **Verify**: `cd packages/client && npm test` — all new tests pass with no failures
  - **Brief ref**: §Frontend component tests

- [ ] TASK-12: Final build and integration verification
  - **Goal**: Confirm the entire feature compiles cleanly and tests are green
  - **Details**: Run `npm run build` from the repo root and confirm zero TypeScript errors. Run `cd packages/client && npm test` and confirm all tests pass. Review console output for any runtime warnings. If the backend (Issue #93) is available, do a quick manual smoke test per the brief's visual verification checklist.
  - **Files**: No file changes — verification only
  - **Verify**: Build succeeds; all tests green; no console errors in dev mode
  - **Brief ref**: §Verification
