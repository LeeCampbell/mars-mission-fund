type Props = {
  label: string
  value: string | number
  subText?: string
  variant?: 'positive' | 'neutral'
  className?: string
}

export function StatCard({ label, value, subText, variant = 'neutral', className }: Props) {
  const subTextColor = variant === 'positive'
    ? 'var(--color-data-positive)'
    : 'var(--color-data-neutral)'

  return (
    <div
      className={className}
      style={{
        background: 'var(--gradient-surface-stat)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-stat)',
        padding: '1.5rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          margin: '0 0 0.5rem 0',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          lineHeight: 1,
          color: 'var(--color-text-primary)',
          margin: '0 0 0.25rem 0',
        }}
      >
        {value}
      </p>
      {subText && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: subTextColor,
            margin: 0,
          }}
        >
          {subText}
        </p>
      )}
    </div>
  )
}
