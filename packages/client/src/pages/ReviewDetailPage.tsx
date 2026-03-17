import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MilestonesSection } from '../components/campaigns/MilestonesSection'
import { StretchGoalsSection } from '../components/campaigns/StretchGoalsSection'
import { TeamSection } from '../components/campaigns/TeamSection'
import { ReviewActionsPanel } from '../components/campaigns/ReviewActionsPanel'
import { useAuthContext } from '../context/AuthContext'
import type { CampaignStatus } from '@mmf/shared'

type BadgeVariant = 'funded' | 'active' | 'new'

const statusBadgeVariant: Record<CampaignStatus, BadgeVariant> = {
  Complete: 'funded',
  Funded: 'funded',
  Live: 'active',
  Approved: 'active',
  'Under Review': 'active',
  Submitted: 'active',
  Draft: 'new',
  Rejected: 'new',
  Failed: 'new',
  Suspended: 'new',
  Settlement: 'new',
  Cancelled: 'new',
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-8)',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const titleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 'var(--space-3)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-2-size)',
  fontWeight: 'var(--type-heading-2-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-2-spacing)',
  lineHeight: 'var(--type-heading-2-leading)',
  color: 'var(--color-text-primary)',
  margin: 0,
}

const categoryStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const descriptionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  lineHeight: 'var(--type-body-leading)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
}

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-status-error)',
}

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthContext()

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')

  useEffect(() => {
    if (campaign) {
      document.title = `Review: ${campaign.title} — Mars Mission Fund`
    }
  }, [campaign])

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle} role="status" aria-busy="true">
          Loading campaign…
        </div>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle} role="alert">
          Failed to load campaign. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <h1 style={titleStyle}>{campaign.title}</h1>
            <Badge variant={statusBadgeVariant[campaign.status]}>{campaign.status}</Badge>
          </div>
          <span style={categoryStyle}>{campaign.category}</span>
        </div>

        {/* Review Actions Panel — shown prominently at the top for the reviewer */}
        <ReviewActionsPanel campaign={campaign} user={user} />

        {/* Description */}
        <Card>
          <div
            style={descriptionStyle}
            dangerouslySetInnerHTML={{ __html: campaign.description }}
          />
        </Card>

        {/* Team */}
        <TeamSection teamMembers={campaign.teamMembers} />

        {/* Milestones */}
        <MilestonesSection milestones={campaign.milestones} />

        {/* Stretch Goals */}
        <StretchGoalsSection stretchGoals={campaign.stretchGoals} />
      </div>
    </div>
  )
}
