import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  complete?: boolean;
}

export function ProgressBar({ value, max = 100, label, complete = false }: ProgressBarProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const fillGradient = complete
    ? 'var(--gradient-progress-complete)'
    : 'var(--gradient-progress-active)';
  const transition = reducedMotion ? 'none' : 'width var(--motion-progress, 300ms) ease';

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      style={{
        position: 'relative',
        height: '8px',
        background: 'var(--color-progress-track)',
        borderRadius: 'var(--radius-progress)',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: `${percentage}%`,
          background: fillGradient,
          borderRadius: 'var(--radius-progress)',
          transition,
        }}
      >
        {percentage > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '10px',
              height: '10px',
              borderRadius: 'var(--radius-full)',
              background: complete ? 'var(--color-status-success)' : 'var(--color-progress-indicator)',
              display: 'block',
            }}
          />
        )}
      </div>
    </div>
  );
}
