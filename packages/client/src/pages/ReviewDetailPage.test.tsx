import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ReviewDetailPage } from './ReviewDetailPage'
import type { CampaignDetail } from '../api/campaigns'

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: vi.fn(),
}))

vi.mock('../hooks/useReview', () => ({
  useApproveCampaign: vi.fn(),
  useRejectCampaign: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useCampaign } from '../hooks/useCampaign'
import { useApproveCampaign, useRejectCampaign } from '../hooks/useReview'
import { useAuthContext } from '../context/AuthContext'

const mockCampaign: CampaignDetail = {
  id: 'aaa00000-0000-0000-0000-000000000001',
  title: 'Mars Habitat Alpha',
  summary: 'A habitat campaign summary.',
  description: 'Full description of the Mars Habitat Alpha campaign.',
  heroImageUrl: null,
  status: 'Submitted',
  category: 'Habitats & Construction',
  raisedAmount: 0,
  goalAmount: 2_000_000,
  contributorCount: 0,
  deadline: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned with Mars mission.',
  tags: [],
  maxFundingCapUsd: 4_000_000,
  launchedAt: null,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  milestones: [],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

function renderWithRoute(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/review/${id}`]}>
      <Routes>
        <Route path="/review/:id" element={<ReviewDetailPage />} />
        <Route path="/review" element={<div>Review Queue</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ReviewDetailPage', () => {
  beforeEach(() => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'reviewer@example.com',
        role: 'Reviewer',
        displayName: 'Reviewer',
        bio: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      token: 'fake-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    vi.mocked(useApproveCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useApproveCampaign>)

    vi.mocked(useRejectCampaign).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useRejectCampaign>)
  })

  it('renders campaign title', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
  })

  it('renders approve and reject form fields', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    expect(screen.getByLabelText('Review Notes')).toBeInTheDocument()
    expect(screen.getByLabelText('Rejection Rationale')).toBeInTheDocument()
    expect(screen.getByLabelText('Guidance for Resubmission')).toBeInTheDocument()
  })

  it('calls approveMutation when Approve form is submitted', () => {
    const mockMutate = vi.fn()
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    vi.mocked(useApproveCampaign).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useApproveCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    fireEvent.change(screen.getByLabelText('Review Notes'), {
      target: { value: 'Looks good!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /approve campaign/i }))

    expect(mockMutate).toHaveBeenCalledWith(
      { id: mockCampaign.id, notes: 'Looks good!' },
      expect.any(Object)
    )
  })

  it('calls rejectMutation when Reject form is submitted', () => {
    const mockMutate = vi.fn()
    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    vi.mocked(useRejectCampaign).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRejectCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    fireEvent.change(screen.getByLabelText('Rejection Rationale'), {
      target: { value: 'Not enough detail.' },
    })
    fireEvent.change(screen.getByLabelText('Guidance for Resubmission'), {
      target: { value: 'Add more specifics.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /reject campaign/i }))

    expect(mockMutate).toHaveBeenCalledWith(
      {
        id: mockCampaign.id,
        rationale: 'Not enough detail.',
        guidance: 'Add more specifics.',
      },
      expect.any(Object)
    )
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    expect(screen.getByText('Loading campaign…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useCampaign).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    expect(screen.getByText('Failed to load campaign. Please try again.')).toBeInTheDocument()
  })

  it('redirects to home if user is not a Reviewer', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@example.com',
        role: 'Administrator',
        displayName: 'Admin',
        bio: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      token: 'fake-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    vi.mocked(useCampaign).mockReturnValue({
      data: mockCampaign,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCampaign>)

    renderWithRoute('aaa00000-0000-0000-0000-000000000001')

    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
