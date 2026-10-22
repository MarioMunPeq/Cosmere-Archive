/**
 * M6 · §5.6 — the Diagram of Taravangian.
 *
 * The wall is nine pinned sheets, a paper index strip, and one loose leaf that
 * comes down when a sheet is chosen. What is asserted here is the part of §5.6
 * a screenshot cannot show:
 *
 *   D.1  nine sheets, real buttons, named, reachable
 *   D.2  the sheet lifts into a loose page and returns to its pin
 *   D.3  the wall arrives containing all nine, at every viewport
 *   D.4  the reading measure is a page, not a screen-wide line
 *   D.5  every sheet reaches a record
 *   D.6  the index strip never covers a sheet, and at 375 the wall itself
 *        never overflows horizontally
 *   D.7  axe wcag2aa, wall closed and sheet open
 *   D.8  deterministic positions and rotations inside ±6°
 */

import { expect, test, type Page } from '@playwright/test'

const DIAGRAM = '/Cosmere-Archive/#/taravangian'

async function audit(page: Page) {
  const axe = (await import('axe-core')).default
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    })
  })
}

async function violations(page: Page) {
  const results = await audit(page)
  return results.violations.map((v: { id: string; nodes: unknown[] }) => ({ id: v.id, nodes: v.nodes.length }))
}

/**
 * Resize, and wait for the wall to actually refit.
 *
 * `setViewportSize` resolves when the browser has the new size, not when the
 * page has laid out against it: the wall refits from a ResizeObserver on the
 * next frame. Measuring in between sets the mural's old 720px height against
 * sheets already framed for 900px, which is exactly the false failure this
 * helper exists to prevent.
 */
async function resize(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await expect
    .poll(() => page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.clientHeight]))
    .toEqual([width, height])
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      }),
  )
}

test.beforeEach(async ({ page }) => {
  // The lift, the ink wipe and the ledger strokes all race an assertion
  // otherwise. Reduced motion is the honest way to make them deterministic.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(DIAGRAM)
  await page.locator('[data-diagram-sheet]').first().waitFor()
})

test.describe('D.1 — nine sheets, reachable and named', () => {
  test('the nine sheets are buttons, not divs', async ({ page }) => {
    const sheets = page.locator('[data-diagram-sheet]')
    expect(await sheets.count()).toBe(9)
    await expect(sheets.first()).toHaveJSProperty('tagName', 'BUTTON')
  })

  test('every sheet carries an aria-label naming it', async ({ page }) => {
    const sheets = page.locator('[data-diagram-sheet]')
    for (let i = 0; i < 9; i++) {
      const label = await sheets.nth(i).getAttribute('aria-label')
      expect(label, `sheet ${i} needs a name`).toBeTruthy()
      expect(label).toMatch(/^Sheet [IVX]+: /)
      expect(label).not.toMatch(/catalogue|wordcount/i)
    }
  })

  test('the index lists all nine sheets', async ({ page }) => {
    const entries = page.locator('[data-diagram-index-entry]')
    await expect(entries).toHaveCount(9)
    await expect(entries.first()).toContainText('Catechism')
  })
})

