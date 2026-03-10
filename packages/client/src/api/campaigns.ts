import type { CampaignSummary, CampaignDetail } from '@mmf/shared'

export type { Milestone, StretchGoal, TeamMember, CampaignUpdate } from '@mmf/shared'
// Backward-compatible alias: old code imported Campaign which had milestone/team arrays
export type { CampaignDetail as Campaign, CampaignSummary } from '@mmf/shared'

export async function fetchCampaigns(): Promise<CampaignSummary[]> {
  const response = await fetch('/v1/campaigns')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return json.data as CampaignSummary[]
}

export async function fetchCampaign(id: string): Promise<CampaignDetail> {
  const response = await fetch(`/v1/campaigns/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return json.data as CampaignDetail
}
