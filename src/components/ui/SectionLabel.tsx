interface SectionLabelProps {
  number: number | string;
  label: string;
  className?: string;
}

export function SectionLabel({ number, label, className }: SectionLabelProps) {
  const padded =
    typeof number === 'number'
      ? String(number).padStart(2, '0')
      : String(number).padStart(2, '0');

  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: 'var(--font-size-section-label)',
        letterSpacing: 'var(--letter-spacing-section-label)',
        color: 'var(--color-text-accent)',
        textTransform: 'uppercase',
        margin: 0,
      }}
    >
      {padded} — {label}
    </p>
  );
}
