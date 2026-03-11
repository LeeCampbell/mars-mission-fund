import { CampaignSummarySchema, CampaignDetailSchema } from '@mmf/shared'
import type {
  CampaignSummary,
  CampaignDetail,
  Milestone,
  StretchGoal,
  TeamMember,
  CampaignUpdate,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@mmf/shared'
import { authedFetch } from './auth.js'

export type {
  CampaignSummary,
  CampaignDetail,
  Milestone,
  StretchGoal,
  TeamMember,
  CampaignUpdate,
  CreateCampaignInput,
  UpdateCampaignInput,
}

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

export async function fetchMyCampaigns(): Promise<CampaignSummary[]> {
  const response = await authedFetch('/v1/campaigns/my')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json.data as unknown[]).map((item) => CampaignSummarySchema.parse(item))
}

export async function claimCampaign(id: string): Promise<void> {
  const response = await authedFetch(`/v1/campaigns/${id}/claim`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function approveCampaign(id: string, notes: string): Promise<void> {
  const response = await authedFetch(`/v1/campaigns/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function rejectCampaign(
  id: string,
  rationale: string,
  guidance: string
): Promise<void> {
  const response = await authedFetch(`/v1/campaigns/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rationale, guidance }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function resubmitCampaign(id: string): Promise<void> {
  const response = await authedFetch(`/v1/campaigns/${id}/resubmit`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function createCampaign(input: CreateCampaignInput): Promise<CampaignDetail> {
  const response = await authedFetch('/v1/campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput
): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function deleteCampaign(id: string): Promise<void> {
  const response = await authedFetch(`/v1/campaigns/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function submitCampaign(id: string): Promise<CampaignDetail> {
  const response = await authedFetch(`/v1/campaigns/${id}/submit`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return CampaignDetailSchema.parse((json as { data: unknown }).data)
}

export async function postCampaignUpdate(id: string, body: string): Promise<CampaignUpdate> {
  const response = await authedFetch(`/v1/campaigns/${id}/updates`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json as { data: CampaignUpdate }).data
}

export async function submitMilestoneEvidence(
  campaignId: string,
  milestoneId: string,
  evidenceText: string
): Promise<void> {
  const response = await authedFetch(
    `/v1/campaigns/${campaignId}/milestones/${milestoneId}/evidence`,
    {
      method: 'POST',
      body: JSON.stringify({ evidenceText }),
    }
  )
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
