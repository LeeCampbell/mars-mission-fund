import { Router } from 'express'
import type { Pool } from 'pg'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { ReviewRouteParamsSchema, ApproveBodySchema, RejectBodySchema } from './types.js'
import {
  listSubmittedCampaigns,
  claimCampaign,
  approveCampaign,
  rejectCampaign,
} from './queries.js'

export function createReviewRouter(pool: Pool): Router {
  const router = Router()

  // GET /v1/review — list Submitted campaigns (Reviewer only)
  router.get('/', authenticate, requireRole('Reviewer'), async (_req, res, next) => {
    try {
      const campaigns = await listSubmittedCampaigns(pool)
      res.json({ data: campaigns })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/review/:id/claim — claim a campaign for review (Reviewer only)
  router.post('/:id/claim', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsed = ReviewRouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const reviewer = res.locals['user'] as { id: string }
    try {
      await claimCampaign(pool, parsed.data.id, reviewer.id)
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/review/:id/approve — approve a campaign (Reviewer only)
  router.post('/:id/approve', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = ReviewRouteParamsSchema.safeParse(req.params)
    if (!parsedParams.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsedParams.error.flatten(),
      })
      return next(err)
    }

    const parsedBody = ApproveBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsedBody.error.flatten(),
      })
      return next(err)
    }

    const reviewer = res.locals['user'] as { id: string }
    try {
      await approveCampaign(pool, parsedParams.data.id, parsedBody.data.notes, reviewer.id)
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/review/:id/reject — reject a campaign (Reviewer only)
  router.post('/:id/reject', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = ReviewRouteParamsSchema.safeParse(req.params)
    if (!parsedParams.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsedParams.error.flatten(),
      })
      return next(err)
    }

    const parsedBody = RejectBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsedBody.error.flatten(),
      })
      return next(err)
    }

    const reviewer = res.locals['user'] as { id: string }
    try {
      await rejectCampaign(
        pool,
        parsedParams.data.id,
        parsedBody.data.rationale,
        parsedBody.data.guidance,
        reviewer.id
      )
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  })

  return router
}
