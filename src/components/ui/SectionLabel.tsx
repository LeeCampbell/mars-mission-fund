interface SectionLabelProps {
  number: number | string;
  title: string;
}

export function SectionLabel({ number, title }: SectionLabelProps) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        color: 'var(--color-text-accent)',
        letterSpacing: 'var(--tracking-wide)',
        margin: 0,
      }}
    >
      {number} — {title}
    </p>
  );
}
