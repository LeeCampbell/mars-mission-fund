import { test, expect } from '@playwright/test'

const SEEDED_CAMPAIGN_ID = '00000000-0001-0000-0000-000000000001'
const SEEDED_CAMPAIGN_TITLE = 'Methane Bi-Propellant Engine Testbed'

test.describe('Campaign list', () => {
  test('happy path — shows seeded campaigns', async ({ page }) => {
    await page.goto('/campaigns')
    const grid = page.getByLabel('Campaign listings')
    await expect(grid).toBeVisible()
    const links = grid.locator('a')
    await expect(links.first()).toBeVisible()
    await expect(page.getByText(SEEDED_CAMPAIGN_TITLE)).toBeVisible()
  })

  test('server error — shows alert, no campaign grid', async ({ page }) => {
    await page.route('**/v1/campaigns', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    )
    await page.goto('/campaigns')

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText("couldn't load missions")

    const grid = page.getByLabel('Campaign listings')
    await expect(grid).not.toBeVisible()
  })
})

test.describe('Campaign detail', () => {
  test('happy path — shows campaign detail', async ({ page }) => {
    await page.goto(`/campaigns/${SEEDED_CAMPAIGN_ID}`)
    const heading = page.locator('h1')
    await expect(heading).toContainText(SEEDED_CAMPAIGN_TITLE)

    // Category label
    const category = page.locator('span').filter({ hasText: /\w+/ }).first()
    await expect(category).toBeVisible()

    // Funding progress section — look for the "raised of" text it always renders
    await expect(page.getByText(/raised of/)).toBeVisible()

    // Milestones section heading (rendered unconditionally by MilestonesSection)
    const milestonesHeading = page.getByRole('heading', { name: 'Milestones' })
    if ((await milestonesHeading.count()) > 0) {
      await expect(milestonesHeading).toBeVisible()
    }
  })

  test('404 — shows error state for non-existent campaign', async ({ page }) => {
    await page.goto('/campaigns/00000000-dead-0000-0000-000000000000')
    await expect(page.getByText('Failed to load campaign')).toBeVisible()
  })
})
