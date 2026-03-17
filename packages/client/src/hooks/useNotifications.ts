import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '../api/notifications'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  })
}
