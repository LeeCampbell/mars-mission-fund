import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundingProgressSection } from './FundingProgressSection'
import type { Campaign } from '../../api/campaigns'

const mockCampaign: Campaign = {
  id: '1',
  title: 'Test Campaign',
  summary: 'A test campaign',
  description: 'A test campaign',
  heroImageUrl: '',
  status: 'active',
  category: 'Technology',
  raisedAmount: 50000,
  goalAmount: 100000,
  fundingProgressPct: 50,
  targetAmount: 100000,
  contributorCount: 250,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    expect(link).toHaveAttribute('href', '/contribute/1')
  })

  it('renders time remaining', () => {
    render(<FundingProgressSection campaign={mockCampaign} />)
    expect(screen.getByText(/remaining/i)).toBeInTheDocument()
  })
})
