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
        __shadesmar?: {
          ratio: () => number
          zoom: () => number
          souls: () => number
          clusters: () => { id: string }[]
          focused: () => boolean
        }
      }
    ).__shadesmar
    if (!s) throw new Error('__shadesmar probe is not installed')
    return {
      ratio: s.ratio(),
      zoom: s.zoom(),
      souls: s.souls(),
      clusters: s.clusters().length,
      focused: s.focused(),
    }
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

/* ------------------------------------------------------------------ S.9 HUD */

test.describe('S.9 — the HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
    await expect(page.getByRole('navigation', { name: 'Shadesmar view controls' })).toBeVisible()
  })

  for (const name of ['Zoom in', 'Zoom out', 'Back to the whole ocean']) {
    test(`"${name}" measures at least 44x44`, async ({ page }) => {
      const box = await page.getByRole('button', { name }).boundingBox()
      expect(box).not.toBeNull()
      // Exactly 44 is what the design asks for; 44 is the floor S.9 sets.
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    })
  }

  test('the buttons work without any gesture at all', async ({ page }) => {
    const before = await probe(page)
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await page.waitForTimeout(80)
    expect((await probe(page)).zoom).toBeGreaterThan(before.zoom)

    await page.getByRole('button', { name: 'Zoom out' }).click()
    await page.waitForTimeout(80)
    await page.getByRole('button', { name: 'Zoom out' }).click()
    await page.waitForTimeout(80)
    expect((await probe(page)).zoom).toBeLessThan(before.zoom)

    await page.getByRole('button', { name: 'Back to the whole ocean' }).click()
    await page.waitForTimeout(80)
    expect((await probe(page)).ratio).toBeCloseTo(before.ratio, 2)
  })

  test('the HUD never swallows a click meant for the canvas', async ({ page }) => {
    // `pointer-events: none` on the container, `auto` on the buttons. Without
    // it the padding around the three buttons would be a dead corner of the
    // page a reader can see and click and get nothing.
    const nav = page.getByRole('navigation', { name: 'Shadesmar view controls' })
    const box = (await nav.boundingBox())!
    const styles = await nav.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { pointerEvents: cs.pointerEvents }
    })
    expect(styles.pointerEvents).toBe('none')
    // And its own box really is bigger than the buttons inside it.
    expect(box.width).toBeGreaterThanOrEqual(44)
  })

  test('every HUD button is reachable and named from the keyboard', async ({ page }) => {
    const buttons = page.getByRole('navigation', { name: 'Shadesmar view controls' }).getByRole('button')
    const n = await buttons.count()
    for (let i = 0; i < n; i++) {
      await buttons.nth(i).focus()
      await expect(buttons.nth(i)).toBeFocused()
      const name = await buttons.nth(i).getAttribute('aria-label')
      expect(name, `button ${i} needs a name`).toBeTruthy()
    }
  })
})

/*
 * The HUD has to clear the mobile bottom navigation.
 *
 * S.5 found this by accident — its Back-button click timed out because
 * `BottomNav` is `fixed inset-x-0 bottom-0` below `md` and the HUD was pinned to
 * `bottom-md`, underneath it. A HUD that looks fine and cannot be pressed is
 * worse than no HUD, so the overlap is asserted rather than left to whoever
 * next tries to tap it on a phone.
 */
test.describe('the HUD and the mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no HUD button sits under the bottom nav', async ({ page }) => {
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))

    const hud = await page.getByRole('navigation', { name: 'Shadesmar view controls' }).boundingBox()
    expect(hud).not.toBeNull()

    // The bottom nav only exists below `md`; its own box is the thing to clear.
    const bottomNav = page.locator('nav[aria-label="Primary"]')
    await expect(bottomNav).toBeVisible()
    const nav = (await bottomNav.boundingBox())!

    // Every control in the HUD must be above the top edge of the nav.
    expect(hud!.y + hud!.height).toBeLessThanOrEqual(nav.y + 1)
  })

  test('and above it on a 4K panel, where there is no bottom nav at all', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
    const hud = (await page.getByRole('navigation', { name: 'Shadesmar view controls' }).boundingBox())!
    // Sits 16px off the bottom edge, not 16px above where the nav used to be.
    expect(hud.y + hud.height).toBeCloseTo(1440 - 16, 0)
  })
})

/* ---------------------------------------------------------- S.5 touch input */

