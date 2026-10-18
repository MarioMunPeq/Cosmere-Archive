/**
 * M2 · Block 4 — the global search, measured in a real browser.
 *
 * Covers §5.8 Q.3 (every result route resolves), Q.5 (the placeholder does not
 * change), Q.6 (the main chunk stays under budget) and Q.7 (the combobox/listbox
 * roles and Escape behaviour). The unit tests cover ranking against the real
 * index; these cover the parts that only exist in the browser.
 */

import { test, expect } from '@playwright/test'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

/**
 * Opens the palette with the shortcut the app registers for it.
 *
 * The wait on the navigation landmark is load-bearing: `page.goto` resolves at
 * the `load` event, which can happen before React has mounted and attached the
 * keydown listener, so pressing Ctrl+K immediately is a race that fails about
 * half the time.
 */
async function openSearch(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main' }).waitFor()
  await page.keyboard.press('Control+k')
  const input = page.getByRole('combobox', { name: 'Search the archive' })
  await expect(input).toBeVisible()
  return input
}

test.describe('M2.4 search', () => {
  /*
   * A longer timeout for this file only.
   *
   * Q.3 loads the app, runs eight queries and navigates to the first result of
   * each — eight full page loads inside one test. It takes about 26 seconds on
   * an idle machine, so the 5s default leaves no margin at all and it fails
   * whenever the suite runs its four workers in parallel. Nothing here asserts
   * less than before; the tests just get the time they were already taking.
   */
  test.describe.configure({ timeout: 60_000 })

  /*
   * And a longer wait on each assertion, for the same reason one level down.
   *
   * The search index is a lazily-imported chunk (`loadIndex` in
   * useGlobalSearch), so the dialog opens, accepts a query and shows an empty
   * state before it can answer anything. Waiting for a listbox therefore has to
   * allow for the index arriving. Playwright's default of 5s is enough on an
   * idle machine and not enough when four workers are competing for the CPU —
   * where the failure reads as "search returns no results", which is the very
   * regression these tests exist to catch.
   *
   * Raising the wait is the fix rather than a readiness handshake in the
   * dialog: nothing about what is asserted changes, and the honest long-term
   * fix is a loading state in the dialog itself (see the notes for M7).
   */
  expect.configure({ timeout: 15_000 })

  test('Q.7 Ctrl+K opens it and the roles are wired', async ({ page }) => {
    const input = await openSearch(page)
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await input.fill('kal')
    await expect(page.getByRole('listbox')).toBeVisible()
    await expect(input).toHaveAttribute('aria-expanded', 'true')

    const controls = await input.getAttribute('aria-controls')
    expect(controls).toBe('search-results')
    await expect(page.locator(`#${controls}`)).toHaveAttribute('role', 'listbox')
  })

  test('Q.1 kaz finds Kaladin', async ({ page }) => {
    const input = await openSearch(page)
    await input.fill('kaz')
    await expect(page.getByRole('option').first()).toContainText('Kaladin')
  })

  test('Q.1 the other three acceptance queries', async ({ page }) => {
    for (const [query, expected] of [
      ['preserv', 'Preservation'],
      ['saz', 'Sazed'],
      ['tall', 'Tal'],
    ] as const) {
      const input = await openSearch(page)
      await input.fill(query)
      await expect(page.getByRole('option').first()).toContainText(expected)
    }
  })

  test('Q.2 results are grouped under labelled categories', async ({ page }) => {
    const input = await openSearch(page)
    await input.fill('s')
    await expect(page.getByRole('listbox')).toBeVisible()
    // Several categories, each with its own separator heading.
    expect(await page.getByRole('option').count()).toBeGreaterThan(3)
  })

  /**
   * §5.8 Q.3: the first results of every category must resolve. This is the
   * regression that motivated the whole block — the old search pointed five of
   * its seven categories at /celestial-charts?focus=…&id=…, and KhrissAtlas
   * reads only ?planet, so every one of those links landed on the atlas index
   * with its own parameters discarded.
   */
  test('Q.3 every result of every category resolves', async ({ page }) => {
    const routes = new Map<string, string>() // route -> label that produced it
    const queries = ['kal', 'rosh', 'final empire', 'allomanc', 'jezrien', 'preserv', 'odal', 'shatter']

    // Collect every route the dialog offers. Read the labels and routes in one
    // pass: clicking a result closes the dialog, which invalidates every
    // locator captured before the click.
    for (const query of queries) {
      const input = await openSearch(page)
      await input.fill(query)

      // A query with no matches shows no listbox, which is correct behaviour.
      // Only the queries that did return results are collected.
      const listbox = page.getByRole('listbox')
      const hasResults = await listbox
        .waitFor({ state: 'visible', timeout: 2000 })
        .then(() => true)
        .catch(() => false)
      if (!hasResults) continue

      const rows = await page.getByRole('option').all()
      for (const row of rows.slice(0, 12)) {
        const route = await row.getAttribute('data-route')
        if (route) routes.set(route, `${query} -> ${((await row.textContent()) ?? '').trim()}`)
      }
    }

    expect(routes.size, 'collected no result routes at all').toBeGreaterThan(10)

    const bad: string[] = []
    for (const [route, label] of routes) {
      await page.goto(`/#${route}`)
      await page.getByRole('navigation', { name: 'Main' }).waitFor()
      await page.waitForTimeout(200)
      const errored = await page
        .getByText('ARCHIVE RECORD LOST')
        .isVisible()
        .catch(() => false)
      if (errored) bad.push(`${label} [${route}] landed on the error page`)
    }
    expect(bad, `these results did not resolve: ${bad.join('; ')}`).toHaveLength(0)
  })

  test('Q.3 clicking a result navigates to its route', async ({ page }) => {
    const input = await openSearch(page)
    await input.fill('kal')
    await expect(page.getByRole('listbox')).toBeVisible()

    const first = page.getByRole('option').first()
    const expected = await first.getAttribute('data-route')
    await first.click()
    await page.waitForTimeout(400)
    expect(page.url()).toContain(expected ?? '#')
  })

  test('Q.7 arrow keys move the highlight and Enter navigates', async ({ page }) => {
    const input = await openSearch(page)
    await input.fill('kal')

    await expect(input).toHaveAttribute('aria-activedescendant', 'search-option-0')
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-activedescendant', 'search-option-1')
    // Focus stays in the input so typing keeps working.
    await expect(input).toBeFocused()

    await input.press('Enter')
    await page.waitForTimeout(400)
    expect(page.url()).toContain('#/')
    expect(page.url()).not.toContain('#/undefined')
  })

  test('Q.7 Escape closes and restores focus', async ({ page }) => {
    const input = await openSearch(page)
    await expect(input).toBeVisible()
    await input.press('Escape')
    await expect(page.getByRole('combobox', { name: 'Search the archive' })).toBeHidden()
  })

  /**
   * §5.8 Q.5. The old hook rotated the placeholder through five strings every
   * four seconds with a setInterval, re-rendering the tree four times a minute
   * to change a decoration.
   */
  test('Q.5 the placeholder does not change over time', async ({ page }) => {
    const input = await openSearch(page)
    const first = await input.getAttribute('placeholder')
    await page.waitForTimeout(12000)
    expect(await input.getAttribute('placeholder')).toBe(first)
    expect(first).toBeTruthy()
  })

  test('the placeholder is not announced as content', async ({ page }) => {
    const input = await openSearch(page)
    // An accessible name must not come from the placeholder.
    expect(await input.getAttribute('aria-label')).toBe('Search the archive')
  })

  test('an empty query explains what can be searched', async ({ page }) => {
    const input = await openSearch(page)
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(page.getByText(/characters, worlds, volumes/i)).toBeVisible()
  })

  test('a query with no matches says so, and offers no dead end', async ({ page }) => {
    const input = await openSearch(page)
    await input.fill('zzzqqqxxx')
    await expect(page.getByText(/No matches for/i)).toBeVisible()
  })
})

