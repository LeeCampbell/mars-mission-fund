import { Link } from 'react-router'
import { useNotifications } from '../hooks/useNotifications'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '800px',
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

const cardBaseStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4) var(--space-5)',
  marginBottom: 'var(--space-3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-4)',
}

const unreadCardStyle: React.CSSProperties = {
  ...cardBaseStyle,
  background: 'var(--color-bg-subtle)',
  borderColor: 'var(--color-accent-primary)',
}

const cardBodyStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const titleBaseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-1)',
}

const titleUnreadStyle: React.CSSProperties = {
  ...titleBaseStyle,
  fontWeight: 700,
}

const messageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-2)',
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const timestampStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
}

const campaignLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  textDecoration: 'none',
}

const markReadBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'transparent',
  color: 'var(--color-accent-primary)',
  border: '1px solid var(--color-accent-primary)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-tertiary)',
  fontStyle: 'italic',
  padding: 'var(--space-8) 0',
  textAlign: 'center',
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ─── NotificationsPage ────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { notifications, markRead, isLoading, error } = useNotifications()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading notifications…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load notifications. Please try again.</div>
      </div>
    )
  }

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Notifications</h1>

        {sorted.length === 0 ? (
          <p style={emptyStyle}>You have no notifications.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} role="list">
            {sorted.map((n) => (
              <li key={n.id} style={n.read ? cardBaseStyle : unreadCardStyle}>
                <div style={cardBodyStyle}>
                  <p style={n.read ? titleBaseStyle : titleUnreadStyle}>{n.title}</p>
                  <p style={messageStyle}>{n.message}</p>
                  <div style={metaRowStyle}>
                    <span style={timestampStyle}>{formatTimestamp(n.createdAt)}</span>
                    {n.campaignId && (
                      <Link to={`/campaigns/${n.campaignId}`} style={campaignLinkStyle}>
                        View campaign
                      </Link>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <button style={markReadBtnStyle} onClick={() => markRead(n.id)}>
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
