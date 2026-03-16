import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminActionsPanel } from './AdminActionsPanel'
import type { CampaignDetail } from '@mmf/shared'
import type { User } from '@mmf/shared'

vi.mock('../../api/campaigns', () => ({
  verifyMilestone: vi.fn().mockResolvedValue({}),
  returnMilestone: vi.fn().mockResolvedValue({}),
  approveCancellation: vi.fn().mockResolvedValue({}),
}))

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
  email: 'superadmin@example.com',
  displayName: 'Super Admin',
  role: 'SuperAdministrator',
}

const backerUser: User = {
  ...adminUser,
  id: 'backer-1',
  email: 'backer@example.com',
  displayName: 'Backer User',
  role: 'Backer',
}

const baseCampaign: CampaignDetail = {
  id: 'campaign-1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign.',
  description: 'Full description.',
  heroImageUrl: null,
  status: 'Settlement',
  category: 'Habitats & Construction',
  raisedAmount: 1_000_000,
  goalAmount: 1_000_000,
  contributorCount: 100,
  deadline: null,
  createdAt: new Date('2024-01-01'),
  createdBy: null,
  slug: 'mars-habitat-alpha',
  alignmentStatement: 'Aligned.',
  tags: [],
  maxFundingCapUsd: 2_000_000,
  launchedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  creatorId: 'creator-1',
  reviewerId: 'reviewer-1',
  cancellationRequestedAt: null,
  milestones: [
    {
      id: 'm1',
      title: 'Phase 1',
      description: 'Initial phase.',
      targetDate: null,
      fundingPercentage: 50,
      verificationCriteria: 'Files reviewed.',
      status: 'Submitted',
      sortOrder: 1,
      evidenceDescription: 'CAD files attached.',
      evidenceUrl: 'https://example.com/evidence',
    },
  ],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

function renderPanel(campaign: CampaignDetail, user: User | null, onActionComplete = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminActionsPanel campaign={campaign} user={user} onActionComplete={onActionComplete} />
    </QueryClientProvider>
  )
}

describe('AdminActionsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('milestone verification panel', () => {
    it('renders for Settlement campaign with Administrator role', () => {
      renderPanel(baseCampaign, adminUser)
      expect(screen.getByText('Milestone Verification')).toBeInTheDocument()
      expect(screen.getByText('Phase 1')).toBeInTheDocument()
    })

    it('renders for Settlement campaign with SuperAdministrator role', () => {
      renderPanel(baseCampaign, superAdminUser)
      expect(screen.getByText('Milestone Verification')).toBeInTheDocument()
    })

    it('shows evidence description for submitted milestones', () => {
      renderPanel(baseCampaign, adminUser)
      expect(screen.getByText('CAD files attached.')).toBeInTheDocument()
    })

    it('shows Verify and Return buttons', () => {
      renderPanel(baseCampaign, adminUser)
      expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Return' })).toBeInTheDocument()
    })
  })

  describe('cancellation approval panel', () => {
    const cancellationCampaign: CampaignDetail = {
      ...baseCampaign,
      status: 'Live',
      cancellationRequestedAt: new Date('2024-03-01'),
      milestones: [],
    }

    it('renders when cancellationRequestedAt is set and user is admin', () => {
      renderPanel(cancellationCampaign, adminUser)
      expect(screen.getByText('Cancellation Request')).toBeInTheDocument()
    })

    it('shows Approve Cancellation button', () => {
      renderPanel(cancellationCampaign, adminUser)
      expect(screen.getByRole('button', { name: 'Approve Cancellation' })).toBeInTheDocument()
    })

    it('shows Deny Cancellation button (disabled as TODO)', () => {
      renderPanel(cancellationCampaign, adminUser)
      const denyButton = screen.getByRole('button', { name: 'Deny Cancellation' })
      expect(denyButton).toBeInTheDocument()
      expect(denyButton).toBeDisabled()
    })
  })

  describe('access control', () => {
    it('renders nothing for non-admin user', () => {
      const { container } = renderPanel(baseCampaign, backerUser)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for null user', () => {
      const { container } = renderPanel(baseCampaign, null)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when campaign is not Settlement and has no cancellation request', () => {
      const liveCampaign: CampaignDetail = {
        ...baseCampaign,
        status: 'Live',
        cancellationRequestedAt: null,
      }
      const { container } = renderPanel(liveCampaign, adminUser)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('combined panels', () => {
    it('renders both panels when campaign is Settlement and has cancellation request', () => {
      const combinedCampaign: CampaignDetail = {
        ...baseCampaign,
        status: 'Settlement',
        cancellationRequestedAt: new Date('2024-03-01'),
      }
      renderPanel(combinedCampaign, adminUser)
      expect(screen.getByText('Milestone Verification')).toBeInTheDocument()
      expect(screen.getByText('Cancellation Request')).toBeInTheDocument()
    })
  })
})
