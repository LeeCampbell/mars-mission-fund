import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ReviewQueuePage } from './ReviewQueuePage'
import type { CampaignSummary } from '@mmf/shared'

vi.mock('../hooks/useReview', () => ({
  useReviewQueue: vi.fn(),
  useClaimCampaign: vi.fn(),
}))

import { useReviewQueue, useClaimCampaign } from '../hooks/useReview'

const mockCampaigns: CampaignSummary[] = [
  {
    id: 'aaa00000-0000-0000-0000-000000000001',
    title: 'Mars Habitat Alpha',
    summary: 'A habitat campaign.',
    status: 'Submitted',
    category: 'Habitats & Construction',
    heroImageUrl: null,
    goalAmount: 2_000_000,
    raisedAmount: 0,
    contributorCount: 0,
    deadline: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'bbb00000-0000-0000-0000-000000000002',
    title: 'Propulsion Research',
    summary: 'An engine campaign.',
    status: 'Submitted',
    category: 'Propulsion',
    heroImageUrl: null,
    goalAmount: 1_000_000,
    raisedAmount: 0,
    contributorCount: 0,
    deadline: null,
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
  },
]

describe('ReviewQueuePage', () => {
  it('renders campaign titles in the table', () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: mockCampaigns,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Propulsion Research')).toBeInTheDocument()
  })

  it('renders a Claim button for each campaign row', () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: mockCampaigns,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    const claimButtons = screen.getAllByRole('button', { name: /claim/i })
    expect(claimButtons).toHaveLength(2)
  })

  it('calls claimMutation.mutate with campaign id when Claim is clicked', () => {
    const mockMutate = vi.fn()

    vi.mocked(useReviewQueue).mockReturnValue({
      data: mockCampaigns,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    const claimButtons = screen.getAllByRole('button', { name: /claim/i })
    fireEvent.click(claimButtons[0])

    expect(mockMutate).toHaveBeenCalledWith(
      'aaa00000-0000-0000-0000-000000000001',
      expect.any(Object)
    )
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading review queue…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Failed to load review queue. Please try again.')).toBeInTheDocument()
  })

  it('shows empty state when queue is empty', () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useReviewQueue>)

    vi.mocked(useClaimCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClaimCampaign>)

    render(
      <MemoryRouter>
        <ReviewQueuePage />
      </MemoryRouter>
    )

    expect(screen.getByText('No campaigns awaiting review.')).toBeInTheDocument()
  })
})
