import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Logo } from './ui/Logo'
import { Badge } from './ui/Badge'
import { useAuthContext } from '../context/AuthContext'
import { useLogout } from '../hooks/useAuth'
import { fetchNotifications } from '../api/notifications'

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'var(--color-bg-page)',
  borderBottom: '1px solid var(--color-border-subtle)',
  backdropFilter: 'blur(8px)',
}

const innerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  height: '64px',
  maxWidth: '1280px',
  margin: '0 auto',
  width: '100%',
}

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
}

const wordmarkStyle: React.CSSProperties = {
  fontFamily: 'var(--type-hero)',
  fontSize: '20px',
  letterSpacing: '0.08em',
  color: 'var(--color-text-primary)',
  lineHeight: 1,
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const navLinkBase: React.CSSProperties = {
  fontFamily: 'var(--type-button)',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  textDecoration: 'none',
  transition: 'color var(--motion-hover)',
  padding: '4px 0',
  borderBottom: '2px solid transparent',
}

const navLinkActiveStyle: React.CSSProperties = {
  color: 'var(--color-text-accent)',
  borderBottomColor: 'var(--color-border-accent)',
}

const skipLinkStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-100px',
  left: '16px',
  padding: '8px 16px',
  background: 'var(--color-action-primary)',
  color: 'var(--color-action-primary-text)',
  fontFamily: 'var(--type-button)',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: 'var(--radius-button)',
  zIndex: 9999,
  textDecoration: 'none',
  transition: 'top var(--motion-hover)',
}

const hamburgerStyle: React.CSSProperties = {
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  color: 'var(--color-text-primary)',
  flexDirection: 'column',
  gap: '5px',
  alignItems: 'center',
  justifyContent: 'center',
}

const barStyle: React.CSSProperties = {
  display: 'block',
  width: '22px',
  height: '2px',
  background: 'var(--color-text-primary)',
  borderRadius: '2px',
  transition: 'transform var(--motion-hover), opacity var(--motion-hover)',
}

const mobileNavStyle: React.CSSProperties = {
  position: 'absolute',
  top: '64px',
  left: 0,
  right: 0,
  background: 'var(--color-bg-page)',
  borderBottom: '1px solid var(--color-border-subtle)',
  padding: '16px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  listStyle: 'none',
  margin: 0,
  zIndex: 99,
}

const mobileNavLinkBase: React.CSSProperties = {
  fontFamily: 'var(--type-button)',
  fontSize: '16px',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  textDecoration: 'none',
  padding: '12px 0',
  display: 'block',
  borderBottom: '1px solid var(--color-border-subtle)',
  transition: 'color var(--motion-hover)',
}

const mobileNavLinkActiveStyle: React.CSSProperties = {
  color: 'var(--color-text-accent)',
}

const logoutButtonStyle: React.CSSProperties = {
  ...navLinkBase,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
}

const mobileLogoutButtonStyle: React.CSSProperties = {
  ...mobileNavLinkBase,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
}

const cssOverrides = `
  .mmf-skip-link:focus {
    top: 16px !important;
    outline: 2px solid var(--color-action-primary-hover);
    outline-offset: 2px;
  }
  .mmf-hamburger {
    display: none !important;
  }
  @media (max-width: 768px) {
    .mmf-desktop-nav {
      display: none !important;
    }
    .mmf-hamburger {
      display: flex !important;
    }
  }
  .mmf-nav-link:focus-visible,
  .mmf-mobile-nav-link:focus-visible {
    outline: 2px solid var(--color-action-primary-hover);
    outline-offset: 2px;
    border-radius: 2px;
  }
`

let headerStyleInjected = false
function ensureHeaderStyle() {
  if (headerStyleInjected || typeof document === 'undefined') return
  headerStyleInjected = true
  const el = document.createElement('style')
  el.textContent = cssOverrides
  document.head.appendChild(el)
}

const bellLinkStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: 'var(--color-text-secondary)',
  fontSize: '20px',
  lineHeight: 1,
  padding: '4px',
  transition: 'color var(--motion-hover)',
}

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-4px',
  right: '-6px',
  minWidth: '16px',
  height: '16px',
  padding: '0 4px',
  borderRadius: '8px',
  background: 'var(--color-status-error)',
  color: 'var(--color-text-on-accent)',
  fontSize: '10px',
  fontWeight: 700,
  lineHeight: '16px',
  textAlign: 'center',
}

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  })
  const unreadCount = data?.filter((n) => !n.read).length ?? 0

  return (
    <Link
      to="/notifications"
      style={bellLinkStyle}
      aria-label={`Notifications (${unreadCount} unread)`}
    >
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
      {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
    </Link>
  )
}

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About', end: false },
  { to: '/contact', label: 'Contact', end: false },
  { to: '/campaigns', label: 'Explore Missions', end: false },
]

