import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminMilestoneVerificationPage } from './AdminMilestoneVerificationPage'
import type { CampaignSummary, CampaignDetail } from '../api/campaigns'

vi.mock('../api/campaigns', () => ({
  fetchCampaignsWithPendingMilestones: vi.fn(),
  fetchCampaign: vi.fn(),
  verifyMilestone: vi.fn(),
  returnMilestone: vi.fn(),
}))

import {
  fetchCampaignsWithPendingMilestones,
  fetchCampaign,
  verifyMilestone,
  returnMilestone,
} from '../api/campaigns'

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
        <AdminMilestoneVerificationPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const campaignSummary: CampaignSummary = {
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

const campaignDetail: CampaignDetail = {
  id: 'c1',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  description: '<p>Description</p>',
  heroImageUrl: null,
  status: 'Live',
  category: 'Habitats & Construction',
  raisedAmount: 0,
  goalAmount: 5_000_000,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: 'Alice',
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned.',
  tags: [],
  maxFundingCapUsd: 0,
  launchedAt: null,
  updatedAt: new Date('2024-01-01'),
  creatorId: 'u1',
  reviewerId: null,
  milestones: [
    {
      id: 'm1',
      title: 'Phase 1',
      description: 'First phase.',
      targetDate: null,
      fundingPercentage: 100,
      verificationCriteria: null,
      status: 'Submitted',
      sortOrder: 0,
      evidenceUrl: 'https://example.com/evidence',
      evidenceSubmittedAt: '2024-06-01T00:00:00.000Z',
    },
  ],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

describe('AdminMilestoneVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockRejectedValue(new Error('fail'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders empty state when no pending milestones', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No submitted milestones awaiting verification.')).toBeInTheDocument()
    })
  })

  it('renders table row for each submitted milestone', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([campaignSummary])
    vi.mocked(fetchCampaign).mockResolvedValue(campaignDetail)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
      expect(screen.getByText('Phase 1')).toBeInTheDocument()
    })
  })

  it('renders evidence URL as a link', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([campaignSummary])
    vi.mocked(fetchCampaign).mockResolvedValue(campaignDetail)
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'https://example.com/evidence' })).toBeInTheDocument()
    })
  })

  it('calls verifyMilestone when Verify is clicked', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([campaignSummary])
    vi.mocked(fetchCampaign).mockResolvedValue(campaignDetail)
    vi.mocked(verifyMilestone).mockResolvedValue(undefined)
    renderPage()
    const verifyBtn = await screen.findByRole('button', { name: 'Verify milestone Phase 1' })
    fireEvent.click(verifyBtn)
    await waitFor(() => {
      expect(verifyMilestone).toHaveBeenCalledWith('c1', 'm1', '')
    })
  })

  it('calls returnMilestone when Return is clicked with feedback', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([campaignSummary])
    vi.mocked(fetchCampaign).mockResolvedValue(campaignDetail)
    vi.mocked(returnMilestone).mockResolvedValue(undefined)
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Return feedback for Phase 1' })
      ).toBeInTheDocument()
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Return feedback for Phase 1' }), {
      target: { value: 'Needs more detail' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Return milestone Phase 1' }))
    await waitFor(() => {
      expect(returnMilestone).toHaveBeenCalledWith('c1', 'm1', 'Needs more detail')
    })
  })

  it('Return button is disabled when feedback is empty', async () => {
    vi.mocked(fetchCampaignsWithPendingMilestones).mockResolvedValue([campaignSummary])
    vi.mocked(fetchCampaign).mockResolvedValue(campaignDetail)
    renderPage()
    const returnBtn = await screen.findByRole('button', { name: 'Return milestone Phase 1' })
    expect(returnBtn).toBeDisabled()
  })
})
