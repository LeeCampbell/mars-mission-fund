// DEMO STUB: validates a stateless JWT rather than a Clerk session.
// Production (L3-002) requires Clerk-managed sessions with revocation.

import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED' } })
    return
  }

  const secret = process.env['JWT_SECRET']
  if (!secret) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' } })
    return
  }

  try {
    const payload = jwt.verify(token, secret)
    res.locals['user'] = payload
    next()
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED' } })
  }
}
