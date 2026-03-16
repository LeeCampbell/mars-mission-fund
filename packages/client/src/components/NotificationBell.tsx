import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '../api/notifications'

const containerStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
}

const bellButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-button)',
  position: 'relative',
  transition: 'color var(--motion-hover)',
}

const badgeStyle: CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0',
  background: 'var(--color-text-accent)',
  color: 'var(--color-bg-page)',
  borderRadius: '999px',
  fontSize: '10px',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 3px',
  lineHeight: 1,
  pointerEvents: 'none',
}

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '340px',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-card)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  zIndex: 200,
  overflow: 'hidden',
}

const dropdownHeaderStyle: CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--color-border-subtle)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const listStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  maxHeight: '360px',
  overflowY: 'auto',
}

function getItemStyle(read: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    padding: 'var(--space-3) var(--space-4)',
    borderBottom: '1px solid var(--color-border-subtle)',
    borderLeft: read ? '3px solid transparent' : '3px solid var(--color-text-accent)',
    cursor: 'pointer',
    background: read ? 'transparent' : 'rgba(var(--color-accent-rgb, 255,140,0),0.04)',
    transition: 'background 0.12s',
  }
}

const itemTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const itemTitleReadStyle: CSSProperties = {
  ...itemTitleStyle,
  fontWeight: 400,
  color: 'var(--color-text-secondary)',
}

const itemMessageStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const itemTimeStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const emptyStyle: CSSProperties = {
  padding: 'var(--space-6) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
}

const viewAllStyle: CSSProperties = {
  display: 'block',
  padding: 'var(--space-3) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-accent)',
  textAlign: 'center',
  textDecoration: 'none',
  borderTop: '1px solid var(--color-border-subtle)',
  fontWeight: 500,
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

function DropdownItem({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onClose: () => void
}) {
  const navigate = useNavigate()

  function handleClick() {
    if (!notification.read) {
      onMarkRead(notification.id)
    }
    onClose()
    if (notification.campaignId) {
      void navigate(`/campaigns/${notification.campaignId}`)
    }
  }

  return (
    <li onClick={handleClick} style={getItemStyle(notification.read)}>
      <span style={notification.read ? itemTitleReadStyle : itemTitleStyle}>
        {notification.title}
      </span>
      <span style={itemMessageStyle}>{notification.message}</span>
      <span style={itemTimeStyle}>{formatRelativeTime(notification.createdAt)}</span>
    </li>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead } = useNotifications()

  const recent = [...notifications]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return (
    <div ref={containerRef} style={containerStyle}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        style={bellButtonStyle}
        onClick={() => setOpen((o) => !o)}
      >
        {/* Bell SVG */}
        <svg
          width="20"
          height="20"
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
        {unreadCount > 0 && (
          <span style={badgeStyle} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>Notifications</div>
          {recent.length === 0 ? (
            <p style={emptyStyle}>No notifications yet.</p>
          ) : (
            <ul style={listStyle}>
              {recent.map((n) => (
                <DropdownItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onClose={() => setOpen(false)}
                />
              ))}
            </ul>
          )}
          <Link to="/notifications" style={viewAllStyle} onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
