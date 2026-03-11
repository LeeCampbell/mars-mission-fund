import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { MilestonesStep } from './MilestonesStep'
import type { MilestoneInput } from '@mmf/shared'

function MilestonesStepWrapper() {
  const [milestones, setMilestones] = useState<MilestoneInput[]>([])
  return <MilestonesStep milestones={milestones} onChange={setMilestones} showErrors={false} />
}

function addMilestone(title: string, percentage: string) {
  fireEvent.click(screen.getByRole('button', { name: '+ Add Milestone' }))
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: title } })
  fireEvent.change(screen.getByLabelText(/funding %/i), { target: { value: percentage } })
  fireEvent.click(screen.getByRole('button', { name: 'Add Milestone' }))
}

describe('MilestonesStep', () => {
  it('renders empty state initially', () => {
    render(<MilestonesStepWrapper />)

    expect(screen.getByText(/No milestones added yet/)).toBeInTheDocument()
  })

  it('shows Add Milestone button', () => {
    render(<MilestonesStepWrapper />)

    expect(screen.getByRole('button', { name: '+ Add Milestone' })).toBeInTheDocument()
  })

  it('shows inline add form when Add Milestone button is clicked', () => {
    render(<MilestonesStepWrapper />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add Milestone' }))

    expect(screen.getByText('New Milestone')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('adds a milestone and shows it in the list', () => {
    render(<MilestonesStepWrapper />)

    addMilestone('Phase 1', '50')

    expect(screen.getByText('Phase 1')).toBeInTheDocument()
    expect(screen.getByText(/50% funding/)).toBeInTheDocument()
  })

  it('shows error when milestones do not sum to 100%', () => {
    render(<MilestonesStepWrapper />)

    addMilestone('Phase 1', '60')
    addMilestone('Phase 2', '30')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Milestone percentages must sum to 100% (currently 90%)'
    )
  })

  it('removes error when milestones sum to exactly 100%', () => {
    render(<MilestonesStepWrapper />)

    addMilestone('Phase 1', '60')
    addMilestone('Phase 2', '30')

    // Error is shown
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Remove Phase 2 and add with 40%
    fireEvent.click(screen.getByRole('button', { name: 'Remove milestone Phase 2' }))
    addMilestone('Phase 2', '40')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows total allocation percentage row when milestones exist', () => {
    render(<MilestonesStepWrapper />)

    addMilestone('Phase 1', '100')

    expect(screen.getByText('Total allocation')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('removes a milestone when Remove button is clicked', () => {
    render(<MilestonesStepWrapper />)

    addMilestone('Phase 1', '100')
    expect(screen.getByText('Phase 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove milestone Phase 1' }))

    expect(screen.queryByText('Phase 1')).not.toBeInTheDocument()
  })
})
