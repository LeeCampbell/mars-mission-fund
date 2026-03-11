import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'CAMPAIGN_SUBMITTED',
  'CAMPAIGN_APPROVED',
  'CAMPAIGN_REJECTED',
  'MILESTONE_SUBMITTED',
  'MILESTONE_VERIFIED',
  'MILESTONE_RETURNED',
  'CAMPAIGN_CANCELLED',
])

export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  campaignId: z.string().uuid().nullable(),
  read: z.boolean(),
  createdAt: z.string(),
})

export type Notification = z.infer<typeof NotificationSchema>
