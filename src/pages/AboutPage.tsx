import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';

const ABOUT_CSS = `
  .mmf-about-section {
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
  }

  .mmf-about-section:nth-child(odd) {
    background: var(--color-surface-elevated);
  }

  .mmf-about-section:nth-child(even) {
    background: var(--color-bg-base);
  }

  .mmf-about-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-10, 2.5rem);
  }

  .mmf-about-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-about-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-about-body {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
    max-width: 56rem;
  }

  /* Problem / Solution two-column layout */
  .mmf-about-problem-solution {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6, 1.5rem);
  }

  @media (min-width: 1024px) {
    .mmf-about-problem-solution {
      grid-template-columns: 1fr 1fr;
    }
  }

  .mmf-about-card-content {
    padding: var(--space-6, 1.5rem);
  }

  .mmf-about-card-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    margin: 0 0 var(--space-3, 0.75rem) 0;
  }

  .mmf-about-card-body {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }

  /* Principles 5-card grid */
  .mmf-about-principles-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 640px) {
    .mmf-about-principles-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .mmf-about-principles-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .mmf-about-principles-grid > :last-child {
      grid-column: 2 / 3;
    }
  }

  .mmf-about-principle-title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .mmf-about-principle-body {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }

  /* Personas 4-card grid */
  .mmf-about-personas-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 768px) {
    .mmf-about-personas-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .mmf-about-personas-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .mmf-about-persona-role {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-section-label);
    letter-spacing: var(--letter-spacing-section-label);
    color: var(--color-text-accent);
    text-transform: uppercase;
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .mmf-about-persona-title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .mmf-about-persona-need {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }
`;

const PRINCIPLES = [
  {
    title: 'Security as Foundation',
    body: 'Every line of code, every workflow, every integration is built on a security-first architecture. In a financial platform, trust is not a feature — it is the product.',
  },
  {
    title: 'Transparency as Currency',
    body: 'Backers see exactly where their money goes. Projects report milestones publicly. The platform itself is auditable and explainable.',
  },
  {
    title: 'Accessibility Over Exclusivity',
    body: 'A $50 contribution and a $50,000 institutional commitment both matter. The platform democratises access to space funding.',
  },
  {
    title: 'Curation Over Volume',
    body: 'We are not a marketplace for everything. Every project is reviewed, vetted, and approved before going live. Quality over quantity.',
  },
  {
    title: 'Bold but Responsible',
    body: 'Our brand is bold and optimistic, but our financial systems are cautious and compliant. We speak like engineers who dream big and build carefully.',
  },
];

const PERSONAS = [
  {
    role: 'Mission Backers',
    title: 'Everyday Investors',
    need: 'Transparency, trust, and a tangible connection to the missions they fund — starting from as little as $50.',
  },
  {
    role: 'Project Creators',
    title: 'Engineers & Scientists',
    need: 'A credible platform to raise capital, gain visibility, and prove the viability of their Mars-enabling technology.',
  },
  {
    role: 'Institutional Partners',
    title: 'Agencies & Sponsors',
    need: 'Due diligence, compliance, and aggregated deal flow for strategic co-investment in space programmes.',
  },
  {
    role: 'Platform Administrators',
    title: 'Internal Team',
    need: 'Efficient review workflows, robust access control, and complete audit trails for platform integrity.',
  },
];

export default function AboutPage() {
  return (
    <>
      <style href="mmf-about" precedence="component">
        {ABOUT_CSS}
      </style>

      {/* Section 01 — Mission Statement */}
      <section className="mmf-about-section" aria-labelledby="about-mission-heading">
        <div className="mmf-about-inner">
          <div className="mmf-about-header">
            <SectionLabel number={1} label="Our Mission" />
            <h1 id="about-mission-heading" className="mmf-about-heading">
              Crowdfunding the Next Giant Leap
            </h1>
          </div>
          <p className="mmf-about-body">
            Mars Mission Fund exists to become the world's most trusted platform for collectively
            funding humanity's journey to Mars — turning everyday investors into mission backers who
            power the engineering, science, and infrastructure that will make interplanetary life
            possible.
          </p>
          <p className="mmf-about-body">
            To build and operate a secure, regulation-ready crowdfunding platform that enables vetted
            Mars-mission projects to raise capital from a global community of backers — with
            institutional-grade security, transparent governance, and an experience that makes complex
            financial participation feel as immediate as a countdown to launch.
          </p>
        </div>
      </section>

      {/* Section 02 — Problem / Solution */}
      <section className="mmf-about-section" aria-labelledby="about-problem-heading">
        <div className="mmf-about-inner">
          <div className="mmf-about-header">
            <SectionLabel number={2} label="The Problem We Solve" />
            <h2 id="about-problem-heading" className="mmf-about-heading">
              Bridging Capital and Ambition
            </h2>
          </div>
          <div className="mmf-about-problem-solution">
            <Card accent>
              <div className="mmf-about-card-content">
                <h3 className="mmf-about-card-heading">The Problem</h3>
                <p className="mmf-about-card-body">
                  Space exploration has historically been the domain of nation-states and a handful
                  of billionaire-backed ventures. The result is a bottleneck: brilliant teams with
                  viable Mars-enabling technologies struggle to find funding, while millions of people
                  who care deeply about humanity's future have no meaningful way to contribute capital
                  toward specific missions.
                </p>
              </div>
            </Card>
            <Card accent>
              <div className="mmf-about-card-content">
                <h3 className="mmf-about-card-heading">Our Solution</h3>
                <p className="mmf-about-card-body">
                  Mars Mission Fund bridges this gap by creating a secure, transparent, and
                  purpose-built crowdfunding platform exclusively focused on Mars-bound projects. We
                  give capital a direction and give ambition a launchpad — connecting vetted
                  mission teams with a global community of backers ready to fund the future.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 03 — Principles */}
      <section className="mmf-about-section" aria-labelledby="about-principles-heading">
        <div className="mmf-about-inner">
          <div className="mmf-about-header">
            <SectionLabel number={3} label="Our Principles" />
            <h2 id="about-principles-heading" className="mmf-about-heading">
              How We Build and Why
            </h2>
          </div>
          <div className="mmf-about-principles-grid">
            {PRINCIPLES.map((principle) => (
              <Card key={principle.title} accent>
                <div className="mmf-about-card-content">
                  <h3 className="mmf-about-principle-title">{principle.title}</h3>
                  <p className="mmf-about-principle-body">{principle.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 04 — Personas */}
      <section className="mmf-about-section" aria-labelledby="about-personas-heading">
        <div className="mmf-about-inner">
          <div className="mmf-about-header">
            <SectionLabel number={4} label="Who We Serve" />
            <h2 id="about-personas-heading" className="mmf-about-heading">
              Built for Every Stakeholder
            </h2>
          </div>
          <div className="mmf-about-personas-grid">
            {PERSONAS.map((persona) => (
              <Card key={persona.role}>
                <div className="mmf-about-card-content">
                  <p className="mmf-about-persona-role">{persona.role}</p>
                  <h3 className="mmf-about-persona-title">{persona.title}</h3>
                  <p className="mmf-about-persona-need">{persona.need}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
