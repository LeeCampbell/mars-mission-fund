import { test, expect, type Page } from '@playwright/test'

async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByLabel('Password').fill('admin-demo-pass')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('Admin campaign management', () => {
  test('admin nav link is visible for administrator role', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()
  })

  test('/admin/campaigns renders both sections', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/campaigns')

    await expect(page.getByRole('heading', { name: 'Campaign Management' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Awaiting Milestone Verification' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pending Cancellation Requests' })).toBeVisible()
  })

  test('non-admin is redirected away from /admin/campaigns', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('backer@example.com')
    await page.getByLabel('Password').fill('backer-demo-pass')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.goto('/admin/campaigns')
    await expect(page).not.toHaveURL('/admin/campaigns')
  })

  test('/admin/campaigns links to campaign detail pages', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/campaigns')

    // After the reviewer flow seeds a Settlement campaign we'd see it here.
    // If no Settlement campaigns exist, the empty state should render.
    const settlingSection = page.getByRole('heading', { name: 'Awaiting Milestone Verification' })
    await expect(settlingSection).toBeVisible()

    // Any campaign links in the settlement table should go to /campaigns/:id
    const campaignLinks = page.locator('table a[href^="/campaigns/"]')
    const count = await campaignLinks.count()
    if (count > 0) {
      const href = await campaignLinks.first().getAttribute('href')
      expect(href).toMatch(/^\/campaigns\/[0-9a-f-]+$/)
    }
  })
})
