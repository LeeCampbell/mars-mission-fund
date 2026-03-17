import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markNotificationRead } from '../api/notifications'
import type { Notification } from '../api/notifications'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-2-size)',
  fontWeight: 'var(--type-heading-2-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-2-spacing)',
  lineHeight: 'var(--type-heading-2-leading)',
  color: 'var(--color-text-primary)',
  margin: 0,
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  listStyle: 'none',
  padding: 0,
  margin: 0,
}

const itemStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-4)',
}

const itemUnreadStyle: React.CSSProperties = {
  ...itemStyle,
  borderLeftColor: 'var(--color-accent-primary)',
  borderLeftWidth: '3px',
}

const itemContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  flex: 1,
  minWidth: 0,
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
}

const messageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  display: 'flex',
  gap: 'var(--space-2)',
  alignItems: 'center',
}

const unreadDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '9999px',
  background: 'var(--color-accent-primary)',
  flexShrink: 0,
}

const markReadButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-16) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-tertiary)',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
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
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  return (
    <li style={notification.read ? itemStyle : itemUnreadStyle}>
      <div style={itemContentStyle}>
        <p style={titleStyle}>{notification.title}</p>
        <p style={messageStyle}>{notification.message}</p>
        <div style={metaStyle}>
          {!notification.read && <span style={unreadDotStyle} aria-label="Unread" />}
          <time dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time>
        </div>
      </div>
      {!notification.read && (
        <button style={markReadButtonStyle} onClick={() => onMarkRead(notification.id)}>
          Mark as read
        </button>
      )}
    </li>
  )
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  async function handleMarkRead(id: string) {
    await markNotificationRead(id)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const sorted = notifications
    ? [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Notifications</h1>

        {isLoading ? (
          <div role="status" aria-busy="true" style={emptyStateStyle}>
            Loading notifications…
          </div>
        ) : sorted.length === 0 ? (
          <div style={emptyStateStyle}>No notifications</div>
        ) : (
          <ul style={listStyle}>
            {sorted.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => void handleMarkRead(id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
