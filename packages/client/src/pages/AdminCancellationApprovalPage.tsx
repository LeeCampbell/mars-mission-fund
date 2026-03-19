import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampaignsWithPendingCancellations, approveCancellation } from '../api/campaigns'
import type { CampaignSummary } from '../api/campaigns'

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
  verticalAlign: 'middle',
}

const tdSecondaryStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--color-text-secondary)',
}

const approveBtnStyle: React.CSSProperties = {
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

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

interface CancellationRowProps {
  campaign: CampaignSummary
  onSuccess: () => void
}

function CancellationRow({ campaign, onSuccess }: CancellationRowProps) {
  const { mutate: doApprove, isPending } = useMutation({
    mutationFn: () => approveCancellation(campaign.id),
    onSuccess,
  })

  return (
    <tr>
      <td style={tdStyle}>{campaign.title}</td>
      <td style={tdSecondaryStyle}>{campaign.createdBy ?? '—'}</td>
      <td style={tdSecondaryStyle}>{formatDate(campaign.createdAt)}</td>
      <td style={tdStyle}>
        <button
          style={approveBtnStyle}
          disabled={isPending}
          onClick={() => doApprove()}
          aria-label={`Approve cancellation for ${campaign.title}`}
        >
          {isPending ? 'Approving…' : 'Approve'}
        </button>
      </td>
    </tr>
  )
}

export function AdminCancellationApprovalPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    document.title = 'Cancellation Approvals — Mars Mission Fund'
  }, [])

  const {
    data: campaigns,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'pending-cancellations'],
    queryFn: fetchCampaignsWithPendingCancellations,
  })

  function handleSuccess() {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'pending-cancellations'] })
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle} role="status" aria-busy="true">
          Loading pending cancellations…
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle} role="alert">
          Failed to load pending cancellations. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Cancellation Approvals</h1>

        {!campaigns || campaigns.length === 0 ? (
          <div style={emptyStyle}>No pending cancellation requests.</div>
        ) : (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Requested</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <CancellationRow
                    key={campaign.id}
                    campaign={campaign}
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
