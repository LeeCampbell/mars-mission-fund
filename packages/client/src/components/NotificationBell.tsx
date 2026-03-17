import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '../api/notifications'

const buttonStyle: React.CSSProperties = {
  position: 'relative',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-sm)',
  transition: 'color var(--motion-hover)',
}

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0',
  background: 'var(--color-status-error)',
  color: '#fff',
  borderRadius: '9999px',
  fontSize: '10px',
  fontWeight: 700,
  lineHeight: 1,
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 3px',
  fontFamily: 'var(--font-body)',
}

export function NotificationBell() {
  const navigate = useNavigate()
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <button
      style={buttonStyle}
      aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
      onClick={() => void navigate('/notifications')}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span style={badgeStyle} aria-hidden="true">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
