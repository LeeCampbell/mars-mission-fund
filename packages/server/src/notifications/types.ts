import { z } from 'zod'

export const NotificationRouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export type NotificationRouteParams = z.infer<typeof NotificationRouteParamsSchema>
