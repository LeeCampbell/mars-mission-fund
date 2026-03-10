import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundingProgressSection } from './FundingProgressSection'
import type { CampaignDetail } from '@mmf/shared'

const mockCampaign: CampaignDetail = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'test-campaign',
  title: 'Test Campaign',
  summary: 'A test campaign',
  description: 'A test campaign',
  alignmentStatement: 'Aligned with Mars mission',
  category: 'Habitats & Construction',
  tags: [],
  status: 'Live',
  heroImageUrl: null,
  minFundingTargetUsd: 100000,
  maxFundingCapUsd: 100000,
  currentAmountUsd: 50000,
  contributorCount: 250,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  launchedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  milestones: [],
  stretchGoals: [],
  teamMembers: [],
  updates: [],
}

describe('FundingProgressSection', () => {
  it('renders raised amount', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    expect(screen.getByText('$50,000')).toBeInTheDocument()
  })

  it('renders target amount', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    expect(screen.getByText(/\$100,000/)).toBeInTheDocument()
  })

  it('renders contributor count', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    expect(screen.getByText('250')).toBeInTheDocument()
  })

  it('renders Contribute Now button linking to contribute page', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    const link = screen.getByRole('link', { name: 'Contribute Now' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/contribute/00000000-0000-0000-0000-000000000001')
  })

  it('renders time remaining', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    expect(screen.getByText(/remaining/i)).toBeInTheDocument()
  })
})
