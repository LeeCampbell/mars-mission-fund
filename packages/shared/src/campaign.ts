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

export const MilestoneStatusSchema = z.enum(['Pending', 'Submitted', 'Verified'])

export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  targetDate: z.coerce.date().nullable(),
  fundingPercentage: z.coerce.number(),
  verificationCriteria: z.string().nullable(),
  status: MilestoneStatusSchema,
  sortOrder: z.number().int(),
})

export const StretchGoalSchema = z.object({
  id: z.string().uuid(),
  targetAmount: z.coerce.number().int(),
  description: z.string(),
  deliverables: z.string().nullable(),
  unlocked: z.boolean(),
  sortOrder: z.number().int(),
})

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const CampaignUpdateSchema = z.object({
  id: z.string().uuid(),
  body: z.string(),
  postedAt: z.coerce.date(),
})

// Summary shape returned by the list endpoint
export const CampaignSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  status: CampaignStatusSchema,
  category: CampaignCategorySchema,
  heroImageUrl: z.string().url().nullable(),
  goalAmount: z.coerce.number().int(),
  raisedAmount: z.coerce.number().int(),
  contributorCount: z.number().int(),
  deadline: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

// Full campaign returned by the detail endpoint
export const CampaignDetailSchema = CampaignSummarySchema.extend({
  slug: z.string(),
  description: z.string(),
  alignmentStatement: z.string(),
  tags: z.array(z.string()),
  maxFundingCapUsd: z.coerce.number().int(),
  launchedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
  milestones: z.array(MilestoneSchema),
  stretchGoals: z.array(StretchGoalSchema),
  teamMembers: z.array(TeamMemberSchema),
  updates: z.array(CampaignUpdateSchema),
})

export type CampaignStatus = z.infer<typeof CampaignStatusSchema>
export type CampaignCategory = z.infer<typeof CampaignCategorySchema>
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>
export type Milestone = z.infer<typeof MilestoneSchema>
export type StretchGoal = z.infer<typeof StretchGoalSchema>
export type TeamMember = z.infer<typeof TeamMemberSchema>
export type CampaignUpdate = z.infer<typeof CampaignUpdateSchema>
export type CampaignSummary = z.infer<typeof CampaignSummarySchema>
export type CampaignDetail = z.infer<typeof CampaignDetailSchema>