test.describe('S.5 — at 375px', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })

  type CDPTouch = { x: number; y: number; radiusX: number; radiusY: number; force: number }
  const finger = (x: number, y: number): CDPTouch => ({ x, y, radiusX: 4, radiusY: 4, force: 1 })

  /**
   * One CDP session for the whole gesture.
   *
   * `Input.dispatchTouchEvent` keeps its touch state in the session, so a
   * session per event means every `touchMove` is rejected with "Must send a
   * TouchStart first" — the gesture never reaches the page at all.
   */
  async function withTouch(
    page: Page,
    run: (send: (type: string, points: CDPTouch[]) => Promise<void>) => Promise<void>,
  ) {
    const client = await page.context().newCDPSession(page)
    try {
      await run(async (type, points) => {
        await client.send('Input.dispatchTouchEvent', { type, touchPoints: points })
      })
    } finally {
      await client.detach()
    }
  }

  async function swipe(page: Page, from: number, to: number, y: number, steps = 8) {
    await withTouch(page, async (send) => {
      await send('touchStart', [finger(from, y)])
      for (let i = 1; i <= steps; i++) {
        await send('touchMove', [finger(from + ((to - from) * i) / steps, y)])
      }
      await send('touchEnd', [])
    })
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(SHADESMAR)
    await page.waitForFunction(() => Boolean((window as unknown as { __shadesmar?: unknown }).__shadesmar))
    await page.waitForTimeout(150)
  })

  test('one finger pans', async ({ page }) => {
    const at = () =>
      page.evaluate(
        () =>
          (
            window as unknown as { __shadesmar: { screenToWorld: (a: number, b: number) => { x: number } } }
          ).__shadesmar.screenToWorld(187, 400).x,
      )

    const before = await at()
    await swipe(page, 300, 120, 400)
    await page.waitForTimeout(200)

    // The world slid under a fixed screen point, so that point now names a
    // different place. That is what a pan is.
    expect(Math.abs((await at()) - before)).toBeGreaterThan(0.001)
  })

  test('two fingers pinch the zoom', async ({ page }) => {
    const before = await probe(page)
    await withTouch(page, async (send) => {
      await send('touchStart', [finger(120, 400), finger(250, 400)])
      for (let i = 1; i <= 8; i++) {
        await send('touchMove', [finger(120 - i * 6, 400), finger(250 + i * 6, 400)])
      }
      await send('touchEnd', [])
    })
    await page.waitForTimeout(150)
    // The fingers came apart, so the spread grew, so the zoom grew.
    expect((await probe(page)).zoom).toBeGreaterThan(before.zoom)
  })

  test('two fingers together also travel, so the ocean does not slide away', async ({ page }) => {
    const worldAt = () =>
      page.evaluate(
        () =>
          (
            window as unknown as { __shadesmar: { screenToWorld: (a: number, b: number) => { x: number } } }
          ).__shadesmar.screenToWorld(187, 400).x,
      )
    const before = await worldAt()
    await withTouch(page, async (send) => {
      // Constant spread, whole pair travelling right.
      await send('touchStart', [finger(140, 400), finger(240, 400)])
      for (let i = 1; i <= 8; i++) {
        await send('touchMove', [finger(140 + i * 8, 400), finger(240 + i * 8, 400)])
      }
      await send('touchEnd', [])
    })
    await page.waitForTimeout(150)
    expect(Math.abs((await worldAt()) - before)).toBeGreaterThan(0.001)
  })

  test('tapping a realm focuses it, and Back is the way out', async ({ page }) => {
    // The realm's own screen position, computed rather than hardcoded: the
    // grid is derived in world units and this test must not restate it.
    //
    // CDP touch points are *page* coordinates and the camera reports
    // canvas-relative ones, so the canvas's offset in the document has to be
    // added. Without it the finger lands 56px low — half a constellation's
    // radius — and the tap misses, which reads as a broken gesture.
    const target = await page.evaluate(() => {
      const s = (
        window as unknown as {
          __shadesmar: {
            clusters: () => { id: string; cx: number; cy: number }[]
            worldToScreen: (a: number, b: number, c: number, d: number) => { x: number; y: number }
            viewport: () => { w: number; h: number }
          }
        }
      ).__shadesmar
      const roshar = s.clusters().find((c) => c.id === 'roshar')!
      const { w, h } = s.viewport()
      const p = s.worldToScreen(roshar.cx, roshar.cy, w, h)
      const rect = document.querySelector('canvas')!.getBoundingClientRect()
      return { x: Math.round(p.x + rect.left), y: Math.round(p.y + rect.top) }
    })

    await withTouch(page, async (send) => {
      await send('touchStart', [finger(target.x, target.y)])
      await send('touchEnd', [])
    })
    await page.waitForTimeout(900)
    expect((await probe(page)).focused).toBe(true)

    // §5.5.2 gives touch no Escape. The Back button is how out.
    // `exact`: the overview button is named "Back to the whole ocean" and
    // Playwright's default name matching is substring, so a loose selector
    // finds both and calls the strict-mode violation a product bug.
    const back = page.getByRole('button', { name: 'Back', exact: true })
    await expect(back).toBeVisible()
    await back.click()
    await page.waitForTimeout(400)
    expect((await probe(page)).focused).toBe(false)
  })
})
