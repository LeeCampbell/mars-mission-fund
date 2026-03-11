import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchSubmittedMilestones,
  verifyMilestone,
  returnMilestone,
  fetchCancellationRequests,
  approveCancellation,
  denyCancellation,
} from '../api/adminCampaigns'

export function useSubmittedMilestones() {
  return useQuery({ queryKey: ['submittedMilestones'], queryFn: fetchSubmittedMilestones })
}

export function useVerifyMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => verifyMilestone(id, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['submittedMilestones'] })
    },
  })
}

export function useReturnMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
      returnMilestone(id, feedback),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['submittedMilestones'] })
    },
  })
}

export function useCancellationRequests() {
  return useQuery({ queryKey: ['cancellationRequests'], queryFn: fetchCancellationRequests })
}

export function useApproveCancellation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveCancellation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cancellationRequests'] })
    },
  })
}

export function useDenyCancellation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => denyCancellation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cancellationRequests'] })
    },
  })
}
