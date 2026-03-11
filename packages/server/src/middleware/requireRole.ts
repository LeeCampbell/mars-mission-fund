import type { Request, Response, NextFunction } from 'express'
import type { Role } from '@mmf/shared'

export function requireRole(role: Role) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const user = res.locals['user'] as { role?: string } | undefined
    if (user?.role !== role) {
      res.status(403).json({ error: { code: 'FORBIDDEN' } })
      return
    }
    next()
  }
}
