import { useEffect, useState } from 'react'
import { Button } from './ui/Button'

export function HeroSection() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <section
      aria-label="Hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--gradient-hero)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-action-primary) 0%, transparent 70%)',
          opacity: 0.15,
          animation: reducedMotion ? 'none' : 'glowPulse 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-glow { animation: none !important; }
        }
      `}</style>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '4rem 1.5rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
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
          The future of space exploration
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 10vw, var(--text-hero))',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            lineHeight: 0.9,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            margin: '0 0 1.5rem',
          }}
        >
          Fund the
          <br />
          <span style={{ color: 'var(--color-text-accent)' }}>next mission</span>
          <br />
          to Mars
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
          }}
        >
          Back real space missions, track progress in real time, and be part of humanity's
          greatest adventure — from launch to landing.
        </p>

        <Button variant="primary">Fund a Mission</Button>
      </div>
    </section>
  )
}
