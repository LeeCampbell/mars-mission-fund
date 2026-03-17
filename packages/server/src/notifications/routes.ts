import { Router } from 'express'
import type { Pool } from 'pg'
import { authenticate } from '../middleware/authenticate.js'
import { getNotificationsForUser, markNotificationAsRead } from '../campaigns/queries.js'

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
      await markNotificationAsRead(pool, String(req.params['id']), user.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  })

  return router
}
