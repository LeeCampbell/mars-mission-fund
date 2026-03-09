import { useQuery } from '@tanstack/react-query'
import { fetchCampaigns } from '../api/campaigns'

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns })
}
