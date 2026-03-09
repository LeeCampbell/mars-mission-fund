import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';

interface MissionCardProps {
  badge: 'funded' | 'active' | 'new';
  title: string;
  description: string;
  progress: number;
  fundingText: string;
  ctaLabel: string;
}

const MISSION_CARD_CSS = `
  .mmf-mission-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    height: 100%;
  }

  .mmf-mission-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .mmf-mission-card-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-heading);
    margin: 0;
    line-height: 1.2;
  }

  .mmf-mission-card-description {
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.6;
    flex: 1;
  }

  .mmf-mission-card-progress-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .mmf-mission-card-funding-text {
    font-family: var(--font-family-body);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
    letter-spacing: var(--letter-spacing-label);
    margin: 0;
  }

  .mmf-mission-card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: auto;
  }
`;

export function MissionCard({
  badge,
  title,
  description,
  progress,
  fundingText,
  ctaLabel,
}: MissionCardProps) {
  return (
    <>
      <style href="mmf-mission-card" precedence="component">
        {MISSION_CARD_CSS}
      </style>
      <Card accent>
        <div className="mmf-mission-card-inner">
          <div className="mmf-mission-card-header">
            <Badge variant={badge}>
              {badge === 'funded' ? 'Funded' : badge === 'active' ? 'Active' : 'New'}
            </Badge>
          </div>
          <h3 className="mmf-mission-card-title">{title}</h3>
          <p className="mmf-mission-card-description">{description}</p>
          <div className="mmf-mission-card-progress-section">
            <ProgressBar value={progress} aria-label={`${title} funding progress: ${progress}%`} />
            <p className="mmf-mission-card-funding-text">{fundingText}</p>
          </div>
          <div className="mmf-mission-card-footer">
            <Button variant="ghost">{ctaLabel}</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
