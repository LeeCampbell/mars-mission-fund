import { z } from 'zod'

export const ReviewRouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const ApproveBodySchema = z.object({
  notes: z.string().min(1),
})

export const RejectBodySchema = z.object({
  rationale: z.string().min(1),
  guidance: z.string().min(1),
})

export type ReviewRouteParams = z.infer<typeof ReviewRouteParamsSchema>
export type ApproveBody = z.infer<typeof ApproveBodySchema>
export type RejectBody = z.infer<typeof RejectBodySchema>
