import { useQuery } from '@tanstack/react-query'
import { fetchCampaign } from '../api/campaigns'
import type { CampaignDetail } from '@mmf/shared'

export function useCampaign(id: string) {
  return useQuery<CampaignDetail, Error>({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaign(id),
    staleTime: 0,
  })
}
