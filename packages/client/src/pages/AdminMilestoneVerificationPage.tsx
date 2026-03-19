import { useState, useEffect } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCampaignsWithPendingMilestones,
  fetchCampaign,
  verifyMilestone,
  returnMilestone,
} from '../api/campaigns'
import type { CampaignDetail, Milestone } from '../api/campaigns'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '1100px',
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

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  borderBottom: '1px solid var(--color-border-subtle)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border-subtle)',
  verticalAlign: 'top',
}

const tdSecondaryStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--color-text-secondary)',
}

const actionsCellStyle: React.CSSProperties = {
  ...tdStyle,
  minWidth: '260px',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 'var(--space-1) var(--space-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-page)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: 'var(--space-2)',
  boxSizing: 'border-box',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  flexWrap: 'wrap',
}

const verifyBtnStyle: React.CSSProperties = {
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  background: 'var(--color-accent-primary)',
  color: 'var(--color-text-on-accent)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
}

const returnBtnStyle: React.CSSProperties = {
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  background: 'transparent',
  color: 'var(--color-status-error)',
  border: '1px solid var(--color-status-error)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
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
  padding: 'var(--space-12) 0',
  textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent-primary)',
  textDecoration: 'underline',
  wordBreak: 'break-all',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

interface MilestoneRowProps {
  campaignId: string
  campaignTitle: string
  milestone: Milestone
  onSuccess: () => void
}

function MilestoneRow({ campaignId, campaignTitle, milestone, onSuccess }: MilestoneRowProps) {
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')

  const { mutate: doVerify, isPending: isVerifying } = useMutation({
    mutationFn: () => verifyMilestone(campaignId, milestone.id, notes),
    onSuccess,
  })

  const { mutate: doReturn, isPending: isReturning } = useMutation({
    mutationFn: () => returnMilestone(campaignId, milestone.id, feedback),
    onSuccess,
  })

  const isPending = isVerifying || isReturning

  return (
    <tr>
      <td style={tdStyle}>{campaignTitle}</td>
      <td style={tdStyle}>{milestone.title}</td>
      <td style={tdSecondaryStyle}>
        {milestone.evidenceUrl ? (
          <a
            href={milestone.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            {milestone.evidenceUrl}
          </a>
        ) : (
          '—'
        )}
      </td>
      <td style={tdSecondaryStyle}>{formatDate(milestone.evidenceSubmittedAt)}</td>
      <td style={actionsCellStyle}>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={inputStyle}
          aria-label={`Verify notes for ${milestone.title}`}
          disabled={isPending}
        />
        <input
          type="text"
          placeholder="Feedback (required for return)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={inputStyle}
          aria-label={`Return feedback for ${milestone.title}`}
          disabled={isPending}
        />
        <div style={buttonRowStyle}>
          <button
            style={verifyBtnStyle}
            disabled={isPending}
            onClick={() => doVerify()}
            aria-label={`Verify milestone ${milestone.title}`}
          >
            {isVerifying ? 'Verifying…' : 'Verify'}
          </button>
          <button
            style={returnBtnStyle}
            disabled={isPending || !feedback.trim()}
            onClick={() => doReturn()}
            aria-label={`Return milestone ${milestone.title}`}
          >
            {isReturning ? 'Returning…' : 'Return'}
          </button>
        </div>
      </td>
    </tr>
  )
}

export function AdminMilestoneVerificationPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    document.title = 'Milestone Verification — Mars Mission Fund'
  }, [])

  const {
    data: campaignSummaries,
    isLoading: isLoadingSummaries,
    isError: isErrorSummaries,
  } = useQuery({
    queryKey: ['admin', 'pending-milestones'],
    queryFn: fetchCampaignsWithPendingMilestones,
  })

  const detailQueries = useQueries({
    queries: (campaignSummaries ?? []).map((c) => ({
      queryKey: ['campaign', c.id],
      queryFn: () => fetchCampaign(c.id),
      enabled: !!campaignSummaries,
    })),
  })

  const isLoadingDetails = detailQueries.some((q) => q.isLoading)
  const isErrorDetails = detailQueries.some((q) => q.isError)

  const isLoading = isLoadingSummaries || isLoadingDetails
  const isError = isErrorSummaries || isErrorDetails

  const campaigns: CampaignDetail[] = detailQueries
    .map((q) => q.data)
    .filter((d): d is CampaignDetail => d !== undefined)

  const rows: { campaign: CampaignDetail; milestone: Milestone }[] = campaigns.flatMap((campaign) =>
    campaign.milestones
      .filter((m) => m.status === 'Submitted')
      .map((milestone) => ({ campaign, milestone }))
  )

  function handleSuccess() {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'pending-milestones'] })
    for (const campaign of campaigns) {
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaign.id] })
    }
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle} role="status" aria-busy="true">
          Loading milestone submissions…
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle} role="alert">
          Failed to load milestone submissions. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Milestone Verification</h1>

        {rows.length === 0 ? (
          <div style={emptyStyle}>No submitted milestones awaiting verification.</div>
        ) : (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Milestone</th>
                  <th style={thStyle}>Evidence URL</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ campaign, milestone }) => (
                  <MilestoneRow
                    key={`${campaign.id}-${milestone.id}`}
                    campaignId={campaign.id}
                    campaignTitle={campaign.title}
                    milestone={milestone}
                    onSuccess={handleSuccess}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
