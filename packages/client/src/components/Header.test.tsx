import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './Header'

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useLogout: vi.fn(),
}))

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useAuthContext } from '../context/AuthContext'
import { useLogout } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderHeader() {
  const qc = makeQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLogout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>)
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: vi.fn(),
      isLoading: false,
      error: null,
    })
  })

  it('renders the brand name', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getByText('MARS MISSION FUND')).toBeInTheDocument()
  })

  it('shows Log in link when unauthenticated', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
  })

  it('does not show notification bell when unauthenticated', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.queryByRole('link', { name: 'Notifications' })).not.toBeInTheDocument()
  })

  it('shows notification bell when authenticated', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Backer',
        displayName: 'Test User',
        email: 'user@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getAllByRole('link', { name: 'Notifications' }).length).toBeGreaterThan(0)
  })

  it('shows unread badge with count when there are unread notifications', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Backer',
        displayName: 'Test User',
        email: 'user@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 3,
      markRead: vi.fn(),
      isLoading: false,
      error: null,
    })

    renderHeader()

    expect(screen.getAllByLabelText('3 unread').length).toBeGreaterThan(0)
  })

  it('does not show unread badge when unreadCount is 0', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Backer',
        displayName: 'Test User',
        email: 'user@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument()
  })

  it('shows Review Queue link for Reviewer role', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Reviewer',
        displayName: 'Reviewer User',
        email: 'reviewer@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getByRole('link', { name: 'Review Queue' })).toBeInTheDocument()
  })

  it('does not show Review Queue link for non-Reviewer roles', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Backer',
        displayName: 'Backer User',
        email: 'backer@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.queryByRole('link', { name: 'Review Queue' })).not.toBeInTheDocument()
  })

  it('shows Admin Campaigns link for Administrator role', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Administrator',
        displayName: 'Admin User',
        email: 'admin@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getByRole('link', { name: 'Admin Campaigns' })).toBeInTheDocument()
  })

  it('shows Admin Campaigns link for SuperAdministrator role', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'SuperAdministrator',
        displayName: 'Super Admin',
        email: 'superadmin@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.getByRole('link', { name: 'Admin Campaigns' })).toBeInTheDocument()
  })

  it('does not show Admin Campaigns link for Backer role', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'u1',
        role: 'Backer',
        displayName: 'Backer User',
        email: 'backer@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderHeader()

    expect(screen.queryByRole('link', { name: 'Admin Campaigns' })).not.toBeInTheDocument()
  })
})
