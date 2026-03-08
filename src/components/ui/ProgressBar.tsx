import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'complete';
  className?: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  className,
}: ProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const fillBackground =
    variant === 'complete'
      ? 'var(--color-progress-complete)'
      : 'var(--color-progress-fill)';

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={className}
      style={{
        position: 'relative',
        height: '8px',
        borderRadius: 'var(--radius-progress)',
        background: 'var(--color-progress-track)',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: `${percentage}%`,
          borderRadius: 'var(--radius-progress)',
          background: fillBackground,
          transition: reducedMotion ? 'none' : 'width var(--motion-enter)',
          minWidth: percentage > 0 ? '8px' : '0',
        }}
      >
        {percentage > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '-5px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--color-progress-indicator)',
              border: '2px solid var(--color-bg-page)',
              display: 'block',
            }}
          />
        )}
      </div>
    </div>
  );
}
