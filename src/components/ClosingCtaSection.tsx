import { Button } from './ui/Button'

export function ClosingCtaSection() {
  return (
    <section
      aria-label="Closing call to action"
      style={{
        background: 'var(--gradient-surface-card)',
        padding: '6rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, var(--text-section-heading))',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            lineHeight: 1.05,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            margin: '0 0 1.5rem',
          }}
        >
          Ready to back
          <br />
          <span style={{ color: 'var(--color-text-accent)' }}>humanity's future?</span>
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            margin: '0 auto 2.5rem',
            maxWidth: '480px',
          }}
        >
          Every mission starts with a single backer. Join thousands of supporters funding
          the next generation of space exploration.
        </p>

        <Button variant="secondary">Explore All Missions</Button>
      </div>
    </section>
  )
}
