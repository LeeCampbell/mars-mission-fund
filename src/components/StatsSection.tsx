import { StatCard } from './ui/StatCard';
import { SectionLabel } from './ui/SectionLabel';

const STATS_CSS = `
  .mmf-stats {
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
    background: var(--color-surface-base);
  }

  .mmf-stats-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-10, 2.5rem);
  }

  .mmf-stats-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-stats-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 640px) {
    .mmf-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .mmf-stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

const STATS = [
  {
    label: 'Missions Funded',
    value: '47',
    subtext: 'Across 12 scientific disciplines',
  },
  {
    label: 'Total Raised',
    value: '$8.3M',
    subtext: 'From 14,000+ backers worldwide',
  },
  {
    label: 'Active Researchers',
    value: '312',
    subtext: 'In 28 countries',
  },
  {
    label: 'Success Rate',
    value: '91%',
    subtext: 'Missions reaching their goals',
  },
];

export function StatsSection() {
  return (
    <>
      <style href="mmf-stats" precedence="component">
        {STATS_CSS}
      </style>
      <section className="mmf-stats" aria-labelledby="stats-heading">
        <div className="mmf-stats-inner">
          <div className="mmf-stats-header">
            <SectionLabel number={1} label="Platform Impact" />
            <h2 id="stats-heading" className="mmf-stats-heading">
              Accelerating the Path to Mars
            </h2>
          </div>
          <div className="mmf-stats-grid" role="list" aria-label="Platform statistics">
            {STATS.map((stat) => (
              <div key={stat.label} role="listitem">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  subtext={stat.subtext}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
