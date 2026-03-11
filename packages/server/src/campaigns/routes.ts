import { Router } from 'express'
import type { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import {
  ListQuerySchema,
  RouteParamsSchema,
  SubmitRouteParamsSchema,
  CreateCampaignRequestSchema,
  UpdateCampaignRequestSchema,
  ApproveBodySchema,
  RejectBodySchema,
} from './types.js'
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  submitCampaign,
  getReviewQueue,
  claimCampaign,
  approveCampaign,
  rejectCampaign,
  resubmitCampaign,
  createAuditEvent,
  createNotification,
} from './queries.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

export function createCampaignRouter(pool: Pool): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    const parsed = ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid query parameters'), {
        status: 400,
        code: 'INVALID_QUERY_PARAMS',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    let creatorId: string | undefined = undefined

    if (parsed.data.createdBy === 'me') {
      const authHeader = req.headers['authorization']
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

      if (!token) {
        const err = Object.assign(new Error('Unauthorized'), {
          status: 401,
          code: 'UNAUTHORIZED',
          details: {},
        })
        return next(err)
      }

      const secret = process.env['JWT_SECRET']
      if (!secret) {
        const err = Object.assign(new Error('Internal server error'), {
          status: 500,
          code: 'INTERNAL_SERVER_ERROR',
          details: {},
        })
        return next(err)
      }

      try {
        const payload = jwt.verify(token, secret) as { id: string }
        creatorId = payload.id
      } catch {
        const err = Object.assign(new Error('Unauthorized'), {
          status: 401,
          code: 'UNAUTHORIZED',
          details: {},
        })
        return next(err)
      }
    }

    try {
      const campaigns = await listCampaigns(pool, parsed.data, creatorId)
      res.json({ data: campaigns })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', authenticate, requireRole('Creator'), async (req, res, next) => {
    const parsed = CreateCampaignRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const campaign = await createCampaign(pool, user.id, parsed.data)
      res.status(201).json({ data: campaign })
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = RouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const bodyParsed = UpdateCampaignRequestSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: bodyParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await updateCampaign(pool, paramsParsed.data.id, user.id, bodyParsed.data)

      if (result.reason === 'not_found') {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'forbidden') {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'not_draft') {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      res.json({ data: result.campaign })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = RouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await deleteCampaign(pool, paramsParsed.data.id, user.id)

      if (result.reason === 'not_found') {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'forbidden') {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'not_draft') {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/submit', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = SubmitRouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await submitCampaign(pool, paramsParsed.data.id, user.id)

      if (result.errors.includes('not_found')) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.errors.includes('forbidden')) {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.errors.includes('not_draft')) {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      if (result.errors.length > 0) {
        const err = Object.assign(new Error('Submission validation failed'), {
          status: 422,
          code: 'SUBMISSION_VALIDATION_FAILED',
          details: result.errors,
        })
        return next(err)
      }

      res.json({ data: result.campaign })
    } catch (err) {
      next(err)
    }
  })

  // Must be registered before /:id to avoid UUID param collision
  router.get('/review-queue', authenticate, requireRole('Reviewer'), async (_req, res, next) => {
    try {
      const campaigns = await getReviewQueue(pool)
      res.json({ data: campaigns })
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    try {
      const campaign = await getCampaignById(pool, parsed.data.id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      res.json({ data: campaign })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/claim', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsed.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Submitted') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      const previousStatus = campaign.status
      const updated = await claimCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to claim campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.claim',
        previousState: previousStatus,
        newState: 'Under Review',
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.claimed',
          title: 'Campaign Under Review',
          message: `Your campaign "${campaign.title}" is now under review.`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/approve', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = RouteParamsSchema.safeParse(req.params)
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

    const actor = res.locals['user'] as { id: string }
    const { id } = parsedParams.data
    const { notes } = parsedBody.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Under Review') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.reviewerId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await approveCampaign(pool, id, actor.id, notes)
      if (updated === null) {
        return next(new Error('Failed to approve campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.approve',
        previousState: previousStatus,
        newState: 'Approved',
        metadata: { notes },
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.approved',
          title: 'Campaign Approved',
          message: `Your campaign "${campaign.title}" has been approved.`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/reject', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = RouteParamsSchema.safeParse(req.params)
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

    const actor = res.locals['user'] as { id: string }
    const { id } = parsedParams.data
    const { rationale, guidance } = parsedBody.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Under Review') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.reviewerId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await rejectCampaign(pool, id, actor.id, rationale, guidance)
      if (updated === null) {
        return next(new Error('Failed to reject campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.reject',
        previousState: previousStatus,
        newState: 'Rejected',
        metadata: { rationale, guidance },
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.rejected',
          title: 'Campaign Rejected',
          message: `Your campaign "${campaign.title}" has been rejected. Guidance: ${guidance}`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/resubmit', authenticate, async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsed.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Rejected') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.creatorId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await resubmitCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to resubmit campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.resubmit',
        previousState: previousStatus,
        newState: 'Draft',
      })

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  return router
}
