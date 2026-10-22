/**
 * The Library of Jasnah.
 *
 * The shelf is made of bookbinding, not cover crops, and the reader is the
 * Codex chassis rather than a second modal. These tests check the promises a
 * reader can actually see: real spines, a label they can read, a shelf that
 * fits, a volume that opens and returns, and the same room on a phone.
 */

import { test, expect } from '@playwright/test'

const LIBRARY = '/#/library'
const SPINES = '[data-book-id]'

/** The codex hides its left leaf below 700px; its first leaf is the cover. */
async function turnIfSinglePage(page: import('@playwright/test').Page, dialog: import('@playwright/test').Locator) {
  const single = !(await dialog.locator('.codex-page--left').isVisible())
  if (!single) return false
  await dialog.getByRole('button', { name: 'Next spread' }).click()
  await page.waitForTimeout(700)
  return true
}

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

async function openVolume(page: import('@playwright/test').Page) {
  await page.locator('[data-book-id="the_way_of_kings"]').click()
  const dialog = page.getByRole('dialog', { name: /reading the way of kings/i })
  await expect(dialog).toBeVisible()

  const skip = dialog.getByRole('button', { name: /open the way of kings/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()
  await expect(dialog.locator('.codex')).toHaveAttribute('data-phase', 'open', { timeout: 6000 })
  // Let the page-turn shadow and the cover ceremony settle before measuring
  // colour or contrast.
  await page.waitForTimeout(700)
  return dialog
}

test.beforeEach(async ({ page }) => {
  await page.goto(LIBRARY)
  await page.locator(SPINES).first().waitFor()
  await page.locator('[data-shelf][data-ready="true"]').first().waitFor()
})

test('every volume is a made spine, not a cover crop', async ({ page }) => {
  const report = await page.evaluate(() => {
    const spines = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
    return {
      count: spines.length,
      coverImages: document.querySelectorAll('[data-shelf] img').length,
      bands: Math.min(...spines.map((spine) => spine.querySelectorAll('.shelf-spine__band').length)),
      titles: spines.filter((spine) => (spine.textContent ?? '').trim().length > 0).length,
    }
  })

  expect(report.count, 'the wall holds all 22 volumes').toBe(22)
  expect(report.coverImages, 'a spine is bound, not a cropped cover').toBe(0)
  expect(report.bands, 'every spine has raised bands').toBeGreaterThanOrEqual(4)
  expect(report.titles).toBe(22)
})

test('spine labels are horizontal Garamond small caps at 13px or more', async ({ page }) => {
  const labels = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-spine-title]')).map((label) => {
      const style = getComputedStyle(label)
      return {
        size: parseFloat(style.fontSize),
        caps: style.fontVariantCaps,
        writing: style.writingMode,
        clipped: label.scrollWidth > label.clientWidth + 1,
      }
    }),
  )

  expect(labels.length).toBe(22)
  for (const label of labels) {
    expect(label.size, 'a paper label is never below 13px').toBeGreaterThanOrEqual(13)
    expect(['small-caps', 'all-small-caps']).toContain(label.caps)
    expect(label.writing, 'the label reads horizontally').toBe('horizontal-tb')
    expect(label.clipped, 'the paper label is not cut off').toBe(false)
  }
})

test('spines vary in height and width without choosing at random', async ({ page }) => {
  const first = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]')).map((spine) => {
      const box = spine.getBoundingClientRect()
      return { width: Math.round(box.width), height: Math.round(box.height) }
    }),
  )
  await page.reload()
  await page.locator(SPINES).first().waitFor()
  await page.locator('[data-shelf][data-ready="true"]').first().waitFor()
  const second = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]')).map((spine) => {
      const box = spine.getBoundingClientRect()
      return { width: Math.round(box.width), height: Math.round(box.height) }
    }),
  )

  expect(second).toEqual(first)
  expect(new Set(first.map((item) => item.height)).size).toBeGreaterThan(1)
  expect(new Set(first.map((item) => item.width)).size).toBeGreaterThan(1)
})

