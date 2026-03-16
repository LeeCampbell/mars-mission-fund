import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotificationBell } from './NotificationBell'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'

const mockMarkAsRead = vi.fn()

const mockNotifications = [
  {
    id: 'n1',
    userId: 'user-1',
    type: 'update',
    title: 'Campaign Update',
    message: 'Your campaign has been updated.',
    campaignId: 'campaign-1',
    read: false,
    createdAt: new Date(Date.now() - 60_000),
  },
  {
    id: 'n2',
    userId: 'user-1',
    type: 'milestone',
    title: 'Milestone Achieved',
    message: 'First milestone complete.',
    campaignId: 'campaign-1',
    read: false,
    createdAt: new Date(Date.now() - 120_000),
  },
  {
    id: 'n3',
    userId: 'user-1',
    type: 'approval',
    title: 'Campaign Approved',
    message: 'Your campaign was approved.',
    campaignId: 'campaign-2',
    read: true,
    createdAt: new Date(Date.now() - 3_600_000),
  },
]

describe('NotificationBell', () => {
  beforeEach(() => {
    mockMarkAsRead.mockClear()
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })
  })

  it('renders the bell button', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows unread badge count in button label', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeInTheDocument()
  })

  it('does not show badge when unread count is zero', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('opens dropdown on bell click showing notification titles', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Campaign Update')).toBeInTheDocument()
    expect(screen.getByText('Milestone Achieved')).toBeInTheDocument()
    expect(screen.getByText('Campaign Approved')).toBeInTheDocument()
  })

  it('shows "View all notifications" link in dropdown', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const viewAllLink = screen.getByRole('link', { name: 'View all notifications' })
    expect(viewAllLink).toBeInTheDocument()
    expect(viewAllLink).toHaveAttribute('href', '/notifications')
  })

  it('calls markAsRead when clicking an unread notification', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    fireEvent.click(screen.getByText('Campaign Update'))
    expect(mockMarkAsRead).toHaveBeenCalledWith('n1')
  })

  it('does not call markAsRead when clicking a read notification', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    fireEvent.click(screen.getByText('Campaign Approved'))
    expect(mockMarkAsRead).not.toHaveBeenCalled()
  })

  it('closes dropdown on second bell click', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    const bell = screen.getByRole('button', { name: /notifications/i })
    fireEvent.click(bell)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(bell)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows empty state when no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      isLoading: false,
    })

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    expect(screen.getByText('No notifications yet.')).toBeInTheDocument()
  })
})
