import React from 'react';

interface CardProps {
  accent?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({ accent = false, className = '', children }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {accent && (
        <div
          aria-hidden="true"
          style={{
            height: '3px',
            background: 'var(--gradient-action-primary)',
            borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
          }}
        />
      )}
      {children}
    </div>
  );
}
