import { useNavigate } from 'react-router'
import { useNotifications } from '../hooks/useNotifications'

const bellButtonStyle: React.CSSProperties = {
  position: 'relative',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'color var(--motion-hover)',
}

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  background: 'var(--color-feedback-error)',
  color: '#fff',
  borderRadius: '9999px',
  minWidth: '16px',
  height: '16px',
  fontSize: '10px',
  fontWeight: 700,
  lineHeight: '16px',
  textAlign: 'center',
  padding: '0 3px',
  pointerEvents: 'none',
}

const focusStyle = `
  .mmf-notification-bell:focus-visible {
    outline: 2px solid var(--color-action-primary-hover);
    outline-offset: 2px;
  }
`

let bellStyleInjected = false
function ensureBellStyle() {
  if (bellStyleInjected || typeof document === 'undefined') return
  bellStyleInjected = true
  const el = document.createElement('style')
  el.textContent = focusStyle
  document.head.appendChild(el)
}

export function NotificationBell() {
  ensureBellStyle()
  const navigate = useNavigate()
  const { data: notifications } = useNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <button
      className="mmf-notification-bell"
      style={bellButtonStyle}
      aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
      onClick={() => void navigate('/notifications')}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zM10 18a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z"
          fill="currentColor"
        />
      </svg>
      {unreadCount > 0 && (
        <span style={badgeStyle} aria-hidden="true">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
