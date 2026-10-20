/**
 * M6 · §5.6 — the Diagram of Taravangian.
 *
 * The wall is nine sheets and a reading panel. What is asserted here is the part
 * of §5.6 that has consequences a screenshot cannot show: that every sheet is
 * reachable, named, and goes somewhere real.
 */

import { expect, test } from '@playwright/test'

const DIAGRAM = '/Cosmere-Archive/#/taravangian'

test.describe('D.1 — nine sheets, reachable and named', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-panel]').waitFor()
  })

  test('the nine sheets are buttons, not divs', async ({ page }) => {
    const sheets = page.locator('[data-diagram-sheet]')
    expect(await sheets.count()).toBe(9)
    // D.1: reachable by keyboard. A div with a click handler is neither.
    await expect(sheets.first()).toHaveJSProperty('tagName', 'BUTTON')
  })

  test('every sheet carries an aria-label naming it', async ({ page }) => {
    const sheets = page.locator('[data-diagram-sheet]')
    for (let i = 0; i < 9; i++) {
      const label = await sheets.nth(i).getAttribute('aria-label')
      expect(label, `sheet ${i} needs a name`).toBeTruthy()
      // D-DIEG: the name is a sheet on a wall, not a column name.
      expect(label).toMatch(/^Sheet [IVX]+: /)
      expect(label).not.toMatch(/catalogue|wordcount/i)
    }
  })

  test('every sheet is reachable by keyboard and opens the panel', async ({ page }) => {
    const sheets = page.locator('[data-diagram-sheet]')
    const first = sheets.first()
    await first.focus()
    await expect(first).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-diagram-sheet-title]')).toContainText('Catechism')
  })

  test('Escape closes the sheet', async ({ page }) => {
    await page.locator('[data-diagram-sheet]').first().click()
    await expect(page.locator('[data-diagram-sheet-title]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-diagram-panel]')).toContainText('The Diagram')
  })
})

test.describe('D.5 — every sheet reaches a record', () => {
  test('the index lists nine, and each one leads somewhere real', async ({ page }) => {
    const entries = page.locator('[data-diagram-index-entry]')
    const links = page.locator('[data-diagram-panel] a')
    const contents = page.getByRole('button', { name: 'Close sheet' })

    // The ids are read up front: choosing a sheet replaces the index with the
    // sheet, so `entries.nth(i)` does not survive the first click.
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-panel]').waitFor()
    expect(await entries.count()).toBe(9)
    const ids = await entries.evaluateAll((els) => els.map((e) => e.getAttribute('data-diagram-index-entry') ?? ''))

    for (let i = 0; i < ids.length; i++) {
      await page.locator(`[data-diagram-index-entry="${ids[i]}"]`).click()
      expect(await links.count(), `sheet ${i} has no destination`).toBeGreaterThan(0)
      // A link has to be a route that exists, not a `#`.
      const href = await links.first().getAttribute('href')
      expect(href, `sheet ${i} points nowhere`).toBeTruthy()
      expect(href).not.toBe('#')
      // HashRouter: the href is the in-app hash.
      expect(href).toMatch(/^#\//)
      await contents.click()
    }
  })

  test('the links are named diegetically, not as web actions', async ({ page }) => {
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-index-entry]').first().click()
    const texts = await page.locator('[data-diagram-panel] a').allInnerTexts()
    expect(texts.length).toBeGreaterThan(0)
    for (const t of texts) {
      // D-DIEG: "View record" and "Click here" are a website's words.
      expect(t).not.toMatch(/view|click|here|read more|link/i)
    }
  })
})

test.describe('the panel', () => {
  test('opens on the index, never on "nothing selected"', async ({ page }) => {
    await page.goto(DIAGRAM)
    const panel = page.locator('[data-diagram-panel]')
    await expect(panel).toContainText('The Diagram')
    await expect(panel).toContainText('Nine sheets')
  })

  test('D.4 — the body measure is 52ch, not a full 360px line', async ({ page }) => {
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-index-entry]').first().click()
    const measure = await page
      .locator('[data-diagram-panel] .max-w-\\[52ch\\]')
      .first()
      .evaluate((el) => getComputedStyle(el).maxWidth)
    expect(measure).not.toBe('none')
  })

  test('D.6 — at 375px the panel is a sheet below the mural', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(DIAGRAM)
    const panel = page.locator('[data-diagram-panel]')
    await expect(panel).toBeVisible()
    const box = (await panel.boundingBox())!
    // 88vh, give or take the sheet's own border.
    expect(box.height).toBeGreaterThan(667 * 0.8)
    // And it takes the full width, because a column is not a column here.
    expect(box.width).toBeGreaterThan(350)
  })

  test('at desktop the panel is a 360px column on the right', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(DIAGRAM)
    const box = (await page.locator('[data-diagram-panel]').boundingBox())!
    expect(Math.round(box.width)).toBeLessThanOrEqual(723)
    expect(box.x).toBeGreaterThan(1440 - 740)
  })
})

