import { useQuery } from '@tanstack/react-query'
import { fetchMyCampaigns } from '../api/campaigns'

export function useMyCampaigns() {
  return useQuery({ queryKey: ['campaigns', 'my'], queryFn: fetchMyCampaigns })
}
