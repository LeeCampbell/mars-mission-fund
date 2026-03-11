import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotificationBell } from './NotificationBell'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '@mmf/shared'

const makeNotification = (id: string, isRead: boolean): Notification => ({
  id,
  userId: 'user-1',
  type: 'CAMPAIGN_SUBMITTED',
  title: 'Test notification',
  body: 'A campaign was submitted.',
  campaignId: null,
  isRead,
  createdAt: '2026-01-01T00:00:00.000Z',
})

describe('NotificationBell', () => {
  it('renders badge with unread count when there are unread notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [
        makeNotification('n1', false),
        makeNotification('n2', false),
        makeNotification('n3', true),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not render badge when all notifications are read', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification('n1', true), makeNotification('n2', true)],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )

    expect(screen.queryByText('2')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument()
  })

  it('does not render badge when there are no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument()
  })

  it('handles loading state gracefully without badge', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /notifications/i })).toBeInTheDocument()
  })

  it('links to /notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /notifications/i })
    expect(link).toHaveAttribute('href', '/notifications')
  })
})
