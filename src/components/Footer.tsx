import { Link } from 'react-router';
import { Logo } from './ui/Logo';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '3rem 1.5rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Logo + tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: '200px',
          }}
        >
          <Logo size="md" />
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-body-small)',
              color: 'var(--color-text-tertiary)',
              margin: 0,
              maxWidth: '260px',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            Funding humanity's multiplanetary future.
          </p>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={{
                    fontFamily: 'var(--font-family-body)',
                    fontSize: 'var(--font-size-button)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    letterSpacing: 'var(--letter-spacing-button)',
                    transition: 'color var(--motion-hover)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'var(--color-text-secondary)';
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-body-small)',
            color: 'var(--color-text-tertiary)',
            margin: 0,
          }}
        >
          © 2026 Mars Mission Fund. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
