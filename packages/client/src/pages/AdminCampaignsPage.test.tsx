import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { AdminCampaignsPage } from './AdminCampaignsPage'
import type { CampaignSummary, CampaignDetail } from '../api/campaigns'

vi.mock('../api/campaigns', () => ({
  fetchCampaignsByStatus: vi.fn(),
  verifyMilestone: vi.fn().mockResolvedValue(undefined),
  returnMilestone: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

import { fetchCampaignsByStatus, verifyMilestone, returnMilestone } from '../api/campaigns'
import { useCampaign } from '../hooks/useCampaign'

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
        <AdminCampaignsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockSummary: CampaignSummary = {
  id: 'campaign-1',
  title: 'Mars Habitat Alpha',
  summary: 'A settlement campaign.',
  status: 'Settlement',
  category: 'Habitats & Construction',
  heroImageUrl: null,
  goalAmount: 2_000_000,
  raisedAmount: 2_000_000,
  contributorCount: 100,
  deadline: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  createdBy: null,
}

const mockCampaignDetail: CampaignDetail = {
  ...mockSummary,
  slug: 'mars-habitat-alpha',
  description: 'Detailed description.',
  alignmentStatement: 'Aligned.',
  tags: [],
  maxFundingCapUsd: 4_000_000,
  launchedAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  creatorId: 'creator-1',
  reviewerId: null,
  cancellationRequestedAt: null,
  milestones: [
    {
      id: 'milestone-1',
      title: 'Phase 1 Completion',
      description: 'Complete the first phase.',
      targetDate: null,
      fundingPercentage: 50,
      verificationCriteria: 'Criteria here.',
      status: 'Submitted',
      sortOrder: 1,
      evidenceDescription: 'We completed phase 1.',
      evidenceUrl: 'https://example.com/evidence',
      evidenceSubmittedAt: null,
      feedback: null,
    },
    {
      id: 'milestone-2',
      title: 'Phase 2',
      description: 'Complete phase 2.',
      targetDate: null,
      fundingPercentage: 50,
      verificationCriteria: null,
      status: 'Pending',
      sortOrder: 2,
      evidenceDescription: null,
      evidenceUrl: null,
      evidenceSubmittedAt: null,
      feedback: null,
    },
  ],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

describe('AdminCampaignsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', async () => {
    vi.mocked(fetchCampaignsByStatus).mockReturnValue(new Promise(() => {}))
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading settlement campaigns…')).toBeInTheDocument()
  })

  it('renders error state', async () => {
    vi.mocked(fetchCampaignsByStatus).mockRejectedValue(new Error('Network error'))
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to load campaigns. Please try again.')).toBeInTheDocument()
    })
  })

  it('renders settlement campaign list with submitted milestones', async () => {
    vi.mocked(fetchCampaignsByStatus).mockResolvedValue([mockSummary])
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaignDetail,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('Phase 1 Completion')).toBeInTheDocument()
    expect(screen.getByText('We completed phase 1.')).toBeInTheDocument()
    // Phase 2 is Pending — should not be listed
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument()
  })

  it('shows empty state when no settlement campaigns', async () => {
    vi.mocked(fetchCampaignsByStatus).mockResolvedValue([])
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No campaigns in settlement.')).toBeInTheDocument()
    })
  })

  it('calls verifyMilestone when Verify button is clicked', async () => {
    vi.mocked(fetchCampaignsByStatus).mockResolvedValue([mockSummary])
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaignDetail,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(vi.mocked(verifyMilestone)).toHaveBeenCalledWith('campaign-1', 'milestone-1')
    })
  })

  it('calls returnMilestone with feedback when Return button is clicked', async () => {
    vi.mocked(fetchCampaignsByStatus).mockResolvedValue([mockSummary])
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaignDetail,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByLabelText('Return feedback')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Return feedback'), {
      target: { value: 'Needs more detail' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^return$/i }))

    await waitFor(() => {
      expect(vi.mocked(returnMilestone)).toHaveBeenCalledWith(
        'campaign-1',
        'milestone-1',
        'Needs more detail'
      )
    })
  })

  it('disables Return button when feedback is empty', async () => {
    vi.mocked(fetchCampaignsByStatus).mockResolvedValue([mockSummary])
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaignDetail,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^return$/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /^return$/i })).toBeDisabled()
  })
})
