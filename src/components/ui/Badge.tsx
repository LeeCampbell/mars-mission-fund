interface BadgeProps {
  variant: 'funded' | 'active' | 'new';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeProps['variant'], React.CSSProperties> = {
  funded: {
    color: 'var(--color-status-success)',
    backgroundColor: 'var(--color-status-success-bg)',
    borderColor: 'var(--color-status-success-border)',
  },
  active: {
    color: 'var(--color-status-active)',
    backgroundColor: 'var(--color-status-active-bg)',
    borderColor: 'var(--color-status-active-border)',
  },
  new: {
    color: 'var(--color-status-new)',
    backgroundColor: 'var(--color-status-new-bg)',
    borderColor: 'var(--color-status-new-border)',
  },
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375em',
        paddingInline: '0.625em',
        paddingBlock: '0.25em',
        borderRadius: 'var(--radius-badge)',
        border: '1px solid',
        fontSize: 'var(--font-size-label)',
        fontFamily: 'var(--font-family-body)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: 'var(--letter-spacing-label)',
        textTransform: 'uppercase',
        ...variantStyles[variant],
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '0.5em',
          height: '0.5em',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}
