import { Pool } from 'pg'
import { Campaign, CampaignSummary, ListQuery } from './types.js'

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
      status,
      category,
      min_funding_target_usd AS goal_amount,
      current_amount_usd AS raised_amount,
      created_at
    FROM campaigns
    ${where}
    ORDER BY created_at DESC
  `

  const result = await pool.query<CampaignSummary>(sql, params)
  return result.rows
}

export async function getCampaignById(pool: Pool, id: string): Promise<Campaign | null> {
  const sql = `
    SELECT
      id,
      slug,
      title,
      summary,
      description,
      alignment_statement,
      category,
      tags,
      status,
      hero_image_url,
      min_funding_target_usd,
      max_funding_cap_usd,
      current_amount_usd,
      contributor_count,
      deadline,
      launched_at,
      created_at,
      updated_at
    FROM campaigns
    WHERE id = $1
  `

  const result = await pool.query<Campaign>(sql, [id])
  if (result.rowCount === 0) {
    return null
  }
  return result.rows[0] ?? null
}
