import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { RisksStep } from './RisksStep'
import type { RiskInput } from '@mmf/shared'

function RisksStepWrapper() {
  const [risks, setRisks] = useState<RiskInput[]>([])
  return <RisksStep risks={risks} onChange={setRisks} />
}

function addRisk(description: string, mitigation: string) {
  fireEvent.click(screen.getByRole('button', { name: '+ Add Risk' }))
  fireEvent.change(screen.getByLabelText(/risk description/i), {
    target: { value: description },
  })
  fireEvent.change(screen.getByLabelText(/mitigation strategy/i), {
    target: { value: mitigation },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Add Risk' }))
}

describe('RisksStep', () => {
  it('renders empty state initially', () => {
    render(<RisksStepWrapper />)

    expect(screen.getByText(/No risks added yet/)).toBeInTheDocument()
  })

  it('shows Add Risk button', () => {
    render(<RisksStepWrapper />)

    expect(screen.getByRole('button', { name: '+ Add Risk' })).toBeInTheDocument()
  })

  it('shows inline add form when Add Risk is clicked', () => {
    render(<RisksStepWrapper />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add Risk' }))

    expect(screen.getByText('New Risk Disclosure')).toBeInTheDocument()
    expect(screen.getByLabelText(/risk description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mitigation strategy/i)).toBeInTheDocument()
  })

  it('adds a risk entry and shows it in the list', () => {
    render(<RisksStepWrapper />)

    addRisk('Supply chain disruption', 'Maintain backup suppliers')

    expect(screen.getByText('Supply chain disruption')).toBeInTheDocument()
    expect(screen.getByText('Maintain backup suppliers')).toBeInTheDocument()
    expect(screen.getByText('Risk 1')).toBeInTheDocument()
  })

  it('removes a risk entry when Remove button is clicked', () => {
    render(<RisksStepWrapper />)

    addRisk('Supply chain disruption', 'Maintain backup suppliers')
    expect(screen.getByText('Supply chain disruption')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove risk 1' }))

    expect(screen.queryByText('Supply chain disruption')).not.toBeInTheDocument()
    expect(screen.getByText(/No risks added yet/)).toBeInTheDocument()
  })

  it('can add multiple risk entries', () => {
    render(<RisksStepWrapper />)

    addRisk('Risk A', 'Mitigation A')
    addRisk('Risk B', 'Mitigation B')

    expect(screen.getByText('Risk 1')).toBeInTheDocument()
    expect(screen.getByText('Risk 2')).toBeInTheDocument()
    expect(screen.getByText('Risk A')).toBeInTheDocument()
    expect(screen.getByText('Risk B')).toBeInTheDocument()
  })

  it('disables Add Risk button when description or mitigation is empty', () => {
    render(<RisksStepWrapper />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add Risk' }))

    const addButton = screen.getByRole('button', { name: 'Add Risk' })
    expect(addButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/risk description/i), {
      target: { value: 'Some risk' },
    })

    // Still disabled — mitigation is empty
    expect(addButton).toBeDisabled()
  })

  it('cancels adding a risk without adding it', () => {
    render(<RisksStepWrapper />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add Risk' }))
    fireEvent.change(screen.getByLabelText(/risk description/i), {
      target: { value: 'Some risk' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Some risk')).not.toBeInTheDocument()
    expect(screen.getByText(/No risks added yet/)).toBeInTheDocument()
  })
})
