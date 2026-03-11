import { Pool } from 'pg'

export interface SubmittedMilestone {
  id: string
  campaignId: string
  campaignTitle: string
  title: string
  description: string
  evidenceUrl: string | null
  evidenceNotes: string | null
  status: string
}

export interface CancellationRequest {
  id: string
  title: string
  status: string
  creatorId: string | null
  cancellationRequestedAt: string
  cancellationReason: string | null
}

export async function listSubmittedMilestones(pool: Pool): Promise<SubmittedMilestone[]> {
  const sql = `
    SELECT
      m.id,
      m.campaign_id AS "campaignId",
      c.title AS "campaignTitle",
      m.title,
      m.description,
      m.evidence_url AS "evidenceUrl",
      m.evidence_notes AS "evidenceNotes",
      m.status
    FROM campaign_milestones m
    JOIN campaigns c ON c.id = m.campaign_id
    WHERE m.status = 'Submitted'
    ORDER BY m.id ASC
  `
  const result = await pool.query<SubmittedMilestone>(sql)
  return result.rows
}

export async function verifyMilestone(pool: Pool, id: string, notes: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaign_milestones
       SET status = 'Verified', admin_feedback = $1, verified_at = now()
       WHERE id = $2 AND status = 'Submitted'
       RETURNING campaign_id`,
      [notes, id]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { campaign_id: campaignId } = updateResult.rows[0]

    const campaignResult = await client.query(
      `SELECT creator_id, title FROM campaigns WHERE id = $1`,
      [campaignId]
    )

    if (campaignResult.rows.length > 0) {
      const { creator_id: creatorId, title } = campaignResult.rows[0]
      if (creatorId) {
        await client.query(
          `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
           VALUES (gen_random_uuid(), $1, 'MILESTONE_VERIFIED', $2, $3, $4)`,
          [
            creatorId,
            'Milestone verified',
            `A milestone for your campaign "${title}" has been verified.`,
            campaignId,
          ]
        )
      }
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function returnMilestone(pool: Pool, id: string, feedback: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaign_milestones
       SET status = 'Pending', admin_feedback = $1, returned_at = now()
       WHERE id = $2 AND status = 'Submitted'
       RETURNING campaign_id`,
      [feedback, id]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { campaign_id: campaignId } = updateResult.rows[0]

    const campaignResult = await client.query(
      `SELECT creator_id, title FROM campaigns WHERE id = $1`,
      [campaignId]
    )

    if (campaignResult.rows.length > 0) {
      const { creator_id: creatorId, title } = campaignResult.rows[0]
      if (creatorId) {
        await client.query(
          `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
           VALUES (gen_random_uuid(), $1, 'MILESTONE_RETURNED', $2, $3, $4)`,
          [
            creatorId,
            'Milestone returned for revision',
            `A milestone for your campaign "${title}" has been returned for revision.`,
            campaignId,
          ]
        )
      }
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function listCancellationRequests(pool: Pool): Promise<CancellationRequest[]> {
  const sql = `
    SELECT
      id,
      title,
      status,
      creator_id AS "creatorId",
      cancellation_requested_at AS "cancellationRequestedAt",
      cancellation_reason AS "cancellationReason"
    FROM campaigns
    WHERE cancellation_requested_at IS NOT NULL
    ORDER BY cancellation_requested_at ASC
  `
  const result = await pool.query<CancellationRequest>(sql)
  return result.rows
}

export async function approveCancellation(pool: Pool, id: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaigns
       SET status = 'Cancelled',
           cancellation_requested_at = NULL,
           cancellation_reason = NULL
       WHERE id = $1 AND cancellation_requested_at IS NOT NULL
       RETURNING creator_id, title`,
      [id]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { creator_id: creatorId, title } = updateResult.rows[0]

    if (creatorId) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
         VALUES (gen_random_uuid(), $1, 'CAMPAIGN_CANCELLED', $2, $3, $4)`,
        [
          creatorId,
          'Campaign cancellation approved',
          `Your cancellation request for "${title}" has been approved.`,
          id,
        ]
      )
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function denyCancellation(pool: Pool, id: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaigns
       SET cancellation_requested_at = NULL,
           cancellation_reason = NULL
       WHERE id = $1 AND cancellation_requested_at IS NOT NULL
       RETURNING creator_id, title`,
      [id]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { creator_id: creatorId, title } = updateResult.rows[0]

    if (creatorId) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
         VALUES (gen_random_uuid(), $1, 'CAMPAIGN_CANCELLED', $2, $3, $4)`,
        [
          creatorId,
          'Campaign cancellation denied',
          `Your cancellation request for "${title}" has been denied.`,
          id,
        ]
      )
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
