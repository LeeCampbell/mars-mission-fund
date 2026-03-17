import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminActionsPanel } from './AdminActionsPanel'
import type { CampaignDetail } from '../../api/campaigns'
import type { User } from '@mmf/shared'

vi.mock('../../api/campaigns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/campaigns')>()
  return {
    ...actual,
    verifyMilestone: vi.fn().mockResolvedValue(undefined),
    returnMilestone: vi.fn().mockResolvedValue(undefined),
    approveCancellation: vi.fn().mockResolvedValue(undefined),
  }
})

const adminUser: User = {
  id: 'admin-1',
  email: 'admin@example.com',
  displayName: 'Admin User',
  bio: null,
  role: 'Administrator',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const superAdminUser: User = {
  ...adminUser,
  id: 'superadmin-1',
  role: 'SuperAdministrator',
}

const reviewerUser: User = {
  ...adminUser,
  id: 'reviewer-1',
  role: 'Reviewer',
}

const baseCampaign: CampaignDetail = {
  id: 'campaign-1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign.',
  description: 'Detailed description.',
  heroImageUrl: null,
  status: 'Settlement',
  category: 'Habitats & Construction',
  raisedAmount: 1_000_000,
  goalAmount: 2_000_000,
  contributorCount: 100,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: 'creator-1',
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned.',
  tags: [],
  maxFundingCapUsd: 4_000_000,
  launchedAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-01-01'),
  creatorId: 'creator-1',
  reviewerId: null,
  cancellationRequestedAt: null,
  milestones: [],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

const submittedMilestone = {
  id: 'm1',
  title: 'Design Phase',
  description: 'Complete the design phase.',
  targetDate: null,
  fundingPercentage: 50,
  verificationCriteria: 'CAD files reviewed.',
  status: 'Submitted' as const,
  sortOrder: 1,
  evidenceDescription: 'Completed all CAD designs as required.',
  evidenceUrl: 'https://example.com/evidence',
  evidenceSubmittedAt: '2024-06-01T00:00:00.000Z',
}

const pendingMilestone = {
  id: 'm2',
  title: 'Build Phase',
  description: 'Complete the build phase.',
  targetDate: null,
  fundingPercentage: 50,
  verificationCriteria: null,
  status: 'Pending' as const,
  sortOrder: 2,
}

describe('AdminActionsPanel', () => {
  const onActionComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders milestone verify/return UI when milestones are in Submitted state', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
    }

    render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    expect(screen.getByText('Milestone Evidence Review')).toBeInTheDocument()
    expect(screen.getByText('Design Phase')).toBeInTheDocument()
    expect(screen.getByText('Completed all CAD designs as required.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Evidence' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Return' })).toBeInTheDocument()
  })

  it('does not render milestone panel when no milestones are Submitted', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [pendingMilestone],
    }

    const { container } = render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders cancellation approval UI when cancellationRequestedAt is set', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      cancellationRequestedAt: new Date('2024-07-15T00:00:00.000Z'),
    }

    render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    expect(screen.getByText('Cancellation Request')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve Cancellation' })).toBeInTheDocument()
  })

  it('does not render cancellation panel when cancellationRequestedAt is null', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
      cancellationRequestedAt: null,
    }

    render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    expect(screen.queryByText('Cancellation Request')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve Cancellation' })).not.toBeInTheDocument()
  })

  it('does not render for non-admin users', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
    }

    const { container } = render(
      <AdminActionsPanel
        campaign={campaign}
        user={reviewerUser}
        onActionComplete={onActionComplete}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders for SuperAdministrator users', () => {
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
    }

    render(
      <AdminActionsPanel
        campaign={campaign}
        user={superAdminUser}
        onActionComplete={onActionComplete}
      />
    )

    expect(screen.getByText('Admin Actions')).toBeInTheDocument()
  })

  it('calls onActionComplete after successful verification', async () => {
    const { verifyMilestone } = await import('../../api/campaigns')
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
    }

    render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }))

    await waitFor(() => {
      expect(verifyMilestone).toHaveBeenCalledWith('campaign-1', 'm1')
      expect(onActionComplete).toHaveBeenCalled()
    })
  })

  it('shows return feedback form and calls returnMilestone on submit', async () => {
    const { returnMilestone } = await import('../../api/campaigns')
    const campaign: CampaignDetail = {
      ...baseCampaign,
      milestones: [submittedMilestone],
    }

    render(
      <AdminActionsPanel campaign={campaign} user={adminUser} onActionComplete={onActionComplete} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Return' }))

    const textarea = screen.getByPlaceholderText('Explain what needs to be corrected…')
    fireEvent.change(textarea, { target: { value: 'Needs more detail.' } })

    fireEvent.click(screen.getByRole('button', { name: 'Submit Return' }))

    await waitFor(() => {
      expect(returnMilestone).toHaveBeenCalledWith('campaign-1', 'm1', 'Needs more detail.')
      expect(onActionComplete).toHaveBeenCalled()
    })
  })
})
