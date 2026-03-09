import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionLabel } from '../components/ui/SectionLabel';

const CONTACT_CSS = `
  .mmf-contact-section {
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
  }

  .mmf-contact-section:nth-child(odd) {
    background: var(--color-surface-elevated);
  }

  .mmf-contact-section:nth-child(even) {
    background: var(--color-bg-base);
  }

  .mmf-contact-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-10, 2.5rem);
  }

  .mmf-contact-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-contact-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-contact-subtext {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
    max-width: 48rem;
  }

  /* Contact cards grid */
  .mmf-contact-cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 640px) {
    .mmf-contact-cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .mmf-contact-cards-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .mmf-contact-card-content {
    padding: var(--space-6, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-contact-card-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-section-label);
    letter-spacing: var(--letter-spacing-section-label);
    color: var(--color-text-accent);
    text-transform: uppercase;
    margin: 0;
  }

  .mmf-contact-card-heading {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .mmf-contact-card-body {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }

  .mmf-contact-card-link {
    font-size: var(--font-size-body);
    color: var(--color-text-accent);
    text-decoration: none;
    word-break: break-all;
  }

  .mmf-contact-card-link:hover {
    text-decoration: underline;
  }

  .mmf-contact-card-link:focus-visible {
    outline: 2px solid var(--color-text-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Social links */
  .mmf-contact-social-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
  }
`;

export default function ContactPage() {
  return (
    <>
      <style href="mmf-contact" precedence="component">
        {CONTACT_CSS}
      </style>

      {/* Section 01 — Get in Touch */}
      <section className="mmf-contact-section" aria-labelledby="contact-touch-heading">
        <div className="mmf-contact-inner">
          <div className="mmf-contact-header">
            <SectionLabel number={1} label="Get in Touch" />
            <h1 id="contact-touch-heading" className="mmf-contact-heading">
              Contact Mars Mission Fund
            </h1>
            <p className="mmf-contact-subtext">
              Have a question, want to submit a project, or interested in institutional partnership?
              Reach out through any of the channels below.
            </p>
          </div>
          <div className="mmf-contact-cards-grid">
            <Card accent>
              <div className="mmf-contact-card-content">
                <p className="mmf-contact-card-label">General Enquiries</p>
                <h2 className="mmf-contact-card-heading">Say Hello</h2>
                <p className="mmf-contact-card-body">
                  For general questions about the platform, our mission, or how to get started.
                </p>
                <a
                  href="mailto:hello@marsmissionfund.org"
                  className="mmf-contact-card-link"
                  aria-label="Send email to hello@marsmissionfund.org"
                >
                  hello@marsmissionfund.org
                </a>
              </div>
            </Card>
            <Card accent>
              <div className="mmf-contact-card-content">
                <p className="mmf-contact-card-label">Project Submissions</p>
                <h2 className="mmf-contact-card-heading">Launch a Mission</h2>
                <p className="mmf-contact-card-body">
                  Researchers and engineers ready to submit a Mars-enabling project for review.
                </p>
                <a
                  href="mailto:projects@marsmissionfund.org"
                  className="mmf-contact-card-link"
                  aria-label="Send email to projects@marsmissionfund.org"
                >
                  projects@marsmissionfund.org
                </a>
              </div>
            </Card>
            <Card accent>
              <div className="mmf-contact-card-content">
                <p className="mmf-contact-card-label">Institutional Partners</p>
                <h2 className="mmf-contact-card-heading">Co-Invest at Scale</h2>
                <p className="mmf-contact-card-body">
                  Agencies, sponsors, and strategic investors interested in aggregated deal flow.
                </p>
                <a
                  href="mailto:partners@marsmissionfund.org"
                  className="mmf-contact-card-link"
                  aria-label="Send email to partners@marsmissionfund.org"
                >
                  partners@marsmissionfund.org
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 02 — Follow the Mission */}
      <section className="mmf-contact-section" aria-labelledby="contact-social-heading">
        <div className="mmf-contact-inner">
          <div className="mmf-contact-header">
            <SectionLabel number={2} label="Follow the Mission" />
            <h2 id="contact-social-heading" className="mmf-contact-heading">
              Stay in the Loop
            </h2>
            <p className="mmf-contact-subtext">
              Follow our open-source development, join the community, and track mission progress
              across our channels.
            </p>
          </div>
          <div className="mmf-contact-social-grid">
            <Button
              variant="ghost"
              href="https://github.com/marsmissionfund"
              aria-label="Visit Mars Mission Fund on GitHub"
            >
              GitHub — Open Source
            </Button>
            <Button
              variant="ghost"
              href="https://twitter.com/marsmissionfund"
              aria-label="Follow Mars Mission Fund on X (Twitter)"
            >
              X / Twitter
            </Button>
            <Button
              variant="ghost"
              href="https://linkedin.com/company/marsmissionfund"
              aria-label="Connect with Mars Mission Fund on LinkedIn"
            >
              LinkedIn
            </Button>
            <Button
              variant="ghost"
              href="https://discord.gg/marsmissionfund"
              aria-label="Join Mars Mission Fund on Discord"
            >
              Discord Community
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
