export interface Campaign {
  id: string
  title: string
  summary: string
  category: string
  status: string
  raisedAmount: number
  goalAmount: number
  fundingProgressPct: number
  deadline: string
  heroImageUrl?: string
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch('/v1/campaigns')
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json() as Promise<Campaign[]>
}
