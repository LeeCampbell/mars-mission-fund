import { z } from 'zod'
import {
  CampaignStatusSchema,
  CampaignCategorySchema,
  CampaignSummarySchema,
  CampaignDetailSchema,
  CreateCampaignRequestSchema,
  UpdateCampaignRequestSchema,
} from '@mmf/shared'

export {
  CampaignStatusSchema,
  CampaignCategorySchema,
  CampaignSummarySchema,
  CampaignDetailSchema,
  CreateCampaignRequestSchema,
  UpdateCampaignRequestSchema,
}
export type {
  CampaignStatus,
  CampaignCategory,
  CampaignSummary,
  CampaignDetail,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@mmf/shared'

export const RouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const SubmitRouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const ListQuerySchema = z.object({
  status: CampaignStatusSchema.optional(),
  category: CampaignCategorySchema.optional(),
  createdBy: z.literal('me').optional(),
})

export type RouteParams = z.infer<typeof RouteParamsSchema>
export type SubmitRouteParams = z.infer<typeof SubmitRouteParamsSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
