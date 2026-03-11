const STEP_LABELS = [
  'Mission Objectives',
  'Team',
  'Funding',
  'Milestones',
  'Risks',
  'Media',
  'Review & Submit',
]

interface StepIndicatorProps {
  currentStep: number // 1-based
  totalSteps?: number
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  overflowX: 'auto',
  padding: 'var(--space-4) 0',
}

const stepStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  flexShrink: 0,
}

const connectorStyle: React.CSSProperties = {
  flex: 1,
  height: '1px',
  minWidth: 'var(--space-3)',
  background: 'var(--color-border-input)',
  margin: '0 var(--space-2)',
}

const connectorCompletedStyle: React.CSSProperties = {
  ...connectorStyle,
  background: 'var(--color-text-accent)',
}

function getCircleStyle(state: 'completed' | 'current' | 'upcoming'): React.CSSProperties {
  const base: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-data)',
    fontSize: '11px',
    fontWeight: 600,
    flexShrink: 0,
    transition: 'background var(--motion-hover), border-color var(--motion-hover)',
  }
  if (state === 'completed') {
    return {
      ...base,
      background: 'var(--color-text-accent)',
      color: 'var(--color-text-on-action)',
      border: '2px solid var(--color-text-accent)',
    }
  }
  if (state === 'current') {
    return {
      ...base,
      background: 'transparent',
      color: 'var(--color-text-accent)',
      border: '2px solid var(--color-text-accent)',
    }
  }
  return {
    ...base,
    background: 'transparent',
    color: 'var(--color-text-tertiary)',
    border: '2px solid var(--color-border-input)',
  }
}

function getLabelStyle(state: 'completed' | 'current' | 'upcoming'): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--type-body-small-size)',
    fontWeight: state === 'current' ? 600 : 400,
    whiteSpace: 'nowrap',
    transition: 'color var(--motion-hover)',
  }
  if (state === 'completed') return { ...base, color: 'var(--color-text-secondary)' }
  if (state === 'current') return { ...base, color: 'var(--color-text-primary)' }
  return { ...base, color: 'var(--color-text-tertiary)' }
}

export function StepIndicator({ currentStep, totalSteps = STEP_LABELS.length }: StepIndicatorProps) {
  const labels = STEP_LABELS.slice(0, totalSteps)

  return (
    <nav aria-label="Form steps" style={containerStyle}>
      {labels.map((label, index) => {
        const stepNumber = index + 1
        const state =
          stepNumber < currentStep ? 'completed' : stepNumber === currentStep ? 'current' : 'upcoming'
        const isLast = index === labels.length - 1

        return (
          <div key={stepNumber} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1, minWidth: 0 }}>
            <div style={stepStyle}>
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                style={getCircleStyle(state)}
              >
                {state === 'completed' ? '✓' : stepNumber}
              </span>
              <span style={getLabelStyle(state)}>{label}</span>
            </div>
            {!isLast && (
              <span
                aria-hidden="true"
                style={stepNumber < currentStep ? connectorCompletedStyle : connectorStyle}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
