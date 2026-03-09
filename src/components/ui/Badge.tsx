type BadgeVariant = 'funded' | 'active' | 'new';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const variantStyles: Record<BadgeVariant, {
  bg: string;
  text: string;
  border: string;
  dot: string;
  defaultLabel: string;
}> = {
  funded: {
    bg: 'var(--color-status-success-bg)',
    text: 'var(--color-status-success)',
    border: 'var(--color-status-success-border)',
    dot: 'var(--color-status-success)',
    defaultLabel: 'Funded',
  },
  active: {
    bg: 'var(--color-status-active-bg)',
    text: 'var(--color-status-active)',
    border: 'var(--color-status-active-border)',
    dot: 'var(--color-status-active)',
    defaultLabel: 'Active',
  },
  new: {
    bg: 'var(--color-status-new-bg)',
    text: 'var(--color-status-new)',
    border: 'var(--color-status-new-border)',
    dot: 'var(--color-status-new)',
    defaultLabel: 'New',
  },
};

export function Badge({ variant, label }: BadgeProps) {
  const styles = variantStyles[variant];
  const displayLabel = label ?? styles.defaultLabel;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--radius-badge)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-label)',
        fontWeight: 500,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: styles.dot,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
}
