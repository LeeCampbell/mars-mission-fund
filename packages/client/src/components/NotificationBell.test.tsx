import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationBell } from './NotificationBell'
import type { Notification } from '../api/notifications'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../api/notifications', () => ({
  fetchNotifications: vi.fn(),
}))

import { fetchNotifications } from '../api/notifications'

const unreadNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    campaignId: null,
    type: 'campaign_approved',
    title: 'Campaign Approved',
    message: 'Your campaign was approved.',
    read: false,
    createdAt: '2024-06-01T00:00:00.000Z',
  },
  {
    id: 'n2',
    userId: 'u1',
    campaignId: null,
    type: 'milestone_verified',
    title: 'Milestone Verified',
    message: 'A milestone was verified.',
    read: false,
    createdAt: '2024-06-02T00:00:00.000Z',
  },
  {
    id: 'n3',
    userId: 'u1',
    campaignId: null,
    type: 'campaign_approved',
    title: 'Another Notification',
    message: 'This one is read.',
    read: true,
    createdAt: '2024-06-03T00:00:00.000Z',
  },
]

const allReadNotifications: Notification[] = unreadNotifications.map((n) => ({ ...n, read: true }))

function renderBell() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders red badge with correct unread count when notifications exist', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue(unreadNotifications)

    renderBell()

    const badge = await screen.findByText('2')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ background: 'var(--color-status-error)' })
  })

  it('renders no badge when all notifications are read', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue(allReadNotifications)

    renderBell()

    // Wait for query to settle
    await screen.findByRole('button', { name: /notifications/i })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    // Badge element should not be present
    const button = screen.getByRole('button', { name: /notifications/i })
    // The badge has aria-hidden, so we check it's not in the DOM by content
    expect(button.querySelector('[aria-hidden="true"] + *')).toBeNull()
  })

  it('renders no badge when notifications list is empty', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([])

    renderBell()

    await screen.findByRole('button', { name: 'Notifications' })
    // No numeric badge
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('clicking the bell navigates to /notifications', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([])

    renderBell()

    const button = await screen.findByRole('button', { name: /notifications/i })
    fireEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/notifications')
  })
})
