import { SectionLabel } from './ui/SectionLabel'
import { StatCard } from './ui/StatCard'

const stats = [
  { label: 'Total Funded', value: '$24M', subtext: '+18% this quarter', subtextVariant: 'positive' as const },
  { label: 'Backers', value: '1,200', subtext: 'Active supporters', subtextVariant: 'neutral' as const },
  { label: 'Missions', value: '18', subtext: 'Across 3 agencies', subtextVariant: 'neutral' as const },
  { label: 'Launches', value: '3', subtext: 'Successfully completed', subtextVariant: 'positive' as const },
]

export function StatsSection() {
  return (
    <section
      aria-label="Platform Impact"
      style={{
        padding: '5rem 1.5rem',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionLabel number="01" title="PLATFORM IMPACT" />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '1.5rem',
        }}
        className="stats-grid"
      >
        <style>{`
          @media (min-width: 640px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (min-width: 1024px) {
            .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
        `}</style>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            subtext={stat.subtext}
            subtextVariant={stat.subtextVariant}
          />
        ))}
      </div>
    </section>
  )
}
