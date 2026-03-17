import { useState } from 'react'
import { Link } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCampaign } from '../hooks/useCampaign'
import { fetchCampaignsByStatus, verifyMilestone, returnMilestone } from '../api/campaigns'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { CampaignSummary, Milestone } from '@mmf/shared'

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
  margin: '0 0 var(--space-6)',
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

const campaignCardStyle: React.CSSProperties = {
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-6)',
  background: 'var(--color-bg-card)',
  marginBottom: 'var(--space-6)',
}

const campaignTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-2)',
}

const campaignLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  textDecoration: 'none',
}

const milestoneListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 'var(--space-4) 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const milestoneItemStyle: React.CSSProperties = {
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-4)',
  background: 'var(--color-bg-page)',
}

const milestoneTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-2)',
}

const evidenceTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-2)',
}

const evidenceLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  textDecoration: 'none',
  display: 'block',
  marginBottom: 'var(--space-3)',
}

const milestoneActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  marginTop: 'var(--space-3)',
}

const returnFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
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
  minHeight: '60px',
  width: '100%',
  boxSizing: 'border-box',
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

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
}

function MilestoneVerifyRow({
  campaignId,
  milestone,
}: {
  campaignId: string
  milestone: Milestone
}) {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  const verifyMut = useMutation({
    mutationFn: () => verifyMilestone(campaignId, milestone.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-settlement-campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
    },
  })

  const returnMut = useMutation({
    mutationFn: () => returnMilestone(campaignId, milestone.id, feedback),
    onSuccess: () => {
      setFeedback('')
      void queryClient.invalidateQueries({ queryKey: ['admin-settlement-campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
    },
  })

  return (
    <li style={milestoneItemStyle}>
      <p style={milestoneTitleStyle}>{milestone.title}</p>
      <Badge variant="active">Submitted</Badge>
      {milestone.evidenceDescription && (
        <p style={evidenceTextStyle}>{milestone.evidenceDescription}</p>
      )}
      {milestone.evidenceUrl && (
        <a href={milestone.evidenceUrl} style={evidenceLinkStyle} target="_blank" rel="noreferrer">
          {milestone.evidenceUrl}
        </a>
      )}
      <div style={milestoneActionsStyle}>
        <div style={buttonRowStyle}>
          <Button
            variant="primary"
            onClick={() => verifyMut.mutate()}
            disabled={verifyMut.isPending}
          >
            {verifyMut.isPending ? 'Verifying…' : 'Verify'}
          </Button>
        </div>
        <div style={returnFormStyle}>
          <label style={labelStyle}>
            Return feedback
            <textarea
              style={textareaStyle}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain what needs to be corrected…"
              aria-label="Return feedback"
            />
          </label>
          <Button
            variant="secondary"
            onClick={() => returnMut.mutate()}
            disabled={returnMut.isPending || feedback.trim() === ''}
          >
            {returnMut.isPending ? 'Returning…' : 'Return'}
          </Button>
        </div>
      </div>
    </li>
  )
}

function SettlementCampaignRow({ summary }: { summary: CampaignSummary }) {
  const { data: campaign, isLoading, isError } = useCampaign(summary.id)

  if (isLoading) {
    return (
      <div style={campaignCardStyle}>
        <p style={evidenceTextStyle}>Loading {summary.title}…</p>
      </div>
    )
  }

  if (isError || !campaign) return null

  const submittedMilestones = campaign.milestones.filter((m) => m.status === 'Submitted')

  return (
    <div style={campaignCardStyle}>
      <h3 style={campaignTitleStyle}>{campaign.title}</h3>
      <Link to={`/campaigns/${campaign.id}`} style={campaignLinkStyle}>
        View campaign page
      </Link>
      {submittedMilestones.length === 0 ? (
        <p style={evidenceTextStyle}>No submitted milestones.</p>
      ) : (
        <ul style={milestoneListStyle}>
          {submittedMilestones.map((milestone) => (
            <MilestoneVerifyRow key={milestone.id} campaignId={campaign.id} milestone={milestone} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminCampaignsPage() {
  const {
    data: campaigns,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-settlement-campaigns'],
    queryFn: () => fetchCampaignsByStatus('Settlement'),
  })

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle} role="status" aria-busy="true">
          Loading settlement campaigns…
        </div>
      </div>
    )
  }

  if (isError || !campaigns) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle} role="alert">
          Failed to load campaigns. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Campaign Management</h1>
        <section aria-label="Milestone Verification">
          <h2 style={sectionHeadingStyle}>Milestone Verification</h2>
          {campaigns.length === 0 ? (
            <p style={emptyStyle}>No campaigns in settlement.</p>
          ) : (
            campaigns.map((c) => <SettlementCampaignRow key={c.id} summary={c} />)
          )}
        </section>
      </div>
    </div>
  )
}
