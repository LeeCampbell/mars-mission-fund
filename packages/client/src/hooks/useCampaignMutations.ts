import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  submitCampaign,
  postCampaignUpdate,
  submitMilestoneEvidence,
  type CampaignDetail,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from '../api/campaigns'

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'my'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCampaignInput }) =>
      updateCampaign(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'my'] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'my'] })
    },
  })
}

export function useSubmitCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => submitCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'my'] })
    },
  })
}

export function usePostCampaignUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => postCampaignUpdate(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ['campaign', id] })
      const previous = queryClient.getQueryData<CampaignDetail>(['campaign', id])
      if (previous) {
        const optimisticUpdate = {
          id: crypto.randomUUID(),
          campaignId: id,
          body,
          postedAt: new Date(),
        }
        queryClient.setQueryData<CampaignDetail>(['campaign', id], {
          ...previous,
          updates: [...previous.updates, optimisticUpdate],
        })
      }
      return { previous }
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['campaign', id], context.previous)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    },
  })
}

export function useSubmitMilestoneEvidence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      campaignId,
      milestoneId,
      evidenceText,
    }: {
      campaignId: string
      milestoneId: string
      evidenceText: string
    }) => submitMilestoneEvidence(campaignId, milestoneId, evidenceText),
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
    },
  })
}
