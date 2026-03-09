import React from 'react'

type CardProps = {
  accent?: boolean
  children: React.ReactNode
  className?: string
}

export function Card({ accent = false, children, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {accent && (
        <div
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, var(--color-border-accent), var(--color-status-warning))',
          }}
        />
      )}
      {children}
    </div>
  )
}
