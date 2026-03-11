import { Link } from 'react-router'
import { useNotifications } from '../hooks/useNotifications'

const containerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-primary)',
  textDecoration: 'none',
  padding: 'var(--space-1)',
  borderRadius: 'var(--radius-sm)',
}

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  minWidth: '18px',
  height: '18px',
  padding: '0 4px',
  background: 'var(--color-status-error)',
  color: '#fff',
  borderRadius: '9px',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'var(--font-body)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
}

export function NotificationBell() {
  const { data: notifications } = useNotifications()

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0

  return (
    <div style={containerStyle}>
      <Link to="/notifications" style={linkStyle} aria-label="Notifications">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </Link>
      {unreadCount > 0 && (
        <span style={badgeStyle} aria-label={`${unreadCount} unread notifications`}>
          {unreadCount}
        </span>
      )}
    </div>
  )
}
