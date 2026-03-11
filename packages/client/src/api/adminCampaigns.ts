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

export interface SubmittedMilestone {
  id: string
  campaignId: string
  campaignTitle: string
  title: string
  evidenceUrl: string | null
  evidenceNotes: string | null
  status: string
}

export interface CancellationRequest {
  id: string
  title: string
  slug: string
  cancellationRequestedAt: string
  cancellationReason: string | null
  status: string
}

export async function fetchSubmittedMilestones(): Promise<SubmittedMilestone[]> {
  const response = await authedFetch('/v1/admin/milestones')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json as { data: SubmittedMilestone[] }).data
}

export async function verifyMilestone(id: string, notes: string): Promise<void> {
  const response = await authedFetch(`/v1/admin/milestones/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function returnMilestone(id: string, feedback: string): Promise<void> {
  const response = await authedFetch(`/v1/admin/milestones/${id}/return`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function fetchCancellationRequests(): Promise<CancellationRequest[]> {
  const response = await authedFetch('/v1/admin/campaigns/cancellations')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json as { data: CancellationRequest[] }).data
}

export async function approveCancellation(id: string): Promise<void> {
  const response = await authedFetch(`/v1/admin/campaigns/${id}/approve-cancellation`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

export async function denyCancellation(id: string): Promise<void> {
  const response = await authedFetch(`/v1/admin/campaigns/${id}/deny-cancellation`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