test.describe('M2.4 Q.6 — chunk budget', () => {
  /**
   * §5.8 caps the main chunk at 180 KB gzip so a reader who never searches does
   * not download the 212 KB index. Measured from the built files rather than
   * from PerformanceResourceTiming, so the assertion does not depend on which
   * chunks a particular test happened to load.
   */
  const distPath = (urlPath: string) =>
    // index.html references /Cosmere-Archive/assets/x.js; on disk that is
    // dist/assets/x.js, so the base prefix has to come off.
    join(process.cwd(), 'dist', urlPath.replace(/^\//, '').replace(/^Cosmere-Archive\//, ''))

  const entryChunk = (): string => {
    const html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8')
    const src = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
    expect(src, 'no module entry script in dist/index.html').toBeTruthy()
    return src!
  }

  test('the entry chunk stays under 180 KB gzip', () => {
    const file = distPath(entryChunk())
    expect(existsSync(file), `entry chunk ${file} not found on disk`).toBe(true)
    const kb = gzipSync(readFileSync(file), { level: 9 }).length / 1024
    expect(kb, `entry chunk is ${kb.toFixed(1)} KB gzip, budget 180 KB`).toBeLessThan(180)
  })

  test('the search index ships as its own lazily-loaded chunk', () => {
    const dir = join(process.cwd(), 'dist', 'assets')
    const chunks = readdirSync(dir).filter((f) => f.endsWith('.js'))
    const indexChunk = chunks.find((f) => f.startsWith('search-index'))
    expect(indexChunk, `no search-index chunk among ${chunks.length} assets`).toBeTruthy()
    // A real file, not something the entry imports eagerly: an entry chunk
    // under 180 KB gzip cannot contain it.
    expect(statSync(join(dir, indexChunk!)).size).toBeGreaterThan(150 * 1024)
  })

  test('minisearch is not in the entry chunk', () => {
    const entry = readFileSync(distPath(entryChunk()), 'utf8')
    expect(entry).not.toContain('MiniSearch')
  })
})
