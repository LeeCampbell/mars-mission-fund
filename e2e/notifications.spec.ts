import { test, expect, type Page } from '@playwright/test'

const SEEDED_CAMPAIGN_ID = '00000000-0001-0000-0000-000000000001'

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1111-0000-0000-000000000001',
    userId: '11111111-1111-1111-1111-111111111111',
    campaignId: SEEDED_CAMPAIGN_ID,
    title: 'Campaign approved',
    message: 'Your campaign has been approved and is now live.',
    read: false,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    id: 'notif-1111-0000-0000-000000000002',
    userId: '11111111-1111-1111-1111-111111111111',
    campaignId: SEEDED_CAMPAIGN_ID,
    title: 'New backer',
    message: 'Someone backed your campaign.',
    read: true,
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
]

async function loginAsBacker(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('backer@example.com')
  await page.getByLabel('Password').fill('backer-demo-pass')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}

function mockNotificationsRoute(page: Page) {
  return page.route('**/v1/notifications', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_NOTIFICATIONS }),
      })
    }
    return route.continue()
  })
}

function mockMarkReadRoute(page: Page) {
  return page.route('**/v1/notifications/*/read', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { ...MOCK_NOTIFICATIONS[0], read: true },
      }),
    })
  })
}

test.describe('Notification bell', () => {
  test('notification bell is visible for authenticated users', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)

    const bell = page.getByRole('button', { name: /Notifications/i })
    await expect(bell).toBeVisible()
  })

  test('bell shows unread badge when there are unread notifications', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)

    // 1 unread notification in mock data — badge should show "1"
    const bell = page.getByRole('button', { name: /1 unread/i })
    await expect(bell).toBeVisible()
  })

  test('clicking bell opens dropdown with notifications', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)

    const bell = page.getByRole('button', { name: /Notifications/i })
    await bell.click()

    const dropdown = page.getByRole('dialog', { name: 'Notifications' })
    await expect(dropdown).toBeVisible()

    // Both notification titles should appear
    await expect(dropdown.getByText('Campaign approved')).toBeVisible()
    await expect(dropdown.getByText('New backer')).toBeVisible()
  })

  test('"View all notifications" link leads to /notifications page', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)

    await page.getByRole('button', { name: /Notifications/i }).click()
    const dropdown = page.getByRole('dialog', { name: 'Notifications' })
    await expect(dropdown).toBeVisible()

    const viewAllLink = dropdown.getByRole('link', { name: /View all notifications/i })
    await expect(viewAllLink).toBeVisible()
    await viewAllLink.click()

    await expect(page).toHaveURL('/notifications')
  })

  test('clicking a notification in the dropdown navigates to campaign detail', async ({ page }) => {
    await mockNotificationsRoute(page)
    await mockMarkReadRoute(page)
    await loginAsBacker(page)

    await page.getByRole('button', { name: /Notifications/i }).click()
    const dropdown = page.getByRole('dialog', { name: 'Notifications' })
    await expect(dropdown).toBeVisible()

    // Click the unread notification (first one) which has a campaignId
    await dropdown.getByText('Campaign approved').click()

    await expect(page).toHaveURL(`/campaigns/${SEEDED_CAMPAIGN_ID}`)
  })
})

test.describe('Notifications page', () => {
  test('/notifications renders full notification list', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)
    await page.goto('/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
    await expect(page.getByText('Campaign approved')).toBeVisible()
    await expect(page.getByText('New backer')).toBeVisible()
  })

  test('unread notifications show mark-as-read button', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)
    await page.goto('/notifications')

    // Unread notification should have a "Mark as read" button
    await expect(page.getByRole('button', { name: 'Mark as read' })).toBeVisible()
  })

  test('empty state renders when there are no notifications', async ({ page }) => {
    await page.route('**/v1/notifications', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })
    await loginAsBacker(page)
    await page.goto('/notifications')

    await expect(page.getByText(/no notifications yet/i)).toBeVisible()
  })

  test('clicking a notification row navigates to campaign', async ({ page }) => {
    await mockNotificationsRoute(page)
    await loginAsBacker(page)
    await page.goto('/notifications')

    // Click the notification row that has a campaignId
    await page.getByText('Campaign approved').click()

    await expect(page).toHaveURL(`/campaigns/${SEEDED_CAMPAIGN_ID}`)
  })
})
