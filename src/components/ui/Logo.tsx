import { useId } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  className?: string;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 72,
  lg: 120,
};

export function Logo({
  size = 'md',
  'aria-label': ariaLabel = 'Mars Mission Fund',
  className,
}: LogoProps) {
  const uid = useId();
  const coinGradId = `coinGrad-${uid}`;
  const coinInnerId = `coinInner-${uid}`;
  const marsGradId = `marsGrad-${uid}`;
  const px = SIZE_MAP[size];

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={px}
      height={px}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={coinGradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" style={{ stopColor: 'var(--chrome)' }} />
          <stop offset="40%" style={{ stopColor: 'var(--silver)' }} />
          <stop offset="75%" style={{ stopColor: 'var(--stardust)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--metallic-shadow)' }} />
        </radialGradient>
        <radialGradient id={coinInnerId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" style={{ stopColor: 'var(--orbit)' }} />
          <stop offset="50%" style={{ stopColor: 'var(--deep-space)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--void)' }} />
        </radialGradient>
        <radialGradient id={marsGradId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" style={{ stopColor: 'var(--ignition)' }} />
          <stop offset="45%" style={{ stopColor: 'var(--red-planet)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--maroon-deep)' }} />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="58" fill={`url(#${coinGradId})`} opacity="0.3" />
      {/* Coin body */}
      <circle cx="60" cy="60" r="52" fill={`url(#${coinGradId})`} />
      {/* Inner recess */}
      <circle cx="60" cy="60" r="44" fill={`url(#${coinInnerId})`} />
      {/* Ridge detail */}
      <circle cx="60" cy="60" r="48" fill="none" style={{ stroke: 'var(--silver)' }} strokeOpacity={0.15} strokeWidth="1" />
      <circle cx="60" cy="60" r="46" fill="none" style={{ stroke: 'var(--silver)' }} strokeOpacity={0.08} strokeWidth="0.5" />
      {/* Mars planet */}
      <circle cx="60" cy="60" r="24" fill={`url(#${marsGradId})`} />
      {/* Mars surface details */}
      <ellipse cx="52" cy="56" rx="5" ry="3" style={{ fill: 'var(--maroon-deep)' }} fillOpacity={0.5} transform="rotate(-15,52,56)" />
      <ellipse cx="68" cy="58" rx="4" ry="2" style={{ fill: 'var(--maroon-deep)' }} fillOpacity={0.4} transform="rotate(10,68,58)" />
      <ellipse cx="60" cy="50" rx="7" ry="2.5" style={{ fill: 'var(--ignition)' }} fillOpacity={0.4} transform="rotate(-5,60,50)" />
      <ellipse cx="57" cy="68" rx="3" ry="2" style={{ fill: 'var(--maroon-deep)' }} fillOpacity={0.3} transform="rotate(20,57,68)" />
      {/* Mars polar cap */}
      <ellipse cx="60" cy="38" rx="6" ry="2.5" style={{ fill: 'var(--chrome)' }} fillOpacity={0.4} />
      {/* Orbital ring */}
      <ellipse
        cx="60"
        cy="60"
        rx="32"
        ry="10"
        fill="none"
        style={{ stroke: 'var(--silver)' }}
        strokeOpacity={0.25}
        strokeWidth="1"
        strokeDasharray="3 2"
        transform="rotate(-25,60,60)"
      />
      {/* Coin shine highlight */}
      <ellipse cx="46" cy="36" rx="14" ry="8" style={{ fill: 'var(--white)' }} fillOpacity={0.12} transform="rotate(-20,46,36)" />
      {/* Star details in rim */}
      <text x="60" y="15" textAnchor="middle" fontSize="7" style={{ fill: 'var(--silver)' }} fillOpacity={0.4} fontFamily="serif" fontWeight="bold">
        ★
      </text>
      <text x="60" y="109" textAnchor="middle" fontSize="7" style={{ fill: 'var(--silver)' }} fillOpacity={0.4} fontFamily="serif" fontWeight="bold">
        ★
      </text>
    </svg>
  );
}
