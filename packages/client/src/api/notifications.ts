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

export interface Notification {
  id: string
  accountId: string
  campaignId: string | null
  type: string
  message: string
  readAt: string | null
  createdAt: string
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await authedFetch('/v1/notifications')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json as { data: Notification[] }).data
}
