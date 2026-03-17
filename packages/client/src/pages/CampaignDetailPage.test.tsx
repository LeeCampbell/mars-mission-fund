import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignDetailPage } from './CampaignDetailPage'
import type { CampaignDetail } from '../api/campaigns'

vi.mock('../api/campaigns', () => ({
  postCampaignUpdate: vi.fn().mockResolvedValue(undefined),
  submitMilestoneEvidence: vi.fn().mockResolvedValue(undefined),
  approveCancellation: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useCampaign } from '../hooks/useCampaign'
import { useAuthContext } from '../context/AuthContext'
import { approveCancellation } from '../api/campaigns'

const mockCampaign: CampaignDetail = {
  id: '1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign about Mars.',
  description: 'A test campaign about Mars.',
  heroImageUrl: null,
  status: 'Live',
  category: 'Habitats & Construction',
  raisedAmount: 1_250_000,
  goalAmount: 2_000_000,
  contributorCount: 4_382,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned with Mars mission.',
  tags: [],
  maxFundingCapUsd: 4_000_000,
  launchedAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  cancellationRequestedAt: null,
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
  updates: [
    {
      id: 'u1',
      postedAt: new Date('2024-01-15T00:00:00.000Z'),
      body: 'Things are going well.',
    },
  ],
  creatorId: null,
  reviewerId: null,
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
      <MemoryRouter initialEntries={['/campaigns/1']}>
        <Routes>
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CampaignDetailPage', () => {
  beforeEach(() => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('renders campaign title', () => {
    renderPage()
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
  })

  it('renders campaign category', () => {
    renderPage()
    expect(screen.getByText('Habitats & Construction')).toBeInTheDocument()
  })

  it('does not show cancellation panel when user is not admin', () => {
    renderPage()
    expect(screen.queryByLabelText('Approve Cancellation')).not.toBeInTheDocument()
  })

  it('does not show cancellation panel when admin but cancellationRequestedAt is null', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'admin-1',
        role: 'Administrator',
        email: 'admin@example.com',
        displayName: 'Admin',
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
    expect(screen.queryByLabelText('Approve Cancellation')).not.toBeInTheDocument()
  })

  it('shows cancellation panel when admin and cancellationRequestedAt is set', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: { ...mockCampaign, cancellationRequestedAt: new Date('2026-03-01T00:00:00Z') },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'admin-1',
        role: 'Administrator',
        email: 'admin@example.com',
        displayName: 'Admin',
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
    expect(screen.getByLabelText('Approve Cancellation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /approve cancellation/i })).toBeInTheDocument()
  })

  it('calls approveCancellation when Approve button is clicked', async () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: { ...mockCampaign, cancellationRequestedAt: new Date('2026-03-01T00:00:00Z') },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCampaign>)

    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'admin-1',
        role: 'Administrator',
        email: 'admin@example.com',
        displayName: 'Admin',
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

    fireEvent.click(screen.getByRole('button', { name: /approve cancellation/i }))

    await waitFor(() => {
      expect(vi.mocked(approveCancellation)).toHaveBeenCalledWith('1')
    })
  })
})
