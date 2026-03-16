import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ReviewDetailPage } from './ReviewDetailPage'

vi.mock('../components/campaigns/ReviewActionsPanel', () => ({
  ReviewActionsPanel: () => <div data-testid="review-actions-panel">Review Actions</div>,
}))

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: {
      id: 'reviewer-1',
      email: 'reviewer@example.com',
      displayName: 'Reviewer User',
      role: 'Reviewer',
    },
    token: 'test-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

import { useCampaign } from '../hooks/useCampaign'

const mockCampaign = {
  id: 'campaign-1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign.',
  description: 'Full description of the campaign.',
  heroImageUrl: null,
  status: 'Under Review' as const,
  category: 'Habitats & Construction' as const,
  raisedAmount: 0,
  goalAmount: 1_000_000,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned with Mars mission goals.',
  tags: [],
  maxFundingCapUsd: 2_000_000,
  launchedAt: null,
  updatedAt: new Date('2024-01-01'),
  creatorId: null,
  reviewerId: 'reviewer-1',
  cancellationRequestedAt: null,
  milestones: [
    {
      id: 'm1',
      title: 'Design Phase',
      description: 'Complete the design phase.',
      targetDate: null,
      fundingPercentage: 50,
      verificationCriteria: 'CAD files reviewed.',
      status: 'Pending' as const,
      sortOrder: 1,
    },
  ],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/review/campaign-1']}>
      <Routes>
        <Route path="/review/:id" element={<ReviewDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ReviewDetailPage', () => {
  it('renders campaign title', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
  })

  it('renders ReviewActionsPanel', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByTestId('review-actions-panel')).toBeInTheDocument()
  })

  it('renders back link to review queue', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()
    const backLink = screen.getByRole('link', { name: /back to review queue/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/review')
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Loading campaign…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Not found'),
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Failed to load campaign. Please try again.')).toBeInTheDocument()
  })
})
