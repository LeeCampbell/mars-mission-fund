import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../hooks/useNotifications'
import { markNotificationAsRead } from '../api/notifications'
import { Badge } from '../components/ui/Badge'
import type { Notification } from '../api/notifications'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '900px',
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
  padding: 'var(--space-12) 0',
  textAlign: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const rowBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-4)',
  padding: 'var(--space-4)',
  borderBottom: '1px solid var(--color-border-subtle)',
  fontFamily: 'var(--font-body)',
}

const rowUnreadStyle: React.CSSProperties = {
  ...rowBaseStyle,
  background: 'var(--color-bg-card)',
  fontWeight: 600,
}

const rowContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-1)',
}

const messageStyle: React.CSSProperties = {
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-2)',
}

const dateStyle: React.CSSProperties = {
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  margin: 0,
}

const markReadButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const markReadButtonDisabledStyle: React.CSSProperties = {
  ...markReadButtonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function NotificationRow({ notification }: { notification: Notification }) {
  const queryClient = useQueryClient()

  const { mutate: markRead, isPending } = useMutation({
    mutationFn: () => markNotificationAsRead(notification.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const rowStyle = notification.read ? rowBaseStyle : rowUnreadStyle

  return (
    <li style={rowStyle}>
      <Badge variant="accent">{notification.type}</Badge>
      <div style={rowContentStyle}>
        <p style={titleStyle}>{notification.title}</p>
        <p style={messageStyle}>{notification.message}</p>
        <p style={dateStyle}>{dateFormatter.format(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <button
          style={isPending ? markReadButtonDisabledStyle : markReadButtonStyle}
          disabled={isPending}
          onClick={() => markRead()}
          aria-label={`Mark "${notification.title}" as read`}
        >
          {isPending ? 'Marking…' : 'Mark as read'}
        </button>
      )}
    </li>
  )
}

export function NotificationsPage() {
  const { data: notifications, isLoading, isError } = useNotifications()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle} role="status" aria-busy="true">
          Loading notifications…
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle} role="alert">
          Failed to load notifications. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Notifications</h1>

        {notifications && notifications.length === 0 && (
          <div style={emptyStyle}>No notifications.</div>
        )}

        {notifications && notifications.length > 0 && (
          <ul style={listStyle} aria-label="Notifications">
            {notifications.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
