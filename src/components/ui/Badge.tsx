import type { ReactNode } from 'react'

type Variant = 'funded' | 'active' | 'new'

type Props = {
  variant: Variant
  className?: string
  children?: ReactNode
}

const variantStyles: Record<Variant, { bg: string; text: string; border: string; dot: string }> = {
  funded: {
    bg: 'var(--color-status-success-bg)',
    text: 'var(--color-status-success)',
    border: 'var(--color-status-success-border)',
    dot: 'var(--color-status-success)',
  },
  active: {
    bg: 'var(--color-status-active-bg)',
    text: 'var(--color-status-active)',
    border: 'var(--color-status-active-border)',
    dot: 'var(--color-status-active)',
  },
  new: {
    bg: 'var(--color-status-new-bg)',
    text: 'var(--color-status-new)',
    border: 'var(--color-status-new-border)',
    dot: 'var(--color-status-new)',
  },
}

export function Badge({ variant, className, children }: Props) {
  const styles = variantStyles[variant]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--radius-badge)',
        padding: '2px 10px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: styles.dot,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  )
}
