import { test, expect } from '@playwright/test'

const SEEDED_CAMPAIGN_ID = '00000000-0001-0000-0000-000000000001'
const SEEDED_CAMPAIGN_TITLE = 'Open Source Climate Prediction Model'

test.describe('Campaign list', () => {
  test('happy path — shows seeded campaigns', async ({ page }) => {
    // NOTE: fetchCampaigns() receives { data: [...] } from the server but treats
    // it as a bare Campaign[] — the component crashes before the grid renders.
    // This test is expected to fail until the "Fix client-server integration"
    // prerequisite issue is resolved (data unwrapping + snake_case mapping).
    test.fail()

    await page.goto('/campaigns')
    const grid = page.getByLabel('Campaign listings')
    await expect(grid).toBeVisible()
    const links = grid.locator('a')
    await expect(links.first()).toBeVisible()
    await expect(page.getByText(SEEDED_CAMPAIGN_TITLE)).toBeVisible()
  })

  test('server error — shows alert, no campaign grid', async ({ page }) => {
    // NOTE: fetchCampaigns() still falls back to mock data on error, so this
    // test is expected to fail until the mock-data fallback is removed from
    // packages/client/src/api/campaigns.ts.
    test.fail()

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
    // NOTE: fetchCampaign() receives { data: {...} } from the server but treats
    // it as a bare Campaign — the component renders with undefined fields.
    // This test is expected to fail until the "Fix client-server integration"
    // prerequisite issue is resolved (data unwrapping + snake_case mapping).
    test.fail()

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
    // NOTE: fetchCampaign() catches the 404 and returns mock data instead of
    // throwing, so the error state is never shown.  This test is expected to
    // fail until the mock-data fallback is removed from
    // packages/client/src/api/campaigns.ts (part of the "Fix client-server
    // integration" prerequisite issue).
    test.fail()

    await page.goto('/campaigns/00000000-dead-0000-0000-000000000000')
    await expect(page.getByText('Failed to load campaign')).toBeVisible()
  })
})
