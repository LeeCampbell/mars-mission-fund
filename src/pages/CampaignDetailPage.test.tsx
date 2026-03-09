import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CampaignDetailPage } from './CampaignDetailPage'
import type { Campaign } from '../api/campaigns'

const mockCampaign: Campaign = {
  id: '1',
  title: 'Mars Habitat Alpha',
  summary: 'A test campaign about Mars.',
  description: 'A test campaign about Mars.',
  heroImageUrl: '',
  status: 'active',
  category: 'Habitat',
  raisedAmount: 1_250_000,
  goalAmount: 2_000_000,
  fundingProgressPct: 63,
  targetAmount: 2_000_000,
  contributorCount: 4_382,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    expect(screen.getByText('Habitat')).toBeInTheDocument()
  })
})
