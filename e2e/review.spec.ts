import { test, expect, type Page } from '@playwright/test'

const REVIEWER_EMAIL = 'reviewer@example.com'
const REVIEWER_PASS = 'reviewer-demo-pass'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASS = 'admin-demo-pass'

const SUBMITTED_CAMPAIGN_1_ID = '00000000-0011-0000-0000-000000000011'
const SUBMITTED_CAMPAIGN_1_TITLE = 'Mars Deep-Drill Core Sampler'
const SUBMITTED_CAMPAIGN_2_TITLE = 'Mars Dust Storm Early Warning Network'

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('Reviewer flow — queue', () => {
  test('reviewer sees submitted campaigns in review queue', async ({ page }) => {
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await expect(page).toHaveURL('/')

    await page.goto('/review')
    await expect(page.getByRole('heading', { name: 'Review Queue' })).toBeVisible()
    await expect(page.getByText(SUBMITTED_CAMPAIGN_1_TITLE)).toBeVisible()
    await expect(page.getByText(SUBMITTED_CAMPAIGN_2_TITLE)).toBeVisible()
  })

  test('reviewer claims a campaign and is redirected to review detail', async ({ page }) => {
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await expect(page).toHaveURL('/')

    await page.goto('/review')

    // Click Claim on the row containing the target campaign title
    const targetRow = page.locator('tr').filter({ hasText: SUBMITTED_CAMPAIGN_1_TITLE })
    await targetRow.getByRole('button', { name: 'Claim' }).click()

    // Should redirect to /review/:id
    await expect(page).toHaveURL(`/review/${SUBMITTED_CAMPAIGN_1_ID}`)
    await expect(page.getByRole('heading', { name: SUBMITTED_CAMPAIGN_1_TITLE })).toBeVisible()
  })

  test('reviewer approves claimed campaign and is returned to queue', async ({ page }) => {
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await expect(page).toHaveURL('/')

    // Navigate directly to the campaign detail (now Under Review after previous test)
    await page.goto(`/review/${SUBMITTED_CAMPAIGN_1_ID}`)
    await expect(page.getByRole('heading', { name: SUBMITTED_CAMPAIGN_1_TITLE })).toBeVisible()

    // Fill in approval notes
    await page
      .getByLabel('Review Notes')
      .fill('Solid technical approach, well-documented milestones.')

    // Submit approval
    await page.getByRole('button', { name: 'Approve' }).click()

    // Should redirect back to /review
    await expect(page).toHaveURL('/review')

    // Approved campaign should no longer appear in the queue
    await expect(page.getByText(SUBMITTED_CAMPAIGN_1_TITLE)).not.toBeVisible()
  })
})

test.describe('Admin flow — milestones', () => {
  test('admin sees submitted milestones on milestones page', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS)
    await expect(page).toHaveURL('/')

    await page.goto('/admin/milestones')
    await expect(page.getByRole('heading', { name: 'Submitted Milestones' })).toBeVisible()

    // Both submitted milestones from seeded data should be visible
    await expect(page.getByText('Orbital Demonstration Flight')).toBeVisible()
    await expect(page.getByText('Rideshare Launch & Commissioning')).toBeVisible()

    // Campaign titles for the milestones
    await expect(page.getByText('Adaptive Aeroshell Heat Shield')).toBeVisible()
    await expect(page.getByText('Laser Optical Relay Network')).toBeVisible()
  })
})

test.describe('Notifications', () => {
  test('notification bell shows unread count badge for reviewer', async ({ page }) => {
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await expect(page).toHaveURL('/')

    // Reviewer has 2 unread notifications seeded — badge should show the count
    const badge = page.getByLabel(/\d+ unread notifications/)
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('2')
  })

  test('notifications page lists notification items', async ({ page }) => {
    await login(page, REVIEWER_EMAIL, REVIEWER_PASS)
    await expect(page).toHaveURL('/')

    await page.goto('/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()

    // Seeded notifications for reviewer
    await expect(
      page.getByText('Mars Deep-Drill Core Sampler has been submitted and is awaiting your review.')
    ).toBeVisible()

    // "Mark as read" buttons should be present for unread notifications
    const markReadButtons = page.getByRole('button', { name: 'Mark as read' })
    await expect(markReadButtons.first()).toBeVisible()
  })
})
