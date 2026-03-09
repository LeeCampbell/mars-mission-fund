import { useCampaigns } from '../hooks/useCampaigns'
import { CampaignCard } from '../components/campaigns/CampaignCard'

const pageStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '48px 24px',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--type-hero)',
  fontSize: '32px',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: '8px',
}

const subheadingStyle: React.CSSProperties = {
  fontFamily: 'var(--type-body)',
  fontSize: '16px',
  color: 'var(--color-text-secondary)',
  marginBottom: '40px',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
}

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--type-body)',
  fontSize: '16px',
  color: 'var(--color-text-secondary)',
  padding: '48px 0',
  textAlign: 'center',
}

const cssOverrides = `
  .mmf-campaigns-grid {
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .mmf-campaigns-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1024px) {
    .mmf-campaigns-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`

let campaignsStyleInjected = false
function ensureCampaignsStyle() {
  if (campaignsStyleInjected || typeof document === 'undefined') return
  campaignsStyleInjected = true
  const el = document.createElement('style')
  el.textContent = cssOverrides
  document.head.appendChild(el)
}

export function CampaignsPage() {
  ensureCampaignsStyle()
  const { data: campaigns, isLoading, isError } = useCampaigns()

  return (
    <section style={pageStyle}>
      <h1 style={headingStyle}>Explore Missions</h1>
      <p style={subheadingStyle}>Support the missions driving humanity toward Mars.</p>

      {isLoading && (
        <div role="status" aria-busy="true" style={statusStyle}>
          Loading missions…
        </div>
      )}

      {isError && (
        <div role="alert" style={statusStyle}>
          We couldn&apos;t load missions right now. Please try again later.
        </div>
      )}

      {campaigns && (
        <div className="mmf-campaigns-grid" style={gridStyle} aria-label="Campaign listings">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </section>
  )
}
