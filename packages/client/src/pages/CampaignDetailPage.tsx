import { useParams } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { FundingProgressSection } from '../components/campaigns/FundingProgressSection'
import { MilestonesSection } from '../components/campaigns/MilestonesSection'
import { StretchGoalsSection } from '../components/campaigns/StretchGoalsSection'
import { CampaignUpdatesSection } from '../components/campaigns/CampaignUpdatesSection'
import { TeamSection } from '../components/campaigns/TeamSection'
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

const statusLabel: Record<CampaignStatus, string> = {
  Complete: 'Complete',
  Funded: 'Funded',
  Live: 'Live',
  Approved: 'Approved',
  'Under Review': 'Under Review',
  Submitted: 'Submitted',
  Draft: 'Draft',
  Rejected: 'Rejected',
  Failed: 'Failed',
  Suspended: 'Suspended',
  Settlement: 'Settlement',
  Cancelled: 'Cancelled',
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const heroWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '400px',
  overflow: 'hidden',
}

const heroBgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'var(--gradient-campaign-hero)',
}

const heroOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%)',
}

const heroImgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const headerStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
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
  fontSize: 'var(--type-hero-heading-size)',
  fontWeight: 'var(--type-hero-heading-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-hero-heading-spacing)',
  lineHeight: 'var(--type-hero-heading-leading)',
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

const contentStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 var(--space-6) var(--space-16)',
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

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading campaign…</div>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load campaign. Please try again.</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .campaign-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        @media (min-width: 1024px) {
          .campaign-layout {
            flex-direction: row;
            align-items: flex-start;
          }
          .campaign-main {
            flex: 65;
          }
          .campaign-sidebar {
            flex: 35;
            position: sticky;
            top: var(--space-8);
          }
        }
      `}</style>
      <div style={pageStyle}>
        {/* Hero */}
        <div style={heroWrapperStyle}>
          <div style={heroBgStyle} />
          {campaign.heroImageUrl && (
            <img src={campaign.heroImageUrl} alt="" aria-hidden="true" style={heroImgStyle} />
          )}
          <div style={heroOverlayStyle} />
        </div>

        {/* Title / meta */}
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <h1 style={titleStyle}>{campaign.title}</h1>
            <Badge variant={statusBadgeVariant[campaign.status]}>
              {statusLabel[campaign.status]}
            </Badge>
          </div>
          <span style={categoryStyle}>{campaign.category}</span>
        </div>

        {/* Two-column content */}
        <div style={contentStyle}>
          <div className="campaign-layout">
            {/* Main column */}
            <div className="campaign-main">
              <Card>
                <p style={descriptionStyle}>{campaign.description}</p>
              </Card>

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
                <CampaignUpdatesSection updates={campaign.updates} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="campaign-sidebar">
              <Card accent>
                <FundingProgressSection campaign={campaign} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
