import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ReviewDetailPage } from './ReviewDetailPage'
import type { CampaignDetail } from '../api/campaigns'

const mockCampaign: CampaignDetail = {
  id: '1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign about Mars.',
  description: 'Detailed proposal for Mars habitat.',
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
  alignmentStatement: 'This project advances the Mars mission.',
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
  stretchGoals: [
    {
      id: 'sg1',
      description: 'Extra Module',
      deliverables: 'Adds extra module.',
      targetAmount: 2_500_000,
      unlocked: false,
      sortOrder: 1,
    },
  ],
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

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
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

vi.mock('../components/campaigns/ReviewActionsPanel', () => ({
  ReviewActionsPanel: () => <div data-testid="review-actions-panel">Review Actions Panel</div>,
}))

import { useCampaign } from '../hooks/useCampaign'

const mockUseCampaign = vi.mocked(useCampaign)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/review/1']}>
      <Routes>
        <Route path="/review/:id" element={<ReviewDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ReviewDetailPage', () => {
  it('renders loading state', () => {
    mockUseCampaign.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading campaign…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseCampaign.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load campaign. Please try again.')).toBeInTheDocument()
  })

  it('renders full proposal when campaign loads', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Habitats & Construction')).toBeInTheDocument()
    expect(screen.getByText('Detailed proposal for Mars habitat.')).toBeInTheDocument()
  })

  it('renders alignment statement when present', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Alignment Statement')).toBeInTheDocument()
    expect(screen.getByText('This project advances the Mars mission.')).toBeInTheDocument()
  })

  it('renders team member', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Dr. Elena Vasquez')).toBeInTheDocument()
  })

  it('renders milestone', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByText('Design Phase')).toBeInTheDocument()
  })

  it('renders ReviewActionsPanel', () => {
    mockUseCampaign.mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    renderPage()
    expect(screen.getByTestId('review-actions-panel')).toBeInTheDocument()
  })
})
