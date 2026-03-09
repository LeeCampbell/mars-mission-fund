import { SectionLabel } from './ui/SectionLabel';
import { MissionCard } from './MissionCard';

const FEATURED_MISSIONS_CSS = `
  .mmf-featured {
    padding: var(--space-section-y, 5rem) var(--space-6, 1.5rem);
    background: var(--color-surface-base);
  }

  .mmf-featured-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-10, 2.5rem);
  }

  .mmf-featured-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .mmf-featured-heading {
    font-family: var(--font-family-display);
    font-size: var(--font-size-section-heading);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-display);
    line-height: 1.1;
    margin: 0;
  }

  .mmf-featured-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
    align-items: stretch;
  }

  @media (min-width: 768px) {
    .mmf-featured-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .mmf-featured-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`;

const MISSIONS = [
  {
    badge: 'active' as const,
    title: 'Closed-Loop Life Support for Deep Space Transit',
    description:
      'Developing a fully autonomous bioregenerative system that recycles air, water, and waste for crews on multi-year interplanetary missions — eliminating dependence on Earth resupply.',
    progress: 62,
    fundingText: '$1.24M raised of $2M goal',
    ctaLabel: 'Back This Mission',
  },
  {
    badge: 'funded' as const,
    title: 'High-Density Radiation Shielding Using Regolith Composites',
    description:
      'Pioneering lightweight shielding panels made from Martian regolith composites that protect against galactic cosmic rays and solar particle events during surface operations.',
    progress: 100,
    fundingText: '$3M fully funded — milestone 2 of 4 complete',
    ctaLabel: 'Follow Progress',
  },
  {
    badge: 'new' as const,
    title: 'In-Situ Propellant Production from Atmospheric CO₂',
    description:
      'Validating a compact Sabatier reactor that converts Martian CO₂ and subsurface water ice into methane and liquid oxygen, enabling return-trip fuel production on the surface.',
    progress: 18,
    fundingText: '$360K raised of $2M goal',
    ctaLabel: 'Back This Mission',
  },
];

export function FeaturedMissionsSection() {
  return (
    <>
      <style href="mmf-featured" precedence="component">
        {FEATURED_MISSIONS_CSS}
      </style>
      <section className="mmf-featured" aria-labelledby="featured-heading">
        <div className="mmf-featured-inner">
          <div className="mmf-featured-header">
            <SectionLabel number={3} label="Active Missions" />
            <h2 id="featured-heading" className="mmf-featured-heading">
              Missions That Move Humanity Forward
            </h2>
          </div>
          <div className="mmf-featured-grid">
            {MISSIONS.map((mission) => (
              <MissionCard key={mission.title} {...mission} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
