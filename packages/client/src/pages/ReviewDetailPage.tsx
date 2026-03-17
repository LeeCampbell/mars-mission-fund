import { useParams } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TeamSection } from '../components/campaigns/TeamSection'
import { MilestonesSection } from '../components/campaigns/MilestonesSection'
import { StretchGoalsSection } from '../components/campaigns/StretchGoalsSection'
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
  maxWidth: '900px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6) var(--space-16)',
}

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-8)',
}

const titleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 'var(--space-3)',
  marginBottom: 'var(--space-2)',
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

const sectionSpacingStyle: React.CSSProperties = {
  marginTop: 'var(--space-10)',
}

const alignmentSectionStyle: React.CSSProperties = {
  marginTop: 'var(--space-10)',
}

const alignmentHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-3-size)',
  fontWeight: 'var(--type-heading-3-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-3-spacing)',
  lineHeight: 'var(--type-heading-3-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-4)',
}

const alignmentTextStyle: React.CSSProperties = {
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
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <h1 style={titleStyle}>{campaign.title}</h1>
            <Badge variant={statusBadgeVariant[campaign.status]}>{campaign.status}</Badge>
          </div>
          <span style={categoryStyle}>{campaign.category}</span>
        </div>

        <Card>
          <div
            style={descriptionStyle}
            dangerouslySetInnerHTML={{ __html: campaign.description }}
          />
        </Card>

        {campaign.alignmentStatement && (
          <div style={alignmentSectionStyle}>
            <Card>
              <h2 style={alignmentHeadingStyle}>Alignment Statement</h2>
              <p style={alignmentTextStyle}>{campaign.alignmentStatement}</p>
            </Card>
          </div>
        )}

        <div style={sectionSpacingStyle}>
          <TeamSection teamMembers={campaign.teamMembers} />
        </div>

        <div style={sectionSpacingStyle}>
          <MilestonesSection milestones={campaign.milestones} />
        </div>

        <div style={sectionSpacingStyle}>
          <StretchGoalsSection stretchGoals={campaign.stretchGoals} />
        </div>

        <div style={sectionSpacingStyle}>
          <ReviewActionsPanel campaign={campaign} user={user} />
        </div>
      </div>
    </div>
  )
}
