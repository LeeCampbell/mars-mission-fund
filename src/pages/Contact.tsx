import { Card } from '../components/ui/Card'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Button } from '../components/ui/Button'

const contactCards = [
  {
    title: 'Email',
    icon: '✉',
    detail: 'hello@marsmissionfund.com',
    note: 'We respond within 1–2 business days.',
  },
  {
    title: 'Mailing Address',
    icon: '📍',
    detail: '742 Launchpad Drive, Suite 300\nHouston, TX 77058\nUnited States',
    note: 'For official correspondence only.',
  },
  {
    title: 'Office Hours',
    icon: '🕐',
    detail: 'Monday – Friday\n09:00 – 18:00 CT',
    note: 'Closed on US federal holidays.',
  },
]

const socialLinks = [
  { label: 'X / Twitter', handle: '@MarsMissionFund' },
  { label: 'LinkedIn', handle: 'Mars Mission Fund' },
  { label: 'GitHub', handle: 'marsmissionfund' },
]

export function Contact() {
  return (
    <main>
      {/* Hero area */}
      <section
        aria-label="Contact Hero"
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
            Contact
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
            Have a question about a mission, partnership enquiry, or just want to say hello?
            We would love to hear from you.
          </p>
        </div>
      </section>

      {/* 01 — GET IN TOUCH */}
      <section
        aria-label="Get In Touch"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-base)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="01" title="GET IN TOUCH" />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '1.5rem',
            }}
            className="contact-cards-grid"
          >
            <style>{`
              @media (min-width: 768px) {
                .contact-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
              }
            `}</style>
            {contactCards.map((card) => (
              <Card key={card.title} accent>
                <div style={{ padding: '2rem' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-label)',
                      color: 'var(--color-text-accent)',
                      letterSpacing: 'var(--tracking-wider)',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {card.title}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.6,
                      margin: '0 0 1rem 0',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {card.detail}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {card.note}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 02 — FOLLOW THE MISSION */}
      <section
        aria-label="Follow The Mission"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel number="02" title="FOLLOW THE MISSION" />
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: '560px',
              marginBottom: '2rem',
            }}
          >
            Stay up to date with mission news, platform updates, and launch announcements
            across our social channels.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            className="social-links-list"
          >
            <style>{`
              @media (min-width: 640px) {
                .social-links-list { flex-direction: row !important; flex-wrap: wrap; }
              }
            `}</style>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={`Follow us on ${social.label}`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="ghost">
                  <span style={{ marginRight: '0.5rem' }}>{social.label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-accent)',
                      opacity: 0.8,
                    }}
                  >
                    {social.handle}
                  </span>
                </Button>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
