import { Router } from 'express'
import type { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import {
  ListQuerySchema,
  RouteParamsSchema,
  SubmitRouteParamsSchema,
  CreateCampaignRequestSchema,
  UpdateCampaignRequestSchema,
} from './types.js'
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  submitCampaign,
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

  return router
}
