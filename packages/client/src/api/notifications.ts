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
  userId: string
  campaignId: string | null
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await authedFetch('/v1/notifications')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json as { data: Notification[] }).data
}

export async function markNotificationRead(id: string): Promise<void> {
  const response = await authedFetch(`/v1/notifications/${id}/read`, { method: 'PATCH' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
