import { test, expect, type Page } from '@playwright/test'

// Campaign 2: Aeroshell Heat Shield — status Funded, milestone 3 is Submitted
const FUNDED_CAMPAIGN_ID = '00000000-0002-0000-0000-000000000002'
const SUBMITTED_MILESTONE_ID = '10000000-0002-0003-0000-000000000002'

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('Admin milestone verification', () => {
  test('admin can verify milestone evidence', async ({ page }) => {
    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    // Mock verify endpoint to avoid permanently mutating DB state
    await page.route(
      `**/v1/campaigns/${FUNDED_CAMPAIGN_ID}/milestones/${SUBMITTED_MILESTONE_ID}/verify`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
    )

    await page.goto(`/campaigns/${FUNDED_CAMPAIGN_ID}`)

    // AdminActionsPanel should be visible for admin when there are Submitted milestones
    const adminPanel = page.getByLabel('Admin actions')
    await expect(adminPanel).toBeVisible()

    // Verify button should be present for the Submitted milestone
    const verifyButton = adminPanel.getByRole('button', { name: 'Verify' }).first()
    await expect(verifyButton).toBeVisible()

    // Click Verify
    await verifyButton.click()

    // Should show success feedback
    await expect(adminPanel.getByText('Milestone verified successfully.')).toBeVisible()
  })

  test('admin can return milestone evidence with feedback', async ({ page }) => {
    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    // Mock return endpoint
    await page.route(
      `**/v1/campaigns/${FUNDED_CAMPAIGN_ID}/milestones/${SUBMITTED_MILESTONE_ID}/return`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
    )

    await page.goto(`/campaigns/${FUNDED_CAMPAIGN_ID}`)

    const adminPanel = page.getByLabel('Admin actions')
    await expect(adminPanel).toBeVisible()

    // Click Return to reveal feedback form
    await adminPanel.getByRole('button', { name: 'Return' }).first().click()

    // Fill in feedback
    await adminPanel
      .getByPlaceholder('Explain what needs to be corrected…')
      .fill('Please provide more detailed measurement data.')

    // Submit the return
    await adminPanel.getByRole('button', { name: 'Submit Return' }).click()

    // Should show success feedback
    await expect(adminPanel.getByText('Milestone returned with feedback.')).toBeVisible()
  })
})

test.describe('Admin cancellation approval', () => {
  test('admin can approve a cancellation request', async ({ page }) => {
    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    // Intercept campaign detail to inject a pending cancellation request
    // The API returns { data: CampaignDetail } — inject into data
    await page.route(`**/v1/campaigns/${FUNDED_CAMPAIGN_ID}`, async (route) => {
      const response = await route.fetch()
      const json = (await response.json()) as { data: Record<string, unknown> }
      json.data['cancellationRequestedAt'] = new Date('2026-03-10T12:00:00Z').toISOString()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      })
    })

    // Mock the approve-cancellation endpoint
    await page.route(`**/v1/campaigns/${FUNDED_CAMPAIGN_ID}/approve-cancellation`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    )

    await page.goto(`/campaigns/${FUNDED_CAMPAIGN_ID}`)

    // AdminActionsPanel should show the cancellation approval section
    const adminPanel = page.getByLabel('Admin actions')
    await expect(adminPanel).toBeVisible()
    await expect(adminPanel.getByText('Cancellation Request')).toBeVisible()

    const approveButton = adminPanel.getByRole('button', { name: 'Approve Cancellation' })
    await expect(approveButton).toBeVisible()

    // Click Approve Cancellation
    await approveButton.click()

    // Should show success feedback
    await expect(adminPanel.getByText('Cancellation approved.')).toBeVisible()
  })
})
