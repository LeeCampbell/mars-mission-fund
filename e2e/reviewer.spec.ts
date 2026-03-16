import { test, expect, type Page } from '@playwright/test'

const SUBMITTED_CAMPAIGN_ID = '00000000-0011-0000-0000-000000000011'
const SUBMITTED_CAMPAIGN_TITLE = 'Mars Soil Analyser'

async function loginAsReviewer(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('reviewer@example.com')
  await page.getByLabel('Password').fill('reviewer-demo-pass')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('Reviewer flow', () => {
  test('review nav link is visible for reviewer role', async ({ page }) => {
    await loginAsReviewer(page)
    await expect(page.getByRole('link', { name: 'Review' })).toBeVisible()
  })

  test('review queue shows submitted campaigns', async ({ page }) => {
    await loginAsReviewer(page)
    await page.goto('/review')
    await expect(page.getByRole('heading', { name: 'Review Queue' })).toBeVisible()
    await expect(page.getByText(SUBMITTED_CAMPAIGN_TITLE)).toBeVisible()
  })

  test('claiming a campaign navigates to review detail page', async ({ page }) => {
    await loginAsReviewer(page)
    await page.goto('/review')

    // Wait for the table to appear and click claim for our campaign
    const claimButton = page.getByRole('button', {
      name: `Claim campaign: ${SUBMITTED_CAMPAIGN_TITLE}`,
    })
    await expect(claimButton).toBeVisible()
    await claimButton.click()

    // Should navigate to review detail page
    await expect(page).toHaveURL(`/review/${SUBMITTED_CAMPAIGN_ID}`)
    await expect(
      page.getByRole('heading', { name: SUBMITTED_CAMPAIGN_TITLE, level: 1 })
    ).toBeVisible()
  })

  test('review detail page shows campaign info and back link', async ({ page }) => {
    await loginAsReviewer(page)
    await page.goto('/review')

    // Claim the campaign
    const claimButton = page.getByRole('button', {
      name: `Claim campaign: ${SUBMITTED_CAMPAIGN_TITLE}`,
    })
    await claimButton.click()
    await expect(page).toHaveURL(`/review/${SUBMITTED_CAMPAIGN_ID}`)

    // Back link should be present
    await expect(page.getByRole('link', { name: /Back to Review Queue/i })).toBeVisible()

    // Campaign title renders
    await expect(
      page.getByRole('heading', { name: SUBMITTED_CAMPAIGN_TITLE, level: 1 })
    ).toBeVisible()

    // Review Actions panel should appear (campaign is now Under Review, assigned to this reviewer)
    await expect(page.getByLabel('Review actions')).toBeVisible()
  })

  test('reviewer can approve a claimed campaign', async ({ page }) => {
    await loginAsReviewer(page)
    await page.goto('/review')

    // Claim the campaign
    const claimButton = page.getByRole('button', {
      name: `Claim campaign: ${SUBMITTED_CAMPAIGN_TITLE}`,
    })
    await claimButton.click()
    await expect(page).toHaveURL(`/review/${SUBMITTED_CAMPAIGN_ID}`)

    // Fill in approval notes
    await page
      .getByLabel('Notes')
      .fill('Campaign meets all mission criteria and technical standards.')

    // Click approve
    await page.getByRole('button', { name: 'Approve' }).click()

    // After approval the Review Actions panel disappears (status changes to Approved)
    await expect(page.getByLabel('Review actions')).not.toBeVisible()
  })
})
