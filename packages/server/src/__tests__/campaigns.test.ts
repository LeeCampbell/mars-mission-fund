import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../app.js'
import type { Pool } from 'pg'

const mockQuery = vi.fn()
const mockPool = { query: mockQuery } as unknown as Pool
const app = createApp(mockPool)

const TEST_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const CREATOR_UUID = '22222222-2222-2222-2222-222222222222'

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
  createdBy: CREATOR_UUID,
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
      expect(res.body.data[0].createdBy).toBe(CREATOR_UUID)
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
      expect(res.body.data.createdBy).toBe(CREATOR_UUID)
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

const TEST_JWT_SECRET = 'test-jwt-secret-for-write-tests'
const TEST_CREATOR_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

function makeCreatorToken(): string {
  return jwt.sign(
    { id: TEST_CREATOR_ID, email: 'creator@example.com', role: 'Creator' },
    TEST_JWT_SECRET,
    { expiresIn: '8h' }
  )
}

function makeBackerToken(): string {
  return jwt.sign(
    { id: TEST_CREATOR_ID, email: 'backer@example.com', role: 'Backer' },
    TEST_JWT_SECRET,
    { expiresIn: '8h' }
  )
}

// Returns a valid campaign row for submitCampaign's SELECT query (snake_case columns)
function makeSubmitCampaignRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return {
    id: TEST_UUID,
    creator_id: TEST_CREATOR_ID,
    status: 'Draft',
    title: 'Mars Habitat Project',
    summary: 'Building a habitat on Mars',
    description: 'Detailed description of the project',
    alignment_statement: 'Aligned with Mars colonization goals',
    min_funding_target_usd: 2_000_000,
    max_funding_cap_usd: 5_000_000,
    deadline: futureDeadline,
    risk_disclosures: ['Risk of mission failure'],
    ...overrides,
  }
}

// Sets up the 5 pool.query calls that getCampaignById makes
function mockGetCampaignById(): void {
  mockQuery.mockResolvedValueOnce({ rows: [mockCampaignRow], rowCount: 1 }) // campaign
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // milestones
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // stretch goals
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // team members
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // updates
}

