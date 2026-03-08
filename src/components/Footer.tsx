import { Link } from 'react-router'
import { Logo } from './ui/Logo'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '48px 24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Logo + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size="sm" />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                letterSpacing: '0.05em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              LAUNCHFIRE
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-text-tertiary)',
                marginTop: '4px',
              }}
            >
              Ignite your campaign. Reach the stars.
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    transition: `color var(--motion-hover)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-tertiary)',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '24px',
          }}
        >
          &copy; {new Date().getFullYear()} Launchfire. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