test('the saga plate sits on the shelf edge and is never truncated', async ({ page }) => {
  const plates = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('.library-plate')).map((plate) => ({
      text: (plate.textContent ?? '').trim(),
      clipped: plate.scrollWidth > plate.clientWidth + 1,
      nowrap: getComputedStyle(plate).whiteSpace,
    })),
  )

  expect(plates.length, 'one plate for each shelf').toBe(3)
  for (const plate of plates) {
    expect(plate.text.length).toBeGreaterThan(2)
    expect(plate.clipped, `plate cut off: ${plate.text}`).toBe(false)
    expect(plate.nowrap).toBe('nowrap')
  }
})

test('hover lifts a volume and offers a paper slip with its year', async ({ page }) => {
  const spine = page.locator('[data-book-id="the_way_of_kings"]')
  const before = await spine.boundingBox()
  await spine.hover()
  await page.waitForTimeout(260)
  const after = await spine.boundingBox()
  const slip = spine.locator('..').locator('.shelf-slip')

  expect(before).not.toBeNull()
  expect(after).not.toBeNull()
  expect(before!.y - after!.y, 'the volume slides out by about 14px').toBeGreaterThanOrEqual(8)
  await expect(slip).toBeVisible()
  await expect(slip).toContainText('The Way of Kings')
  await expect(slip).toContainText('2010')
})

test('keyboard focus is an ink ring, and arrows walk the run', async ({ page }) => {
  const first = page.locator('[data-book-id="the_way_of_kings"]')
  await first.focus()

  const outline = await first.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: style.outlineWidth, style: style.outlineStyle }
  })
  expect(outline.style).toBe('solid')
  expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2)

  await page.keyboard.press('ArrowRight')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'words_of_radiance')

  await page.keyboard.press('End')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'wind_and_truth')

  await page.keyboard.press('Home')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'the_way_of_kings')
})

for (const width of [375, 768, 1440, 2560]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(450)

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement

      // The paper slip is absolutely positioned and deliberately leans out of
      // the run; it is not a book and must not be counted as row overflow.
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-shelf-row]'))
        .map((row) => {
          const edge = row.getBoundingClientRect().right
          const books = Array.from(row.children)
            .filter((child) => getComputedStyle(child).position !== 'absolute')
            .map((child) => child.getBoundingClientRect().right)
          const over = books.length > 0 ? Math.max(...books) - edge : 0
          return {
            shelf: row.closest('[data-shelf]')?.getAttribute('data-shelf') ?? '',
            over: Math.max(0, Math.ceil(over)),
          }
        })
        .filter((row) => row.over > 1)

      const mobileScrollers = Array.from(document.querySelectorAll<HTMLElement>('.library-shelf__scroll')).map(
        (scroller) => getComputedStyle(scroller).overflowX,
      )

      return { doc: doc.scrollWidth - doc.clientWidth, rows, mobileScrollers }
    })

    expect(overflow.doc, `document overflows by ${overflow.doc}px`).toBeLessThanOrEqual(0)
    expect(overflow.rows, `rows overflow their shelf: ${JSON.stringify(overflow.rows)}`).toEqual([])
    if (width === 375) {
      expect(overflow.mobileScrollers.every((value) => value === 'auto')).toBe(true)
    }
  })
}

test('a phone gets horizontal snap shelves, not a wrapped cabinet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.waitForTimeout(450)

  const shelves = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-shelf]')).map((shelf) => {
      const scroller = shelf.querySelector<HTMLElement>('.library-shelf__scroll')
      return {
        mobile: shelf.dataset.mobile,
        snap: scroller ? getComputedStyle(scroller).scrollSnapType : '',
        scrollable: scroller ? scroller.scrollWidth > scroller.clientWidth : false,
      }
    }),
  )

  expect(shelves.length).toBe(3)
  for (const shelf of shelves) {
    expect(shelf.mobile).toBe('true')
    expect(shelf.snap).toContain('x mandatory')
  }
  // A collection that happens to fit within 375px is still a shelf scroller;
  // at least the long runs must be scrollable rather than wrapping.
  expect(shelves.filter((shelf) => shelf.scrollable).length).toBeGreaterThan(0)
})

