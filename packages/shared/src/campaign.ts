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
  goalAmount: z.coerce.number().int(),
  raisedAmount: z.coerce.number().int(),
  createdAt: z.coerce.date(),
})

// Full campaign row returned by the detail endpoint
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  alignmentStatement: z.string(),
  category: CampaignCategorySchema,
  tags: z.array(z.string()),
  status: CampaignStatusSchema,
  heroImageUrl: z.string().url().nullable(),
  minFundingTargetUsd: z.coerce.number().int(),
  maxFundingCapUsd: z.coerce.number().int(),
  currentAmountUsd: z.coerce.number().int(),
  contributorCount: z.number().int(),
  deadline: z.coerce.date().nullable(),
  launchedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetDate: z.string(),
  fundingPercentage: z.number(),
  verificationCriteria: z.string(),
  status: z.enum(['pending', 'active', 'completed']),
})

export const StretchGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  targetAmount: z.number(),
  unlocked: z.boolean(),
})

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
})

export const CampaignUpdateSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  body: z.string(),
})

export const CampaignDetailSchema = CampaignSchema.extend({
  milestones: z.array(MilestoneSchema),
  stretchGoals: z.array(StretchGoalSchema),
  teamMembers: z.array(TeamMemberSchema),
  updates: z.array(CampaignUpdateSchema),
})

export type CampaignStatus = z.infer<typeof CampaignStatusSchema>
export type CampaignCategory = z.infer<typeof CampaignCategorySchema>
export type CampaignSummary = z.infer<typeof CampaignSummarySchema>
export type Campaign = z.infer<typeof CampaignSchema>
export type Milestone = z.infer<typeof MilestoneSchema>
export type StretchGoal = z.infer<typeof StretchGoalSchema>
export type TeamMember = z.infer<typeof TeamMemberSchema>
export type CampaignUpdate = z.infer<typeof CampaignUpdateSchema>
export type CampaignDetail = z.infer<typeof CampaignDetailSchema>
