import { useQuery } from '@tanstack/react-query'
import { fetchCampaign, type Campaign } from '../api/campaigns'

export function useCampaign(id: string) {
  return useQuery<Campaign, Error>({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaign(id),
    staleTime: 0,
  })
}
