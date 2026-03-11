import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AdminMilestonesPage } from './AdminMilestonesPage'
import type { SubmittedMilestone } from '../api/adminCampaigns'

vi.mock('../hooks/useAdmin', () => ({
  useSubmittedMilestones: vi.fn(),
  useVerifyMilestone: vi.fn(),
  useReturnMilestone: vi.fn(),
}))

import { useSubmittedMilestones, useVerifyMilestone, useReturnMilestone } from '../hooks/useAdmin'

const mockMilestones: SubmittedMilestone[] = [
  {
    id: 'ms-aaa-001',
    campaignId: 'cmp-aaa-001',
    campaignTitle: 'Mars Habitat Alpha',
    title: 'Site Preparation Complete',
    evidenceUrl: 'https://evidence.example.com/habitat-alpha',
    evidenceNotes: 'Excavation finished and foundation poured.',
    status: 'Submitted',
  },
  {
    id: 'ms-bbb-002',
    campaignId: 'cmp-bbb-002',
    campaignTitle: 'Propulsion Research',
    title: 'Engine Test 1 Complete',
    evidenceUrl: null,
    evidenceNotes: null,
    status: 'Submitted',
  },
]

describe('AdminMilestonesPage', () => {
  it('renders milestone rows with campaign title and milestone title', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
    expect(screen.getByText('Site Preparation Complete')).toBeInTheDocument()
    expect(screen.getByText('Propulsion Research')).toBeInTheDocument()
    expect(screen.getByText('Engine Test 1 Complete')).toBeInTheDocument()
  })

  it('renders evidence info including clickable link', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    const evidenceLink = screen.getByRole('link', { name: /evidence\.example\.com/i })
    expect(evidenceLink).toBeInTheDocument()
    expect(evidenceLink).toHaveAttribute('href', 'https://evidence.example.com/habitat-alpha')
    expect(screen.getByText('Excavation finished and foundation poured.')).toBeInTheDocument()
  })

  it('renders Verify and Return buttons for each row', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    const verifyButtons = screen.getAllByRole('button', { name: /verify milestone/i })
    const returnButtons = screen.getAllByRole('button', { name: /return milestone/i })
    expect(verifyButtons).toHaveLength(2)
    expect(returnButtons).toHaveLength(2)
  })

  it('calls verifyMutation.mutate with correct args when Verify is clicked', () => {
    const mockVerifyMutate = vi.fn()

    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: mockVerifyMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    const notesInputs = screen.getAllByLabelText('Admin notes')
    fireEvent.change(notesInputs[0], { target: { value: 'Evidence verified.' } })

    const verifyButtons = screen.getAllByRole('button', { name: /verify milestone/i })
    fireEvent.click(verifyButtons[0])

    expect(mockVerifyMutate).toHaveBeenCalledWith({ id: 'ms-aaa-001', notes: 'Evidence verified.' })
  })

  it('calls returnMutation.mutate with correct args when Return is clicked', () => {
    const mockReturnMutate = vi.fn()

    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: mockReturnMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    const feedbackInputs = screen.getAllByLabelText('Return feedback')
    fireEvent.change(feedbackInputs[0], { target: { value: 'Needs more detail.' } })

    const returnButtons = screen.getAllByRole('button', { name: /return milestone/i })
    fireEvent.click(returnButtons[0])

    expect(mockReturnMutate).toHaveBeenCalledWith({
      id: 'ms-aaa-001',
      feedback: 'Needs more detail.',
    })
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading milestones…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Failed to load milestones. Please try again.')).toBeInTheDocument()
  })

  it('shows empty state when no milestones', () => {
    vi.mocked(useSubmittedMilestones).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSubmittedMilestones>)

    vi.mocked(useVerifyMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useVerifyMilestone>)

    vi.mocked(useReturnMilestone).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReturnMilestone>)

    render(
      <MemoryRouter>
        <AdminMilestonesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('No milestones awaiting review.')).toBeInTheDocument()
  })
})
