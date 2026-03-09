import { SectionLabel } from './ui/SectionLabel'
import { Card } from './ui/Card'

const steps = [
  {
    number: '01',
    title: 'Browse Missions',
    description:
      'Explore active space missions across agencies. Filter by category, funding stage, or launch timeline.',
  },
  {
    number: '02',
    title: 'Back a Mission',
    description:
      'Choose your contribution level and back a mission you believe in. Every dollar goes directly to mission funding.',
  },
  {
    number: '03',
    title: 'Track Progress',
    description:
      'Follow real-time updates on your backed missions — from development milestones to successful launches.',
  },
]

export function HowItWorksSection() {
  return (
    <section
      aria-label="How It Works"
      style={{
        padding: '5rem 1.5rem',
        backgroundColor: 'var(--color-surface-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionLabel number="02" title="HOW IT WORKS" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1.5rem',
          }}
          className="how-it-works-grid"
        >
          <style>{`
            @media (min-width: 1024px) {
              .how-it-works-grid { grid-template-columns: repeat(3, 1fr) !important; }
            }
          `}</style>
          {steps.map((step) => (
            <Card key={step.number} accent>
              <div style={{ padding: '2rem' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-accent)',
                    margin: '0 0 1rem 0',
                    letterSpacing: 'var(--tracking-wide)',
                  }}
                >
                  {step.number}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--type-section-heading)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 0.75rem 0',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    lineHeight: '1.6',
                  }}
                >
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
