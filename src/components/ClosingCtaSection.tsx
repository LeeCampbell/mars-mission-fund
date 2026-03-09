import { Button } from './ui/Button';

const CLOSING_CTA_CSS = `
  .mmf-closing-cta {
    background: var(--gradient-surface-card);
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
    text-align: center;
  }

  .mmf-closing-cta-inner {
    max-width: 48rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6, 1.5rem);
  }

  .mmf-closing-cta-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-heading);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-closing-cta-body {
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }
`;

export function ClosingCtaSection() {
  return (
    <>
      <style href="mmf-closing-cta" precedence="component">
        {CLOSING_CTA_CSS}
      </style>
      <section className="mmf-closing-cta" aria-label="Get started">
        <div className="mmf-closing-cta-inner">
          <h2 className="mmf-closing-cta-heading">
            Ready to Back a Mission?
          </h2>
          <p className="mmf-closing-cta-body">
            Join thousands of supporters funding the next chapter of human
            exploration. Every contribution brings us one step closer to Mars.
          </p>
          <Button variant="secondary" href="/missions">
            Browse All Missions
          </Button>
        </div>
      </section>
    </>
  );
}
