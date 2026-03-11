import { useNavigate } from 'react-router'
import { useMyCampaigns } from '../hooks/useMyCampaigns'
import { useSubmitCampaign } from '../hooks/useCampaignMutations'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { CampaignStatus, CampaignSummary } from '@mmf/shared'

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

const STATUS_ORDER: CampaignStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Live',
  'Funded',
  'Settlement',
  'Complete',
  'Rejected',
  'Failed',
  'Suspended',
  'Cancelled',
]

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
  padding: 'var(--space-8) var(--space-6)',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-8)',
  flexWrap: 'wrap',
  gap: 'var(--space-4)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-hero-heading-size)',
  fontWeight: 'var(--type-hero-heading-weight)' as React.CSSProperties['fontWeight'],
  color: 'var(--color-text-primary)',
  margin: 0,
}

const groupStyle: React.CSSProperties = {
  marginBottom: 'var(--space-8)',
}

const groupHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-section-heading-size)',
  fontWeight: 'var(--type-section-heading-weight)' as React.CSSProperties['fontWeight'],
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-4)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const campaignRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  marginBottom: 'var(--space-3)',
  flexWrap: 'wrap',
}

const campaignTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  flex: '1 1 200px',
  margin: 0,
}

const deadlineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  whiteSpace: 'nowrap',
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  flexWrap: 'wrap',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

const loadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-status-error)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

function formatDeadline(deadline: Date | null): string {
  if (!deadline) return '—'
  return deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface CampaignRowProps {
  campaign: CampaignSummary
}

function CampaignRow({ campaign }: CampaignRowProps) {
  const navigate = useNavigate()
  const submitMutation = useSubmitCampaign()
  const isDraft = campaign.status === 'Draft'

  function handleSubmitForReview() {
    submitMutation.mutate(campaign.id)
  }

  return (
    <div style={campaignRowStyle}>
      <Badge variant={statusBadgeVariant[campaign.status]}>{campaign.status}</Badge>
      <p style={campaignTitleStyle}>{campaign.title}</p>
      <span style={deadlineStyle}>{formatDeadline(campaign.deadline)}</span>
      <div style={actionsStyle}>
        {isDraft && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
            type="button"
          >
            Edit
          </Button>
        )}
        {isDraft && (
          <Button
            variant="ghost"
            onClick={handleSubmitForReview}
            type="button"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate(`/campaigns/${campaign.id}`)} type="button">
          View
        </Button>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: campaigns, isLoading, isError } = useMyCampaigns()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>Loading your campaigns…</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={errorStyle}>Failed to load campaigns. Please try again.</div>
        </div>
      </div>
    )
  }

  const grouped = (campaigns ?? []).reduce<Partial<Record<CampaignStatus, CampaignSummary[]>>>(
    (acc, campaign) => {
      const group = acc[campaign.status] ?? []
      return { ...acc, [campaign.status]: [...group, campaign] }
    },
    {}
  )

  const hasAnyCampaigns = (campaigns ?? []).length > 0

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>My Campaigns</h1>
          <Button variant="primary" onClick={() => navigate('/campaigns/new')} type="button">
            New Campaign
          </Button>
        </div>

        {!hasAnyCampaigns && (
          <div style={emptyStyle}>
            You have no campaigns yet.{' '}
            <Button variant="ghost" onClick={() => navigate('/campaigns/new')} type="button">
              Create your first campaign
            </Button>
          </div>
        )}

        {STATUS_ORDER.filter((status) => grouped[status]?.length).map((status) => (
          <div key={status} style={groupStyle}>
            <h2 style={groupHeadingStyle}>{status}</h2>
            {grouped[status]!.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
