import { Card } from '../components/ui/Card'
import { SectionLabel } from '../components/ui/SectionLabel'

const principles = [
  {
    title: 'Security as Foundation',
    description:
      'Every line of code, every workflow, every integration is built on a security-first architecture. In a financial platform, trust is not a feature — it is the product.',
  },
  {
    title: 'Transparency as Currency',
    description:
      'Backers see exactly where their money goes. Projects report milestones publicly. The platform itself is auditable and explainable.',
  },
  {
    title: 'Accessibility Over Exclusivity',
    description:
      'A $50 contribution and a $50,000 institutional commitment both matter. The platform democratises access to space funding.',
  },
  {
    title: 'Curation Over Volume',
    description:
      'We are not a marketplace for everything. Every project is reviewed, vetted, and approved before going live. Quality over quantity.',
  },
  {
    title: 'Bold but Responsible',
    description:
      'Our brand is bold and optimistic, but our financial systems are cautious and compliant. We speak like engineers who dream big and build carefully.',
  },
]

const personas = [
  {
    title: 'Mission Backers',
    description:
      'Individuals who want to fund specific Mars projects with as little as $50.',
    need: 'Transparency, trust, and a tangible connection to the mission they fund.',
  },
  {
    title: 'Project Creators',
    description:
      'Engineers, scientists, and teams building Mars-enabling technology.',
    need: 'A credible platform to raise capital, gain visibility, and prove viability.',
  },
  {
    title: 'Institutional Partners',
    description:
      'Space agencies, research institutions, and corporate sponsors.',
    need: 'Due diligence, compliance, and aggregated deal flow for strategic co-investment.',
  },
  {
    title: 'Platform Administrators',
    description:
      'Internal team responsible for curation, compliance, and platform integrity.',
    need: 'Efficient review workflows, robust access control, and audit trails.',
  },
]

export function About() {
  return (
    <main>
      {/* Hero area */}
      <section
        aria-label="About Hero"
        style={{
          background: 'var(--gradient-hero)',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-label)',
              color: 'var(--color-text-accent)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Mars Mission Fund
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, var(--type-page-title))',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 0.95,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              margin: '0 0 1.5rem',
            }}
          >
            About Us
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            We exist to channel collective human ambition toward Mars — building the platform
            that turns everyday people into mission backers and bold ideas into funded realities.
          </p>
        </div>
      </section>

      {/* 01 — OUR MISSION */}
      <section
        aria-label="Our Mission"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-base)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="01" title="OUR MISSION" />
          </div>
          <div style={{ maxWidth: '760px' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              Mars Mission Fund exists to become the world's most trusted platform for collectively
              funding humanity's journey to Mars — turning everyday investors into mission backers
              who power the engineering, science, and infrastructure that will make interplanetary
              life possible.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
              }}
            >
              To build and operate a secure, regulation-ready crowdfunding platform that enables
              vetted Mars-mission projects to raise capital from a global community of backers —
              with institutional-grade security, transparent governance, and an experience that makes
              complex financial participation feel as immediate as a countdown to launch.
            </p>
          </div>
        </div>
      </section>

      {/* 02 — THE PROBLEM WE SOLVE */}
      <section
        aria-label="The Problem We Solve"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="02" title="THE PROBLEM WE SOLVE" />
          </div>
          <div style={{ maxWidth: '760px' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              Space exploration has historically been the domain of nation-states and a handful of
              billionaire-backed ventures. The result is a bottleneck: brilliant teams with viable
              Mars-enabling technologies struggle to find funding, while millions of people who care
              deeply about humanity's future have no meaningful way to contribute capital toward
              specific missions.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
              }}
            >
              Mars Mission Fund bridges this gap by creating a secure, transparent, and
              purpose-built crowdfunding platform exclusively focused on Mars-bound projects.
              We give capital a direction and give ambition a launchpad.
            </p>
          </div>
        </div>
      </section>

      {/* 03 — OUR PRINCIPLES */}
      <section
        aria-label="Our Principles"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-base)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="03" title="OUR PRINCIPLES" />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '1.5rem',
            }}
            className="principles-grid"
          >
            <style>{`
              @media (min-width: 768px) {
                .principles-grid { grid-template-columns: repeat(2, 1fr) !important; }
              }
              @media (min-width: 1024px) {
                .principles-grid { grid-template-columns: repeat(3, 1fr) !important; }
              }
            `}</style>
            {principles.map((principle) => (
              <Card key={principle.title} accent>
                <div style={{ padding: '2rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--type-section-heading)',
                      color: 'var(--color-text-primary)',
                      margin: '0 0 0.75rem 0',
                      textTransform: 'uppercase',
                    }}
                  >
                    {principle.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {principle.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — WHO WE SERVE */}
      <section
        aria-label="Who We Serve"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="04" title="WHO WE SERVE" />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '1.5rem',
            }}
            className="personas-grid"
          >
            <style>{`
              @media (min-width: 768px) {
                .personas-grid { grid-template-columns: repeat(2, 1fr) !important; }
              }
            `}</style>
            {personas.map((persona) => (
              <Card key={persona.title} accent>
                <div style={{ padding: '2rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--type-section-heading)',
                      color: 'var(--color-text-primary)',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                    }}
                  >
                    {persona.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: '0 0 1rem 0',
                    }}
                  >
                    {persona.description}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-accent)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    <span style={{ opacity: 0.6 }}>Primary need: </span>
                    {persona.need}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
