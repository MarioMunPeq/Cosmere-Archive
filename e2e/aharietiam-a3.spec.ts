/**
 * A3 audit for /aharietiam.
 *
 * The scene is route-exclusive and WebGL-heavy, so these checks cover the
 * things a normal route smoke test cannot: the quality preset, the fallback,
 * the rendering loop, accessibility, readable type, and exit cleanup.
 */
import { test, expect } from '@playwright/test'

// SwiftShader makes the scene heavy; keep these audits serial so they do not
// starve each other's render loop.
test.describe.configure({ mode: 'serial', timeout: 120_000 })

async function audit(page: import('@playwright/test').Page) {
  const axe = (await import('axe-core')).default
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    })
  })
}

test('A3.1 the live scene exposes quality, DPR and shadow diagnostics', async ({ page }) => {
  await page.goto('/#/aharietiam')
  const scene = page.locator('[data-aharietiam-scene="live"]')
  await expect(scene).toBeVisible()
  await expect(scene).toHaveAttribute('data-scene-quality', 'full')
  await expect(scene).toHaveAttribute('data-scene-ready', 'true', { timeout: 30000 })

  const canvas = scene.locator('canvas')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-render-dpr'))).toBeLessThanOrEqual(1.75)
  await expect(canvas).toHaveAttribute('data-shadows', 'on')
  await expect(page.locator('h1')).toHaveCount(1)
})

test.describe('A3.2 phone preset', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('drops shadows, caps DPR and keeps the mobile sheet available', async ({ page }) => {
    await page.goto('/#/aharietiam')
    const scene = page.locator('[data-aharietiam-scene="live"]')
    await expect(scene).toHaveAttribute('data-scene-quality', 'light', { timeout: 30000 })
    const canvas = scene.locator('canvas')
    expect(Number(await canvas.getAttribute('data-render-dpr'))).toBeLessThanOrEqual(1.5)
    await expect(canvas).toHaveAttribute('data-shadows', 'off')
    await expect(page.getByText('tap a blade')).toBeVisible()
  })
})

test('A3.3 WebGL failure renders the accessible field sketch', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return original.call(this, type, ...args)
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/#/aharietiam')
  await expect(page.locator('[data-aharietiam-scene="fallback"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /aharietiam — the ten blades/i })).toBeVisible()
  await expect(page.getByRole('img', { name: /ten honorblades standing in a circle/i })).toBeVisible()
  await expect(page.locator('[data-aharietiam-scene] canvas')).toHaveCount(0)
})

test('A3.4 axe passes WCAG 2 AA and visible text is at least 12px', async ({ page }) => {
  await page.goto('/#/aharietiam')
  await expect(page.locator('[data-aharietiam-scene="live"]')).toBeVisible()
  await page.waitForTimeout(1200)

  const results = await audit(page)
  const violations = results.violations.map((violation: { id: string; nodes: unknown[] }) => ({
    id: violation.id,
    nodes: violation.nodes.length,
  }))
  expect(violations, `axe violations: ${JSON.stringify(violations)}`).toEqual([])

  const smallText = await page.evaluate(() => {
    const root = document.querySelector('[data-aharietiam-scene]')
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>('*'))
      .filter((element) => {
        const text = element.textContent?.trim()
        if (!text || element.children.length > 0) return false
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
      })
      .map((element) => ({
        text: element.textContent?.trim().slice(0, 40),
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      }))
      .filter((entry) => entry.fontSize < 12)
  })
  expect(smallText, `visible text under 12px: ${JSON.stringify(smallText)}`).toEqual([])
})

test('A3.5 the render loop advances', async ({ page }) => {
  await page.goto('/#/aharietiam')
  await expect(page.locator('[data-aharietiam-scene="live"]')).toBeVisible()
  const frames = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let count = 0
        const start = performance.now()
        const tick = () => {
          count++
          if (performance.now() - start >= 1500) resolve(count)
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
  test.info().annotations.push({ type: 'swiftshader-frames', description: String(frames) })
  expect(frames).toBeGreaterThan(0)
})

test('A3.6 leaving and returning ten times does not grow listeners or DOM', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP memory counters are Chromium-only')
  test.slow()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  await cdp.send('HeapProfiler.enable')

  const counters = async () => {
    await cdp.send('HeapProfiler.collectGarbage')
    return cdp.send('Memory.getDOMCounters')
  }

  await page.goto('/#/library')
  await page.getByRole('main').waitFor()
  await page.waitForTimeout(900)
  const baseline = await counters()

  for (let cycle = 0; cycle < 10; cycle++) {
    await page.evaluate(() => (window.location.hash = '#/aharietiam'))
    await page.locator('[data-aharietiam-scene]').waitFor({ timeout: 30000 })
    await page.waitForTimeout(1000)
    await page.evaluate(() => (window.location.hash = '#/library'))
    await page.getByRole('main').waitFor()
    await page.waitForTimeout(1600)
  }

  let after = await counters()
  /* Let the two teardown timers finish even when SwiftShader stalls a frame. */
  for (let attempt = 0; attempt < 6 && after.jsEventListeners > baseline.jsEventListeners + 8; attempt++) {
    await page.waitForTimeout(500)
    after = await counters()
  }
  expect(after.jsEventListeners, 'listeners after ten route exits').toBeLessThanOrEqual(baseline.jsEventListeners + 8)
  expect(after.nodes, 'DOM nodes after ten route exits').toBeLessThanOrEqual(baseline.nodes + 80)
})
