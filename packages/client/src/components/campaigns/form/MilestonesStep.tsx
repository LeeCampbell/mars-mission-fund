import { useState } from 'react'
import type { MilestoneInput } from '@mmf/shared'
import { Button } from '../../ui/Button'

interface MilestonesStepProps {
  milestones: MilestoneInput[]
  onChange: (milestones: MilestoneInput[]) => void
  showErrors?: boolean
}

interface InlineMilestoneForm {
  title: string
  description: string
  targetDate: string
  fundingPercentage: string
  verificationCriteria: string
}

const EMPTY_FORM: InlineMilestoneForm = {
  title: '',
  description: '',
  targetDate: '',
  fundingPercentage: '',
  verificationCriteria: '',
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-input-label-size)',
  fontWeight: 'var(--type-input-label-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-input-label-spacing)',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border-input)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  padding: 'var(--space-3) var(--space-4)',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '80px',
}

const milestoneCardStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const addFormStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px dashed var(--color-border-input)',
  background: 'var(--color-bg-input)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  padding: 'var(--space-8)',
  border: '1px dashed var(--color-border-input)',
  borderRadius: 'var(--radius-card)',
}

const sumRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-input)',
  background: 'var(--color-bg-elevated)',
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-body-small-size)',
}

function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return ''
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function MilestonesStep({ milestones, onChange, showErrors = false }: MilestonesStepProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<InlineMilestoneForm>(EMPTY_FORM)

  const totalPercentage = milestones.reduce((sum, m) => sum + (m.fundingPercentage || 0), 0)
  const sumError =
    milestones.length > 0 && totalPercentage !== 100
      ? `Milestone percentages must sum to 100% (currently ${totalPercentage}%)`
      : null

  function handleAdd() {
    if (!form.title.trim()) return
    const pct = parseFloat(form.fundingPercentage) || 0
    const dateVal = form.targetDate ? new Date(form.targetDate) : null
    onChange([
      ...milestones,
      {
        title: form.title.trim(),
        description: form.description.trim(),
        targetDate: dateVal,
        fundingPercentage: pct,
        verificationCriteria: form.verificationCriteria.trim() || null,
      },
    ])
    setForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleRemove(index: number) {
    onChange(milestones.filter((_, i) => i !== index))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--type-body-size)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Milestones ({milestones.length})
        </h3>
        {!showAddForm && (
          <Button variant="secondary" onClick={() => setShowAddForm(true)} type="button">
            + Add Milestone
          </Button>
        )}
      </div>

      {milestones.length === 0 && !showAddForm && (
        <p style={emptyStyle}>
          No milestones added yet. Add milestones to show your campaign&apos;s roadmap.
        </p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {milestones.map((milestone, index) => (
          <li key={index} style={milestoneCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--type-body-size)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {milestone.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 'var(--type-label-size)',
                    color: 'var(--color-text-accent)',
                  }}
                >
                  {milestone.fundingPercentage}% funding
                  {milestone.targetDate && ` · Target: ${formatDate(milestone.targetDate)}`}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleRemove(index)}
                type="button"
                aria-label={`Remove milestone ${milestone.title}`}
              >
                Remove
              </Button>
            </div>
            {milestone.description && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                {milestone.description}
              </p>
            )}
            {milestone.verificationCriteria && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-text-tertiary)',
                  margin: 0,
                }}
              >
                <strong>Verification:</strong> {milestone.verificationCriteria}
              </p>
            )}
          </li>
        ))}
      </ul>

      {milestones.length > 0 && (
        <div style={sumRowStyle}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Total allocation</span>
          <span
            style={{
              fontWeight: 600,
              color: totalPercentage === 100 ? 'var(--color-text-success)' : 'var(--color-text-error)',
            }}
          >
            {totalPercentage}%
          </span>
        </div>
      )}

      {(showErrors || milestones.length > 0) && sumError && (
        <span role="alert" style={errorStyle}>
          {sumError}
        </span>
      )}

      {showAddForm && (
        <div style={addFormStyle}>
          <h4
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--type-body-size)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            New Milestone
          </h4>

          <div style={fieldGroupStyle}>
            <label htmlFor="milestone-title" style={labelStyle}>
              Title <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <input
              id="milestone-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={inputStyle}
              placeholder="Milestone title"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="milestone-description" style={labelStyle}>
              Description
            </label>
            <textarea
              id="milestone-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={textareaStyle}
              placeholder="What will be achieved at this milestone?"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' as const }}>
            <div style={{ ...fieldGroupStyle, flex: 1, minWidth: '160px' }}>
              <label htmlFor="milestone-date" style={labelStyle}>
                Target Date
              </label>
              <input
                id="milestone-date"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ ...fieldGroupStyle, flex: 1, minWidth: '160px' }}>
              <label htmlFor="milestone-pct" style={labelStyle}>
                Funding % <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
              </label>
              <input
                id="milestone-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.fundingPercentage}
                onChange={(e) => setForm((f) => ({ ...f, fundingPercentage: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="milestone-verification" style={labelStyle}>
              Verification Criteria
            </label>
            <textarea
              id="milestone-verification"
              value={form.verificationCriteria}
              onChange={(e) => setForm((f) => ({ ...f, verificationCriteria: e.target.value }))}
              style={textareaStyle}
              placeholder="How will completion of this milestone be verified?"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              onClick={handleAdd}
              type="button"
              disabled={!form.title.trim()}
            >
              Add Milestone
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddForm(false)
                setForm(EMPTY_FORM)
              }}
              type="button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
