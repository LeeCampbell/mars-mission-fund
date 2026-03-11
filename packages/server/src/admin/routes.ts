import { Router } from 'express'
import type { Pool } from 'pg'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  VerifyBodySchema,
  ReturnBodySchema,
  MilestoneRouteParamsSchema,
  CancellationRouteParamsSchema,
} from './types.js'
import {
  listSubmittedMilestones,
  verifyMilestone,
  returnMilestone,
  listCancellationRequests,
  approveCancellation,
  denyCancellation,
} from './queries.js'

const adminRoles = ['Administrator', 'SuperAdministrator'] as const

export function createAdminRouter(pool: Pool): Router {
  const router = Router()

  // GET /v1/admin/milestones — list Submitted milestones (Admin only)
  router.get('/milestones', authenticate, requireRole([...adminRoles]), async (_req, res, next) => {
    try {
      const milestones = await listSubmittedMilestones(pool)
      res.json({ data: milestones })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/admin/milestones/:id/verify — verify a milestone (Admin only)
  router.post(
    '/milestones/:id/verify',
    authenticate,
    requireRole([...adminRoles]),
    async (req, res, next) => {
      const parsedParams = MilestoneRouteParamsSchema.safeParse(req.params)
      if (!parsedParams.success) {
        const err = Object.assign(new Error('Invalid milestone ID'), {
          status: 400,
          code: 'INVALID_MILESTONE_ID',
          details: parsedParams.error.flatten(),
        })
        return next(err)
      }

      const parsedBody = VerifyBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        const err = Object.assign(new Error('Invalid request body'), {
          status: 400,
          code: 'INVALID_REQUEST_BODY',
          details: parsedBody.error.flatten(),
        })
        return next(err)
      }

      try {
        await verifyMilestone(pool, parsedParams.data.id, parsedBody.data.notes)
        res.json({ data: { success: true } })
      } catch (err) {
        next(err)
      }
    }
  )

  // POST /v1/admin/milestones/:id/return — return a milestone for revision (Admin only)
  router.post(
    '/milestones/:id/return',
    authenticate,
    requireRole([...adminRoles]),
    async (req, res, next) => {
      const parsedParams = MilestoneRouteParamsSchema.safeParse(req.params)
      if (!parsedParams.success) {
        const err = Object.assign(new Error('Invalid milestone ID'), {
          status: 400,
          code: 'INVALID_MILESTONE_ID',
          details: parsedParams.error.flatten(),
        })
        return next(err)
      }

      const parsedBody = ReturnBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        const err = Object.assign(new Error('Invalid request body'), {
          status: 400,
          code: 'INVALID_REQUEST_BODY',
          details: parsedBody.error.flatten(),
        })
        return next(err)
      }

      try {
        await returnMilestone(pool, parsedParams.data.id, parsedBody.data.feedback)
        res.json({ data: { success: true } })
      } catch (err) {
        next(err)
      }
    }
  )

  // GET /v1/admin/campaigns/cancellations — list cancellation requests (Admin only)
  router.get(
    '/campaigns/cancellations',
    authenticate,
    requireRole([...adminRoles]),
    async (_req, res, next) => {
      try {
        const campaigns = await listCancellationRequests(pool)
        res.json({ data: campaigns })
      } catch (err) {
        next(err)
      }
    }
  )

  // POST /v1/admin/campaigns/:id/approve-cancellation — approve cancellation (Admin only)
  router.post(
    '/campaigns/:id/approve-cancellation',
    authenticate,
    requireRole([...adminRoles]),
    async (req, res, next) => {
      const parsedParams = CancellationRouteParamsSchema.safeParse(req.params)
      if (!parsedParams.success) {
        const err = Object.assign(new Error('Invalid campaign ID'), {
          status: 400,
          code: 'INVALID_CAMPAIGN_ID',
          details: parsedParams.error.flatten(),
        })
        return next(err)
      }

      try {
        await approveCancellation(pool, parsedParams.data.id)
        res.json({ data: { success: true } })
      } catch (err) {
        next(err)
      }
    }
  )

  // POST /v1/admin/campaigns/:id/deny-cancellation — deny cancellation (Admin only)
  router.post(
    '/campaigns/:id/deny-cancellation',
    authenticate,
    requireRole([...adminRoles]),
    async (req, res, next) => {
      const parsedParams = CancellationRouteParamsSchema.safeParse(req.params)
      if (!parsedParams.success) {
        const err = Object.assign(new Error('Invalid campaign ID'), {
          status: 400,
          code: 'INVALID_CAMPAIGN_ID',
          details: parsedParams.error.flatten(),
        })
        return next(err)
      }

      try {
        await denyCancellation(pool, parsedParams.data.id)
        res.json({ data: { success: true } })
      } catch (err) {
        next(err)
      }
    }
  )

  return router
}
