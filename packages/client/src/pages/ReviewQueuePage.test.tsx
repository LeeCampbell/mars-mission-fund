import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReviewQueuePage } from './ReviewQueuePage'
import type { CampaignSummary } from '../api/campaigns'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...(actual as object), useNavigate: () => mockNavigate }
})

vi.mock('../api/campaigns', () => ({
  fetchReviewQueue: vi.fn(),
  claimCampaign: vi.fn(),
}))

import { fetchReviewQueue, claimCampaign } from '../api/campaigns'

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
        <ReviewQueuePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const baseCampaign: CampaignSummary = {
  id: 'c1',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  status: 'Submitted',
  category: 'Habitats & Construction',
  heroImageUrl: null,
  goalAmount: 5_000_000,
  raisedAmount: 0,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: null,
}

describe('ReviewQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(fetchReviewQueue).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', async () => {
    vi.mocked(fetchReviewQueue).mockRejectedValue(new Error('fail'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders empty state when queue is empty', async () => {
    vi.mocked(fetchReviewQueue).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No campaigns awaiting review.')).toBeInTheDocument()
    })
  })

  it('renders campaign rows in the table', async () => {
    vi.mocked(fetchReviewQueue).mockResolvedValue([baseCampaign])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Claim campaign: Mars Habitat Alpha' })
    ).toBeInTheDocument()
  })

  it('disables Claim button while claim is pending', async () => {
    vi.mocked(fetchReviewQueue).mockResolvedValue([baseCampaign])
    vi.mocked(claimCampaign).mockReturnValue(new Promise(() => {}))
    renderPage()
    const claimBtn = await screen.findByRole('button', {
      name: 'Claim campaign: Mars Habitat Alpha',
    })
    fireEvent.click(claimBtn)
    await waitFor(() => {
      expect(claimBtn).toBeDisabled()
    })
  })

  it('navigates to /review/:id after successful claim', async () => {
    vi.mocked(fetchReviewQueue).mockResolvedValue([baseCampaign])
    vi.mocked(claimCampaign).mockResolvedValue(undefined)
    renderPage()
    const claimBtn = await screen.findByRole('button', {
      name: 'Claim campaign: Mars Habitat Alpha',
    })
    fireEvent.click(claimBtn)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/review/c1')
    })
  })

  it('shows error message on claim failure', async () => {
    vi.mocked(fetchReviewQueue).mockResolvedValue([baseCampaign])
    vi.mocked(claimCampaign).mockRejectedValue(new Error('fail'))
    renderPage()
    const claimBtn = await screen.findByRole('button', {
      name: 'Claim campaign: Mars Habitat Alpha',
    })
    fireEvent.click(claimBtn)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
