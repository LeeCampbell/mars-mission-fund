import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { authenticate } from '../middleware/authenticate.js'
import { getNotificationsForUser, markNotificationRead } from '../campaigns/queries.js'

const NotificationParamsSchema = z.object({
  id: z.string().uuid(),
})

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
    const parsed = NotificationParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid notification id' })
      return
    }
    try {
      const notification = await markNotificationRead(pool, parsed.data.id, user.id)
      if (!notification) {
        res.status(403).json({ error: 'Notification not found or access denied' })
        return
      }
      res.json({ data: notification })
    } catch (err) {
      next(err)
    }
  })

  return router
}
