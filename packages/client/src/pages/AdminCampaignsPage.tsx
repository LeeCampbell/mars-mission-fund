import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCampaigns } from '../hooks/useCampaigns'
import { useCampaign } from '../hooks/useCampaign'
import {
  verifyMilestone,
  returnMilestone,
  approveCancellation,
  denyCancellation,
} from '../api/campaigns'
import type { CampaignSummary, Milestone } from '@mmf/shared'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-2-size)',
  fontWeight: 'var(--type-heading-2-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-2-spacing)',
  lineHeight: 'var(--type-heading-2-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-8)',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-3-size)',
  fontWeight: 'var(--type-heading-3-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-3-spacing)',
  lineHeight: 'var(--type-heading-3-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-4)',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-10)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  marginBottom: 'var(--space-4)',
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-1)',
}

const cardMetaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  margin: '0 0 var(--space-3)',
}

const evidenceStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg-page)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  margin: '0 0 var(--space-3)',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--color-accent-primary)',
  color: 'var(--color-text-on-accent)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const dangerBtnStyle: React.CSSProperties = {
  background: 'var(--color-status-error)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const feedbackTextareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  background: 'var(--color-bg-page)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-2)',
  resize: 'vertical',
  boxSizing: 'border-box',
}

const statusMsgStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  marginTop: 'var(--space-2)',
}

const errorMsgStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-status-error)',
  marginTop: 'var(--space-2)',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-tertiary)',
  fontStyle: 'italic',
  padding: 'var(--space-4) 0',
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-status-error)',
}

// ─── MilestoneCard ────────────────────────────────────────────────────────────

interface MilestoneCardProps {
  campaignId: string
  campaignTitle: string
  milestone: Milestone
}

