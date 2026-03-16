import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markNotificationAsRead } from '../api/notifications'
import type { Notification } from '../api/notifications'
import { useAuthContext } from '../context/AuthContext'

export function useNotifications(): {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  isLoading: boolean
} {
  const { token } = useAuthContext()
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!token,
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markAsRead, isLoading }
}
