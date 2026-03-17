import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReviewDetailPage } from './ReviewDetailPage'
import type { CampaignDetail } from '../api/campaigns'
import type { UseQueryResult } from '@tanstack/react-query'

const mockCampaign: CampaignDetail = {
  id: '1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign about Mars.',
  description: 'A detailed description of the Mars campaign.',
  heroImageUrl: null,
  status: 'Under Review',
  category: 'Habitats & Construction',
  raisedAmount: 0,
  goalAmount: 2_000_000,
  contributorCount: 0,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned with Mars mission.',
  tags: [],
  maxFundingCapUsd: 4_000_000,
  launchedAt: null,
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  milestones: [
    {
      id: 'm1',
      title: 'Design Phase',
      description: 'Complete the design phase.',
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      fundingPercentage: 100,
      verificationCriteria: 'CAD files reviewed.',
      status: 'Pending',
      sortOrder: 1,
    },
  ],
  stretchGoals: [],
  teamMembers: [
    {
      id: 'tm1',
      name: 'Dr. Elena Vasquez',
      role: 'Chief Engineer',
      bio: 'Experienced engineer.',
      sortOrder: 1,
    },
  ],
  updates: [],
  creatorId: 'creator-1',
  reviewerId: 'reviewer-1',
}

const mockUseCampaign = vi.fn()

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: (...args: unknown[]) => mockUseCampaign(...args),
}))

vi.mock('../components/campaigns/ReviewActionsPanel', () => ({
  ReviewActionsPanel: () => <div>Review Actions</div>,
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: { id: 'reviewer-1', role: 'Reviewer', email: 'reviewer@example.com', name: 'Reviewer' },
    token: 'test-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/review/1']}>
        <Routes>
          <Route path="/review/:id" element={<ReviewDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ReviewDetailPage', () => {
  it('renders campaign title and description when data loads', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as Partial<UseQueryResult<CampaignDetail, Error>>)

    renderPage()

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('A detailed description of the Mars campaign.')).toBeInTheDocument()
  })

  it('renders ReviewActionsPanel for the assigned reviewer', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as Partial<UseQueryResult<CampaignDetail, Error>>)

    renderPage()

    expect(screen.getByText('Review Actions')).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    mockUseCampaign.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<UseQueryResult<CampaignDetail, Error>>)

    renderPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
