import { describe, it, expect, vi } from 'vitest'
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
  approveCampaign: vi.fn(),
  rejectCampaign: vi.fn(),
  resubmitCampaign: vi.fn(),
}))

import { useCampaign } from '../hooks/useCampaign'
import { useAuthContext } from '../context/AuthContext'

const mockCampaign: CampaignDetail = {
  id: 'c1',
  title: 'Mars Habitat Alpha',
  summary: 'A Mars habitat.',
  description: '<p>Full description here.</p>',
  heroImageUrl: null,
  status: 'Under Review',
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
  maxFundingCapUsd: 0,
  launchedAt: null,
  updatedAt: new Date('2024-01-01'),
  creatorId: 'u1',
  reviewerId: 'r1',
  milestones: [
    {
      id: 'm1',
      title: 'Phase 1',
      description: 'First phase.',
      targetDate: null,
      fundingPercentage: 100,
      verificationCriteria: null,
      status: 'Pending',
      sortOrder: 0,
    },
  ],
  stretchGoals: [],
  teamMembers: [
    {
      id: 'tm1',
      name: 'Dr. Elena Vasquez',
      role: 'Chief Engineer',
      bio: null,
      sortOrder: 0,
    },
  ],
  updates: [],
}

const reviewerUser = {
  id: 'r1',
  email: 'reviewer@example.com',
  displayName: 'Reviewer Bob',
  bio: null,
  role: 'Reviewer' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

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
      <MemoryRouter initialEntries={['/review/c1']}>
        <Routes>
          <Route path="/review/:id" element={<ReviewDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ReviewDetailPage', () => {
  it('renders loading state', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)
    vi.mocked(useAuthContext).mockReturnValue({
      user: reviewerUser,
      token: 'tok',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Loading campaign…')).toBeInTheDocument()
  })

  it('renders error state on fetch failure', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useCampaign>)
    vi.mocked(useAuthContext).mockReturnValue({
      user: reviewerUser,
      token: 'tok',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Failed to load campaign. Please try again.')).toBeInTheDocument()
  })

  it('renders campaign title and category', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)
    vi.mocked(useAuthContext).mockReturnValue({
      user: reviewerUser,
      token: 'tok',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Habitats & Construction')).toBeInTheDocument()
  })

  it('shows ReviewActionsPanel for a Reviewer user on Submitted campaign', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)
    vi.mocked(useAuthContext).mockReturnValue({
      user: reviewerUser,
      token: 'tok',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderPage()
    // ReviewActionsPanel renders Approve button for Submitted campaign + Reviewer
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
  })

  it('renders team member section', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)
    vi.mocked(useAuthContext).mockReturnValue({
      user: reviewerUser,
      token: 'tok',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Dr. Elena Vasquez')).toBeInTheDocument()
  })
})