for (const width of [375, 1440]) {
  test(`axe passes on the shelves at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(450)

    const results = await audit(page)
    const violations = results.violations.map((v: { id: string; nodes: unknown[] }) => ({
      id: v.id,
      nodes: v.nodes.length,
    }))
    expect(violations, `axe violations on shelves at ${width}px`).toEqual([])
  })
}

test('the reader shows the cover plate, ledger and drop-cap synopsis', async ({ page }) => {
  const dialog = await openVolume(page)

  await expect(dialog.getByAltText(/cover of the way of kings/i)).toBeVisible()
  await expect(dialog.getByText('Accession', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: /return to shelf/i })).toBeVisible()

  // A phone opens on the cover leaf; the synopsis is the next leaf.
  await turnIfSinglePage(page, dialog)
  await expect(dialog.getByRole('heading', { level: 2, name: 'Synopsis' })).toBeVisible()
  await expect(dialog.locator('.library-world-link')).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Adolin' })).toBeVisible()
})

test('the reader is a real dialog, axe-clean, and returns focus to its spine', async ({ page }) => {
  const dialog = await openVolume(page)
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  const results = await audit(page)
  const violations = results.violations.map((v: { id: string; nodes: unknown[] }) => ({
    id: v.id,
    nodes: v.nodes.length,
  }))
  expect(violations, 'axe violations in the reader').toEqual([])

  await dialog.getByRole('button', { name: /return to shelf/i }).click()
  await expect(dialog).toBeHidden({ timeout: 5000 })
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'the_way_of_kings')
  await expect(page).not.toHaveURL(/[?&]book=/)
})

test('a page turn advances the spread and the live region', async ({ page }) => {
  const dialog = await openVolume(page)

  const spread = dialog.locator('[data-codex-spread]')
  const before = await spread.getAttribute('data-codex-spread')
  const next = dialog.getByRole('button', { name: 'Next spread' })
  await expect(next).toBeEnabled()
  await next.click()

  await expect(spread).not.toHaveAttribute('data-codex-spread', before ?? '')
  await expect(dialog.getByText(/spread 2 of/i)).toBeAttached()
})

test('a deep link opens the volume at the desk', async ({ page }) => {
  await page.goto(`${LIBRARY}?book=the_way_of_kings`)
  const dialog = page.getByRole('dialog', { name: /reading the way of kings/i })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByAltText(/cover of the way of kings/i)).toBeVisible()
  await turnIfSinglePage(page, dialog)
  await expect(dialog.getByRole('heading', { level: 2, name: 'Synopsis' })).toBeVisible()
  await expect(page).toHaveURL(/\?book=the_way_of_kings/)
})

test('a phone reads one page at a time and swipes forward', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.reload()
  await page.locator(SPINES).first().waitFor()
  const dialog = await openVolume(page)

  const left = dialog.locator('.codex-page--left')
  await expect(left).toBeHidden()
  const spread = dialog.locator('[data-codex-spread]')
  const before = await spread.getAttribute('data-codex-spread')

  const stage = dialog.locator('.codex-stage')
  const box = await stage.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width * 0.76, box!.y + box!.height * 0.45)
  await page.mouse.down()
  await page.mouse.move(box!.x + box!.width * 0.24, box!.y + box!.height * 0.45, { steps: 12 })
  await page.mouse.up()

  await expect(spread).not.toHaveAttribute('data-codex-spread', before ?? '', { timeout: 5000 })

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return doc.scrollWidth - doc.clientWidth
  })
  expect(overflow, 'the phone reader must not scroll sideways').toBeLessThanOrEqual(0)
})
