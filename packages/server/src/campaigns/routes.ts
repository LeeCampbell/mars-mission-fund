import { Router } from 'express'
import type { Pool } from 'pg'
import { ListQuerySchema, RouteParamsSchema } from './types.js'
import { listCampaigns, getCampaignById } from './queries.js'

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

    try {
      const campaigns = await listCampaigns(pool, parsed.data)
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

  return router
}
