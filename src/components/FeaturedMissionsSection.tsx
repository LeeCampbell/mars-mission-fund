import { SectionLabel } from './ui/SectionLabel'
import { MissionCard } from './MissionCard'

const missions = [
  {
    title: 'Artemis Lunar Gateway',
    description:
      'Establishing a sustainable human presence in lunar orbit — the first deep-space outpost enabling long-duration missions to the Moon and beyond.',
    badge: 'active' as const,
    badgeLabel: 'Lunar',
    progress: 72,
    fundingStatus: '$17.3M raised of $24M goal',
    buttonLabel: 'Back This Mission',
  },
  {
    title: 'Mars Ascent Vehicle',
    description:
      'Engineering the rocket that will lift the first Mars samples — and eventually crew — off the Martian surface and into orbit for the journey home.',
    badge: 'new' as const,
    badgeLabel: 'Mars',
    progress: 31,
    fundingStatus: '$4.7M raised of $15M goal',
    buttonLabel: 'Back This Mission',
  },
  {
    title: 'Orbital Debris Sweeper',
    description:
      'Deploying a next-generation capture system to clear low-Earth orbit of debris and safeguard the satellites that underpin modern civilization.',
    badge: 'funded' as const,
    badgeLabel: 'Orbital',
    progress: 85,
    fundingStatus: '$8.5M raised of $10M goal',
    buttonLabel: 'View Mission',
  },
]

export function FeaturedMissionsSection() {
  return (
    <section
      aria-label="Featured Missions"
      style={{
        padding: '5rem 1.5rem',
        backgroundColor: 'var(--color-surface-base)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionLabel number="03" title="ACTIVE MISSIONS" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1.5rem',
          }}
          className="featured-missions-grid"
        >
          <style>{`
            @media (min-width: 768px) {
              .featured-missions-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (min-width: 1024px) {
              .featured-missions-grid { grid-template-columns: repeat(3, 1fr) !important; }
            }
          `}</style>
          {missions.map((mission) => (
            <MissionCard
              key={mission.title}
              title={mission.title}
              description={mission.description}
              badge={mission.badge}
              badgeLabel={mission.badgeLabel}
              progress={mission.progress}
              fundingStatus={mission.fundingStatus}
              buttonLabel={mission.buttonLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
