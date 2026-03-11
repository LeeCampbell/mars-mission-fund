import { CampaignSummarySchema, CampaignDetailSchema } from '@mmf/shared'
import type {
  CampaignSummary,
  CampaignDetail,
  Milestone,
  StretchGoal,
  TeamMember,
  CampaignUpdate,
} from '@mmf/shared'

function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(path, { ...init, headers })
}

export type { CampaignSummary, CampaignDetail, Milestone, StretchGoal, TeamMember, CampaignUpdate }

// Backward-compat alias — components will be updated in TASK-05
export type Campaign = CampaignDetail

export async function fetchCampaigns(): Promise<CampaignSummary[]> {
  const response = await fetch('/v1/campaigns')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json.data as unknown[]).map((item) => CampaignSummarySchema.parse(item))
}

export async function fetchCampaign(id: string): Promise<CampaignDetail> {
  const response = await fetch(`/v1/campaigns/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse(json.data)
}

export async function fetchReviewQueue(): Promise<CampaignSummary[]> {
  const response = await authedFetch('/v1/campaigns/review-queue')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json.data as unknown[]).map((item) => CampaignSummarySchema.parse(item))
}

export async function claimCampaign(id: string): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}/claim`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function approveCampaign(id: string, notes: string): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function rejectCampaign(
  id: string,
  rationale: string,
  guidance: string
): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rationale, guidance }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function resubmitCampaign(id: string): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}/resubmit`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}
