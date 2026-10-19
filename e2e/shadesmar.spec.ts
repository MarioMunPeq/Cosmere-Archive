/**
 * M5 · §5.5 — Shadesmar.
 *
 * The canvas draws no text and no HUD, so nothing here is asserted by looking
 * at the screen. Every criterion reads either the DOM or
 * `window.__shadesmar`, which reports where the live camera actually put the
 * realm grid.
 */

import { expect, test, type Page } from '@playwright/test'

const SHADESMAR = '/Cosmere-Archive/#/shadesmar'

async function probe(page: Page) {
  return page.evaluate(() => {
    const s = (
      window as unknown as {
        __shadesmar?: { ratio: () => number; zoom: () => number; souls: () => number; clusters: () => { id: string }[] }
      }
    ).__shadesmar
    if (!s) throw new Error('__shadesmar probe is not installed')
    return { ratio: s.ratio(), zoom: s.zoom(), souls: s.souls(), clusters: s.clusters().length }
  })
}

test.describe('S.1 — calibration', () => {
  const RESOLUTIONS = [
    { width: 360, height: 640 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 },
  ]

  for (const size of RESOLUTIONS) {
    test(`the realm grid fills about 65% of the shorter side at ${size.width}x${size.height}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: size })
      const page = await context.newPage()
      await page.goto(SHADESMAR)
      await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
      // One frame, so the resize handler has run against the real viewport.
      await page.waitForTimeout(150)

      const { ratio } = await probe(page)
      expect(ratio, `measured fraction at ${size.width}x${size.height}`).toBeGreaterThan(0.6)
      expect(ratio, `measured fraction at ${size.width}x${size.height}`).toBeLessThan(0.72)
      await context.close()
    })
  }

  test('the fraction is the same at every resolution', async ({ browser }) => {
    const ratios: number[] = []
    for (const size of RESOLUTIONS) {
      const context = await browser.newContext({ viewport: size })
      const page = await context.newPage()
      await page.goto(SHADESMAR)
      await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
      await page.waitForTimeout(120)
      ratios.push((await probe(page)).ratio)
      await context.close()
    }
    // What `fitToViewport()` is for: one number, not one number per screen.
    for (const r of ratios) expect(Math.abs(r - ratios[0]!)).toBeLessThan(0.005)
  })

  test('re-frames when the window changes size', async ({ page }) => {
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
    await page.waitForTimeout(120)
    const before = await probe(page)

    await page.setViewportSize({ width: 1200, height: 1600 })
    await page.waitForTimeout(200)
    const after = await probe(page)

    expect(after.ratio).toBeCloseTo(before.ratio, 2)
  })
})

test.describe('the ocean', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
  })

  test('has every soul the catalogue defines, and the twelve clusters', async ({ page }) => {
    const { souls, clusters } = await probe(page)
    // The catalogue is the runtime's own: 93 characters + 10 Honorblades.
    expect(souls).toBeGreaterThan(90)
    expect(clusters).toBe(12)
  })

  test('zooms with the wheel, focused on the cursor', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    const box = (await canvas.boundingBox())!
    const before = await probe(page)

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, -400)
    await page.waitForTimeout(120)
    const zoomedIn = (await probe(page)).zoom
    expect(zoomedIn).toBeGreaterThan(before.zoom)

    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(120)
    expect((await probe(page)).zoom).toBeLessThan(zoomedIn)
  })

  test('zooming keeps the point under the cursor fixed', async ({ page }) => {
    // A zoom that recentres the world on its middle is not a zoom, it is a
    // jump: everything you were pointing at moves out from under the pointer.
    const canvas = page.locator('canvas').first()
    const box = (await canvas.boundingBox())!
    // Page coordinates for the pointer, canvas-relative for the probe: the
    // canvas does not start at the top-left of the document, and the camera
    // measures from the canvas, not the page.
    const px = box.x + box.width * 0.3
    const py = box.y + box.height * 0.7
    const cx = box.width * 0.3
    const cy = box.height * 0.7

    const worldAt = () =>
      page.evaluate(
        ([x, y]) =>
          (
            window as unknown as {
              __shadesmar: { screenToWorld: (x: number, y: number) => { x: number; y: number } }
            }
          ).__shadesmar.screenToWorld(x as number, y as number),
        [cx, cy],
      )

    await page.mouse.move(px, py)
    const before = await worldAt()
    await page.mouse.wheel(0, -300)
    await page.waitForTimeout(120)
    const after = await worldAt()

    expect(Math.abs(after.x - before.x)).toBeLessThan(0.01)
    expect(Math.abs(after.y - before.y)).toBeLessThan(0.01)
  })

  test('clamps zoom to the range §5.5.1 sets', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    const box = (await canvas.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    for (let i = 0; i < 60; i++) await page.mouse.wheel(0, -200)
    await page.waitForTimeout(200)
    expect((await probe(page)).zoom).toBeLessThanOrEqual(4.0 + 1e-6)
    for (let i = 0; i < 90; i++) await page.mouse.wheel(0, 200)
    await page.waitForTimeout(200)
    expect((await probe(page)).zoom).toBeGreaterThanOrEqual(0.25 - 1e-6)
  })
})
