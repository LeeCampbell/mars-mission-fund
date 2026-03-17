import { test, expect, type Page } from '@playwright/test'

const MOCK_UNREAD_NOTIFICATION = {
  id: 'aaaaaaaa-0001-0000-0000-000000000001',
  userId: '33333333-3333-3333-3333-333333333333',
  campaignId: '00000000-0001-0000-0000-000000000001',
  type: 'CampaignApproved',
  title: 'Campaign approved',
  message: 'Your campaign "Methane Engine" has been approved.',
  read: false,
  createdAt: new Date('2026-03-15T10:00:00Z').toISOString(),
}

const MOCK_READ_NOTIFICATION = {
  id: 'aaaaaaaa-0002-0000-0000-000000000002',
  userId: '33333333-3333-3333-3333-333333333333',
  campaignId: '00000000-0002-0000-0000-000000000002',
  type: 'MilestoneVerified',
  title: 'Milestone verified',
  message: 'Your milestone has been verified by the admin.',
  read: true,
  createdAt: new Date('2026-03-14T09:00:00Z').toISOString(),
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('Notification bell', () => {
  test('notification bell shows unread count badge', async ({ page }) => {
    // Mock notifications before login so the bell fetches mocked data
    await page.route('**/v1/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [MOCK_UNREAD_NOTIFICATION, MOCK_READ_NOTIFICATION] }),
      })
    )

    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    // Bell with unread label should be visible
    const bell = page.getByRole('button', { name: /Notifications \(1 unread\)/ })
    await expect(bell).toBeVisible()
  })

  test('notification bell shows no badge when all notifications are read', async ({ page }) => {
    await page.route('**/v1/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [MOCK_READ_NOTIFICATION] }),
      })
    )

    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    // Bell without unread count
    const bell = page.getByRole('button', { name: 'Notifications' })
    await expect(bell).toBeVisible()

    // No badge element visible (badge is aria-hidden so not findable by role — check by text)
    await expect(
      page.getByRole('button', { name: /Notifications \(\d+ unread\)/ })
    ).not.toBeVisible()
  })

  test('clicking notification bell navigates to /notifications', async ({ page }) => {
    await page.route('**/v1/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    )

    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')

    await page.getByRole('button', { name: 'Notifications' }).click()
    await expect(page).toHaveURL('/notifications')
  })
})

test.describe('Notifications page', () => {
  test('user can mark a notification as read', async ({ page }) => {
    // After mark-as-read is called, subsequent notification fetches return the item as read
    let markReadCalled = false

    // Mock mark-as-read first so the flag flips before the next notifications fetch
    await page.route(`**/v1/notifications/${MOCK_UNREAD_NOTIFICATION.id}/read`, (route) => {
      markReadCalled = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Notifications mock: unread until mark-as-read fires, then return read version
    await page.route('**/v1/notifications', (route) => {
      const data = markReadCalled
        ? [{ ...MOCK_UNREAD_NOTIFICATION, read: true }, MOCK_READ_NOTIFICATION]
        : [MOCK_UNREAD_NOTIFICATION, MOCK_READ_NOTIFICATION]
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data }),
      })
    })

    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')
    await page.goto('/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()

    // Unread notification should show "Mark as read" button
    await expect(page.getByText(MOCK_UNREAD_NOTIFICATION.title)).toBeVisible()
    const markReadButton = page.getByRole('button', { name: 'Mark as read' })
    await expect(markReadButton).toBeVisible()

    // Click mark as read
    await markReadButton.click()

    // After refetch the button should disappear (notification is now read)
    await expect(page.getByRole('button', { name: 'Mark as read' })).not.toBeVisible()
  })

  test('shows empty state when there are no notifications', async ({ page }) => {
    await page.route('**/v1/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    )

    await login(page, 'admin@example.com', 'admin-demo-pass')
    await expect(page).toHaveURL('/')
    await page.goto('/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
    await expect(page.getByText('No notifications')).toBeVisible()
  })
})
