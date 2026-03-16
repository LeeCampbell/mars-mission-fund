import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CampaignSummarySchema } from '@mmf/shared'
import type { CampaignSummary } from '@mmf/shared'

function authedFetch(path: string): Promise<Response> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(path, { headers })
}

async function fetchCampaignsByStatus(status: string): Promise<CampaignSummary[]> {
  const response = await authedFetch(`/v1/campaigns?status=${encodeURIComponent(status)}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json.data as unknown[]).map((item) => CampaignSummarySchema.parse(item))
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--type-heading-2-size)',
  fontWeight: 'var(--type-heading-2-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-heading-2-spacing)',
  lineHeight: 'var(--type-heading-2-leading)',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-8)',
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

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-10)',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-primary)',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '2px solid var(--color-border-subtle)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--type-body-small-size)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--color-border-subtle)',
  verticalAlign: 'middle',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-text-link)',
  textDecoration: 'none',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  padding: 'var(--space-6) 0',
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

function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  return (
    <tr>
      <td style={tdStyle}>
        <Link to={`/campaigns/${campaign.id}`} style={linkStyle}>
          {campaign.title}
        </Link>
      </td>
      <td style={tdStyle}>{campaign.category}</td>
      <td style={tdStyle}>{campaign.status}</td>
    </tr>
  )
}

function CampaignTable({ campaigns }: { campaigns: CampaignSummary[] }) {
  if (campaigns.length === 0) {
    return <p style={emptyStyle}>No campaigns in this section.</p>
  }
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Campaign</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Status</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <CampaignRow key={c.id} campaign={c} />
        ))}
      </tbody>
    </table>
  )
}

export function AdminCampaignsPage() {
  const {
    data: settlementCampaigns,
    isLoading: settlementLoading,
    isError: settlementError,
  } = useQuery({
    queryKey: ['campaigns', 'Settlement'],
    queryFn: () => fetchCampaignsByStatus('Settlement'),
  })

  const {
    data: liveCampaigns,
    isLoading: liveLoading,
    isError: liveError,
  } = useQuery({
    queryKey: ['campaigns', 'Live'],
    queryFn: () => fetchCampaignsByStatus('Live'),
  })

  if (settlementLoading || liveLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading campaigns…</div>
      </div>
    )
  }

  if (settlementError || liveError) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>Failed to load campaigns. Please try again.</div>
      </div>
    )
  }

  // Live campaigns with a pending cancellation request
  // Note: CampaignSummary does not include cancellationRequestedAt, so we show all Live campaigns
  // and link to the detail page where AdminActionsPanel will show the cancellation section if set.
  const cancellationCampaigns = liveCampaigns ?? []

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Campaign Management</h1>

        <div style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Awaiting Milestone Verification</h2>
          <CampaignTable campaigns={settlementCampaigns ?? []} />
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Pending Cancellation Requests</h2>
          {cancellationCampaigns.length === 0 ? (
            <p style={emptyStyle}>No campaigns in this section.</p>
          ) : (
            <>
              <p style={{ ...emptyStyle, paddingBottom: 0, paddingTop: 0 }}>
                Live campaigns are listed below. Visit each campaign to check for cancellation
                requests.
              </p>
              <CampaignTable campaigns={cancellationCampaigns} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
