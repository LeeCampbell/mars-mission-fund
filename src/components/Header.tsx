import { useState } from 'react'
import { NavLink } from 'react-router'
import { Logo } from './ui/Logo'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Skip-to-content link — visually hidden until focused */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          const el = e.currentTarget
          el.style.left = '16px'
          el.style.top = '16px'
          el.style.width = 'auto'
          el.style.height = 'auto'
          el.style.overflow = 'visible'
          el.style.zIndex = '100'
          el.style.padding = '8px 16px'
          el.style.background = 'var(--color-action-primary)'
          el.style.color = 'var(--color-text-on-action)'
          el.style.borderRadius = 'var(--radius-button)'
          el.style.fontFamily = 'var(--font-body)'
          el.style.fontWeight = '600'
          el.style.textDecoration = 'none'
        }}
        onBlur={(e) => {
          const el = e.currentTarget
          el.style.left = '-9999px'
          el.style.top = 'auto'
          el.style.width = '1px'
          el.style.height = '1px'
          el.style.overflow = 'hidden'
          el.style.zIndex = ''
          el.style.padding = ''
          el.style.background = ''
          el.style.color = ''
          el.style.borderRadius = ''
          el.style.fontFamily = ''
          el.style.fontWeight = ''
          el.style.textDecoration = ''
        }}
      >
        Skip to main content
      </a>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size="sm" />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              letterSpacing: '0.05em',
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}
          >
            LAUNCHFIRE
          </span>
        </div>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          id="main-nav"
          style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
          className="header-nav"
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: isActive ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                paddingBottom: '2px',
                borderBottom: isActive
                  ? '2px solid var(--color-border-accent)'
                  : '2px solid transparent',
                transition: `color var(--motion-hover), border-color var(--motion-hover)`,
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--color-text-primary)',
          }}
          className="header-hamburger"
        >
          {menuOpen ? (
            /* X icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="header-mobile-nav"
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)',
                fontSize: '17px',
                fontWeight: 500,
                color: isActive ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                paddingLeft: '8px',
                borderLeft: isActive
                  ? '3px solid var(--color-border-accent)'
                  : '3px solid transparent',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-nav { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .header-mobile-nav { display: none !important; }
        }
      `}</style>
    </header>
  )
}
