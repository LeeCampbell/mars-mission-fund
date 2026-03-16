import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminCampaignsPage } from './AdminCampaignsPage'
import type { CampaignSummary, CampaignDetail } from '@mmf/shared'

vi.mock('../hooks/useCampaigns', () => ({
  useCampaigns: vi.fn(),
}))

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

const mockVerifyMilestone = vi.fn().mockResolvedValue(undefined)
const mockReturnMilestone = vi.fn().mockResolvedValue(undefined)
const mockApproveCancellation = vi.fn().mockResolvedValue(undefined)
const mockDenyCancellation = vi.fn().mockResolvedValue(undefined)

vi.mock('../api/campaigns', () => ({
  verifyMilestone: (...args: unknown[]) => mockVerifyMilestone(...args),
  returnMilestone: (...args: unknown[]) => mockReturnMilestone(...args),
  approveCancellation: (...args: unknown[]) => mockApproveCancellation(...args),
  denyCancellation: (...args: unknown[]) => mockDenyCancellation(...args),
}))

import { useCampaigns } from '../hooks/useCampaigns'
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

const baseSummary: CampaignSummary = {
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
  createdBy: null,
  cancellationRequestedAt: null,
}

const campaignWithSubmittedMilestone: CampaignDetail = {
  id: 'c1',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  description: 'Full description.',
  heroImageUrl: null,
  status: 'Live',
  category: 'Habitats & Construction',
  raisedAmount: 0,
  goalAmount: 5_000_000,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned.',
  tags: [],
  maxFundingCapUsd: 10_000_000,
  launchedAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-01-01'),
  milestones: [
    {
      id: 'm1',
      title: 'Design Phase',
      description: 'Complete the design.',
      targetDate: null,
      fundingPercentage: 50,
      verificationCriteria: null,
      status: 'Submitted',
      sortOrder: 1,
      evidenceDescription: 'Design docs attached.',
      evidenceUrl: null,
    },
  ],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
  creatorId: 'creator-1',
  reviewerId: null,
  cancellationRequestedAt: null,
}

describe('AdminCampaignsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    expect(screen.getByText('Loading campaigns…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    expect(screen.getByText('Failed to load campaigns. Please try again.')).toBeInTheDocument()
  })

  it('renders both section headings', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    expect(screen.getByText('Pending Milestone Verifications')).toBeInTheDocument()
    expect(screen.getByText('Pending Cancellation Requests')).toBeInTheDocument()
  })

  it('shows empty state messages when no pending items', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    expect(screen.getByText('No pending milestone verifications.')).toBeInTheDocument()
    expect(screen.getByText('No pending cancellation requests.')).toBeInTheDocument()
  })

  it('renders milestone card for campaigns with submitted milestones', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: [baseSummary],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    vi.mocked(useCampaign).mockReturnValue({
      data: campaignWithSubmittedMilestone,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.getByText('Milestone: Design Phase')).toBeInTheDocument()
    expect(screen.getByText('Design docs attached.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Return' })).toBeInTheDocument()
  })

  it('clicking Return shows feedback textarea', () => {
    vi.mocked(useCampaigns).mockReturnValue({
      data: [baseSummary],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    vi.mocked(useCampaign).mockReturnValue({
      data: campaignWithSubmittedMilestone,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Return' }))

    expect(screen.getByRole('textbox', { name: 'Return feedback' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Return' })).toBeInTheDocument()
  })

  it('renders cancellation card with Approve and Deny buttons', () => {
    const cancellationCampaign: CampaignSummary = {
      ...baseSummary,
      id: 'c2',
      title: 'Mars Power Grid',
      status: 'Live',
      cancellationRequestedAt: new Date('2025-01-15'),
    }

    vi.mocked(useCampaigns).mockReturnValue({
      data: [cancellationCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    expect(screen.getByText('Mars Power Grid')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deny' })).toBeInTheDocument()
  })

  it('clicking Approve calls approveCancellation', async () => {
    const cancellationCampaign: CampaignSummary = {
      ...baseSummary,
      id: 'c2',
      title: 'Mars Power Grid',
      status: 'Live',
      cancellationRequestedAt: new Date('2025-01-15'),
    }

    vi.mocked(useCampaigns).mockReturnValue({
      data: [cancellationCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    await vi.waitFor(() => {
      expect(mockApproveCancellation).toHaveBeenCalledWith('c2')
    })
  })

  it('clicking Deny calls denyCancellation', async () => {
    const cancellationCampaign: CampaignSummary = {
      ...baseSummary,
      id: 'c3',
      title: 'Mars Water System',
      status: 'Live',
      cancellationRequestedAt: new Date('2025-01-16'),
    }

    vi.mocked(useCampaigns).mockReturnValue({
      data: [cancellationCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Deny' }))

    await vi.waitFor(() => {
      expect(mockDenyCancellation).toHaveBeenCalledWith('c3')
    })
  })
})
