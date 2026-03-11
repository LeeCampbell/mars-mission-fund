import { Router } from 'express'
import type { Pool } from 'pg'
import { authenticate } from '../middleware/authenticate.js'
import { NotificationRouteParamsSchema } from './types.js'
import { listNotifications, markNotificationRead } from './queries.js'

export function createNotificationsRouter(pool: Pool): Router {
  const router = Router()

  // GET /v1/notifications — list notifications for the authenticated user
  router.get('/', authenticate, async (_req, res, next) => {
    const user = res.locals['user'] as { id: string }
    try {
      const notifications = await listNotifications(pool, user.id)
      res.json({ data: notifications })
    } catch (err) {
      next(err)
    }
  })

  // PATCH /v1/notifications/:id/read — mark a notification as read
  router.patch('/:id/read', authenticate, async (req, res, next) => {
    const parsed = NotificationRouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid notification ID'), {
        status: 400,
        code: 'INVALID_NOTIFICATION_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }
    try {
      await markNotificationRead(pool, parsed.data.id, user.id)
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  })

  return router
}
