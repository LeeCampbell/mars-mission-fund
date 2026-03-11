import {
  useCancellationRequests,
  useApproveCancellation,
  useDenyCancellation,
} from '../hooks/useAdmin'
import type { CancellationRequest } from '../api/adminCampaigns'

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

const approveButtonStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-status-success)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
  marginRight: 'var(--space-2)',
}

const denyButtonStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-status-error)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
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

const emptyStyle: React.CSSProperties = {
  padding: 'var(--space-8)',
  textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function CancellationRow({
  request,
  onApprove,
  onDeny,
  isApproving,
  isDenying,
}: {
  request: CancellationRequest
  onApprove: (id: string) => void
  onDeny: (id: string) => void
  isApproving: boolean
  isDenying: boolean
}) {
  return (
    <tr>
      <td style={tdStyle}>{request.title}</td>
      <td style={tdStyle}>
        {request.cancellationReason ?? (
          <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
        )}
      </td>
      <td style={tdStyle}>{formatDate(request.cancellationRequestedAt)}</td>
      <td style={tdStyle}>
        <button
          style={approveButtonStyle}
          onClick={() => onApprove(request.id)}
          disabled={isApproving || isDenying}
          aria-label="Approve cancellation"
        >
          Approve
        </button>
        <button
          style={denyButtonStyle}
          onClick={() => onDeny(request.id)}
          disabled={isApproving || isDenying}
          aria-label="Deny cancellation"
        >
          Deny
        </button>
      </td>
    </tr>
  )
}

export function AdminCancellationsPage() {
  const { data: requests, isLoading, isError } = useCancellationRequests()
  const approveMutation = useApproveCancellation()
  const denyMutation = useDenyCancellation()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading cancellation requests…</div>
      </div>
    )
  }

  if (isError || !requests) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load cancellation requests. Please try again.</div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Cancellation Requests</h1>
        {requests.length === 0 ? (
          <div style={emptyStyle}>No cancellation requests pending.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Campaign</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Requested</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <CancellationRow
                  key={request.id}
                  request={request}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onDeny={(id) => denyMutation.mutate(id)}
                  isApproving={approveMutation.isPending}
                  isDenying={denyMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
