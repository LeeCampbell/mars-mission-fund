import { useState } from 'react'
import { useSubmittedMilestones, useVerifyMilestone, useReturnMilestone } from '../hooks/useAdmin'
import type { SubmittedMilestone } from '../api/adminCampaigns'

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

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '2px solid var(--color-border-subtle)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--type-body-small-size)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--color-border-subtle)',
  verticalAlign: 'middle',
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-surface)',
  width: '140px',
}

const verifyButtonStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-status-success)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
  marginLeft: 'var(--space-2)',
}

const returnButtonStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-status-warning)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
  marginLeft: 'var(--space-2)',
}

const actionCellStyle: React.CSSProperties = {
  ...tdStyle,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-2)',
  alignItems: 'center',
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
  padding: 'var(--space-8)',
  textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent-primary)',
  textDecoration: 'underline',
}

function MilestoneRow({
  milestone,
  onVerify,
  onReturn,
  isVerifying,
  isReturning,
}: {
  milestone: SubmittedMilestone
  onVerify: (id: string, notes: string) => void
  onReturn: (id: string, feedback: string) => void
  isVerifying: boolean
  isReturning: boolean
}) {
  const [verifyNotes, setVerifyNotes] = useState('')
  const [returnFeedback, setReturnFeedback] = useState('')

  return (
    <tr>
      <td style={tdStyle}>{milestone.campaignTitle}</td>
      <td style={tdStyle}>{milestone.title}</td>
      <td style={tdStyle}>
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
          <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
        )}
      </td>
      <td style={tdStyle}>
        {milestone.evidenceNotes ?? <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
      </td>
      <td style={actionCellStyle}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Admin notes"
          aria-label="Admin notes"
          value={verifyNotes}
          onChange={(e) => setVerifyNotes(e.target.value)}
        />
        <button
          style={verifyButtonStyle}
          onClick={() => onVerify(milestone.id, verifyNotes)}
          disabled={isVerifying}
          aria-label="Verify milestone"
        >
          Verify
        </button>
        <input
          style={inputStyle}
          type="text"
          placeholder="Return feedback"
          aria-label="Return feedback"
          value={returnFeedback}
          onChange={(e) => setReturnFeedback(e.target.value)}
        />
        <button
          style={returnButtonStyle}
          onClick={() => onReturn(milestone.id, returnFeedback)}
          disabled={isReturning}
          aria-label="Return milestone"
        >
          Return
        </button>
      </td>
    </tr>
  )
}

export function AdminMilestonesPage() {
  const { data: milestones, isLoading, isError } = useSubmittedMilestones()
  const verifyMutation = useVerifyMilestone()
  const returnMutation = useReturnMilestone()

  function handleVerify(id: string, notes: string) {
    verifyMutation.mutate({ id, notes })
  }

  function handleReturn(id: string, feedback: string) {
    returnMutation.mutate({ id, feedback })
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading milestones…</div>
      </div>
    )
  }

  if (isError || !milestones) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load milestones. Please try again.</div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Submitted Milestones</h1>
        {milestones.length === 0 ? (
          <div style={emptyStyle}>No milestones awaiting review.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Campaign</th>
                <th style={thStyle}>Milestone</th>
                <th style={thStyle}>Evidence URL</th>
                <th style={thStyle}>Evidence Notes</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => (
                <MilestoneRow
                  key={milestone.id}
                  milestone={milestone}
                  onVerify={handleVerify}
                  onReturn={handleReturn}
                  isVerifying={verifyMutation.isPending}
                  isReturning={returnMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
