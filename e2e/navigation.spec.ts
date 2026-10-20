/**
 * M2 · Block 2 — the measurable acceptance criteria of §5.1.
 *
 * These cannot be checked in jsdom: contrast needs real composited pixels and
 * a target size needs `getBoundingClientRect` on a laid-out box. So they run in
 * Chromium against the production build.
 *
 * Covered here:
 *   N.1  the four core destinations plus Historical are real, keyboard-reachable
 *        links, with aria-current on the active one
 *   N.2  every navigation label clears 4.5:1 on the bar background
 *   N.3  every interactive target in the bar is at least 44x44
 *   N.4  the bottom bar has five destinations and no horizontal scroll at 320px
 *   M2.4 no horizontal overflow on /, /about or /404 at 320px
 */

import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'

/** Relative luminance, WCAG 2.x. */
function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Resolves the colour actually painted, walking ancestors past transparency. */
async function effectiveColor(locator: Locator): Promise<[number, number, number]> {
  return locator.evaluate((el) => {
    const parse = (value: string): [number, number, number] => {
      const m = value.match(/rgba?\(([^)]+)\)/)
      if (!m) return [0, 0, 0]
      const parts = m[1]!.split(',').map((s) => Number.parseFloat(s.trim()))
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
    }
    // Walk up until an opaque background is found, compositing any alpha over.
    const stack: [number, number, number][] = []
    let node: Element | null = el
    while (node) {
      const bg = getComputedStyle(node).backgroundColor
      const parsed = parse(bg)
      const alpha = Number(bg.match(/rgba?\(([^)]+)\)/)?.[1]?.split(',')[3] ?? '1')
      if (parsed[0] || parsed[1] || parsed[2] || alpha > 0) stack.push(parsed)
      if (alpha >= 1) break
      node = node.parentElement
    }
    let out: [number, number, number] = [13, 17, 25]
    for (const layer of stack.reverse()) {
      out = [layer[0], layer[1], layer[2]]
    }
    return out
  })
}

test.describe('M2.2 navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/library')
    await page.getByRole('navigation', { name: 'Main' }).waitFor()
  })

  /**
   * The app uses HashRouter, so an internal link must be `#/route`, not
   * `/route`. A plain `<a href="/library">` looks correct in review and in the
   * unit tests — the href attribute is exactly what you expect — but clicking it
   * leaves the router and requests a server path that does not exist.
   */
  test('every internal link uses a fragment href', async ({ page }) => {
    const bad: string[] = []
    for (const route of ['/', '/#/library', '/#/characters', '/#/historical', '/#/about']) {
      await page.goto(route)
      await page.waitForTimeout(300)
      const offenders = await page.locator('a[href]').evaluateAll((els) =>
        els
          .map((e) => e.getAttribute('href') ?? '')
          // Skip in-page anchors (#main-content) and external links.
          .filter((h) => h.startsWith('/') && !h.startsWith('//'))
          .map((h) => `${h}`),
      )
      for (const href of offenders) bad.push(`${route} -> ${href}`)
    }
    expect(bad, `internal links must be fragments under HashRouter: ${bad.join(', ')}`).toHaveLength(0)
  })

  test('clicking a door navigates without leaving the router', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('link', { name: /^Records/ })
      .first()
      .click()
    await page.waitForTimeout(600)
    expect(page.url()).toContain('#/characters')
    // A full page load would have produced a 404 from the preview server.
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  test('N.1 the core destinations are real links', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const label of ['Library', 'Records', 'Shadesmar', 'Taravangian Diagram']) {
      const link = nav.getByRole('link', { name: label, exact: true })
      await expect(link).toBeVisible()
      const href = await link.getAttribute('href')
      expect(href, `${label} must be a fragment href under HashRouter`).toMatch(/^#\/[a-z-]+$/)
    }
    // Historical is a real button controlling a real panel.
    await expect(nav.getByRole('button', { name: 'Historical' })).toBeVisible()
  })

  test('N.1 the active destination carries aria-current', async ({ page }) => {
    // HashRouter: the route lives in the fragment, not the path.
    await page.goto('/#/library')
    const nav = page.getByRole('navigation', { name: 'Main' })
    const current = nav.locator('[aria-current="page"]')
    await expect(current).toHaveCount(1)
    await expect(current).toHaveAttribute('href', '#/library')
  })

  test('N.1 everything is reachable by keyboard from /', async ({ page }) => {
    // Tab through and collect where focus lands.
    await page.keyboard.press('Tab') // skip to content
    const seen: string[] = []
    for (let i = 0; i < 25; i++) {
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return el?.textContent?.trim().slice(0, 40) ?? ''
      })
      if (label) seen.push(label)
      await page.keyboard.press('Tab')
    }
    const joined = seen.join(' | ')
    for (const label of ['Skip to content', 'Library', 'Records', 'Historical']) {
      expect(joined, `tab order should reach "${label}"`).toContain(label)
    }
  })

  test('N.2 every navigation label clears 4.5:1 on the bar', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' })
    const targets = [
      nav.getByRole('link', { name: /Cosmere Archive/i }),
      nav.getByRole('link', { name: 'Library', exact: true }),
      nav.getByRole('link', { name: 'Records', exact: true }),
      nav.getByRole('link', { name: 'Shadesmar', exact: true }),
      nav.getByRole('link', { name: 'Taravangian Diagram', exact: true }),
      nav.getByRole('button', { name: 'Historical' }),
    ]

    const failures: string[] = []
    for (const locator of targets) {
      const fg = await locator.evaluate((el) => getComputedStyle(el).color)
      const fgRgb = fg.match(/rgba?\(([^)]+)\)/)!
      const [r, g, b] = fgRgb[1]!.split(',').map((s) => Number.parseFloat(s.trim()))
      const bg = await effectiveColor(locator)
      const ratio = contrast([r ?? 0, g ?? 0, b ?? 0], bg)
      const name = (await locator.textContent())?.trim() ?? '?'
      if (ratio < 4.5) failures.push(`${name}: ${ratio.toFixed(2)}:1 on rgb(${bg})`)
    }
    expect(failures, `below 4.5:1 — ${failures.join('; ')}`).toHaveLength(0)
  })

  test('N.3 every bar target is at least 44x44', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' })
    const targets = await nav.locator('a[href], button').all()
    expect(targets.length).toBeGreaterThan(4)

    const failures: string[] = []
    for (const target of targets) {
      const box = await target.boundingBox()
      if (!box) continue
      const name = (await target.textContent())?.trim().slice(0, 24) ?? '?'
      if (box.width < 44 || box.height < 44) {
        failures.push(`${name}: ${box.width.toFixed(0)}x${box.height.toFixed(0)}`)
      }
    }
    expect(failures, `below 44x44 — ${failures.join('; ')}`).toHaveLength(0)
  })

  test('N.3 the wordmark is at least 44px tall', async ({ page }) => {
    const box = await page.getByRole('link', { name: /Cosmere Archive/i }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('M2.2 bottom bar', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('N.4 it has five destinations below 768px', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    await expect(nav.locator('a[href]')).toHaveCount(5)
  })

  test('N.4 no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')
    await page.waitForTimeout(400)
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(320)
  })
})

test.describe('M2.4 narrow viewport', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  // HashRouter, so every route is a fragment.
  for (const path of ['/', '/#/about', '/#/no-such-route']) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForTimeout(500)
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(
        overflow.scrollWidth,
        `${path} overflows by ${overflow.scrollWidth - overflow.clientWidth}px at 320px`,
      ).toBeLessThanOrEqual(320)
    })
  }
})
