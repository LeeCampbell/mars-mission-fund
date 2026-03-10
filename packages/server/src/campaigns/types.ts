import { z } from 'zod'
import {
  CampaignStatusSchema,
  CampaignCategorySchema,
  CampaignSummarySchema,
  CampaignSchema,
} from '@mmf/shared'

export { CampaignStatusSchema, CampaignCategorySchema, CampaignSummarySchema, CampaignSchema }
export type { CampaignStatus, CampaignCategory, CampaignSummary, Campaign } from '@mmf/shared'

export const RouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const ListQuerySchema = z.object({
  status: CampaignStatusSchema.optional(),
  category: CampaignCategorySchema.optional(),
})

export type RouteParams = z.infer<typeof RouteParamsSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
