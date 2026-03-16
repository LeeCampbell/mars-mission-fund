import { type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '../api/notifications'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
  padding: 'var(--space-10) var(--space-6)',
}

const containerStyle: CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
}

const headingStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '32px',
  color: 'var(--color-text-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 'var(--space-8)',
}

const loadingStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const emptyStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

const listStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
}

function getRowStyle(read: boolean): CSSProperties {
  return {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderLeft: read ? '4px solid transparent' : '4px solid var(--color-text-accent)',
    borderRadius: 'var(--radius-card)',
    padding: 'var(--space-4) var(--space-5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  }
}

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const titleUnreadStyle: CSSProperties = {
  ...titleStyle,
  fontWeight: 700,
}

const messageStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-1)',
}

const timestampStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const markReadButtonStyle: CSSProperties = {
  flexShrink: 0,
  padding: 'var(--space-2) var(--space-3)',
  background: 'transparent',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-button)',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-accent)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const navigate = useNavigate()

  function handleRowClick() {
    if (notification.campaignId) {
      void navigate(`/campaigns/${notification.campaignId}`)
    }
  }

  function handleMarkRead(e: React.MouseEvent) {
    e.stopPropagation()
    onMarkRead(notification.id)
  }

  return (
    <li onClick={handleRowClick} style={getRowStyle(notification.read)}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={notification.read ? titleStyle : titleUnreadStyle}>{notification.title}</p>
        <p style={messageStyle}>{notification.message}</p>
        <p style={timestampStyle}>{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <button type="button" onClick={handleMarkRead} style={markReadButtonStyle}>
          Mark as read
        </button>
      )}
    </li>
  )
}

export function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading notifications…</div>
      </div>
    )
  }

  const sorted = [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Notifications</h1>

        {sorted.length === 0 ? (
          <p style={emptyStyle}>You have no notifications yet.</p>
        ) : (
          <ul style={listStyle}>
            {sorted.map((n) => (
              <NotificationRow key={n.id} notification={n} onMarkRead={markAsRead} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
