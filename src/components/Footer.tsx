import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--color-surface-footer)',
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '3rem 1.5rem',
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
        className="footer-inner"
      >
        {/* Logo + Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Logo size="md" />
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-muted)',
              margin: 0,
              maxWidth: '280px',
            }}
          >
            Your stake. Their mission. Our planet.
          </p>
        </div>

        {/* Nav links + Copyright */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <nav aria-label="Footer navigation">
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--motion-hover)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid var(--color-border-accent)';
                      e.currentTarget.style.outlineOffset = '4px';
                      e.currentTarget.style.borderRadius = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-body-small)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            © {year} Mars Mission Fund. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
