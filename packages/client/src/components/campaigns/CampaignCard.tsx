import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import type { CampaignSummary } from '@mmf/shared'

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--type-card-title)',
  color: 'var(--color-text-primary)',
  margin: '12px 0 8px',
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: 1.3,
}

const fundingStatusStyle: React.CSSProperties = {
  fontFamily: 'var(--type-data)',
  color: 'var(--color-text-tertiary)',
  fontSize: '12px',
  margin: '8px 0 16px',
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CampaignCardProps {
  campaign: CampaignSummary
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const raised = formatUSD(campaign.raisedAmount)
  const goal = formatUSD(campaign.goalAmount)
  const fundingProgressPct =
    campaign.goalAmount > 0
      ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
      : 0

  return (
    <Card accent>
      <Badge variant="active">{campaign.category}</Badge>
      <h3 style={titleStyle}>{campaign.title}</h3>
      <ProgressBar
        value={fundingProgressPct}
        label={`${campaign.title} funding progress: ${fundingProgressPct}% funded`}
      />
      <p style={fundingStatusStyle}>
        Raised {raised} of {goal}
      </p>
      <Button variant="ghost" href={`/campaigns/${campaign.id}`}>
        View Mission
      </Button>
    </Card>
  )
}
