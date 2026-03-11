import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchReviewQueue, claimCampaign, approveCampaign, rejectCampaign } from '../api/review'

export function useReviewQueue() {
  return useQuery({ queryKey: ['reviewQueue'], queryFn: fetchReviewQueue })
}

export function useClaimCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => claimCampaign(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })
}

export function useApproveCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => approveCampaign(id, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })
}

export function useRejectCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      rationale,
      guidance,
    }: {
      id: string
      rationale: string
      guidance: string
    }) => rejectCampaign(id, rationale, guidance),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })
}
