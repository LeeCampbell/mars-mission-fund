import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { useApproveCampaign, useRejectCampaign } from '../hooks/useReview'
import { useAuthContext } from '../context/AuthContext'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '960px',
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
  margin: '0 0 var(--space-4)',
}

const subheadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-4-size)',
  fontWeight: 'var(--type-heading-4-weight)' as React.CSSProperties['fontWeight'],
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-3)',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  lineHeight: 'var(--type-body-leading)',
  margin: '0 0 var(--space-6)',
}

const panelStyle: React.CSSProperties = {
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-6)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-2)',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100px',
  padding: 'var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border-input)',
  borderRadius: 'var(--radius-sm)',
  resize: 'vertical',
  boxSizing: 'border-box',
}

const approveButtonStyle: React.CSSProperties = {
  marginTop: 'var(--space-4)',
  padding: 'var(--space-2) var(--space-6)',
  background: 'var(--color-status-success)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const rejectButtonStyle: React.CSSProperties = {
  marginTop: 'var(--space-4)',
  padding: 'var(--space-2) var(--space-6)',
  background: 'var(--color-status-error)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
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

const backLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  textDecoration: 'none',
  marginBottom: 'var(--space-6)',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [approveNotes, setApproveNotes] = useState('')
  const [rejectRationale, setRejectRationale] = useState('')
  const [rejectGuidance, setRejectGuidance] = useState('')

  const isReviewer = user?.role === 'Reviewer'

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')
  const approveMutation = useApproveCampaign()
  const rejectMutation = useRejectCampaign()

  useEffect(() => {
    if (!isReviewer) {
      void navigate('/')
    }
  }, [isReviewer, navigate])

  if (!isReviewer) {
    return null
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading campaign…</div>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load campaign. Please try again.</div>
      </div>
    )
  }

  function handleApprove(e: React.FormEvent) {
    e.preventDefault()
    approveMutation.mutate(
      { id: campaign!.id, notes: approveNotes },
      {
        onSuccess: () => {
          void navigate('/review')
        },
      }
    )
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault()
    rejectMutation.mutate(
      { id: campaign!.id, rationale: rejectRationale, guidance: rejectGuidance },
      {
        onSuccess: () => {
          void navigate('/review')
        },
      }
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <button style={backLinkStyle} onClick={() => void navigate('/review')}>
          ← Back to Review Queue
        </button>

        <h1 style={headingStyle}>{campaign.title}</h1>
        <p style={bodyStyle}>{campaign.summary}</p>

        <div style={panelStyle}>
          <h2 style={subheadingStyle}>Campaign Description</h2>
          <p style={bodyStyle}>{campaign.description}</p>
        </div>

        <div style={panelStyle}>
          <h2 style={subheadingStyle}>Approve Campaign</h2>
          <form onSubmit={handleApprove}>
            <label style={labelStyle} htmlFor="approve-notes">
              Review Notes
            </label>
            <textarea
              id="approve-notes"
              style={textareaStyle}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Add any notes about your approval decision…"
            />
            <button
              type="submit"
              style={approveButtonStyle}
              disabled={approveMutation.isPending}
              aria-label="Approve campaign"
            >
              {approveMutation.isPending ? 'Approving…' : 'Approve'}
            </button>
          </form>
        </div>

        <div style={panelStyle}>
          <h2 style={subheadingStyle}>Reject Campaign</h2>
          <form onSubmit={handleReject}>
            <label style={labelStyle} htmlFor="reject-rationale">
              Rejection Rationale
            </label>
            <textarea
              id="reject-rationale"
              style={textareaStyle}
              value={rejectRationale}
              onChange={(e) => setRejectRationale(e.target.value)}
              placeholder="Explain why this campaign is being rejected…"
            />
            <label style={{ ...labelStyle, marginTop: 'var(--space-4)' }} htmlFor="reject-guidance">
              Guidance for Resubmission
            </label>
            <textarea
              id="reject-guidance"
              style={textareaStyle}
              value={rejectGuidance}
              onChange={(e) => setRejectGuidance(e.target.value)}
              placeholder="Provide guidance to help the creator improve their campaign…"
            />
            <button
              type="submit"
              style={rejectButtonStyle}
              disabled={rejectMutation.isPending}
              aria-label="Reject campaign"
            >
              {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
