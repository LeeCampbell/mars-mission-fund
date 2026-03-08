import type { ReactNode } from 'react'

type Props = {
  accent?: boolean
  className?: string
  children?: ReactNode
}

export function Card({ accent = false, className, children }: Props) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {accent && (
        <div
          style={{
            height: '3px',
            background: 'var(--gradient-action-primary)',
          }}
          aria-hidden="true"
        />
      )}
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  )
}