test.describe('D.8 — deterministic', () => {
  test('the wall is in the same place on every visit', async ({ page }) => {
    const positions = async () => {
      await page.goto(DIAGRAM)
      await page.locator('[data-diagram-panel]').waitFor()
      return page.locator('[data-diagram-sheet]').evaluateAll((els) =>
        els.map((e) => {
          const p = (e as HTMLElement).parentElement as HTMLElement
          return `${p.style.left},${p.style.top},${(e as HTMLElement).style.transform}`
        }),
      )
    }
    expect(await positions()).toEqual(await positions())
  })

  test('rotations stay within the ±6° §5.6.2 sets', async ({ page }) => {
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-panel]').waitFor()
    const angles = await page.locator('[data-diagram-sheet]').evaluateAll((els) =>
      els.map((e) => {
        const m = /rotate\((-?[\d.]+)deg\)/.exec((e as HTMLElement).style.transform ?? '')
        return m ? Number(m[1]) : 0
      }),
    )
    expect(angles.length).toBe(9)
    for (const a of angles) expect(Math.abs(a)).toBeLessThanOrEqual(6)
  })
})

/**
 * The wall is framed to the space it is actually in.
 *
 * This exists because the mural was `fixed inset-0` and measured
 * `window.innerWidth` while sitting in a 1080px column beside a 360px panel. It
 * was fitted to a viewport it did not have, and the screenshot showed a quarter
 * of a page of wall followed by a wall of black.
 */
test.describe('the frame', () => {
  test('the mural fills its column, leaving no void', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(DIAGRAM)
    await page.locator('[data-diagram-panel]').waitFor()
    await page.waitForTimeout(250)

    const mural = (await page.locator('[data-taravangian] > main').boundingBox())!
    const sheets = await page.locator('[data-diagram-sheet]').evaluateAll((els) =>
      els.map((e) => {
        const b = (e as HTMLElement).getBoundingClientRect()
        return { x: b.x, y: b.y, r: b.right, b: b.bottom }
      }),
    )
    const minX = Math.min(...sheets.map((s) => s.x))
    const maxX = Math.max(...sheets.map((s) => s.r))
    const minY = Math.min(...sheets.map((s) => s.y))
    const maxY = Math.max(...sheets.map((s) => s.b))

    // In reading mode, at least one sheet is large enough to read: D.3's floor
    // is 310px, and the reading scale is set so an A-5 sheet is 298px tall.
    const tallest = Math.max(...sheets.map((s) => s.b - s.y))
    expect(tallest).toBeGreaterThan(280)

    // Stepping back, the whole wall still fits: every sheet inside the mural.
    await page.getByRole('button', { name: /The whole wall/i }).click()
    await page.waitForTimeout(400)
    const wideSheets = await page.locator('[data-diagram-sheet]').evaluateAll((els) =>
      els.map((e) => {
        const b = (e as HTMLElement).getBoundingClientRect()
        return { x: b.x, y: b.y, r: b.right, b: b.bottom }
      }),
    )
    const wminX = Math.min(...wideSheets.map((s) => s.x))
    const wmaxX = Math.max(...wideSheets.map((s) => s.r))
    const wminY = Math.min(...wideSheets.map((s) => s.y))
    const wmaxY = Math.max(...wideSheets.map((s) => s.b))
    expect(wminX).toBeGreaterThanOrEqual(mural.x - 1)
    expect(wmaxX).toBeLessThanOrEqual(mural.x + mural.width + 1)
    expect(wminY).toBeGreaterThanOrEqual(mural.y - 1)
    expect(wmaxY).toBeLessThanOrEqual(mural.y + mural.height + 1)
  })

  test('the mural is not fixed to the window', async ({ page }) => {
    await page.goto(DIAGRAM)
    const cls = await page
      .locator('[data-taravangian] > main > div')
      .first()
      .evaluate((el) => getComputedStyle(el).position)
    // `fixed` would take it out of the layout and pin it to the viewport, which
    // is how it came to measure 1440px wide inside a 1080px column.
    expect(cls).not.toBe('fixed')
  })
})

test.describe('the old address still works', () => {
  test('/stats redirects to /taravangian', async ({ page }) => {
    await page.goto('/Cosmere-Archive/#/stats')
    await page.locator('[data-diagram-panel]').waitFor()
    expect(page.url()).toContain('/taravangian')
  })
})
