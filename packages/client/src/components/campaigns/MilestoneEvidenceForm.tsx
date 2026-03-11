import { useState } from 'react'
import { useSubmitMilestoneEvidence } from '../../hooks/useCampaignMutations'
import { Button } from '../ui/Button'
import type { Milestone } from '@mmf/shared'

interface MilestoneEvidenceFormProps {
  campaignId: string
  milestone: Milestone
}

const wrapperStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
}

const milestoneTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-input-label-size)',
  fontWeight: 'var(--type-input-label-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-input-label-spacing)',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
}

const textareaStyle: React.CSSProperties = {
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
  resize: 'vertical' as const,
  minHeight: '80px',
}

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-success)',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

const submittedBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-label-size)',
  letterSpacing: 'var(--type-label-spacing)',
  textTransform: 'uppercase',
  color: 'var(--color-text-accent)',
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: 'var(--radius-input)',
  border: '1px solid var(--color-text-accent)',
  display: 'inline-block',
}

export function MilestoneEvidenceForm({ campaignId, milestone }: MilestoneEvidenceFormProps) {
  const [evidenceText, setEvidenceText] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const mutation = useSubmitMilestoneEvidence()

  const alreadySubmitted = milestone.status === 'Submitted' || milestone.status === 'Verified'

  function handleSubmit() {
    if (!evidenceText.trim()) return
    mutation.mutate(
      { campaignId, milestoneId: milestone.id, evidenceText: evidenceText.trim() },
      {
        onSuccess: () => {
          setEvidenceText('')
          setSuccessMessage('Evidence submitted successfully.')
          setTimeout(() => setSuccessMessage(null), 4000)
        },
      },
    )
  }

  return (
    <div style={wrapperStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <p style={milestoneTitleStyle}>{milestone.title}</p>
        {alreadySubmitted && (
          <span style={submittedBadgeStyle}>{milestone.status}</span>
        )}
      </div>

      {alreadySubmitted ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--type-body-small-size)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Evidence has already been submitted for this milestone.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor={`evidence-${milestone.id}`} style={labelStyle}>
              Evidence <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <textarea
              id={`evidence-${milestone.id}`}
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              style={textareaStyle}
              placeholder="Describe the evidence for milestone completion…"
              disabled={mutation.isPending}
            />
          </div>

          {mutation.isError && (
            <span role="alert" style={errorStyle}>
              Failed to submit evidence. Please try again.
            </span>
          )}

          {successMessage && (
            <span role="status" style={successStyle}>
              {successMessage}
            </span>
          )}

          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              type="button"
              disabled={!evidenceText.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Evidence'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
