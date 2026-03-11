import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { DashboardPage } from './DashboardPage'
import type { CampaignSummary } from '@mmf/shared'

vi.mock('../hooks/useMyCampaigns', () => ({
  useMyCampaigns: vi.fn(),
}))

vi.mock('../hooks/useCampaignMutations', () => ({
  useSubmitCampaign: vi.fn(),
}))

import { useMyCampaigns } from '../hooks/useMyCampaigns'
import { useSubmitCampaign } from '../hooks/useCampaignMutations'

const mockSubmitMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockDraftCampaign: CampaignSummary = {
  id: 'campaign-1',
  title: 'Mars Habitat Alpha',
  summary: 'A draft campaign.',
  status: 'Draft',
  category: 'Habitats & Construction',
  heroImageUrl: null,
  goalAmount: 2_000_000,
  raisedAmount: 0,
  contributorCount: 0,
  deadline: new Date('2027-01-01'),
  createdAt: new Date('2026-01-01'),
}

const mockLiveCampaign: CampaignSummary = {
  id: 'campaign-2',
  title: 'Mars Power Grid',
  summary: 'A live campaign.',
  status: 'Live',
  category: 'Power & Energy',
  heroImageUrl: null,
  goalAmount: 5_000_000,
  raisedAmount: 3_000_000,
  contributorCount: 100,
  deadline: new Date('2027-06-01'),
  createdAt: new Date('2026-01-01'),
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useSubmitCampaign).mockReturnValue(
      mockSubmitMutation as unknown as ReturnType<typeof useSubmitCampaign>
    )
  })

  it('renders loading state while fetching', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByText('Loading your campaigns…')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByText('Failed to load campaigns. Please try again.')).toBeInTheDocument()
  })

  it('renders empty state when no campaigns', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByText(/You have no campaigns yet/)).toBeInTheDocument()
  })

  it('renders "New Campaign" button', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByRole('button', { name: 'New Campaign' })).toBeInTheDocument()
  })

  it('renders campaign title in status group', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockDraftCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
  })

  it('renders status group heading for Draft campaigns', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockDraftCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByRole('heading', { name: 'Draft' })).toBeInTheDocument()
  })

  it('renders Edit and Submit for Review buttons for Draft campaigns', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockDraftCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit for Review' })).toBeInTheDocument()
  })

  it('renders View button for all campaigns', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockDraftCampaign, mockLiveCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    const viewButtons = screen.getAllByRole('button', { name: 'View' })
    expect(viewButtons).toHaveLength(2)
  })

  it('does not render Edit button for non-Draft campaigns', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockLiveCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('renders multiple status group headings for campaigns in different statuses', () => {
    vi.mocked(useMyCampaigns).mockReturnValue({
      data: [mockDraftCampaign, mockLiveCampaign],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCampaigns>)

    renderDashboard()

    expect(screen.getByRole('heading', { name: 'Draft' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Live' })).toBeInTheDocument()
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Mars Power Grid')).toBeInTheDocument()
  })
})