function MilestoneCard({ campaignId, campaignTitle, milestone }: MilestoneCardProps) {
  const queryClient = useQueryClient()
  const [showReturn, setShowReturn] = useState(false)
  const [feedback, setFeedback] = useState('')

  const verifyMut = useMutation({
    mutationFn: () => verifyMilestone(campaignId, milestone.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const returnMut = useMutation({
    mutationFn: () => returnMilestone(campaignId, milestone.id, feedback),
    onSuccess: () => {
      setShowReturn(false)
      setFeedback('')
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  return (
    <div style={cardStyle}>
      <p style={cardTitleStyle}>{campaignTitle}</p>
      <p style={cardMetaStyle}>Milestone: {milestone.title}</p>

      {(milestone.evidenceDescription || milestone.evidenceUrl) && (
        <div style={evidenceStyle}>
          {milestone.evidenceDescription && (
            <p style={{ margin: '0 0 var(--space-1)' }}>{milestone.evidenceDescription}</p>
          )}
          {milestone.evidenceUrl && (
            <a
              href={milestone.evidenceUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-accent-primary)', wordBreak: 'break-all' }}
            >
              {milestone.evidenceUrl}
            </a>
          )}
        </div>
      )}

      {verifyMut.isSuccess ? (
        <p style={statusMsgStyle}>Milestone verified.</p>
      ) : returnMut.isSuccess ? (
        <p style={statusMsgStyle}>Milestone returned with feedback.</p>
      ) : showReturn ? (
        <div>
          <textarea
            style={feedbackTextareaStyle}
            placeholder="Enter feedback for the creator…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            aria-label="Return feedback"
          />
          <div style={buttonRowStyle}>
            <button
              style={dangerBtnStyle}
              onClick={() => returnMut.mutate()}
              disabled={returnMut.isPending || !feedback.trim()}
            >
              {returnMut.isPending ? 'Returning…' : 'Submit Return'}
            </button>
            <button style={secondaryBtnStyle} onClick={() => setShowReturn(false)}>
              Cancel
            </button>
          </div>
          {returnMut.isError && (
            <p style={errorMsgStyle}>Failed to return milestone. Please try again.</p>
          )}
        </div>
      ) : (
        <div style={buttonRowStyle}>
          <button
            style={primaryBtnStyle}
            onClick={() => verifyMut.mutate()}
            disabled={verifyMut.isPending}
          >
            {verifyMut.isPending ? 'Verifying…' : 'Verify'}
          </button>
          <button style={secondaryBtnStyle} onClick={() => setShowReturn(true)}>
            Return
          </button>
          {verifyMut.isError && (
            <span style={errorMsgStyle}>Failed to verify. Please try again.</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CampaignMilestonesLoader ─────────────────────────────────────────────────
// Fetches full campaign detail for a single campaign and renders submitted milestone cards.
// Returns null while loading or when no milestones need verification.

interface CampaignMilestonesLoaderProps {
  campaignId: string
  campaignTitle: string
}

function CampaignMilestonesLoader({ campaignId, campaignTitle }: CampaignMilestonesLoaderProps) {
  const { data: campaign } = useCampaign(campaignId)

  if (!campaign) return null

  const submitted = campaign.milestones.filter((m) => m.status === 'Submitted')
  if (submitted.length === 0) return null

  return (
    <>
      {submitted.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          milestone={milestone}
        />
      ))}
    </>
  )
}

// ─── CancellationCard ─────────────────────────────────────────────────────────

interface CancellationCardProps {
  campaign: CampaignSummary
}

function CancellationCard({ campaign }: CancellationCardProps) {
  const queryClient = useQueryClient()

  const approveMut = useMutation({
    mutationFn: () => approveCancellation(campaign.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const denyMut = useMutation({
    mutationFn: () => denyCancellation(campaign.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const requestedDate =
    campaign.cancellationRequestedAt != null
      ? new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(campaign.cancellationRequestedAt))
      : '—'

  return (
    <div style={cardStyle}>
      <p style={cardTitleStyle}>{campaign.title}</p>
      <p style={cardMetaStyle}>Requested: {requestedDate}</p>

      {approveMut.isSuccess ? (
        <p style={statusMsgStyle}>Cancellation approved.</p>
      ) : denyMut.isSuccess ? (
        <p style={statusMsgStyle}>Cancellation denied.</p>
      ) : (
        <div style={buttonRowStyle}>
          <button
            style={primaryBtnStyle}
            onClick={() => approveMut.mutate()}
            disabled={approveMut.isPending || denyMut.isPending}
          >
            {approveMut.isPending ? 'Approving…' : 'Approve'}
          </button>
          <button
            style={dangerBtnStyle}
            onClick={() => denyMut.mutate()}
            disabled={approveMut.isPending || denyMut.isPending}
          >
            {denyMut.isPending ? 'Denying…' : 'Deny'}
          </button>
          {(approveMut.isError || denyMut.isError) && (
            <span style={errorMsgStyle}>Action failed. Please try again.</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── AdminCampaignsPage ───────────────────────────────────────────────────────

// Campaigns in these statuses can have milestones awaiting verification
const ACTIVE_MILESTONE_STATUSES = new Set(['Live', 'Settlement'])

export function AdminCampaignsPage() {
  const { data: campaigns, isLoading, isError } = useCampaigns()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading campaigns…</div>
      </div>
    )
  }

  if (isError || !campaigns) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load campaigns. Please try again.</div>
      </div>
    )
  }

  const activeCampaigns = campaigns.filter((c) => ACTIVE_MILESTONE_STATUSES.has(c.status))
  const cancellationPending = campaigns.filter((c) => c.cancellationRequestedAt != null)

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Campaign Management</h1>

        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Pending Milestone Verifications</h2>
          {activeCampaigns.length === 0 ? (
            <p style={emptyStyle}>No pending milestone verifications.</p>
          ) : (
            activeCampaigns.map((c) => (
              <CampaignMilestonesLoader key={c.id} campaignId={c.id} campaignTitle={c.title} />
            ))
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Pending Cancellation Requests</h2>
          {cancellationPending.length === 0 ? (
            <p style={emptyStyle}>No pending cancellation requests.</p>
          ) : (
            cancellationPending.map((c) => <CancellationCard key={c.id} campaign={c} />)
          )}
        </section>
      </div>
    </div>
  )
}
