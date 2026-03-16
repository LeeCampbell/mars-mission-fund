import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotificationsPage } from './NotificationsPage'
import type { Notification } from '../api/notifications'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'

const mockMarkRead = vi.fn()

const unreadNotification: Notification = {
  id: 'n1',
  userId: 'u1',
  type: 'milestone_verified',
  title: 'Milestone Verified',
  message: 'Your milestone has been verified.',
  campaignId: 'c1',
  read: false,
  createdAt: '2025-03-10T10:00:00.000Z',
}

const readNotification: Notification = {
  id: 'n2',
  userId: 'u1',
  type: 'campaign_approved',
  title: 'Campaign Approved',
  message: 'Your campaign was approved.',
  campaignId: null,
  read: true,
  createdAt: '2025-03-08T09:00:00.000Z',
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMarkRead.mockReset()
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: mockMarkRead,
      isLoading: true,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading notifications…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: mockMarkRead,
      isLoading: false,
      error: new Error('fetch failed'),
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Failed to load notifications. Please try again.')).toBeInTheDocument()
  })

  it('shows empty state when there are no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('You have no notifications.')).toBeInTheDocument()
  })

  it('renders notification title and message', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [unreadNotification],
      unreadCount: 1,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Milestone Verified')).toBeInTheDocument()
    expect(screen.getByText('Your milestone has been verified.')).toBeInTheDocument()
  })

  it('shows "Mark as read" button only for unread notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [unreadNotification, readNotification],
      unreadCount: 1,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument()
  })

  it('does not show "Mark as read" for read notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [readNotification],
      unreadCount: 0,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument()
  })

  it('calls markRead with notification id when button clicked', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [unreadNotification],
      unreadCount: 1,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))

    expect(mockMarkRead).toHaveBeenCalledWith('n1')
  })

  it('renders campaign link when campaignId is present', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [unreadNotification],
      unreadCount: 1,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    const campaignLink = screen.getByRole('link', { name: 'View campaign' })
    expect(campaignLink).toBeInTheDocument()
    expect(campaignLink).toHaveAttribute('href', '/campaigns/c1')
  })

  it('sorts notifications newest first', () => {
    const olderNotification: Notification = {
      ...unreadNotification,
      id: 'n3',
      title: 'Older Notification',
      createdAt: '2025-01-01T00:00:00.000Z',
    }

    vi.mocked(useNotifications).mockReturnValue({
      notifications: [olderNotification, unreadNotification],
      unreadCount: 2,
      markRead: mockMarkRead,
      isLoading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Milestone Verified')
    expect(items[1]).toHaveTextContent('Older Notification')
  })
})
