import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationBell } from './NotificationBell'
import type { Notification } from '@mmf/shared'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'
import { useNavigate } from 'react-router'

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
    type: 'CampaignApproved',
    title: 'Campaign Approved',
    message: 'Your campaign was approved.',
    campaignId: null,
    read: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

describe('NotificationBell', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('renders the bell button', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('shows unread count badge when there are unread notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [
        makeNotification({ read: false }),
        makeNotification({ id: '00000000-0000-0000-0000-000000000003', read: false }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeInTheDocument()
  })

  it('hides badge when all notifications are read', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification({ read: true })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('hides badge when there are no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('navigates to /notifications when clicked', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    expect(mockNavigate).toHaveBeenCalledWith('/notifications')
  })

  it('counts only unread notifications for the badge', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [
        makeNotification({ id: '00000000-0000-0000-0000-000000000001', read: false }),
        makeNotification({ id: '00000000-0000-0000-0000-000000000002', read: true }),
        makeNotification({ id: '00000000-0000-0000-0000-000000000003', read: false }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(<NotificationBell />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeInTheDocument()
  })
})
