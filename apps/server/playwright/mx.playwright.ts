import { test, expect } from '@playwright/test'

test('connects to mx bank with oAuth', async ({ page }) => {
  test.setTimeout(60000)

  await page.goto('http://localhost:8080/?job_type=agg')

  await page.getByPlaceholder('Search').fill('MX Bank (Oauth)')

  await page.getByLabel('Add account with MX Bank (Oauth)').click()

  const popupPromise = page.waitForEvent('popup')

  await page.getByRole('link', { name: 'Continue' }).click()

  const authorizeTab = await popupPromise
  await authorizeTab.getByRole('button', { name: 'Authorize' }).click()

  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible({
    timeout: 60000
  })
})