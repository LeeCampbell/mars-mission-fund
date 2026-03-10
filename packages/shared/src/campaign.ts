import { z } from 'zod'

export const CampaignStatusSchema = z.enum([
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Live',
  'Funded',
  'Suspended',
  'Failed',
  'Settlement',
  'Complete',
  'Cancelled',
])

export const CampaignCategorySchema = z.enum([
  'Propulsion',
  'Entry, Descent & Landing',
  'Power & Energy',
  'Habitats & Construction',
  'Life Support & Crew Health',
  'Food & Water Production',
  'In-Situ Resource Utilisation',
  'Radiation Protection',
  'Robotics & Automation',
  'Communications & Navigation',
])

// Summary shape returned by the list endpoint
export const CampaignSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: CampaignStatusSchema,
  category: CampaignCategorySchema,
  goal_amount: z.coerce.number().int(),
  raised_amount: z.coerce.number().int(),
  created_at: z.coerce.date(),
})

// Full campaign row returned by the detail endpoint
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  alignment_statement: z.string(),
  category: CampaignCategorySchema,
  tags: z.array(z.string()),
  status: CampaignStatusSchema,
  hero_image_url: z.string().url().nullable(),
  min_funding_target_usd: z.coerce.number().int(),
  max_funding_cap_usd: z.coerce.number().int(),
  current_amount_usd: z.coerce.number().int(),
  contributor_count: z.number().int(),
  deadline: z.coerce.date().nullable(),
  launched_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type CampaignStatus = z.infer<typeof CampaignStatusSchema>
export type CampaignCategory = z.infer<typeof CampaignCategorySchema>
export type CampaignSummary = z.infer<typeof CampaignSummarySchema>
export type Campaign = z.infer<typeof CampaignSchema>
