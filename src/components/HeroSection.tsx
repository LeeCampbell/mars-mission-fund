import { Button } from './ui/Button';

const HERO_CSS = `
  .mmf-hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    background: var(--gradient-hero);
    overflow: hidden;
    padding: var(--space-16, 4rem) var(--space-6, 1.5rem);
    text-align: center;
  }

  .mmf-hero-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      ellipse 60% 40% at 50% 60%,
      var(--color-action-primary-shadow) 0%,
      transparent 70%
    );
  }

  .mmf-hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6, 1.5rem);
    max-width: 56rem;
    width: 100%;
  }

  .mmf-hero-eyebrow {
    font-family: var(--font-family-body);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-accent);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    margin: 0;
  }

  .mmf-hero-heading {
    font-family: var(--font-family-display);
    font-size: 3rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-hero);
    line-height: 1;
    margin: 0;
  }

  .mmf-hero-subtext {
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    max-width: 38rem;
    margin: 0;
  }

  @media (min-width: 768px) {
    .mmf-hero-heading {
      font-size: 4.5rem;
    }
  }

  @media (min-width: 1280px) {
    .mmf-hero-heading {
      font-size: 6rem;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    @keyframes mmf-hero-glow-pulse {
      0%, 100% {
        opacity: 0.7;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.08);
      }
    }

    .mmf-hero-glow {
      animation: mmf-hero-glow-pulse 6000ms ease-in-out infinite;
    }
  }
`;

export function HeroSection() {
  return (
    <>
      <style href="mmf-hero" precedence="component">
        {HERO_CSS}
      </style>
      <section className="mmf-hero" aria-label="Hero">
        <div className="mmf-hero-glow" aria-hidden="true" />
        <div className="mmf-hero-content">
          <p className="mmf-hero-eyebrow">Mars Mission Fund</p>
          <h1 className="mmf-hero-heading">
            Fund the Future of Human Space Exploration
          </h1>
          <p className="mmf-hero-subtext">
            Back breakthrough science missions that push humanity beyond Earth.
            Every contribution accelerates our path to Mars.
          </p>
          <Button variant="primary" href="/missions">
            Explore Missions
          </Button>
        </div>
      </section>
    </>
  );
}
