import { CampaignSummarySchema } from '@mmf/shared'
import type { CampaignSummary } from '@mmf/shared'

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

export async function fetchReviewQueue(): Promise<CampaignSummary[]> {
  const response = await authedFetch('/v1/review')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return ((json as { data: unknown[] }).data as unknown[]).map((item) =>
    CampaignSummarySchema.parse(item)
  )
}

export async function claimCampaign(id: string): Promise<void> {
  const response = await authedFetch(`/v1/review/${id}/claim`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function approveCampaign(id: string, notes: string): Promise<void> {
  const response = await authedFetch(`/v1/review/${id}/approve`, {
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
  const response = await authedFetch(`/v1/review/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rationale, guidance }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
