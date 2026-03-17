import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReviewDetailPage } from './ReviewDetailPage'
import type { CampaignDetail } from '../api/campaigns'

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('../api/campaigns', () => ({
  approveCampaign: vi.fn().mockResolvedValue(undefined),
  rejectCampaign: vi.fn().mockResolvedValue(undefined),
  resubmitCampaign: vi.fn().mockResolvedValue(undefined),
}))

import { useCampaign } from '../hooks/useCampaign'
import { useAuthContext } from '../context/AuthContext'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderPage(id = 'test-id') {
  const qc = makeQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/review/${id}`]}>
        <Routes>
          <Route path="/review/:id" element={<ReviewDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockCampaign: CampaignDetail = {
  id: 'test-id',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  description: 'Full description of the Mars habitat.',
  heroImageUrl: null,
  status: 'Under Review',
  category: 'Habitats & Construction',
  raisedAmount: 0,
  goalAmount: 5_000_000,
  contributorCount: 0,
  deadline: new Date('2025-12-31'),
  createdAt: new Date('2024-01-01'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned with mission.',
  tags: [],
  maxFundingCapUsd: 10_000_000,
  launchedAt: null,
  updatedAt: new Date('2024-01-01'),
  milestones: [],
  stretchGoals: [],
  teamMembers: [
    { id: 'tm1', name: 'Dr. Elena Vasquez', role: 'Chief Engineer', bio: null, sortOrder: 1 },
  ],
  updates: [],
  creatorId: 'creator-1',
  reviewerId: 'reviewer-1',
}

describe('ReviewDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
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
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.getByText('Failed to load campaign. Please try again.')).toBeInTheDocument()
  })

  it('renders campaign title and category', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Habitats & Construction')).toBeInTheDocument()
  })

  it('renders goal amount and status', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.getByText('$5,000,000')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()
  })

  it('renders back link to review queue', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    const backLink = screen.getByRole('link', { name: 'Back to Review Queue' })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/review-queue')
  })

  it('renders ReviewActionsPanel for the assigned reviewer', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: { ...mockCampaign, status: 'Under Review', reviewerId: 'reviewer-1' },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'reviewer-1',
        role: 'Reviewer',
        displayName: 'Test Reviewer',
        email: 'reviewer@test.com',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Review Actions')).toBeInTheDocument()
    expect(screen.getByText('Approve Campaign')).toBeInTheDocument()
    expect(screen.getByText('Reject Campaign')).toBeInTheDocument()
  })

  it('does not render ReviewActionsPanel for a non-assigned user', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCampaign>)

    renderPage()

    expect(screen.queryByText('Review Actions')).not.toBeInTheDocument()
  })
})
