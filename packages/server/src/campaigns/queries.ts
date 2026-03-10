import { Pool } from 'pg'
import { CampaignSummary, CampaignDetail } from './types.js'
import { ListQuery } from './types.js'

export async function listCampaigns(pool: Pool, filters: ListQuery): Promise<CampaignSummary[]> {
  const conditions: string[] = []
  const params: string[] = []

  if (filters.status !== undefined) {
    params.push(filters.status)
    conditions.push(`status = $${params.length}`)
  }

  if (filters.category !== undefined) {
    params.push(filters.category)
    conditions.push(`category = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

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
    ${where}
    ORDER BY created_at DESC
  `

  const result = await pool.query<CampaignSummary>(sql, params)
  return result.rows
}

export async function getCampaignById(pool: Pool, id: string): Promise<CampaignDetail | null> {
  const campaignSql = `
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
      created_at AS "createdAt",
      slug,
      description,
      alignment_statement AS "alignmentStatement",
      tags,
      max_funding_cap_usd AS "maxFundingCapUsd",
      launched_at AS "launchedAt",
      updated_at AS "updatedAt"
    FROM campaigns
    WHERE id = $1
  `

  const campaignResult = await pool.query(campaignSql, [id])
  if (campaignResult.rowCount === 0) {
    return null
  }
  const campaign = campaignResult.rows[0]

  const milestonesResult = await pool.query(
    `SELECT
      id,
      title,
      description,
      target_date AS "targetDate",
      funding_pct AS "fundingPercentage",
      verification_criteria AS "verificationCriteria",
      status,
      sort_order AS "sortOrder"
    FROM campaign_milestones
    WHERE campaign_id = $1
    ORDER BY sort_order`,
    [id]
  )

  const stretchGoalsResult = await pool.query(
    `SELECT
      id,
      target_usd AS "targetAmount",
      description,
      deliverables,
      sort_order AS "sortOrder"
    FROM campaign_stretch_goals
    WHERE campaign_id = $1
    ORDER BY sort_order`,
    [id]
  )

  const teamMembersResult = await pool.query(
    `SELECT
      id,
      name,
      role,
      bio,
      sort_order AS "sortOrder"
    FROM campaign_team_members
    WHERE campaign_id = $1
    ORDER BY sort_order`,
    [id]
  )

  const updatesResult = await pool.query(
    `SELECT
      id,
      body,
      posted_at AS "postedAt"
    FROM campaign_updates
    WHERE campaign_id = $1
    ORDER BY posted_at DESC`,
    [id]
  )

  const stretchGoals = stretchGoalsResult.rows.map((goal) => ({
    ...goal,
    unlocked: goal.targetAmount <= campaign.raisedAmount,
  }))

  const detail: CampaignDetail = {
    ...campaign,
    milestones: milestonesResult.rows,
    stretchGoals,
    teamMembers: teamMembersResult.rows,
    updates: updatesResult.rows,
  }

  return detail
}
