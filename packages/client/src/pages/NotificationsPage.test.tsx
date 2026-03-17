import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationsPage } from './NotificationsPage'
import type { Notification } from '../api/notifications'

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

vi.mock('../api/notifications', () => ({
  markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
}))

import { useNotifications } from '../hooks/useNotifications'
import { markNotificationAsRead } from '../api/notifications'

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
      <NotificationsPage />
    </QueryClientProvider>
  )
}

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
    type: 'CampaignApproved',
    title: 'Campaign Approved',
    message: 'Your campaign was approved.',
    campaignId: null,
    read: false,
    createdAt: new Date('2026-01-15T10:00:00Z'),
    ...overrides,
  }
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading notifications…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load notifications. Please try again.')).toBeInTheDocument()
  })

  it('renders empty state when there are no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.getByText('No notifications.')).toBeInTheDocument()
  })

  it('renders notification list with title, message, type badge', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification()],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.getByText('Campaign Approved')).toBeInTheDocument()
    expect(screen.getByText('Your campaign was approved.')).toBeInTheDocument()
    expect(screen.getByText('CampaignApproved')).toBeInTheDocument()
  })

  it('shows "Mark as read" button for unread notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification({ read: false })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.getByRole('button', { name: /mark.*read/i })).toBeInTheDocument()
  })

  it('does not show "Mark as read" button for already-read notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification({ read: true })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    expect(screen.queryByRole('button', { name: /mark.*read/i })).not.toBeInTheDocument()
  })

  it('calls markNotificationAsRead when "Mark as read" is clicked', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeNotification({ id: '00000000-0000-0000-0000-000000000001', read: false })],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /mark.*read/i }))

    await waitFor(() => {
      expect(vi.mocked(markNotificationAsRead)).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001'
      )
    })
  })

  it('renders unread rows with visually distinct styling', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [
        makeNotification({ id: '00000000-0000-0000-0000-000000000001', read: false }),
        makeNotification({ id: '00000000-0000-0000-0000-000000000002', read: true }),
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    renderPage()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    // Unread item has bg-card background (fontWeight 600 style)
    expect(items[0]).toHaveStyle({ fontWeight: '600' })
    // Read item does not have bold weight
    expect(items[1]).not.toHaveStyle({ fontWeight: '600' })
  })
})
