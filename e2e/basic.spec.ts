import { test, expect } from '@playwright/test'

test('homepage loads and shows interactive map', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('role=heading[name="COSMERE ARCHIVE"]')).toBeVisible()
  await expect(page.locator('role=img[description*="Interactive map"]')).toBeVisible()
})

test('navigation works between pages', async ({ page }) => {
  await page.goto('/')
  await page.click('role=link[name="About"]')
  await expect(page).toHaveURL(/\/about/)
  await expect(page.locator('role=heading[name*="About"]')).toBeVisible()
})

test('search returns results', async ({ page }) => {
  await page.goto('/')
  await page.fill('role=combobox[name="Search the Cosmere"]', 'Rosh')
  const results = page.locator('role=listbox')
  await expect(results).toBeVisible({ timeout: 5000 })
})

test('404 page shows for unknown routes', async ({ page }) => {
  await page.goto('/nonexistent')
  await expect(page.locator('text=404')).toBeVisible()
  await expect(page.locator('text=does not exist in the Cosmere')).toBeVisible()
})

test('glossary page renders with filter', async ({ page }) => {
  await page.goto('/glossary')
  await expect(page.locator('text=Glossary')).toBeVisible()
  await page.fill('input[placeholder*="Search"]', 'Shard')
  await expect(page.locator('text=Shard')).toBeVisible({ timeout: 5000 })
})

test('magic systems page lists systems', async ({ page }) => {
  await page.goto('/magic')
  await expect(page.locator('text=Allomancy')).toBeVisible()
  await expect(page.locator('text=Feruchemy')).toBeVisible()
})

test('characters page shows characters and filters', async ({ page }) => {
  await page.goto('/characters')
  await expect(page.locator('text=Characters')).toBeVisible()
  await expect(page.locator('text=Kaladin')).toBeVisible()
  await expect(page.locator('text=Vin')).toBeVisible()
})

test('books page shows all sagas and filters', async ({ page }) => {
  await page.goto('/books')
  await expect(page.locator('text=Books')).toBeVisible()
  await expect(page.locator('text=The Final Empire')).toBeVisible()
  await expect(page.locator('text=The Way of Kings')).toBeVisible()
  await page.click('role=button[name="Mistborn Era 1"]')
  await expect(page.locator('text=The Way of Kings')).not.toBeVisible()
})

test('family tree page loads', async ({ page }) => {
  await page.goto('/family-tree')
  await expect(page.locator('text=Family Tree')).toBeVisible()
})

test('relationships page filters', async ({ page }) => {
  await page.goto('/relationships')
  await expect(page.locator('text=Relationships')).toBeVisible()
  await page.fill('input[placeholder*="Search"]', 'Hoid')
  await expect(page.locator('text=Hoid')).toBeVisible({ timeout: 5000 })
})
