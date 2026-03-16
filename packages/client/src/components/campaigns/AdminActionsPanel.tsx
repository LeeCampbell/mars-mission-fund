import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyMilestone, returnMilestone, approveCancellation } from '../../api/campaigns'
import type { CampaignDetail, Milestone } from '@mmf/shared'
import type { User } from '@mmf/shared'
import { Button } from '../ui/Button'

interface AdminActionsPanelProps {
  campaign: CampaignDetail
  user: User | null
  onActionComplete?: () => void
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

const milestoneItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  paddingTop: 'var(--space-4)',
  borderTop: '1px solid var(--color-border-subtle)',
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

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-status-error)',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  paddingTop: 'var(--space-4)',
  borderTop: '1px solid var(--color-border-subtle)',
}

function MilestoneVerifyItem({
  milestone,
  campaignId,
  onActionComplete,
}: {
  milestone: Milestone
  campaignId: string
  onActionComplete?: () => void
}) {
  const queryClient = useQueryClient()
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)

  const verifyMutation = useMutation({
    mutationFn: () => verifyMilestone(campaignId, milestone.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      onActionComplete?.()
    },
    onError: () => {
      setError('Failed to verify milestone. Please try again.')
    },
  })

  const returnMutation = useMutation({
    mutationFn: () => returnMilestone(campaignId, milestone.id, feedback),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      onActionComplete?.()
    },
    onError: () => {
      setError('Failed to return milestone. Please try again.')
    },
  })

  return (
    <div style={milestoneItemStyle}>
      <p style={subheadingStyle}>{milestone.title}</p>
      {milestone.evidenceDescription && (
        <p style={metaStyle}>
          <strong>Evidence:</strong> {milestone.evidenceDescription}
        </p>
      )}
      {milestone.evidenceUrl && (
        <p style={metaStyle}>
          <strong>URL:</strong>{' '}
          <a href={milestone.evidenceUrl} target="_blank" rel="noopener noreferrer">
            {milestone.evidenceUrl}
          </a>
        </p>
      )}
      {error && (
        <span role="alert" style={errorStyle}>
          {error}
        </span>
      )}
      <div style={buttonRowStyle}>
        <Button
          type="button"
          variant="primary"
          disabled={verifyMutation.isPending || returnMutation.isPending}
          onClick={() => {
            setError(null)
            verifyMutation.mutate()
          }}
        >
          {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={verifyMutation.isPending || returnMutation.isPending}
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
              placeholder="Explain what needs to be addressed…"
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            disabled={returnMutation.isPending || feedback.trim() === ''}
            onClick={() => {
              setError(null)
              returnMutation.mutate()
            }}
          >
            {returnMutation.isPending ? 'Returning…' : 'Confirm Return'}
          </Button>
        </div>
      )}
    </div>
  )
}

function MilestoneVerificationPanel({
  campaign,
  onActionComplete,
}: {
  campaign: CampaignDetail
  onActionComplete?: () => void
}) {
  const submittedMilestones = campaign.milestones.filter((m) => m.status === 'Submitted')

  if (submittedMilestones.length === 0) {
    return (
      <div style={sectionStyle}>
        <p style={subheadingStyle}>Milestone Verification</p>
        <p style={metaStyle}>No milestones awaiting verification.</p>
      </div>
    )
  }

  return (
    <div style={sectionStyle}>
      <p style={subheadingStyle}>Milestone Verification</p>
      {submittedMilestones.map((milestone) => (
        <MilestoneVerifyItem
          key={milestone.id}
          milestone={milestone}
          campaignId={campaign.id}
          onActionComplete={onActionComplete}
        />
      ))}
    </div>
  )
}

function CancellationApprovalPanel({
  campaign,
  onActionComplete,
}: {
  campaign: CampaignDetail
  onActionComplete?: () => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const approveMutation = useMutation({
    mutationFn: () => approveCancellation(campaign.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaign.id] })
      onActionComplete?.()
    },
    onError: () => {
      setError('Failed to approve cancellation. Please try again.')
    },
  })

  return (
    <div style={sectionStyle}>
      <p style={subheadingStyle}>Cancellation Request</p>
      <p style={metaStyle}>The campaign creator has requested cancellation of this campaign.</p>
      {error && (
        <span role="alert" style={errorStyle}>
          {error}
        </span>
      )}
      <div style={buttonRowStyle}>
        <Button
          type="button"
          variant="primary"
          disabled={approveMutation.isPending}
          onClick={() => {
            setError(null)
            approveMutation.mutate()
          }}
        >
          {approveMutation.isPending ? 'Approving…' : 'Approve Cancellation'}
        </Button>
        {/* TODO: Deny Cancellation — POST /v1/campaigns/:id/deny-cancel not yet implemented */}
        <Button type="button" variant="secondary" disabled>
          Deny Cancellation
        </Button>
      </div>
    </div>
  )
}

export function AdminActionsPanel({ campaign, user, onActionComplete }: AdminActionsPanelProps) {
  const isAdmin = user?.role === 'Administrator' || user?.role === 'SuperAdministrator'

  if (!isAdmin) return null

  const showMilestonePanel = campaign.status === 'Settlement'
  const showCancellationPanel = Boolean(campaign.cancellationRequestedAt)

  if (!showMilestonePanel && !showCancellationPanel) return null

  return (
    <div style={panelStyle} aria-label="Admin actions">
      <h2 style={headingStyle}>Admin Actions</h2>
      {showMilestonePanel && (
        <MilestoneVerificationPanel campaign={campaign} onActionComplete={onActionComplete} />
      )}
      {showCancellationPanel && (
        <CancellationApprovalPanel campaign={campaign} onActionComplete={onActionComplete} />
      )}
    </div>
  )
}
