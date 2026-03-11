import { test, expect, type Page } from '@playwright/test'

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

const CREATOR_EMAIL = 'creator@example.com'
const CREATOR_PASS = 'creator-demo-pass'
const REVIEWER_EMAIL = 'reviewer@example.com'
const REVIEWER_PASS = 'reviewer-demo-pass'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASS = 'admin-demo-pass'

test.describe('Campaign lifecycle', () => {
  // Depends on Issue #6 — Creator UI: /creator/campaigns/new page and
  // POST /v1/campaigns, PATCH /v1/campaigns/:id, POST /v1/campaigns/:id/submit endpoints
  test.fixme('Creator creates draft, fills required fields, submits for review', async ({
    page,
  }) => {
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns/new')

    // Fill required fields
    await page.getByLabel('Title').fill('Mars Habitat Alpha')
    await page.getByLabel('Tagline').fill('First permanent habitat on Mars')
    await page.getByLabel('Funding Goal').fill('500000')

    // Save draft
    await page.getByRole('button', { name: /Save draft/i }).click()
    await expect(page.getByText(/Draft/i)).toBeVisible()

    // Submit for review
    await page.getByRole('button', { name: /Submit for review/i }).click()
    await expect(page.getByText(/Submitted/i)).toBeVisible()
  })

  // Depends on Issue #7 — Reviewer/Admin UI: /review-queue and /review/:id pages,
  // POST /v1/campaigns/:id/claim and POST /v1/campaigns/:id/approve endpoints
  test.fixme('Reviewer views queue, claims campaign, approves with notes', async ({ page }) => {
    // First create and submit a campaign as creator
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns/new')
    await page.getByLabel('Title').fill('Mars Habitat Beta')
    await page.getByLabel('Tagline').fill('Second habitat on Mars')
    await page.getByLabel('Funding Goal').fill('750000')
    await page.getByRole('button', { name: /Save draft/i }).click()
    await page.getByRole('button', { name: /Submit for review/i }).click()
    await expect(page.getByText(/Submitted/i)).toBeVisible()

    // Switch to reviewer
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await page.goto('/review-queue')
    await expect(page.getByText('Mars Habitat Beta')).toBeVisible()

    // Claim campaign
    await page.getByRole('link', { name: 'Mars Habitat Beta' }).click()
    await page.getByRole('button', { name: /Claim/i }).click()
    await expect(page.getByText(/Claimed/i)).toBeVisible()

    // Approve with notes
    await page.getByLabel(/Notes/i).fill('Looks great — approved!')
    await page.getByRole('button', { name: /Approve/i }).click()
    await expect(page.getByText(/Approved/i)).toBeVisible()
  })

  // Depends on Issue #6 — Creator UI: POST /v1/campaigns/:id/launch and creator dashboard
  // Depends on Issue #7 — Reviewer/Admin UI: approve endpoint
  test.fixme('Creator launches approved campaign — campaign appears on public /campaigns', async ({
    page,
  }) => {
    // Create, submit, and get approved
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns/new')
    await page.getByLabel('Title').fill('Mars Habitat Gamma')
    await page.getByLabel('Tagline').fill('Third habitat on Mars')
    await page.getByLabel('Funding Goal').fill('1000000')
    await page.getByRole('button', { name: /Save draft/i }).click()
    await page.getByRole('button', { name: /Submit for review/i }).click()

    // Approve as reviewer
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await page.goto('/review-queue')
    await page.getByRole('link', { name: 'Mars Habitat Gamma' }).click()
    await page.getByRole('button', { name: /Claim/i }).click()
    await page.getByRole('button', { name: /Approve/i }).click()

    // Creator launches
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns')
    await page.getByRole('link', { name: 'Mars Habitat Gamma' }).click()
    await page.getByRole('button', { name: /Launch/i }).click()
    await expect(page.getByText(/Live/i)).toBeVisible()

    // Verify appears on public campaigns page
    await page.goto('/campaigns')
    await expect(page.getByText('Mars Habitat Gamma')).toBeVisible()
  })

  // Depends on Issue #7 — Reviewer/Admin UI: /review/:id page and POST /v1/campaigns/:id/reject
  // Depends on Issue #6 — Creator UI: creator dashboard shows rejection status
  test.fixme('Reviewer rejects campaign — creator sees rejection and can resubmit to Draft', async ({
    page,
  }) => {
    // Create and submit as creator
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns/new')
    await page.getByLabel('Title').fill('Mars Habitat Delta')
    await page.getByLabel('Tagline').fill('Fourth habitat on Mars')
    await page.getByLabel('Funding Goal').fill('250000')
    await page.getByRole('button', { name: /Save draft/i }).click()
    await page.getByRole('button', { name: /Submit for review/i }).click()

    // Reject as reviewer
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await page.goto('/review-queue')
    await page.getByRole('link', { name: 'Mars Habitat Delta' }).click()
    await page.getByRole('button', { name: /Claim/i }).click()
    await page.getByLabel(/Rejection rationale/i).fill('Insufficient detail on propulsion system')
    await page.getByRole('button', { name: /Reject/i }).click()
    await expect(page.getByText(/Rejected/i)).toBeVisible()

    // Creator sees rejection with rationale
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns')
    await expect(page.getByText('Mars Habitat Delta')).toBeVisible()
    await expect(page.getByText(/Rejected/i)).toBeVisible()
    await expect(page.getByText(/Insufficient detail on propulsion system/)).toBeVisible()

    // Creator revises — status returns to Draft
    await page.getByRole('link', { name: 'Mars Habitat Delta' }).click()
    await page.getByRole('button', { name: /Revise/i }).click()
    await expect(page.getByText(/Draft/i)).toBeVisible()
  })

  // Depends on Issue #6 — Creator UI: POST /v1/campaigns/:id/milestones/:milestoneId/evidence
  // Depends on Issue #7 — Admin UI: /admin/campaigns/:id and
  // POST /v1/campaigns/:id/milestones/:milestoneId/verify
  test.fixme('Creator submits milestone evidence — Admin verifies — funds released indicator visible', async ({
    page,
  }) => {
    // Assumes a live campaign with milestones exists for the creator
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns')

    // Navigate to a live campaign with a pending milestone
    const liveCampaign = page.getByText(/Live/i).first()
    await liveCampaign.locator('..').getByRole('link').click()

    // Submit milestone evidence
    await page.getByRole('button', { name: /Submit evidence/i }).click()
    await page.getByLabel(/Evidence URL/i).fill('https://example.com/milestone-proof')
    await page.getByLabel(/Notes/i).fill('Milestone completed successfully')
    await page.getByRole('button', { name: /Submit/i }).click()
    await expect(page.getByText(/Evidence submitted/i)).toBeVisible()

    // Admin verifies milestone
    await login(page, ADMIN_EMAIL, ADMIN_PASS)
    const campaignUrl = page.url()
    const campaignId = campaignUrl.split('/').pop()
    await page.goto(`/admin/campaigns/${campaignId}`)
    await expect(page.getByText(/Pending evidence/i)).toBeVisible()

    await page.getByRole('button', { name: /Verify milestone/i }).click()
    await expect(page.getByText(/Verified/i)).toBeVisible()

    // Funds released indicator visible
    await expect(page.getByText(/Funds released/i)).toBeVisible()
  })

  // Depends on Issue #6 — Creator UI: POST /v1/campaigns/:id/cancel (creator request)
  // Depends on Issue #7 — Admin UI: POST /v1/campaigns/:id/cancel (admin approval)
  test.fixme('Creator requests cancellation of live campaign — Admin approves — campaign Cancelled', async ({
    page,
  }) => {
    // Assumes a live campaign exists for the creator
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns')

    // Find a live campaign and request cancellation
    const liveCampaign = page.getByText(/Live/i).first()
    await liveCampaign.locator('..').getByRole('link').click()

    await page.getByRole('button', { name: /Request cancellation/i }).click()
    await page.getByLabel(/Reason/i).fill('Project scope changed significantly')
    await page.getByRole('button', { name: /Confirm/i }).click()
    await expect(page.getByText(/Cancellation requested/i)).toBeVisible()

    // Admin approves cancellation
    await login(page, ADMIN_EMAIL, ADMIN_PASS)
    const campaignUrl = page.url()
    const campaignId = campaignUrl.split('/').pop()
    await page.goto(`/admin/campaigns/${campaignId}`)
    await expect(page.getByText(/Cancellation requested/i)).toBeVisible()

    await page.getByRole('button', { name: /Approve cancellation/i }).click()
    await expect(page.getByText(/Cancelled/i)).toBeVisible()
  })

  // Depends on Issue #6 — Creator UI: notification indicator in creator dashboard
  // Depends on Issue #7 — Reviewer/Admin UI: approve/reject endpoints trigger notifications
  test.fixme('Creator receives visible notification for review actions (approve / reject)', async ({
    page,
  }) => {
    // Submit a campaign as creator
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    await page.goto('/creator/campaigns/new')
    await page.getByLabel('Title').fill('Mars Habitat Epsilon')
    await page.getByLabel('Tagline').fill('Fifth habitat on Mars')
    await page.getByLabel('Funding Goal').fill('300000')
    await page.getByRole('button', { name: /Save draft/i }).click()
    await page.getByRole('button', { name: /Submit for review/i }).click()

    // Approve as reviewer
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await page.goto('/review-queue')
    await page.getByRole('link', { name: 'Mars Habitat Epsilon' }).click()
    await page.getByRole('button', { name: /Claim/i }).click()
    await page.getByRole('button', { name: /Approve/i }).click()

    // Creator logs back in and sees notification
    await login(page, CREATOR_EMAIL, CREATOR_PASS)
    // Notification indicator should be visible (badge, banner, or alert)
    await expect(
      page
        .getByRole('alert')
        .or(page.getByText(/approved/i))
        .or(page.getByText(/notification/i))
    ).toBeVisible()
  })
})