describe('Campaign Write Endpoints', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    vi.stubEnv('JWT_SECRET', TEST_JWT_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('POST /v1/campaigns', () => {
    it('returns 201 with campaign data on success', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: TEST_UUID }], rowCount: 1 }) // INSERT campaign
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT audit event
      mockGetCampaignById()

      const res = await request(app)
        .post('/v1/campaigns')
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Mars Habitat Project', category: 'Habitats & Construction' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.id).toBe(TEST_UUID)
    })

    it('returns 400 INVALID_REQUEST_BODY when body is invalid', async () => {
      const res = await request(app)
        .post('/v1/campaigns')
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: '' }) // title fails min(1), category missing

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_REQUEST_BODY')
    })

    it('returns 401 UNAUTHORIZED when no token provided', async () => {
      const res = await request(app)
        .post('/v1/campaigns')
        .send({ title: 'Test', category: 'Propulsion' })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 403 FORBIDDEN when caller is not Creator role', async () => {
      const res = await request(app)
        .post('/v1/campaigns')
        .set('Authorization', `Bearer ${makeBackerToken()}`)
        .send({ title: 'Test', category: 'Propulsion' })

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })
  })

  describe('PUT /v1/campaigns/:id', () => {
    it('returns 200 with updated campaign on success', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: TEST_CREATOR_ID, status: 'Draft' }],
        rowCount: 1,
      }) // SELECT check
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // UPDATE
      mockGetCampaignById()

      const res = await request(app)
        .put(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.id).toBe(TEST_UUID)
    })

    it('returns 400 INVALID_CAMPAIGN_ID when id is not a UUID', async () => {
      const res = await request(app)
        .put('/v1/campaigns/not-a-uuid')
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_CAMPAIGN_ID')
    })

    it('returns 404 CAMPAIGN_NOT_FOUND when campaign does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT check → not found

      const res = await request(app)
        .put(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND')
    })

    it('returns 403 FORBIDDEN when caller is not the campaign creator', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: 'other-creator-id', status: 'Draft' }],
        rowCount: 1,
      })

      const res = await request(app)
        .put(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 409 CAMPAIGN_NOT_EDITABLE when campaign is not in Draft state', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: TEST_CREATOR_ID, status: 'Live' }],
        rowCount: 1,
      })

      const res = await request(app)
        .put(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_EDITABLE')
    })
  })

  describe('DELETE /v1/campaigns/:id', () => {
    it('returns 204 with no body on success', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: TEST_CREATOR_ID, status: 'Draft' }],
        rowCount: 1,
      }) // SELECT check
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // DELETE

      const res = await request(app)
        .delete(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(204)
      expect(res.body).toEqual({})
    })

    it('returns 403 FORBIDDEN when caller is not the campaign creator', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: 'other-creator-id', status: 'Draft' }],
        rowCount: 1,
      })

      const res = await request(app)
        .delete(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 409 CAMPAIGN_NOT_EDITABLE when campaign is not in Draft state', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: TEST_UUID, creator_id: TEST_CREATOR_ID, status: 'Submitted' }],
        rowCount: 1,
      })

      const res = await request(app)
        .delete(`/v1/campaigns/${TEST_UUID}`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_EDITABLE')
    })
  })

  describe('POST /v1/campaigns/:id/submit', () => {
    it('returns 200 with submitted campaign when all validations pass', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeSubmitCampaignRow()], rowCount: 1 }) // SELECT campaign
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 }) // team COUNT
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '2', total_pct: '100' }], rowCount: 1 }) // milestones COUNT+SUM
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // UPDATE status
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT audit event
      mockGetCampaignById()

      const res = await request(app)
        .post(`/v1/campaigns/${TEST_UUID}/submit`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.id).toBe(TEST_UUID)
    })

    it('returns 422 SUBMISSION_VALIDATION_FAILED when milestone percentages do not sum to 100 (AC-CAMP-003)', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeSubmitCampaignRow()], rowCount: 1 })
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 }) // team OK
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '2', total_pct: '90' }], rowCount: 1 }) // milestones sum ≠ 100

      const res = await request(app)
        .post(`/v1/campaigns/${TEST_UUID}/submit`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(422)
      expect(res.body.error.code).toBe('SUBMISSION_VALIDATION_FAILED')
      expect(Array.isArray(res.body.error.details)).toBe(true)
      expect(res.body.error.details).toContain('milestone funding percentages must sum to 100')
    })

    it('returns 422 SUBMISSION_VALIDATION_FAILED when required fields are missing (AC-CAMP-001)', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          makeSubmitCampaignRow({
            title: '',
            summary: '',
            description: '',
            alignment_statement: '',
            min_funding_target_usd: 0,
            max_funding_cap_usd: 0,
            deadline: null,
            risk_disclosures: [],
          }),
        ],
        rowCount: 1,
      })
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }) // team missing
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1', total_pct: '50' }], rowCount: 1 }) // milestones < 2

      const res = await request(app)
        .post(`/v1/campaigns/${TEST_UUID}/submit`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(422)
      expect(res.body.error.code).toBe('SUBMISSION_VALIDATION_FAILED')
      expect(Array.isArray(res.body.error.details)).toBe(true)
      expect(res.body.error.details.length).toBeGreaterThan(0)
    })

    it('returns 409 CAMPAIGN_NOT_EDITABLE when campaign is not in Draft state', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeSubmitCampaignRow({ status: 'Submitted' })],
        rowCount: 1,
      })

      const res = await request(app)
        .post(`/v1/campaigns/${TEST_UUID}/submit`)
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_EDITABLE')
    })
  })

  describe('GET /v1/campaigns?createdBy=me', () => {
    it('returns 200 with filtered campaigns when valid token provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCampaignSummary], rowCount: 1 })

      const res = await request(app)
        .get('/v1/campaigns?createdBy=me')
        .set('Authorization', `Bearer ${makeCreatorToken()}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })

    it('returns 401 UNAUTHORIZED when no token provided', async () => {
      const res = await request(app).get('/v1/campaigns?createdBy=me')

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })
  })
})
