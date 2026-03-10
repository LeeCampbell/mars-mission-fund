import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import type { Pool } from 'pg'

const mockQuery = vi.fn()
const mockPool = { query: mockQuery } as unknown as Pool
const app = createApp(mockPool)

const TEST_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockCampaignSummary = {
  id: TEST_UUID,
  title: 'Mars Habitat Project',
  summary: 'Building a habitat on Mars',
  status: 'Live',
  category: 'Habitats & Construction',
  heroImageUrl: null,
  goalAmount: 500000,
  raisedAmount: 125000,
  contributorCount: 42,
  deadline: null,
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
}

const mockCampaignRow = {
  ...mockCampaignSummary,
  slug: 'mars-habitat-project',
  description: 'Detailed description of the Mars Habitat Project',
  alignmentStatement: 'Aligned with Mars colonization goals',
  tags: ['habitat', 'mars', 'construction'],
  maxFundingCapUsd: 1000000,
  launchedAt: new Date('2024-01-20T00:00:00.000Z'),
  updatedAt: new Date('2024-01-20T10:00:00.000Z'),
}

describe('Campaign Routes', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  describe('GET /v1/campaigns', () => {
    it('returns 200 with data array when campaigns exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCampaignSummary], rowCount: 1 })

      const res = await request(app).get('/v1/campaigns')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.headers['x-correlation-id']).toBeDefined()
    })

    it('returns 200 with filtered campaigns when status query param is valid', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCampaignSummary], rowCount: 1 })

      const res = await request(app).get('/v1/campaigns?status=Live')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('returns 400 with INVALID_QUERY_PARAMS error when status is invalid', async () => {
      const res = await request(app).get('/v1/campaigns?status=INVALID')

      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error.code).toBe('INVALID_QUERY_PARAMS')
      expect(res.body.error).toHaveProperty('correlation_id')
      expect(res.body.error).toHaveProperty('message')
    })
  })

  describe('GET /v1/campaigns/:id', () => {
    it('returns 200 with campaign data when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCampaignRow], rowCount: 1 })
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // milestones
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // stretch goals
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // team members
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // updates

      const res = await request(app).get(`/v1/campaigns/${TEST_UUID}`)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.id).toBe(TEST_UUID)
      expect(res.headers['x-correlation-id']).toBeDefined()
    })

    it('returns 404 with CAMPAIGN_NOT_FOUND when campaign does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const res = await request(app).get(`/v1/campaigns/${TEST_UUID}`)

      expect(res.status).toBe(404)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND')
      expect(res.body.error).toHaveProperty('correlation_id')
    })

    it('returns 400 with INVALID_CAMPAIGN_ID when ID is not a UUID', async () => {
      const res = await request(app).get('/v1/campaigns/not-a-uuid')

      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error.code).toBe('INVALID_CAMPAIGN_ID')
      expect(res.body.error).toHaveProperty('correlation_id')
    })
  })
})
