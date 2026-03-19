import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationsPage } from './NotificationsPage'
import type { Notification } from '../api/notifications'

vi.mock('../api/notifications', () => ({
  fetchNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}))

import { fetchNotifications, markNotificationRead } from '../api/notifications'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderPage() {
  const qc = makeQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const unreadNotification: Notification = {
  id: 'n1',
  userId: 'u1',
  campaignId: null,
  type: 'campaign_approved',
  title: 'Campaign Approved',
  message: 'Your campaign was approved!',
  read: false,
  createdAt: new Date(Date.now() - 60_000).toISOString(),
}

const readNotification: Notification = {
  id: 'n2',
  userId: 'u1',
  campaignId: null,
  type: 'campaign_rejected',
  title: 'Campaign Rejected',
  message: 'Your campaign was rejected.',
  read: true,
  createdAt: new Date(Date.now() - 120_000).toISOString(),
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(fetchNotifications).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', async () => {
    vi.mocked(fetchNotifications).mockRejectedValue(new Error('fail'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders empty state when no notifications', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No notifications yet.')).toBeInTheDocument()
    })
  })

  it('renders notification titles and messages', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([unreadNotification, readNotification])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Campaign Approved')).toBeInTheDocument()
      expect(screen.getByText('Your campaign was approved!')).toBeInTheDocument()
      expect(screen.getByText('Campaign Rejected')).toBeInTheDocument()
    })
  })

  it('shows "Mark as read" button only for unread notifications', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([unreadNotification, readNotification])
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Mark "Campaign Approved" as read' })
      ).toBeInTheDocument()
    })
    // No mark-as-read button for the already-read notification
    expect(
      screen.queryByRole('button', { name: 'Mark "Campaign Rejected" as read' })
    ).not.toBeInTheDocument()
  })

  it('calls markNotificationRead when Mark as read is clicked', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([unreadNotification])
    vi.mocked(markNotificationRead).mockResolvedValue(undefined)
    renderPage()
    const btn = await screen.findByRole('button', { name: 'Mark "Campaign Approved" as read' })
    fireEvent.click(btn)
    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n1')
    })
  })

  it('shows "Mark all as read" button when there are unread notifications', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([unreadNotification])
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mark all as read' })).toBeInTheDocument()
    })
  })

  it('does not show "Mark all as read" button when all notifications are read', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([readNotification])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Campaign Rejected')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument()
  })
})