test.describe('D.2 — the loose sheet', () => {
  test('Enter on a focused sheet lifts it, and Escape puts it back', async ({ page }) => {
    const first = page.locator('[data-diagram-sheet]').first()
    await first.focus()
    await expect(first).toBeFocused()
    await page.keyboard.press('Enter')

    const reader = page.locator('[data-diagram-reader]')
    await expect(reader).toBeVisible()
    await expect(page.locator('[data-diagram-sheet-title]')).toContainText('Catechism')

    await page.keyboard.press('Escape')
    await expect(reader).toHaveCount(0)
    await expect(first).toBeFocused()
  })

  test('next and previous move one sheet, with the text following', async ({ page }) => {
    await page.locator('[data-diagram-index-entry="catalogue"]').click()
    const title = page.locator('[data-diagram-sheet-title]')
    await expect(title).toContainText('Catechism')

    await page.locator('[data-diagram-next]').click()
    await expect(title).toContainText('Tenets of Instruction')

    await page.locator('[data-diagram-prev]').click()
    await expect(title).toContainText('Catechism')
  })

  test('the loose sheet is a page, not a pane: the measure is bounded', async ({ page }) => {
    await page.locator('[data-diagram-index-entry="catalogue"]').click()
    // The leaf is one column of type; the measure is declared on the article,
    // and inherited by every paragraph in the prose.
    const leaf = page.locator('[data-diagram-reader] .diagram-reader__leaf')
    const measure = await leaf.evaluate((el) => getComputedStyle(el).maxWidth)
    expect(measure).not.toBe('none')
    expect(parseFloat(measure)).toBeLessThan(760)
  })

  test('the full text is on the paper, with a way out to the archive', async ({ page }) => {
    await page.locator('[data-diagram-index-entry="catalogue"]').click()
    const reader = page.locator('[data-diagram-reader]')
    await expect(reader).toContainText('Q: For what essential must we strive?')
    await expect(reader).toContainText('Our burden is that of the species')

    const links = reader.locator('a[href^="#/"]')
    expect(await links.count()).toBeGreaterThan(0)
    const texts = await links.allInnerTexts()
    for (const t of texts) {
      // D-DIEG: "View record" and "Click here" are a website's words.
      expect(t).not.toMatch(/view|click|here|read more|link/i)
    }
  })

  test('the tallies are ledgers: ruled rows, mono numerals, drawn ink', async ({ page }) => {
    await page.locator('[data-diagram-index-entry="volumes"]').click()
    const table = page.locator('[data-diagram-reader] [data-diagram-ledger]')
    await expect(table).toBeVisible()

    const rows = table.locator('tbody tr')
    expect(await rows.count()).toBeGreaterThan(3)
    await expect(table.locator('tfoot')).toContainText('Counted')

    const font = await table
      .locator('tbody td')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily)
    expect(font).toMatch(/JetBrains|mono/i)

    // One ink stroke per row, and each is drawn with a dash offset.
    expect(await table.locator('path.diagram-bar').count()).toBe(await rows.count())
  })

  test('no sheet text falls below 12px', async ({ page }) => {
    const small = async (scope: string) =>
      page.locator(scope).evaluateAll((els) =>
        els
          .filter((el): el is HTMLElement => el instanceof HTMLElement)
          .filter((el) => {
            const style = getComputedStyle(el)
            if (style.display === 'none' || style.visibility === 'hidden') return false
            if (el.classList.contains('sr-only')) return false
            const ownText = Array.from(el.childNodes).some(
              (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0,
            )
            return ownText && parseFloat(style.fontSize) < 12
          })
          .map((el) => `${el.tagName}.${el.className} ${getComputedStyle(el).fontSize} "${el.textContent?.trim()}"`),
      )

    expect(await small('[data-taravangian] *')).toEqual([])
    await page.locator('[data-diagram-index-entry="catalogue"]').click()
    expect(await small('[data-diagram-reader] *')).toEqual([])
  })
})

