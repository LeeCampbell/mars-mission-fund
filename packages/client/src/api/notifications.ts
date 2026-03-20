import { NotificationSchema } from '@mmf/shared'
import type { Notification } from '@mmf/shared'

export type { Notification }

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

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await authedFetch('/v1/notifications')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  return (json.data as unknown[]).map((item) => NotificationSchema.parse(item))
}

export async function markNotificationRead(id: string): Promise<void> {
  const response = await authedFetch(`/v1/notifications/${id}/read`, { method: 'PATCH' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
