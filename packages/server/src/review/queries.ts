import { Pool } from 'pg'
import type { CampaignSummary } from '@mmf/shared'

export async function listSubmittedCampaigns(pool: Pool): Promise<CampaignSummary[]> {
  const sql = `
    SELECT
      id,
      title,
      summary,
      status,
      category,
      hero_image_url AS "heroImageUrl",
      min_funding_target_usd AS "goalAmount",
      current_amount_usd AS "raisedAmount",
      contributor_count AS "contributorCount",
      deadline,
      created_at AS "createdAt"
    FROM campaigns
    WHERE status = 'Submitted'
    ORDER BY created_at ASC
  `
  const result = await pool.query<CampaignSummary>(sql)
  return result.rows
}

export async function claimCampaign(pool: Pool, id: string, reviewerId: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaigns
       SET status = 'Under Review', reviewer_id = $1
       WHERE id = $2 AND status = 'Submitted'
       RETURNING creator_id, title`,
      [reviewerId, id]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { creator_id: creatorId, title } = updateResult.rows[0]

    if (creatorId) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
         VALUES (gen_random_uuid(), $1, 'CAMPAIGN_SUBMITTED', $2, $3, $4)`,
        [
          creatorId,
          'Your campaign is under review',
          `A reviewer has picked up "${title}" for review.`,
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

export async function approveCampaign(
  pool: Pool,
  id: string,
  notes: string,
  reviewerId: string
): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaigns
       SET status = 'Approved', review_notes = $1, reviewed_at = now()
       WHERE id = $2 AND reviewer_id = $3
       RETURNING creator_id, title`,
      [notes, id, reviewerId]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { creator_id: creatorId, title } = updateResult.rows[0]

    if (creatorId) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
         VALUES (gen_random_uuid(), $1, 'CAMPAIGN_APPROVED', $2, $3, $4)`,
        [creatorId, 'Campaign approved', `Your campaign "${title}" has been approved.`, id]
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

export async function rejectCampaign(
  pool: Pool,
  id: string,
  rationale: string,
  guidance: string,
  reviewerId: string
): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE campaigns
       SET status = 'Rejected',
           rejection_rationale = $1,
           rejection_guidance = $2,
           reviewed_at = now()
       WHERE id = $3 AND reviewer_id = $4
       RETURNING creator_id, title`,
      [rationale, guidance, id, reviewerId]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return
    }

    const { creator_id: creatorId, title } = updateResult.rows[0]

    if (creatorId) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, body, campaign_id)
         VALUES (gen_random_uuid(), $1, 'CAMPAIGN_REJECTED', $2, $3, $4)`,
        [
          creatorId,
          'Campaign rejected',
          `Your campaign "${title}" was not approved. Please review the feedback.`,
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
