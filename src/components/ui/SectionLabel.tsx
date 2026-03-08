interface SectionLabelProps {
  number: string | number;
  title: string;
  className?: string;
}

export function SectionLabel({ number, title, className }: SectionLabelProps) {
  const formatted = `${String(number).padStart(2, '0')} — ${title.toUpperCase()}`;

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      {formatted}
    </span>
  );
}
