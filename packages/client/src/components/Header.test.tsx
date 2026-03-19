import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './Header'
import type { Notification } from '../api/notifications'

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useLogout: vi.fn(),
}))

vi.mock('../api/notifications', () => ({
  fetchNotifications: vi.fn(),
}))

import { useAuthContext } from '../context/AuthContext'
import { useLogout } from '../hooks/useAuth'
import { fetchNotifications } from '../api/notifications'

const backerUser = {
  id: 'u1',
  email: 'backer@example.com',
  displayName: 'Alice',
  bio: null,
  role: 'Backer' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const reviewerUser = {
  id: 'u2',
  email: 'reviewer@example.com',
  displayName: 'Bob',
  bio: null,
  role: 'Reviewer' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const adminUser = {
  id: 'u3',
  email: 'admin@example.com',
  displayName: 'Admin Carol',
  bio: null,
  role: 'Administrator' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

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
    } as unknown as ReturnType<typeof useLogout>)
  })

  describe('unauthenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
    })

    it('shows Log in link', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: 'Log in' }).length).toBeGreaterThan(0)
    })

    it('does not show notification bell', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: /Notifications/i })).not.toBeInTheDocument()
    })

    it('does not show role-based nav links', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: 'Review Queue' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Milestones' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Cancellations' })).not.toBeInTheDocument()
    })
  })

  describe('authenticated as Backer', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: backerUser,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      })
      vi.mocked(fetchNotifications).mockResolvedValue([])
    })

    it('does not show Review Queue link', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: 'Review Queue' })).not.toBeInTheDocument()
    })

    it('does not show Milestones or Cancellations links', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: 'Milestones' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Cancellations' })).not.toBeInTheDocument()
    })

    it('shows notification bell', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: /Notifications/i }).length).toBeGreaterThan(0)
    })
  })

  describe('authenticated as Reviewer', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: reviewerUser,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      })
      vi.mocked(fetchNotifications).mockResolvedValue([])
    })

    it('shows Review Queue link', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: 'Review Queue' }).length).toBeGreaterThan(0)
    })

    it('does not show Milestones or Cancellations links', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: 'Milestones' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Cancellations' })).not.toBeInTheDocument()
    })
  })

  describe('authenticated as Admin', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: adminUser,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      })
      vi.mocked(fetchNotifications).mockResolvedValue([])
    })

    it('shows Milestones and Cancellations links', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: 'Milestones' }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: 'Cancellations' }).length).toBeGreaterThan(0)
    })

    it('does not show Review Queue link', () => {
      renderHeader()
      expect(screen.queryByRole('link', { name: 'Review Queue' })).not.toBeInTheDocument()
    })
  })

  describe('notification bell', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: backerUser,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      })
    })

    it('shows unread count badge when there are unread notifications', async () => {
      const notifications: Notification[] = [
        {
          id: 'n1',
          userId: 'u1',
          campaignId: null,
          type: 'campaign_approved',
          title: 'Approved',
          message: 'Approved!',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          userId: 'u1',
          campaignId: null,
          type: 'campaign_approved',
          title: 'Also approved',
          message: 'Also!',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]
      vi.mocked(fetchNotifications).mockResolvedValue(notifications)
      renderHeader()
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('bell link has correct aria-label with unread count', async () => {
      const notifications: Notification[] = [
        {
          id: 'n1',
          userId: 'u1',
          campaignId: null,
          type: 'campaign_approved',
          title: 'Approved',
          message: 'Approved!',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          userId: 'u1',
          campaignId: null,
          type: 'campaign_approved',
          title: 'Also approved',
          message: 'Also!',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]
      vi.mocked(fetchNotifications).mockResolvedValue(notifications)
      renderHeader()
      await waitFor(() => {
        const bellLink = screen.getAllByRole('link', { name: 'Notifications (2 unread)' })
        expect(bellLink.length).toBeGreaterThan(0)
      })
    })

    it('bell link shows 0 unread in aria-label when all read', async () => {
      vi.mocked(fetchNotifications).mockResolvedValue([])
      renderHeader()
      await waitFor(() => {
        const bellLinks = screen.getAllByRole('link', { name: 'Notifications (0 unread)' })
        expect(bellLinks.length).toBeGreaterThan(0)
      })
    })

    it('does not render badge when unread count is 0', async () => {
      vi.mocked(fetchNotifications).mockResolvedValue([])
      renderHeader()
      await waitFor(() => {
        // Bell links should be present but no numeric badge
        expect(screen.getAllByRole('link', { name: /Notifications/i }).length).toBeGreaterThan(0)
      })
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })
})