export function Header() {
  ensureHeaderStyle()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuthContext()
  const { mutate: logoutMutate } = useLogout()

  const isAdmin = user?.role === 'Administrator' || user?.role === 'SuperAdministrator'
  const isReviewer = user?.role === 'Reviewer'

  return (
    <header style={headerStyle}>
      <a href="#main-content" className="mmf-skip-link" style={skipLinkStyle}>
        Skip to main content
      </a>
      <div style={innerStyle}>
        <Link to="/" style={brandStyle}>
          <Logo size="sm" />
          <span style={wordmarkStyle}>MARS MISSION FUND</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="mmf-desktop-nav">
          <ul style={navStyle}>
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className="mmf-nav-link"
                  style={({ isActive }) => ({
                    ...navLinkBase,
                    ...(isActive ? navLinkActiveStyle : {}),
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {!isAuthenticated && (
              <li>
                <NavLink
                  to="/login"
                  className="mmf-nav-link"
                  style={({ isActive }) => ({
                    ...navLinkBase,
                    ...(isActive ? navLinkActiveStyle : {}),
                  })}
                >
                  Log in
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <>
                {isReviewer && (
                  <li>
                    <NavLink
                      to="/review"
                      className="mmf-nav-link"
                      style={({ isActive }) => ({
                        ...navLinkBase,
                        ...(isActive ? navLinkActiveStyle : {}),
                      })}
                    >
                      Review Queue
                    </NavLink>
                  </li>
                )}
                {isAdmin && (
                  <>
                    <li>
                      <NavLink
                        to="/admin/milestones"
                        className="mmf-nav-link"
                        style={({ isActive }) => ({
                          ...navLinkBase,
                          ...(isActive ? navLinkActiveStyle : {}),
                        })}
                      >
                        Milestones
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/admin/cancellations"
                        className="mmf-nav-link"
                        style={({ isActive }) => ({
                          ...navLinkBase,
                          ...(isActive ? navLinkActiveStyle : {}),
                        })}
                      >
                        Cancellations
                      </NavLink>
                    </li>
                  </>
                )}
                <li>
                  <NavLink
                    to="/profile"
                    className="mmf-nav-link"
                    style={({ isActive }) => ({
                      ...navLinkBase,
                      ...(isActive ? navLinkActiveStyle : {}),
                    })}
                  >
                    {user?.displayName ?? 'Profile'}
                  </NavLink>
                </li>
                {isAdmin && (
                  <li>
                    <Badge variant="accent">Admin</Badge>
                  </li>
                )}
                <li>
                  <NotificationBell />
                </li>
                <li>
                  <button
                    className="mmf-nav-link"
                    style={logoutButtonStyle}
                    onClick={() => logoutMutate()}
                  >
                    Log out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Hamburger button */}
        <button
          className="mmf-hamburger"
          style={hamburgerStyle}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="mmf-mobile-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span style={barStyle} />
          <span style={barStyle} />
          <span style={barStyle} />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <ul id="mmf-mobile-nav" style={mobileNavStyle}>
          {navLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className="mmf-mobile-nav-link"
                style={({ isActive }) => ({
                  ...mobileNavLinkBase,
                  ...(isActive ? mobileNavLinkActiveStyle : {}),
                })}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
          {!isAuthenticated && (
            <li>
              <NavLink
                to="/login"
                className="mmf-mobile-nav-link"
                style={({ isActive }) => ({
                  ...mobileNavLinkBase,
                  ...(isActive ? mobileNavLinkActiveStyle : {}),
                })}
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </NavLink>
            </li>
          )}
          {isAuthenticated && (
            <>
              {isReviewer && (
                <li>
                  <NavLink
                    to="/review"
                    className="mmf-mobile-nav-link"
                    style={({ isActive }) => ({
                      ...mobileNavLinkBase,
                      ...(isActive ? mobileNavLinkActiveStyle : {}),
                    })}
                    onClick={() => setMobileOpen(false)}
                  >
                    Review Queue
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <NavLink
                      to="/admin/milestones"
                      className="mmf-mobile-nav-link"
                      style={({ isActive }) => ({
                        ...mobileNavLinkBase,
                        ...(isActive ? mobileNavLinkActiveStyle : {}),
                      })}
                      onClick={() => setMobileOpen(false)}
                    >
                      Milestones
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/cancellations"
                      className="mmf-mobile-nav-link"
                      style={({ isActive }) => ({
                        ...mobileNavLinkBase,
                        ...(isActive ? mobileNavLinkActiveStyle : {}),
                      })}
                      onClick={() => setMobileOpen(false)}
                    >
                      Cancellations
                    </NavLink>
                  </li>
                </>
              )}
              <li>
                <NavLink
                  to="/profile"
                  className="mmf-mobile-nav-link"
                  style={({ isActive }) => ({
                    ...mobileNavLinkBase,
                    ...(isActive ? mobileNavLinkActiveStyle : {}),
                  })}
                  onClick={() => setMobileOpen(false)}
                >
                  {user?.displayName ?? 'Profile'}
                </NavLink>
              </li>
              {isAdmin && (
                <li
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <Badge variant="accent">Admin</Badge>
                </li>
              )}
              <li
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <NotificationBell />
              </li>
              <li>
                <button
                  className="mmf-mobile-nav-link"
                  style={mobileLogoutButtonStyle}
                  onClick={() => {
                    logoutMutate()
                    setMobileOpen(false)
                  }}
                >
                  Log out
                </button>
              </li>
            </>
          )}
        </ul>
      )}
    </header>
  )
}
