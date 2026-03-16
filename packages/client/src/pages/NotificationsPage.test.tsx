import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotificationsPage } from './NotificationsPage'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'

const mockMarkAsRead = vi.fn()

const readNotification = {
  id: 'n1',
  userId: 'user-1',
  type: 'approval',
  title: 'Campaign Approved',
  message: 'Your campaign was approved.',
  campaignId: 'campaign-1',
  read: true,
  createdAt: new Date('2024-02-01T10:00:00.000Z'),
}

const unreadNotification = {
  id: 'n2',
  userId: 'user-1',
  type: 'update',
  title: 'Milestone Submitted',
  message: 'Evidence has been submitted.',
  campaignId: 'campaign-2',
  read: false,
  createdAt: new Date('2024-02-02T10:00:00.000Z'),
}

function renderPage() {
  return render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>
  )
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    mockMarkAsRead.mockClear()
  })

  it('renders all notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [readNotification, unreadNotification],
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    expect(screen.getByText('Campaign Approved')).toBeInTheDocument()
    expect(screen.getByText('Milestone Submitted')).toBeInTheDocument()
  })

  it('shows "Mark as read" button for unread notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [readNotification, unreadNotification],
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument()
  })

  it('does not show "Mark as read" button for read notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [readNotification],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument()
  })

  it('calls markAsRead when "Mark as read" button is clicked', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [unreadNotification],
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(mockMarkAsRead).toHaveBeenCalledWith('n2')
  })

  it('renders empty state when there are no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    expect(screen.getByText('You have no notifications yet.')).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: true,
    })

    renderPage()
    expect(screen.getByText('Loading notifications…')).toBeInTheDocument()
  })

  it('renders the page heading', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    renderPage()
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
  })
})
