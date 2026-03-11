import { Pool } from 'pg'
import type { Notification } from '@mmf/shared'

export async function listNotifications(pool: Pool, userId: string): Promise<Notification[]> {
  const sql = `
    SELECT
      id,
      user_id AS "userId",
      type,
      title,
      message,
      campaign_id AS "campaignId",
      read,
      created_at AS "createdAt"
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
  `
  const result = await pool.query<Notification>(sql, [userId])
  return result.rows
}

export async function markNotificationRead(pool: Pool, id: string, userId: string): Promise<void> {
  await pool.query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ])
}
