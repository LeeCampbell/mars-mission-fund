import { useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { ReviewActionsPanel } from '../components/campaigns/ReviewActionsPanel'
import { MilestonesSection } from '../components/campaigns/MilestonesSection'
import { TeamSection } from '../components/campaigns/TeamSection'
import { useAuthContext } from '../context/AuthContext'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
}

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-accent-primary)',
  textDecoration: 'none',
  marginBottom: 'var(--space-6)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-2-size)',
  fontWeight: 'var(--type-heading-2-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-2-spacing)',
  lineHeight: 'var(--type-heading-2-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-2)',
}

const categoryStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 var(--space-6)',
}

const sectionSpacingStyle: React.CSSProperties = {
  marginTop: 'var(--space-8)',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-3-size)',
  fontWeight: 'var(--type-heading-3-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-3-spacing)',
  lineHeight: 'var(--type-heading-3-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-4)',
}

const descriptionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  lineHeight: 'var(--type-body-leading)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-8)',
  flexWrap: 'wrap',
  marginBottom: 'var(--space-6)',
}

const metaItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
}

const metaLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  fontWeight: 600,
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const metaValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
}

const mediaLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-accent-primary)',
  wordBreak: 'break-all',
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
      document.title = `Review: ${campaign.title} — MMF`
    }
  }, [campaign])

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

  const goalFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(campaign.goalAmount)

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <Link to="/review" style={backLinkStyle} aria-label="Back to Review Queue">
          ← Back to Review Queue
        </Link>

        <h1 style={headingStyle}>{campaign.title}</h1>
        <p style={categoryStyle}>{campaign.category}</p>

        <div style={metaRowStyle}>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Goal Amount</span>
            <span style={metaValueStyle}>{goalFormatted}</span>
          </div>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Status</span>
            <span style={metaValueStyle}>{campaign.status}</span>
          </div>
          {campaign.deadline && (
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Deadline</span>
              <span style={metaValueStyle}>
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(campaign.deadline)}
              </span>
            </div>
          )}
        </div>

        <div style={sectionSpacingStyle}>
          <h2 style={sectionHeadingStyle}>Description</h2>
          <p style={descriptionStyle} dangerouslySetInnerHTML={{ __html: campaign.description }} />
        </div>

        {campaign.heroImageUrl && (
          <div style={sectionSpacingStyle}>
            <h2 style={sectionHeadingStyle}>Media</h2>
            <a href={campaign.heroImageUrl} style={mediaLinkStyle} target="_blank" rel="noreferrer">
              {campaign.heroImageUrl}
            </a>
          </div>
        )}

        <div style={sectionSpacingStyle}>
          <TeamSection teamMembers={campaign.teamMembers} />
        </div>

        <div style={sectionSpacingStyle}>
          <MilestonesSection milestones={campaign.milestones} />
        </div>

        <div style={sectionSpacingStyle}>
          <ReviewActionsPanel campaign={campaign} user={user} />
        </div>
      </div>
    </div>
  )
}
