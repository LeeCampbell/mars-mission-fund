type StatCardProps = {
  label: string
  value: string
  subtext?: string
  subtextVariant?: 'positive' | 'neutral'
}

export function StatCard({ label, value, subtext, subtextVariant = 'neutral' }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--gradient-surface-stat)',
        borderRadius: 'var(--radius-card)',
        padding: '1.25rem 1.5rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-label)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 0.25rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-stat-value)',
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          margin: subtext ? '0 0 0.375rem' : '0',
        }}
      >
        {value}
      </p>
      {subtext && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-body-small)',
            color:
              subtextVariant === 'positive'
                ? 'var(--color-status-success)'
                : 'var(--color-text-muted)',
            margin: '0',
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  )
}
