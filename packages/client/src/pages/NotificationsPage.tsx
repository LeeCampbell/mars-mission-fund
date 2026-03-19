import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markNotificationRead } from '../api/notifications'
import type { Notification } from '../api/notifications'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '860px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-6)',
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

const markAllButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--color-accent-primary)',
  border: '1px solid var(--color-accent-primary)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
}

const itemBaseStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4) var(--space-5)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-4)',
}

const itemUnreadStyle: React.CSSProperties = {
  ...itemBaseStyle,
  borderLeftWidth: '4px',
  borderLeftColor: 'var(--color-accent-primary)',
}

const itemBodyStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const itemTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-1)',
}

const itemMessageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-2)',
}

const itemMetaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
}

const unreadDotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--color-accent-primary)',
  marginRight: 'var(--space-2)',
  flexShrink: 0,
  marginTop: '6px',
}

const markReadButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--color-accent-primary)',
  border: '1px solid var(--color-accent-primary)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
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

function formatRelativeTime(createdAt: string): string {
  const now = Date.now()
  const then = new Date(createdAt).getTime()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return 'just now'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(createdAt)
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  const queryClient = useQueryClient()

  const { mutate: markRead, isPending } = useMutation({
    mutationFn: () => markNotificationRead(notification.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const itemStyle = notification.read ? itemBaseStyle : itemUnreadStyle

  return (
    <li style={itemStyle}>
      {!notification.read && <span style={unreadDotStyle} aria-hidden="true" />}
      <div style={itemBodyStyle}>
        <p style={itemTitleStyle}>{notification.title}</p>
        <p style={itemMessageStyle}>{notification.message}</p>
        <span style={itemMetaStyle}>{formatRelativeTime(notification.createdAt)}</span>
      </div>
      {!notification.read && (
        <button
          style={markReadButtonStyle}
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
  const queryClient = useQueryClient()

  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  useEffect(() => {
    document.title = 'Notifications — Mars Mission Fund'
  }, [])

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: async (unread: Notification[]) => {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

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

  const sorted = notifications
    ? [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  const unread = sorted.filter((n) => !n.read)
  const hasUnread = unread.length > 0

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={headerRowStyle}>
          <h1 style={headingStyle}>Notifications</h1>
          {hasUnread && (
            <button
              style={markAllButtonStyle}
              disabled={isMarkingAll}
              onClick={() => markAllRead(unread)}
            >
              {isMarkingAll ? 'Marking all…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <div style={emptyStyle}>No notifications yet.</div>
        ) : (
          <ul style={listStyle} aria-label="Notifications">
            {sorted.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
