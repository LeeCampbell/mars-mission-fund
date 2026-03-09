import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'

type BadgeVariant = 'funded' | 'active' | 'new'

interface MissionCardProps {
  title: string
  description: string
  badge: BadgeVariant
  badgeLabel?: string
  progress: number
  fundingStatus: string
  buttonLabel: string
}

export function MissionCard({
  title,
  description,
  badge,
  badgeLabel,
  progress,
  fundingStatus,
  buttonLabel,
}: MissionCardProps) {
  return (
    <Card accent>
      <div
        style={{
          padding: 'var(--space-content-padding, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div>
          <Badge variant={badge} label={badgeLabel} />
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-section-heading)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>

        <ProgressBar value={progress} label={`${title} funding progress`} />

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-label)',
            color: 'var(--color-text-muted)',
            margin: 0,
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          {fundingStatus}
        </p>

        <div>
          <Button variant="ghost">{buttonLabel}</Button>
        </div>
      </div>
    </Card>
  )
}
