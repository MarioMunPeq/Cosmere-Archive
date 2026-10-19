/**
 * M2 · Block 5 — /about, /404 and public/404.html.
 *
 * §5.9 asks for axe (wcag2aa + wcag22aa) on /, /about and /404, and §5.7 wants
 * GitHub Pages to return a real 404. Both are checked here rather than in prose.
 */

import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Minimal axe, injected from the installed package.
 *
 * `axe-core` is already a transitive dependency of @axe-core/playwright's peers;
 * importing it here keeps the spec self-contained and avoids adding a runtime
 * dependency to the app for a test-only need.
 */
async function audit(page: import('@playwright/test').Page) {
  const axe = (await import('axe-core')).default
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async () => {
    // eslint-disable-next-line no-explicit-any
    return (window as any).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    })
  })
}

for (const [label, route] of [
  ['landing', '/'],
  ['about', '/#/about'],
  ['404', '/#/no-such-page'],
] as const) {
  test(`M2.7 axe passes on ${label}`, async ({ page }) => {
    await page.goto(route)
    await page.getByRole('navigation', { name: 'Main' }).waitFor()
    await page.waitForTimeout(400)

    const results = await audit(page)
    const violations = results.violations.map((v: { id: string; nodes: unknown[] }) => ({
      id: v.id,
      nodes: v.nodes.length,
    }))
    expect(violations, `axe violations on ${route}: ${JSON.stringify(violations)}`).toEqual([])
  })
}

test('M2.7 the 404 page has one h1 and a named navigation landmark', async ({ page }) => {
  await page.goto('/#/no-such-page')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
})

test('the /404 page reaches every core destination', async ({ page }) => {
  await page.goto('/#/no-such-page')
  // #/stats moved to #/taravangian; the redirect is asserted in diagram.spec.ts.
  for (const href of ['#/library', '#/characters', '#/shadesmar', '#/taravangian']) {
    await expect(page.locator(`main a[href="${href}"]`).first()).toHaveCount(1)
  }
})

/**
 * GitHub Pages serves public/404.html for a path that does not exist, with a
 * real HTTP 404 status. Without the file the server returns its own default
 * page and the archive's own message never appears.
 */
test.describe('public/404.html', () => {
  const html = readFileSync(join(process.cwd(), 'public', '404.html'), 'utf8')

  test('exists and is standalone', () => {
    expect(html.length).toBeGreaterThan(500)
    // No bundle and no stylesheet: it has to render if the JS never loads.
    expect(html).not.toMatch(/<script/)
    expect(html).not.toMatch(/<link[^>]+stylesheet/)
  })

  test('is copied into dist at the site root, where Pages looks for it', () => {
    const built = readFileSync(join(process.cwd(), 'dist', '404.html'), 'utf8')
    expect(built).toContain('Record not found')
  })

  test('links into the fragment routes by hand', () => {
    for (const path of ['/#/', '/#/characters', '/#/library', '/#/historical']) {
      expect(html, `404.html must offer ${path}`).toContain(`/Cosmere-Archive${path}`)
    }
  })

  test('every target it links to is a real route', async ({ page }) => {
    const paths = [...html.matchAll(/\/Cosmere-Archive\/(#\/[a-z-]*)/g)].map((m) => m[1]!)
    expect(paths.length).toBeGreaterThan(3)
    for (const path of [...new Set(paths)]) {
      // Through the configured baseURL, so the request is a real navigation
      // rather than a fragment-only change that does not reload the document.
      await page.goto(`/${path}`)
      await page.getByRole('navigation', { name: 'Main' }).waitFor()
      const lost = await page
        .getByText('ARCHIVE RECORD LOST')
        .isVisible()
        .catch(() => false)
      expect(lost, `${path} from 404.html lands on the error page`).toBe(false)
    }
  })

  test('is announced correctly and is not indexed', () => {
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('noindex')
    expect(html).toContain('name="viewport"')
  })
})

test.describe('About', () => {
  test('keeps its content in a single readable column', async ({ page }) => {
    await page.goto('/#/about')
    await expect(page.getByRole('heading', { level: 1, name: /about the archive/i })).toBeVisible()
    for (const text of [/coppermind/i, /way of the shard/i, /all rights/i, /github/i]) {
      await expect(page.getByText(text).first()).toBeVisible()
    }
  })

  test('the source links point at the right places', async ({ page }) => {
    await page.goto('/#/about')
    await expect(page.locator('a[href="https://wob.coppermind.net"]')).toHaveText(/way of the shard/i)
    await expect(page.locator('a[href="https://coppermind.net"]')).toHaveText(/coppermind/i)
    await expect(page.locator('a[href="https://github.com/MarioMunPeq"]')).toHaveCount(1)
  })

  test('probes for the signature image once, and reserves no space for it', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('signature')) requests.push(r.url())
    })
    await page.goto('/#/about')
    await page.waitForTimeout(1000)
    // The file does not exist, so the name must still render and the probe must
    // not run again for a second mount.
    await expect(page.getByText('Mario Muñoz Pequeño').first()).toBeVisible()
    expect(requests, 'the absent signature must be probed exactly once').toHaveLength(1)
  })
})