test.describe('D.3 / D.6 — the wall and its index', () => {
  test('at desktop, the arrival shows all nine sheets inside the mural', async ({ page }) => {
    await resize(page, 1440, 900)

    const muralLoc = page.locator('[data-taravangian] > main')
    const sheetBoxes = () =>
      page.locator('[data-diagram-sheet]').evaluateAll((els) =>
        els.map((el) => {
          const b = (el as HTMLElement).getBoundingClientRect()
          return { x: b.x, y: b.y, right: b.right, bottom: b.bottom }
        }),
      )

    // The wall refits from JS once the viewport lands. Poll the actual predicate
    // so the measurement below can never see one viewport's mural against the
    // previous viewport's sheet transforms.
    await expect
      .poll(async () => {
        const mural = (await muralLoc.boundingBox())!
        const boxes = await sheetBoxes()
        return (
          boxes.length === 9 &&
          boxes.every(
            (s) =>
              s.x >= mural.x - 2 &&
              s.right <= mural.x + mural.width + 2 &&
              s.y >= mural.y - 2 &&
              s.bottom <= mural.y + mural.height + 2,
          )
        )
      })
      .toBe(true)

    const mural = (await muralLoc.boundingBox())!
    const index = (await page.locator('[data-diagram-index]').boundingBox())!

    // The strip is a sibling, not an overlay: it ends where the wall begins.
    expect(index.x + index.width).toBeLessThanOrEqual(mural.x + 2)

    const sheets = await sheetBoxes()
    expect(sheets).toHaveLength(9)
    for (const s of sheets) {
      expect(s.x).toBeGreaterThanOrEqual(mural.x - 2)
      expect(s.right).toBeLessThanOrEqual(mural.x + mural.width + 2)
      expect(s.y).toBeGreaterThanOrEqual(mural.y - 2)
      expect(s.bottom).toBeLessThanOrEqual(mural.y + mural.height + 2)
    }
  })

  test('at 375 the index is a closed strip below the wall, and opens on demand', async ({ page }) => {
    await resize(page, 375, 667)

    const mural = (await page.locator('[data-taravangian] > main').boundingBox())!
    const index = page.locator('[data-diagram-index]')
    const closed = (await index.boundingBox())!

    expect(closed.y).toBeGreaterThanOrEqual(mural.y + mural.height - 2)
    expect(closed.height).toBeLessThan(64)
    expect(closed.width).toBeGreaterThan(350)

    await page.getByRole('button', { name: /open the index of the nine sheets/i }).click()
    const open = (await index.boundingBox())!
    expect(open.height).toBeGreaterThan(667 * 0.3)
    await expect(page.locator('[data-diagram-index-entry]')).toHaveCount(9)
  })

  test('at 375 the loose sheet is full width and nothing scrolls sideways', async ({ page }) => {
    await resize(page, 375, 667)
    await page.getByRole('button', { name: /open the index of the nine sheets/i }).click()
    await page.locator('[data-diagram-index-entry="catalogue"]').click()

    const paper = (await page.locator('[data-diagram-reader-sheet]').boundingBox())!
    expect(paper.width).toBeGreaterThan(330)
    expect(paper.x).toBeGreaterThanOrEqual(0)
    expect(paper.x + paper.width).toBeLessThanOrEqual(375)

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)

    const overflow = await page
      .locator('[data-diagram-reader] .codex-page__body')
      .evaluate((el) => el.scrollWidth - el.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
})

test.describe('D.5 — every sheet reaches a record', () => {
  test('each index entry opens a sheet with a real destination', async ({ page }) => {
    const entries = page.locator('[data-diagram-index-entry]')
    expect(await entries.count()).toBe(9)
    const ids = await entries.evaluateAll((els) => els.map((e) => e.getAttribute('data-diagram-index-entry') ?? ''))

    for (const id of ids) {
      await page.locator(`[data-diagram-index-entry="${id}"]`).click()
      const links = page.locator('[data-diagram-reader] a')
      expect(await links.count(), `sheet ${id} has no destination`).toBeGreaterThan(0)
      const href = await links.first().getAttribute('href')
      expect(href, `sheet ${id} points nowhere`).toBeTruthy()
      expect(href).not.toBe('#')
      expect(href).toMatch(/^#\//)
      await page.locator('[data-diagram-close]').click()
      await expect(page.locator('[data-diagram-reader]')).toHaveCount(0)
    }
  })
})

test.describe('D.7 — axe', () => {
  test('the wall and an open sheet have no wcag2aa violations', async ({ page }) => {
    await resize(page, 1440, 900)
    expect(await violations(page), 'wall').toEqual([])

    await page.locator('[data-diagram-index-entry="volumes"]').click()
    await page.waitForTimeout(260)
    expect(await violations(page), 'sheet VII').toEqual([])
  })
})

test.describe('D.8 — deterministic', () => {
  test('the wall is in the same place on every visit', async ({ page }) => {
    const positions = async () => {
      await page.goto(DIAGRAM)
      await page.locator('[data-diagram-sheet]').first().waitFor()
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
    // The overlay button is the interactive element; the transform that places
    // and tilts the paper lives on the sheet wrapper it covers.
    const angles = await page.locator('[data-diagram-sheet]').evaluateAll((els) =>
      els.map((e) => {
        const wrapper = (e as HTMLElement).parentElement as HTMLElement
        const m = /rotate\((-?[\d.]+)deg\)/.exec(wrapper.style.transform ?? '')
        return m ? Number(m[1]) : 0
      }),
    )
    expect(angles.length).toBe(9)
    for (const a of angles) expect(Math.abs(a)).toBeLessThanOrEqual(6)
  })
})

test.describe('the old address still works', () => {
  test('/stats redirects to /taravangian', async ({ page }) => {
    await page.goto('/Cosmere-Archive/#/stats')
    await page.locator('[data-diagram-sheet]').first().waitFor()
    expect(page.url()).toContain('/taravangian')
  })
})
