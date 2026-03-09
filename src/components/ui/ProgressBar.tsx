interface ProgressBarProps {
  value: number;
  'aria-label': string;
  className?: string;
}

export function ProgressBar({ value, 'aria-label': ariaLabel, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isComplete = clamped === 100;

  const fillBackground = isComplete
    ? 'var(--color-progress-complete)'
    : 'var(--color-progress-fill)';

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={className}
      style={{
        position: 'relative',
        height: '0.5rem',
        borderRadius: 'var(--radius-progress)',
        backgroundColor: 'var(--color-progress-track)',
        overflow: 'visible',
      }}
    >
      {/* Fill */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${clamped}%`,
          borderRadius: 'var(--radius-progress)',
          background: fillBackground,
          transition: `width var(--transition-duration-base) var(--transition-easing-out)`,
          overflow: 'visible',
        }}
      >
        {/* Endpoint dot */}
        {clamped > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '-0.375rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '50%',
              backgroundColor: isComplete
                ? 'var(--color-status-success)'
                : 'var(--color-progress-indicator)',
              boxShadow: isComplete
                ? '0 0 0.5rem var(--color-status-success)'
                : '0 0 0.5rem var(--color-progress-indicator)',
            }}
          />
        )}
      </div>
    </div>
  );
}
