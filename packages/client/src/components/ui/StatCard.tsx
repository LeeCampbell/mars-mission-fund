import type { CSSProperties } from 'react'

interface StatCardProps {
  label: string
  value: string
  subText?: string
  subVariant?: 'positive' | 'neutral'
  className?: string
}

const cardStyle: CSSProperties = {
  background: 'var(--gradient-surface-stat)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-stat)',
  padding: '24px',
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--type-body-small)',
  fontSize: 'var(--type-label-size)',
  fontWeight: 500,
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
}

const valueStyle: CSSProperties = {
  fontFamily: 'var(--type-stat-value)',
  fontSize: 'var(--type-stat-value-size)',
  lineHeight: 1,
  color: 'var(--color-text-primary)',
  marginBottom: '4px',
}

const subTextVariantStyles: Record<'positive' | 'neutral', CSSProperties> = {
  positive: {
    color: 'var(--color-status-success)',
    fontSize: 'var(--type-input-label-size)',
    fontFamily: 'var(--type-body-small)',
  },
  neutral: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--type-input-label-size)',
    fontFamily: 'var(--type-body-small)',
  },
}

export function StatCard({
  label,
  value,
  subText,
  subVariant = 'neutral',
  className,
}: StatCardProps) {
  return (
    <div style={cardStyle} className={className}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
      {subText && <div style={subTextVariantStyles[subVariant]}>{subText}</div>}
    </div>
  )
}
