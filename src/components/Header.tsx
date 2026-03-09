import { useState } from 'react';
import { NavLink } from 'react-router';
import { Logo } from './ui/Logo';

const headerStyles = `
  .skip-link {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .skip-link:focus-visible {
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: nowrap;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 200;
    background: var(--color-bg-surface);
    color: var(--color-text-primary);
    border: 2px solid var(--color-border-accent);
    border-radius: var(--radius-button);
    font-family: var(--font-family-body);
    font-size: var(--font-size-body-small);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
  }
  .header-nav-link {
    color: var(--color-text-secondary);
    font-family: var(--font-family-body);
    font-size: var(--font-size-button);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-button);
    text-decoration: none;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid transparent;
    transition: color var(--motion-hover), border-color var(--motion-hover);
  }
  .header-nav-link:hover {
    color: var(--color-text-primary);
  }
  .header-nav-link.active {
    color: var(--color-border-accent);
    border-bottom-color: var(--color-border-accent);
  }
  .header-nav-link:focus-visible {
    outline: 2px solid var(--color-border-accent);
    outline-offset: 4px;
    border-radius: 2px;
  }
  .header-desktop-nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  .header-hamburger {
    display: none;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-badge);
    color: var(--color-text-secondary);
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    transition: color var(--motion-hover), border-color var(--motion-hover);
  }
  .header-hamburger:hover {
    color: var(--color-text-primary);
    border-color: var(--color-border-emphasis);
  }
  .header-hamburger:focus-visible {
    outline: 2px solid var(--color-border-accent);
    outline-offset: 2px;
  }
  @media (max-width: 767px) {
    .header-desktop-nav {
      display: none;
    }
    .header-hamburger {
      display: flex;
    }
  }
`;

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `header-nav-link${isActive ? ' active' : ''}`;

  return (
    <header
      style={{
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <style>{headerStyles}</style>

      {/* Skip to content — first focusable element per L3-005 */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo + Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size="sm" />
          <span
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-card-title)',
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--letter-spacing-section-heading)',
              lineHeight: 1,
            }}
          >
            MARS MISSION FUND
          </span>
        </div>

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="header-desktop-nav">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Hamburger toggle — mobile only */}
        <button
          className="header-hamburger"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav"
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            {mobileNavOpen ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileNavOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main navigation"
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={() => setMobileNavOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={navLinkClass}
            onClick={() => setMobileNavOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={navLinkClass}
            onClick={() => setMobileNavOpen(false)}
          >
            Contact
          </NavLink>
        </nav>
      )}
    </header>
  );
}
