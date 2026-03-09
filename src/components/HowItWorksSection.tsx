import { Card } from './ui/Card';
import { SectionLabel } from './ui/SectionLabel';

const HOW_IT_WORKS_CSS = `
  .mmf-how {
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
    background: var(--color-surface-elevated);
  }

  .mmf-how-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-10, 2.5rem);
  }

  .mmf-how-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-how-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-how-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 1024px) {
    .mmf-how-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .mmf-how-step-number {
    font-size: var(--font-size-stat-value-compact);
    font-family: var(--font-family-display);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-accent);
    line-height: 1;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .mmf-how-step-title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .mmf-how-step-body {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
  }
`;

const STEPS = [
  {
    number: '01',
    title: 'Discover Missions',
    body: 'Browse vetted research projects from scientists and engineers working on humanity\'s most ambitious goal. Each mission is reviewed for scientific merit and feasibility.',
  },
  {
    number: '02',
    title: 'Back What Matters',
    body: 'Contribute to the missions that excite you. Your funds are held in escrow and released only when verified milestones are reached — protecting your investment.',
  },
  {
    number: '03',
    title: 'Track Real Progress',
    body: 'Follow mission updates, milestone completions, and scientific breakthroughs. See exactly how your contribution is advancing the path to Mars.',
  },
];

export function HowItWorksSection() {
  return (
    <>
      <style href="mmf-how" precedence="component">
        {HOW_IT_WORKS_CSS}
      </style>
      <section className="mmf-how" aria-labelledby="how-heading">
        <div className="mmf-how-inner">
          <div className="mmf-how-header">
            <SectionLabel number={2} label="How It Works" />
            <h2 id="how-heading" className="mmf-how-heading">
              Science You Can Trust. Progress You Can See.
            </h2>
          </div>
          <div className="mmf-how-grid">
            {STEPS.map((step) => (
              <Card key={step.number} accent>
                <div className="mmf-how-step-number">{step.number}</div>
                <h3 className="mmf-how-step-title">{step.title}</h3>
                <p className="mmf-how-step-body">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
