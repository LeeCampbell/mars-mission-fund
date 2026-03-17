import { useState } from 'react'
import { verifyMilestone, returnMilestone, approveCancellation } from '../../api/campaigns'
import type { CampaignDetail, Milestone } from '../../api/campaigns'
import type { User } from '@mmf/shared'
import { Button } from '../ui/Button'

interface AdminActionsPanelProps {
  campaign: CampaignDetail
  user: User | null
  onActionComplete: () => void
}

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-6)',
  background: 'var(--color-bg-card)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-3-size)',
  fontWeight: 'var(--type-heading-3-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-3-spacing)',
  lineHeight: 'var(--type-heading-3-leading)',
  color: 'var(--color-text-primary)',
  margin: 0,
}

const subheadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-3)',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  paddingTop: 'var(--space-4)',
  borderTop: '1px solid var(--color-border-subtle)',
}

const milestoneItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  background: 'var(--color-bg-page)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border-subtle)',
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const textareaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-3)',
  resize: 'vertical',
  minHeight: '80px',
  width: '100%',
  boxSizing: 'border-box',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-status-error)',
}

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-status-success)',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-action-primary-hover)',
  textDecoration: 'underline',
  wordBreak: 'break-all',
}

interface MilestoneRowProps {
  campaignId: string
  milestone: Milestone
  onActionComplete: () => void
}

function MilestoneRow({ campaignId, milestone, onActionComplete }: MilestoneRowProps) {
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleVerify() {
    setIsLoading(true)
    setError(null)
    try {
      await verifyMilestone(campaignId, milestone.id)
      setSuccess('Milestone verified successfully.')
      onActionComplete()
    } catch {
      setError('Failed to verify milestone. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReturn() {
    if (!feedback.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await returnMilestone(campaignId, milestone.id, feedback)
      setSuccess('Milestone returned with feedback.')
      setShowReturnForm(false)
      onActionComplete()
    } catch {
      setError('Failed to return milestone. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={milestoneItemStyle}>
      <p style={{ ...bodyStyle, fontWeight: 600 }}>{milestone.title}</p>
      {milestone.evidenceDescription && <p style={bodyStyle}>{milestone.evidenceDescription}</p>}
      {milestone.evidenceUrl && (
        <a href={milestone.evidenceUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          View Evidence
        </a>
      )}
      {error && (
        <span role="alert" style={errorStyle}>
          {error}
        </span>
      )}
      {success && <span style={successStyle}>{success}</span>}
      {!success && (
        <>
          <div style={buttonRowStyle}>
            <Button
              type="button"
              variant="primary"
              disabled={isLoading}
              onClick={() => void handleVerify()}
            >
              {isLoading && !showReturnForm ? 'Verifying…' : 'Verify'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={() => setShowReturnForm((v) => !v)}
            >
              Return
            </Button>
          </div>
          {showReturnForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <label style={labelStyle}>
                Feedback
                <textarea
                  style={textareaStyle}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to be corrected…"
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading || !feedback.trim()}
                onClick={() => void handleReturn()}
              >
                {isLoading && showReturnForm ? 'Returning…' : 'Submit Return'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface CancellationApprovalProps {
  campaignId: string
  requestedAt: Date
  onActionComplete: () => void
}

function CancellationApprovalSection({
  campaignId,
  requestedAt,
  onActionComplete,
}: CancellationApprovalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleApprove() {
    setIsLoading(true)
    setError(null)
    try {
      await approveCancellation(campaignId)
      setSuccess('Cancellation approved.')
      onActionComplete()
    } catch {
      setError('Failed to approve cancellation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={sectionStyle}>
      <p style={subheadingStyle}>Cancellation Request</p>
      <p style={bodyStyle}>
        A cancellation was requested on{' '}
        {requestedAt.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        .
      </p>
      <p style={{ ...bodyStyle, fontStyle: 'italic' }}>
        Note: There is no deny action — to decline, leave this request without approving.
      </p>
      {error && (
        <span role="alert" style={errorStyle}>
          {error}
        </span>
      )}
      {success ? (
        <span style={successStyle}>{success}</span>
      ) : (
        <Button
          type="button"
          variant="primary"
          disabled={isLoading}
          onClick={() => void handleApprove()}
        >
          {isLoading ? 'Approving…' : 'Approve Cancellation'}
        </Button>
      )}
    </div>
  )
}

export function AdminActionsPanel({ campaign, user, onActionComplete }: AdminActionsPanelProps) {
  const isAdmin = user?.role === 'Administrator' || user?.role === 'SuperAdministrator'

  if (!isAdmin) {
    return null
  }

  const submittedMilestones = campaign.milestones.filter((m) => m.status === 'Submitted')
  const hasPendingCancellation =
    campaign.cancellationRequestedAt != null && campaign.cancellationRequestedAt !== undefined

  if (submittedMilestones.length === 0 && !hasPendingCancellation) {
    return null
  }

  return (
    <div style={panelStyle} aria-label="Admin actions">
      <h2 style={headingStyle}>Admin Actions</h2>

      {submittedMilestones.length > 0 && (
        <div style={sectionStyle}>
          <p style={subheadingStyle}>Milestone Evidence Review</p>
          {submittedMilestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              campaignId={campaign.id}
              milestone={milestone}
              onActionComplete={onActionComplete}
            />
          ))}
        </div>
      )}

      {hasPendingCancellation && (
        <CancellationApprovalSection
          campaignId={campaign.id}
          requestedAt={campaign.cancellationRequestedAt as Date}
          onActionComplete={onActionComplete}
        />
      )}
    </div>
  )
}
