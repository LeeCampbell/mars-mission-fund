import { useState } from 'react'
import { usePostCampaignUpdate } from '../../hooks/useCampaignMutations'
import { Button } from '../ui/Button'

interface CampaignUpdateFormProps {
  campaignId: string
}

const wrapperStyle: React.CSSProperties = {
  padding: 'var(--space-5)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-section-heading-size)',
  fontWeight: 'var(--type-section-heading-weight)' as React.CSSProperties['fontWeight'],
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
  minHeight: '100px',
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

export function CampaignUpdateForm({ campaignId }: CampaignUpdateFormProps) {
  const [body, setBody] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const mutation = usePostCampaignUpdate()

  function handleSubmit() {
    if (!body.trim()) return
    mutation.mutate(
      { id: campaignId, body: body.trim() },
      {
        onSuccess: () => {
          setBody('')
          setSuccessMessage('Update posted successfully.')
          setTimeout(() => setSuccessMessage(null), 4000)
        },
      },
    )
  }

  return (
    <div style={wrapperStyle}>
      <h2 style={headingStyle}>Post a Campaign Update</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label htmlFor="campaign-update-body" style={labelStyle}>
          Update Message <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
        </label>
        <textarea
          id="campaign-update-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={textareaStyle}
          placeholder="Share news, progress, or milestones with your backers…"
          disabled={mutation.isPending}
        />
      </div>

      {mutation.isError && (
        <span role="alert" style={errorStyle}>
          Failed to post update. Please try again.
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
          disabled={!body.trim() || mutation.isPending}
        >
          {mutation.isPending ? 'Posting…' : 'Post Update'}
        </Button>
      </div>
    </div>
  )
}
