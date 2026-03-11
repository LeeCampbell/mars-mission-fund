import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications'
import type { Notification } from '@mmf/shared'

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
  margin: '0 0 var(--space-6)',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-4)',
  padding: 'var(--space-4)',
  borderBottom: '1px solid var(--color-border-subtle)',
  background: 'var(--color-bg-surface)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: 'var(--space-3)',
}

const itemReadStyle: React.CSSProperties = {
  ...itemStyle,
  opacity: 0.6,
}

const notifTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-1)',
}

const notifBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-1)',
}

const notifTimeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
}

const markReadButtonStyle: React.CSSProperties = {
  flexShrink: 0,
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-accent-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const markReadButtonDisabledStyle: React.CSSProperties = {
  ...markReadButtonStyle,
  background: 'var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
  cursor: 'not-allowed',
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
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NotificationItem({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  isMarking: boolean
}) {
  return (
    <li style={notification.isRead ? itemReadStyle : itemStyle}>
      <div>
        <p style={notifTitleStyle}>{notification.title}</p>
        <p style={notifBodyStyle}>{notification.body}</p>
        <span style={notifTimeStyle}>{formatDate(notification.createdAt)}</span>
      </div>
      <button
        style={notification.isRead ? markReadButtonDisabledStyle : markReadButtonStyle}
        onClick={() => onMarkRead(notification.id)}
        disabled={notification.isRead || isMarking}
        aria-label="Mark as read"
      >
        {notification.isRead ? 'Read' : 'Mark as read'}
      </button>
    </li>
  )
}

export function NotificationsPage() {
  const { data: notifications, isLoading, isError } = useNotifications()
  const markReadMutation = useMarkNotificationRead()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading notifications…</div>
      </div>
    )
  }

  if (isError || !notifications) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load notifications. Please try again.</div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Notifications</h1>
        {notifications.length === 0 ? (
          <div style={emptyStyle}>No notifications yet.</div>
        ) : (
          <ul style={listStyle}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                isMarking={markReadMutation.isPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
