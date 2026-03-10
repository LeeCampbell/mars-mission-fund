import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CampaignDetailPage } from './CampaignDetailPage'
import type { CampaignDetail } from '@mmf/shared'

const mockCampaign: CampaignDetail = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'mars-habitat-alpha',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign about Mars.',
  description: 'A test campaign about Mars.',
  alignmentStatement: 'Aligned with Mars mission',
  category: 'Habitats & Construction',
  tags: [],
  status: 'Live',
  heroImageUrl: null,
  minFundingTargetUsd: 2_000_000,
  maxFundingCapUsd: 2_000_000,
  currentAmountUsd: 1_250_000,
  contributorCount: 4_382,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  launchedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  milestones: [
    {
      id: 'm1',
      title: 'Design Phase',
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      fundingPercentage: 100,
      verificationCriteria: 'CAD files reviewed.',
      status: 'completed',
    },
  ],
  stretchGoals: [
    {
      id: 'sg1',
      title: 'Extra Module',
      description: 'Adds extra module.',
      targetAmount: 2_500_000,
      unlocked: false,
    },
  ],
  teamMembers: [
    {
      id: 'tm1',
      name: 'Dr. Elena Vasquez',
      role: 'Chief Engineer',
      bio: 'Experienced engineer.',
    },
  ],
  updates: [
    {
      id: 'u1',
      title: 'First Update',
      date: '2024-01-15T00:00:00.000Z',
      body: 'Things are going well.',
    },
  ],
}

vi.mock('../hooks/useCampaign', () => ({
  useCampaign: () => ({
    data: mockCampaign,
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

describe('CampaignDetailPage', () => {
  it('renders campaign title', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/1']}>
        <Routes>
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Mars Habitat Alpha')).toBeInTheDocument()
  })

  it('renders campaign category', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/1']}>
        <Routes>
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Habitats & Construction')).toBeInTheDocument()
  })
})
