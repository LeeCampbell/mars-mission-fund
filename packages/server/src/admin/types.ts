import { z } from 'zod'

export const VerifyBodySchema = z.object({
  notes: z.string().min(1),
})

export const ReturnBodySchema = z.object({
  feedback: z.string().min(1),
})

export const MilestoneRouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export const CancellationRouteParamsSchema = z.object({
  id: z.string().uuid(),
})

export type VerifyBody = z.infer<typeof VerifyBodySchema>
export type ReturnBody = z.infer<typeof ReturnBodySchema>
export type MilestoneRouteParams = z.infer<typeof MilestoneRouteParamsSchema>
export type CancellationRouteParams = z.infer<typeof CancellationRouteParamsSchema>
