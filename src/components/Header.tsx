import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './ui/Logo';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-surface-header)',
        borderBottom: '1px solid var(--color-border-subtle)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Skip to content */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '1rem',
          padding: '0.5rem 1rem',
          background: 'var(--color-surface-header)',
          color: 'var(--color-text-accent)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-body-small)',
          textDecoration: 'none',
          borderRadius: 'var(--radius-badge)',
          border: '1px solid var(--color-border-accent)',
          zIndex: 200,
          transition: 'top var(--motion-hover)',
        }}
        onFocus={(e) => { e.currentTarget.style.top = '0.5rem'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-100%'; }}
      >
        Skip to content
      </a>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size="sm" />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-card-title)',
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--tracking-wide)',
              lineHeight: 1,
            }}
          >
            MARS MISSION FUND
          </span>
        </div>

        {/* Desktop nav */}
        <nav
          id="main-nav"
          aria-label="Main navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="header-desktop-nav"
        >
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-border-accent)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                borderBottom: isActive
                  ? '2px solid var(--color-border-accent)'
                  : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'color var(--motion-hover), border-color var(--motion-hover)',
                outline: 'none',
              })}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--color-border-accent)';
                e.currentTarget.style.outlineOffset = '4px';
                e.currentTarget.style.borderRadius = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger button — visible below 768px */}
        <button
          className="header-hamburger"
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setNavOpen((prev) => !prev)}
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-badge)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--color-border-accent)';
            e.currentTarget.style.outlineOffset = '4px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {navOpen ? (
            /* Close icon */
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav — visible below 768px when open */}
      {navOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main navigation"
          className="header-mobile-nav"
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setNavOpen(false)}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-border-accent)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: '0.5rem 0',
                borderLeft: isActive
                  ? '2px solid var(--color-border-accent)'
                  : '2px solid transparent',
                paddingLeft: '0.75rem',
                outline: 'none',
              })}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--color-border-accent)';
                e.currentTarget.style.outlineOffset = '4px';
                e.currentTarget.style.borderRadius = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
