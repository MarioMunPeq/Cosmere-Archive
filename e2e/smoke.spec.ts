import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('homepage loads with map and sidebar tabs', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toContainText('COSMERE ARCHIVE')
    await expect(page.locator('button:has-text("Planets"), button:has-text("Characters")').first()).toBeVisible({ timeout: 10000 })
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL(/\/about/)
    await expect(page.locator('h1')).toContainText('About')
  })

  test('glossary page loads and shows terms', async ({ page }) => {
    await page.goto('/#/glossary')
    await expect(page.locator('h1')).toContainText('Glossary')
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.getByPlaceholder('Search terms...')).toBeVisible()
  })

  test('family tree page loads with family selector', async ({ page }) => {
    await page.goto('/#/family-tree')
    await expect(page.locator('h1')).toContainText('Family Trees')
    await expect(page.locator('button:has-text("Kholin")')).toBeVisible()
  })
})
