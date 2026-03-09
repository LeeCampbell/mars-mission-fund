interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className = '' }: StatCardProps) {
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
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-label)',
          fontWeight: 'var(--font-weight-regular)',
          letterSpacing: 'var(--letter-spacing-label)',
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          margin: '0 0 0.5rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-stat-value)',
          fontWeight: 'var(--font-weight-bold)',
          letterSpacing: 'var(--letter-spacing-stat-value)',
          color: 'var(--color-text-primary)',
          margin: '0',
          lineHeight: '1.1',
        }}
      >
        {value}
      </p>
      {subtext && (
        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-body-small)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-secondary)',
            margin: '0.5rem 0 0',
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
