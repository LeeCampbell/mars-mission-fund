import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MilestonesSection } from './MilestonesSection'
import type { Milestone } from '../../api/campaigns'

const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    title: 'Design Phase',
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    fundingPercentage: 100,
    verificationCriteria: 'CAD files reviewed.',
    status: 'completed',
  },
  {
    id: 'm2',
    title: 'Prototype Build',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    fundingPercentage: 50,
    verificationCriteria: 'Prototype passes pressure test.',
    status: 'active',
  },
]

describe('MilestonesSection', () => {
  it('renders milestone titles', () => {
    render(<MilestonesSection milestones={mockMilestones} />)
    expect(screen.getByText('Design Phase')).toBeInTheDocument()
    expect(screen.getByText('Prototype Build')).toBeInTheDocument()
  })

  it('renders at least one milestone item', () => {
    render(<MilestonesSection milestones={mockMilestones} />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('renders milestone section heading', () => {
    render(<MilestonesSection milestones={mockMilestones} />)
    expect(screen.getByText('Milestones')).toBeInTheDocument()
  })

  it('renders status badge for each milestone', () => {
    render(<MilestonesSection milestones={mockMilestones} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
