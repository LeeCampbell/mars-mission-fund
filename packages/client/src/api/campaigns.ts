import type {
  CampaignSummary,
  CampaignDetail,
  Milestone,
  StretchGoal,
  TeamMember,
  CampaignUpdate,
} from '@mmf/shared'

export type { CampaignSummary, CampaignDetail, Milestone, StretchGoal, TeamMember, CampaignUpdate }

// Backward-compat alias — components will be updated in TASK-05
export type Campaign = CampaignDetail

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
