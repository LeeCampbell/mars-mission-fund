import { z } from 'zod'
import {
  CampaignStatusSchema,
  CampaignCategorySchema,
  CampaignSummarySchema,
  CampaignDetailSchema,
} from '@mmf/shared'

export { CampaignStatusSchema, CampaignCategorySchema, CampaignSummarySchema, CampaignDetailSchema }
export type { CampaignStatus, CampaignCategory, CampaignSummary, CampaignDetail } from '@mmf/shared'

export const RouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const ListQuerySchema = z.object({
  status: CampaignStatusSchema.optional(),
  category: CampaignCategorySchema.optional(),
})

export type RouteParams = z.infer<typeof RouteParamsSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
