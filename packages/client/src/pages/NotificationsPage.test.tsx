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

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    campaignId: null,
    type: 'campaign_approved',
    title: 'Campaign Approved',
    message: 'Your campaign was approved.',
    read: false,
    createdAt: '2024-06-01T10:00:00.000Z',
  },
  {
    id: 'n2',
    userId: 'u1',
    campaignId: 'c1',
    type: 'milestone_verified',
    title: 'Milestone Verified',
    message: 'Milestone 1 was verified.',
    read: true,
    createdAt: '2024-06-02T10:00:00.000Z',
  },
  {
    id: 'n3',
    userId: 'u1',
    campaignId: null,
    type: 'campaign_rejected',
    title: 'Campaign Rejected',
    message: 'Your campaign was rejected.',
    read: false,
    createdAt: '2024-06-03T10:00:00.000Z',
  },
]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification list with messages', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue(mockNotifications)

    renderPage()

    expect(await screen.findByText('Campaign Approved')).toBeInTheDocument()
    expect(screen.getByText('Your campaign was approved.')).toBeInTheDocument()
    expect(screen.getByText('Milestone Verified')).toBeInTheDocument()
    expect(screen.getByText('Campaign Rejected')).toBeInTheDocument()
  })

  it('"Mark as read" button is present for unread notifications', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue(mockNotifications)

    renderPage()

    await screen.findByText('Campaign Approved')

    const markReadButtons = screen.getAllByRole('button', { name: /mark as read/i })
    // Two unread notifications (n1 and n3)
    expect(markReadButtons).toHaveLength(2)
  })

  it('shows empty state when list is empty', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('No notifications')).toBeInTheDocument()
  })

  it('clicking "Mark as read" calls markNotificationRead with the correct id', async () => {
    vi.mocked(fetchNotifications).mockResolvedValue(mockNotifications)
    vi.mocked(markNotificationRead).mockResolvedValue(undefined)

    renderPage()

    await screen.findByText('Campaign Approved')

    // Items sorted newest-first: n3, n2, n1. First unread button belongs to n3.
    const markReadButtons = screen.getAllByRole('button', { name: /mark as read/i })
    fireEvent.click(markReadButtons[0])

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n3')
    })
  })
})
