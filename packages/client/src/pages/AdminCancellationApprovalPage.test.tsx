import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminCancellationApprovalPage } from './AdminCancellationApprovalPage'
import type { CampaignSummary } from '../api/campaigns'

vi.mock('../api/campaigns', () => ({
  fetchCampaignsWithPendingCancellations: vi.fn(),
  approveCancellation: vi.fn(),
}))

import { fetchCampaignsWithPendingCancellations, approveCancellation } from '../api/campaigns'

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
        <AdminCancellationApprovalPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const pendingCampaign: CampaignSummary = {
  id: 'c1',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  status: 'Live',
  category: 'Habitats & Construction',
  heroImageUrl: null,
  goalAmount: 5_000_000,
  raisedAmount: 0,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: 'Alice',
}

describe('AdminCancellationApprovalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', async () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockRejectedValue(new Error('fail'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders empty state when no pending cancellations', async () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No pending cancellation requests.')).toBeInTheDocument()
    })
  })

  it('renders table rows with campaign title, creator, and Approve button', async () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockResolvedValue([pendingCampaign])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Approve cancellation for Mars Habitat Alpha' })
    ).toBeInTheDocument()
  })

  it('calls approveCancellation when Approve is clicked', async () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockResolvedValue([pendingCampaign])
    vi.mocked(approveCancellation).mockResolvedValue(undefined)
    renderPage()
    const approveBtn = await screen.findByRole('button', {
      name: 'Approve cancellation for Mars Habitat Alpha',
    })
    fireEvent.click(approveBtn)
    await waitFor(() => {
      expect(approveCancellation).toHaveBeenCalledWith('c1')
    })
  })

  it('disables Approve button while approval is pending', async () => {
    vi.mocked(fetchCampaignsWithPendingCancellations).mockResolvedValue([pendingCampaign])
    vi.mocked(approveCancellation).mockReturnValue(new Promise(() => {}))
    renderPage()
    const approveBtn = await screen.findByRole('button', {
      name: 'Approve cancellation for Mars Habitat Alpha',
    })
    fireEvent.click(approveBtn)
    await waitFor(() => {
      expect(approveBtn).toBeDisabled()
    })
  })
})
