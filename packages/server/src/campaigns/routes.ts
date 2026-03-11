import { Router } from 'express'
import type { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import {
  ListQuerySchema,
  RouteParamsSchema,
  SubmitRouteParamsSchema,
  CreateCampaignRequestSchema,
  UpdateCampaignRequestSchema,
  ApproveBodySchema,
  RejectBodySchema,
  PostUpdateBodySchema,
  ContributeBodySchema,
} from './types.js'
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  submitCampaign,
  getReviewQueue,
  claimCampaign,
  approveCampaign,
  rejectCampaign,
  resubmitCampaign,
  createAuditEvent,
  createNotification,
  getCampaignState,
  launchCampaign,
  postCampaignUpdate,
  recordContribution,
  cancelCampaign,
  requestCancellation,
  approveCancellation,
  enforceDeadline,
} from './queries.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { writeAuditEvent } from './audit.js'

type JwtUser = { id?: string; role?: string }

function makeError(message: string, status: number, code: string) {
  return Object.assign(new Error(message), { status, code, details: {} })
}

export function createCampaignRouter(pool: Pool): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    const parsed = ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid query parameters'), {
        status: 400,
        code: 'INVALID_QUERY_PARAMS',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    let creatorId: string | undefined = undefined

    if (parsed.data.createdBy === 'me') {
      const authHeader = req.headers['authorization']
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

      if (!token) {
        const err = Object.assign(new Error('Unauthorized'), {
          status: 401,
          code: 'UNAUTHORIZED',
          details: {},
        })
        return next(err)
      }

      const secret = process.env['JWT_SECRET']
      if (!secret) {
        const err = Object.assign(new Error('Internal server error'), {
          status: 500,
          code: 'INTERNAL_SERVER_ERROR',
          details: {},
        })
        return next(err)
      }

      try {
        const payload = jwt.verify(token, secret) as { id: string }
        creatorId = payload.id
      } catch {
        const err = Object.assign(new Error('Unauthorized'), {
          status: 401,
          code: 'UNAUTHORIZED',
          details: {},
        })
        return next(err)
      }
    }

    try {
      const campaigns = await listCampaigns(pool, parsed.data, creatorId)
      res.json({ data: campaigns })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', authenticate, requireRole('Creator'), async (req, res, next) => {
    const parsed = CreateCampaignRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const campaign = await createCampaign(pool, user.id, parsed.data)
      res.status(201).json({ data: campaign })
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = RouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const bodyParsed = UpdateCampaignRequestSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: bodyParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await updateCampaign(pool, paramsParsed.data.id, user.id, bodyParsed.data)

      if (result.reason === 'not_found') {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'forbidden') {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'not_draft') {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      res.json({ data: result.campaign })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = RouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await deleteCampaign(pool, paramsParsed.data.id, user.id)

      if (result.reason === 'not_found') {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'forbidden') {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.reason === 'not_draft') {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/submit', authenticate, requireRole('Creator'), async (req, res, next) => {
    const paramsParsed = SubmitRouteParamsSchema.safeParse(req.params)
    if (!paramsParsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: paramsParsed.error.flatten(),
      })
      return next(err)
    }

    const user = res.locals['user'] as { id: string }

    try {
      const result = await submitCampaign(pool, paramsParsed.data.id, user.id)

      if (result.errors.includes('not_found')) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      if (result.errors.includes('forbidden')) {
        const err = Object.assign(new Error('Forbidden'), {
          status: 403,
          code: 'FORBIDDEN',
          details: {},
        })
        return next(err)
      }
      if (result.errors.includes('not_draft')) {
        const err = Object.assign(new Error('Campaign is not editable'), {
          status: 409,
          code: 'CAMPAIGN_NOT_EDITABLE',
          details: {},
        })
        return next(err)
      }

      if (result.errors.length > 0) {
        const err = Object.assign(new Error('Submission validation failed'), {
          status: 422,
          code: 'SUBMISSION_VALIDATION_FAILED',
          details: result.errors,
        })
        return next(err)
      }

      res.json({ data: result.campaign })
    } catch (err) {
      next(err)
    }
  })

  // Must be registered before /:id to avoid UUID param collision
  router.get('/review-queue', authenticate, requireRole('Reviewer'), async (_req, res, next) => {
    try {
      const campaigns = await getReviewQueue(pool)
      res.json({ data: campaigns })
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    try {
      const campaign = await getCampaignById(pool, parsed.data.id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }
      res.json({ data: campaign })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/claim', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsed.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Submitted') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      const previousStatus = campaign.status
      const updated = await claimCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to claim campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.claim',
        previousState: previousStatus,
        newState: 'Under Review',
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.claimed',
          title: 'Campaign Under Review',
          message: `Your campaign "${campaign.title}" is now under review.`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/launch
  router.post('/:id/launch', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser
    if (user.role !== 'Creator') {
      return next(makeError('Forbidden', 403, 'FORBIDDEN'))
    }

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      // Ownership check: allow null creatorId (unassigned)
      if (campaign.creatorId !== null && campaign.creatorId !== user.id) {
        return next(makeError('Forbidden', 403, 'FORBIDDEN'))
      }

      if (campaign.status !== 'Approved') {
        return next(makeError('Campaign is not in Approved state', 409, 'INVALID_CAMPAIGN_STATE'))
      }

      const result = await launchCampaign(pool, parsed.data.id)

      writeAuditEvent(pool, {
        action: 'campaign.launch',
        actorId: user.id,
        actorType: 'Creator',
        resourceType: 'campaign',
        resourceId: parsed.data.id,
        outcome: 'success',
      })

      res
        .status(200)
        .json({ data: { id: result.id, status: result.status, launchedAt: result.launchedAt } })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/approve', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = RouteParamsSchema.safeParse(req.params)
    if (!parsedParams.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsedParams.error.flatten(),
      })
      return next(err)
    }

    const parsedBody = ApproveBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsedBody.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsedParams.data
    const { notes } = parsedBody.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Under Review') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.reviewerId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await approveCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to approve campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.approve',
        previousState: previousStatus,
        newState: 'Approved',
        metadata: { notes },
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.approved',
          title: 'Campaign Approved',
          message: `Your campaign "${campaign.title}" has been approved.`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/reject', authenticate, requireRole('Reviewer'), async (req, res, next) => {
    const parsedParams = RouteParamsSchema.safeParse(req.params)
    if (!parsedParams.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsedParams.error.flatten(),
      })
      return next(err)
    }

    const parsedBody = RejectBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      const err = Object.assign(new Error('Invalid request body'), {
        status: 400,
        code: 'INVALID_REQUEST_BODY',
        details: parsedBody.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsedParams.data
    const { rationale, guidance } = parsedBody.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Under Review') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.reviewerId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await rejectCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to reject campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.reject',
        previousState: previousStatus,
        newState: 'Rejected',
        metadata: { rationale, guidance },
      })

      if (campaign.creatorId) {
        await createNotification(pool, {
          userId: campaign.creatorId,
          campaignId: id,
          type: 'campaign.rejected',
          title: 'Campaign Rejected',
          message: `Your campaign "${campaign.title}" has been rejected. Guidance: ${guidance}`,
        })
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/resubmit', authenticate, async (req, res, next) => {
    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      const err = Object.assign(new Error('Invalid campaign ID'), {
        status: 400,
        code: 'INVALID_CAMPAIGN_ID',
        details: parsed.error.flatten(),
      })
      return next(err)
    }

    const actor = res.locals['user'] as { id: string }
    const { id } = parsed.data

    try {
      const campaign = await getCampaignById(pool, id)
      if (campaign === null) {
        const err = Object.assign(new Error('Campaign not found'), {
          status: 404,
          code: 'CAMPAIGN_NOT_FOUND',
          details: {},
        })
        return next(err)
      }

      if (campaign.status !== 'Rejected') {
        const err = Object.assign(new Error('Invalid campaign status for this action'), {
          status: 409,
          code: 'INVALID_CAMPAIGN_STATUS',
          details: {},
        })
        return next(err)
      }

      if (campaign.creatorId !== actor.id) {
        res.status(403).json({ error: { code: 'FORBIDDEN' } })
        return
      }

      const previousStatus = campaign.status
      const updated = await resubmitCampaign(pool, id, actor.id)
      if (updated === null) {
        return next(new Error('Failed to resubmit campaign'))
      }

      await createAuditEvent(pool, {
        campaignId: id,
        actorId: actor.id,
        eventType: 'campaign.resubmit',
        previousState: previousStatus,
        newState: 'Draft',
      })

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/updates
  router.post('/:id/updates', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser
    if (user.role !== 'Creator') {
      return next(makeError('Forbidden', 403, 'FORBIDDEN'))
    }

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    const bodyParsed = PostUpdateBodySchema.safeParse(req.body)
    if (!bodyParsed.success) {
      return next(
        Object.assign(new Error('Invalid request body'), {
          status: 400,
          code: 'INVALID_REQUEST_BODY',
          details: bodyParsed.error.flatten(),
        })
      )
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      if (campaign.creatorId !== null && campaign.creatorId !== user.id) {
        return next(makeError('Forbidden', 403, 'FORBIDDEN'))
      }

      if (campaign.status !== 'Live' && campaign.status !== 'Funded') {
        return next(
          makeError('Campaign is not in Live or Funded state', 409, 'INVALID_CAMPAIGN_STATE')
        )
      }

      const result = await postCampaignUpdate(pool, parsed.data.id, bodyParsed.data.body)

      writeAuditEvent(pool, {
        action: 'campaign.update_posted',
        actorId: user.id,
        actorType: 'Creator',
        resourceType: 'campaign',
        resourceId: parsed.data.id,
        outcome: 'success',
      })

      res
        .status(201)
        .json({ data: { id: result.id, body: result.body, postedAt: result.postedAt } })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/contribute
  router.post('/:id/contribute', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    const bodyParsed = ContributeBodySchema.safeParse(req.body)
    if (!bodyParsed.success) {
      return next(
        Object.assign(new Error('Invalid request body'), {
          status: 400,
          code: 'INVALID_REQUEST_BODY',
          details: bodyParsed.error.flatten(),
        })
      )
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      // Deadline guard: if deadline passed, campaign is Live, and underfunded → enforce deadline
      const now = new Date()
      if (
        campaign.deadline !== null &&
        campaign.deadline < now &&
        campaign.status === 'Live' &&
        campaign.currentAmountUsd < campaign.minFundingTargetUsd
      ) {
        await enforceDeadline(pool, parsed.data.id)
        writeAuditEvent(pool, {
          action: 'campaign.deadline_expired',
          actorId: user.id,
          resourceType: 'campaign',
          resourceId: parsed.data.id,
          outcome: 'success',
        })
        return next(makeError('Campaign deadline has passed', 409, 'CAMPAIGN_DEADLINE_PASSED'))
      }

      if (campaign.status !== 'Live' && campaign.status !== 'Funded') {
        return next(
          makeError('Campaign is not accepting contributions', 409, 'INVALID_CAMPAIGN_STATE')
        )
      }

      if (campaign.currentAmountUsd + bodyParsed.data.amountUsd > campaign.maxFundingCapUsd) {
        return next(makeError('Contribution would exceed funding cap', 422, 'FUNDING_CAP_EXCEEDED'))
      }

      const oldStatus = campaign.status
      const result = await recordContribution(
        pool,
        parsed.data.id,
        bodyParsed.data.amountUsd,
        campaign.minFundingTargetUsd
      )

      if (oldStatus === 'Live' && result.status === 'Funded') {
        writeAuditEvent(pool, {
          action: 'campaign.status_changed',
          actorId: user.id,
          resourceType: 'campaign',
          resourceId: parsed.data.id,
          outcome: 'success',
          previousState: { status: oldStatus },
          newState: { status: result.status },
        })
      }

      writeAuditEvent(pool, {
        action: 'campaign.contribution_received',
        actorId: user.id,
        resourceType: 'campaign',
        resourceId: parsed.data.id,
        outcome: 'success',
        newState: { amountUsd: bodyParsed.data.amountUsd },
      })

      res.status(200).json({
        data: {
          currentAmountUsd: result.currentAmountUsd,
          contributorCount: result.contributorCount,
          status: result.status,
        },
      })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/cancel
  router.post('/:id/cancel', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser
    if (user.role !== 'Creator') {
      return next(makeError('Forbidden', 403, 'FORBIDDEN'))
    }

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      if (campaign.creatorId !== null && campaign.creatorId !== user.id) {
        return next(makeError('Forbidden', 403, 'FORBIDDEN'))
      }

      if (campaign.status !== 'Live') {
        return next(makeError('Campaign is not Live', 409, 'INVALID_CAMPAIGN_STATE'))
      }

      if (campaign.cancellationRequestedAt !== null) {
        return next(
          makeError('Cancellation already requested', 409, 'CANCELLATION_ALREADY_REQUESTED')
        )
      }

      if (campaign.contributorCount === 0) {
        // Branch A: no contributors — cancel immediately
        await cancelCampaign(pool, parsed.data.id)
        writeAuditEvent(pool, {
          action: 'campaign.cancelled',
          actorId: user.id,
          actorType: 'Creator',
          resourceType: 'campaign',
          resourceId: parsed.data.id,
          outcome: 'success',
        })
        res.status(200).json({ data: { status: 'Cancelled' } })
      } else {
        // Branch B: has contributors — request cancellation
        await requestCancellation(pool, parsed.data.id)
        writeAuditEvent(pool, {
          action: 'campaign.cancellation_requested',
          actorId: user.id,
          actorType: 'Creator',
          resourceType: 'campaign',
          resourceId: parsed.data.id,
          outcome: 'success',
        })
        res
          .status(202)
          .json({ data: { message: 'Cancellation requested. Awaiting administrator approval.' } })
      }
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/approve-cancel
  router.post('/:id/approve-cancel', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser
    if (user.role !== 'Administrator') {
      return next(makeError('Forbidden', 403, 'FORBIDDEN'))
    }

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      if (campaign.status !== 'Live' || campaign.cancellationRequestedAt === null) {
        return next(makeError('No pending cancellation request', 409, 'NO_PENDING_CANCELLATION'))
      }

      await approveCancellation(pool, parsed.data.id)

      writeAuditEvent(pool, {
        action: 'campaign.cancellation_approved',
        actorId: user.id,
        actorType: 'Administrator',
        resourceType: 'campaign',
        resourceId: parsed.data.id,
        outcome: 'success',
      })

      res.status(200).json({ data: { status: 'Cancelled' } })
    } catch (err) {
      next(err)
    }
  })

  // POST /v1/campaigns/:id/enforce-deadline
  router.post('/:id/enforce-deadline', authenticate, async (req, res, next) => {
    const user = res.locals['user'] as JwtUser
    if (user.role !== 'Administrator') {
      return next(makeError('Forbidden', 403, 'FORBIDDEN'))
    }

    const parsed = RouteParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return next(makeError('Invalid campaign ID', 400, 'INVALID_CAMPAIGN_ID'))
    }

    try {
      const campaign = await getCampaignState(pool, parsed.data.id)
      if (campaign === null) {
        return next(makeError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND'))
      }

      if (campaign.status !== 'Live') {
        return next(makeError('Campaign is not Live', 409, 'INVALID_CAMPAIGN_STATE'))
      }

      const now = new Date()
      if (campaign.deadline === null || campaign.deadline >= now) {
        return next(makeError('Campaign deadline has not passed', 409, 'DEADLINE_NOT_PASSED'))
      }

      if (campaign.currentAmountUsd < campaign.minFundingTargetUsd) {
        // Branch A: underfunded → fail the campaign
        await enforceDeadline(pool, parsed.data.id)
        writeAuditEvent(pool, {
          action: 'campaign.deadline_expired',
          actorId: user.id,
          actorType: 'Administrator',
          resourceType: 'campaign',
          resourceId: parsed.data.id,
          outcome: 'success',
        })
        res.status(200).json({ data: { status: 'Failed' } })
      } else {
        // Branch B: already funded — no enforcement needed
        res
          .status(200)
          .json({ data: { status: campaign.status, message: 'No enforcement needed.' } })
      }
    } catch (err) {
      next(err)
    }
  })

  return router
}
