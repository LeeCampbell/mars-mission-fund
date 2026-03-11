import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { MissionObjectivesStep, type MissionObjectivesData } from './MissionObjectivesStep'

const INITIAL_DATA: MissionObjectivesData = {
  title: '',
  summary: '',
  description: '',
  alignmentStatement: '',
}

function MissionObjectivesStepWrapper({
  initialData = INITIAL_DATA,
  showErrors = false,
}: {
  initialData?: MissionObjectivesData
  showErrors?: boolean
}) {
  const [data, setData] = useState(initialData)
  return <MissionObjectivesStep data={data} onChange={setData} showErrors={showErrors} />
}

describe('MissionObjectivesStep', () => {
  it('renders all form fields', () => {
    render(<MissionObjectivesStepWrapper />)

    expect(screen.getByLabelText(/campaign title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mars alignment statement/i)).toBeInTheDocument()
  })

  it('shows summary character counter', () => {
    render(<MissionObjectivesStepWrapper />)

    expect(screen.getByText('0/280')).toBeInTheDocument()
  })

  it('updates summary character counter when typing', () => {
    render(<MissionObjectivesStepWrapper />)

    const summaryTextarea = screen.getByLabelText(/summary/i)
    fireEvent.change(summaryTextarea, { target: { value: 'Hello world' } })

    expect(screen.getByText('11/280')).toBeInTheDocument()
  })

  it('shows validation error when summary exceeds 280 characters', () => {
    render(<MissionObjectivesStepWrapper />)

    const summaryTextarea = screen.getByLabelText(/summary/i)
    const longText = 'a'.repeat(281)
    fireEvent.change(summaryTextarea, { target: { value: longText } })

    expect(screen.getByRole('alert')).toHaveTextContent('Summary must be 280 characters or fewer')
    expect(screen.getByText('281/280')).toBeInTheDocument()
  })

  it('shows title required error when showErrors is true and title is empty', () => {
    render(<MissionObjectivesStepWrapper showErrors={true} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
  })

  it('shows title required error after blurring the title field', () => {
    render(<MissionObjectivesStepWrapper />)

    const titleInput = screen.getByLabelText(/campaign title/i)
    fireEvent.blur(titleInput)

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
  })

  it('does not show title error when title is filled in', () => {
    render(<MissionObjectivesStepWrapper />)

    const titleInput = screen.getByLabelText(/campaign title/i)
    fireEvent.change(titleInput, { target: { value: 'My Campaign' } })
    fireEvent.blur(titleInput)

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })

  it('calls onChange when title is typed', () => {
    const onChange = vi.fn()
    render(<MissionObjectivesStep data={INITIAL_DATA} onChange={onChange} showErrors={false} />)

    const titleInput = screen.getByLabelText(/campaign title/i)
    fireEvent.change(titleInput, { target: { value: 'New Title' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }))
  })
})
