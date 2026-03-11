import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CampaignNewPage } from './CampaignNewPage'

vi.mock('../hooks/useCampaignMutations', () => ({
  useCreateCampaign: vi.fn(),
  useSubmitCampaign: vi.fn(),
}))

import { useCreateCampaign, useSubmitCampaign } from '../hooks/useCampaignMutations'

const mockCreateMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
}

const mockSubmitMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
}

function renderCampaignNewPage() {
  return render(
    <MemoryRouter>
      <CampaignNewPage />
    </MemoryRouter>
  )
}

describe('CampaignNewPage', () => {
  beforeEach(() => {
    vi.mocked(useCreateCampaign).mockReturnValue(
      mockCreateMutation as unknown as ReturnType<typeof useCreateCampaign>
    )
    vi.mocked(useSubmitCampaign).mockReturnValue(
      mockSubmitMutation as unknown as ReturnType<typeof useSubmitCampaign>
    )
  })

  it('renders step 1 (Mission Objectives) initially', () => {
    renderCampaignNewPage()

    expect(screen.getByLabelText(/campaign title/i)).toBeInTheDocument()
    expect(screen.getByText('Mission Objectives')).toBeInTheDocument()
  })

  it('renders step indicator with all step labels', () => {
    renderCampaignNewPage()

    expect(screen.getByText('Mission Objectives')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Funding')).toBeInTheDocument()
    expect(screen.getByText('Milestones')).toBeInTheDocument()
    expect(screen.getByText('Risks')).toBeInTheDocument()
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByText('Review & Submit')).toBeInTheDocument()
  })

  it('renders Next button on step 1', () => {
    renderCampaignNewPage()

    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument()
  })

  it('does not render Back button on step 1', () => {
    renderCampaignNewPage()

    expect(screen.queryByRole('button', { name: '← Back' })).not.toBeInTheDocument()
  })

  it('shows error and stays on step 1 if title is empty and Next is clicked', () => {
    renderCampaignNewPage()

    fireEvent.click(screen.getByRole('button', { name: 'Next →' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
    expect(screen.getByLabelText(/campaign title/i)).toBeInTheDocument()
  })

  it('advances to step 2 when title is filled and Next is clicked', () => {
    renderCampaignNewPage()

    fireEvent.change(screen.getByLabelText(/campaign title/i), {
      target: { value: 'My Mars Mission' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }))

    expect(screen.getByText('Team Members (0)')).toBeInTheDocument()
  })

  it('shows Back button on step 2', () => {
    renderCampaignNewPage()

    fireEvent.change(screen.getByLabelText(/campaign title/i), {
      target: { value: 'My Mars Mission' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }))

    expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument()
  })

  it('preserves form state when navigating back from step 2 to step 1', () => {
    renderCampaignNewPage()

    // Fill in title on step 1
    fireEvent.change(screen.getByLabelText(/campaign title/i), {
      target: { value: 'My Mars Mission' },
    })

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }))
    expect(screen.getByText('Team Members (0)')).toBeInTheDocument()

    // Go back to step 1
    fireEvent.click(screen.getByRole('button', { name: '← Back' }))

    // Title should still be filled in
    expect(screen.getByDisplayValue('My Mars Mission')).toBeInTheDocument()
  })
})
