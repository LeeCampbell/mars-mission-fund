import { Router } from 'express'
import type { Pool } from 'pg'
import { authenticate } from '../middleware/authenticate.js'
import { getNotificationsForUser, markNotificationRead } from '../campaigns/queries.js'

export function createNotificationsRouter(pool: Pool): Router {
  const router = Router()

  // GET /v1/notifications — authenticated
  router.get('/', authenticate, async (_req, res, next) => {
    const user = res.locals['user'] as { id: string }
    try {
      const notifications = await getNotificationsForUser(pool, user.id)
      res.json({ data: notifications })
    } catch (err) {
      next(err)
    }
  })

  // PATCH /v1/notifications/:id/read — authenticated
  router.patch('/:id/read', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as { id: string }
    try {
      await markNotificationRead(pool, req.params['id'] as string, user.id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  return router
}
