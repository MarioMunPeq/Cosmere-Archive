/**
 * M3 — the Library of Jasnah.
 *
 * §5.3.6's acceptance criteria, checked in a browser rather than asserted in
 * prose. The ones worth naming:
 *
 *   M3.1  every spine paints a real cover, no 404s — the old library showed the
 *         same "circle and four rivets" fallback on 17 of 22 books
 *   M3.3  no spine text under 11px
 *   M3.4  no horizontal overflow at 375 / 768 / 1440 / 2560 — the old layout
 *         overflowed by exactly 192px, which is the horizontal padding
 *   M3.5  Dawnshard, which has no wordCount, is at least MIN_SPINE wide and
 *         fully inside the shelf
 *   M3.6  48px between shelves
 *   M3.7  axe at four breakpoints
 *   M3.8  the List view carries the same 22 volumes and is sortable
 *
 * M3.2, the 4.5:1 title contrast over the real cover, is measured by sampling
 * rendered pixels and lives in scripts/shots.ts, because it needs `sharp` to
 * decode a screenshot and that belongs with the other visual checks rather than
 * in CI. `pnpm shots` prints it.
 */

import { test, expect } from '@playwright/test'

const LIBRARY = '/#/library'
const SPINES = '[data-book-id]'

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

test.beforeEach(async ({ page }) => {
  await page.goto(LIBRARY)
  await page.locator(SPINES).first().waitFor()
})

test('M3.1 every volume paints a real cover, none 404s', async ({ page }) => {
  // Covers are `loading="lazy"`, so a spine that has never scrolled into view
  // legitimately has `complete === false`. Waiting for them is the only way to
  // tell "not requested yet" apart from "requested and failed".
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[data-cover]'))
      return imgs.length > 0 && imgs.every((i) => i.complete)
    },
    undefined,
    { timeout: 15_000 },
  )

  const report = await page.evaluate(() => {
    const spines = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
    const imgs = spines.map((s) => s.querySelector('img[data-cover]') as HTMLImageElement | null)
    return {
      spines: spines.length,
      missing: imgs.filter((i) => !i).length,
      broken: imgs.filter((i) => i && i.naturalWidth === 0).map((i) => i.src),
    }
  })

  expect(report.spines, 'the shelf should hold all 22 volumes').toBe(22)
  expect(report.missing, 'every spine needs a cover element').toBe(0)
  expect(report.broken, 'covers that failed to load').toEqual([])
})

test('covers below the fold are not fetched', async ({ page }) => {
  // The lazy attribute is only worth anything if it is actually on the images.
  const eager = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>('img[data-cover]'))
      .filter((i) => i.loading !== 'lazy')
      .map((i) => i.src),
  )
  expect(eager, 'spine covers must be lazy-loaded').toEqual([])
})

test('M3.1 the 22 covers are distinct files, not one shared fallback', async ({ page }) => {
  const sources = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>('img[data-cover]')).map((i) => i.currentSrc || i.src),
  )
  // A shared fallback would collapse to one URL. Twenty-two volumes means
  // twenty-two sources.
  expect(new Set(sources).size).toBe(22)
})

test('M3.3 no spine text measures under 11px', async ({ page }) => {
  const tooSmall = await page.evaluate(() => {
    const spines = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
    return spines
      .map((s) => {
        const title = s.querySelector<HTMLElement>('[data-spine-title]')
        return title
          ? {
              id: s.dataset.bookId ?? '',
              size: parseFloat(getComputedStyle(title).fontSize),
            }
          : null
      })
      .filter((t): t is { id: string; size: number } => t !== null && t.size < 11)
  })

  expect(tooSmall, `spine titles under 11px: ${JSON.stringify(tooSmall)}`).toEqual([])
})

for (const width of [375, 768, 1440, 2560]) {
  test(`M3.4 no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(400)

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      // Per-row as well as per-document. A row can overflow its own container
      // by a few pixels and the document still reports zero, because the
      // container clips it — which is how a spine gets sliced without anything
      // failing. Six pixels of it was a padding the measurement counted twice.
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-shelf] .flex.items-end'))
        .map((row) => ({
          shelf: row.closest('[data-shelf]')?.getAttribute('data-shelf') ?? '',
          over: row.scrollWidth - row.clientWidth,
        }))
        .filter((r) => r.over > 0)
      return { doc: doc.scrollWidth - doc.clientWidth, rows }
    })

    expect(overflow.doc, `document overflows by ${overflow.doc}px`).toBeLessThanOrEqual(0)
    expect(overflow.rows, `rows overflow their shelf: ${JSON.stringify(overflow.rows)}`).toEqual([])
  })
}

test('M3.5 Dawnshard is at least 24px wide and fully inside the shelf', async ({ page }) => {
  const dawnshard = page.locator('[data-book-id="dawnshard"]')
  await expect(dawnshard).toBeVisible()

  const box = await dawnshard.boundingBox()
  expect(box).not.toBeNull()
  // MIN_SPINE from utils/shelf-layout.
  expect(box!.width).toBeGreaterThanOrEqual(24)

  // Fully visible: inside its row, which is inside the cabinet.
  const fits = await page.evaluate(() => {
    const spine = document.querySelector<HTMLElement>('[data-book-id="dawnshard"]')!
    const row = spine.parentElement!.parentElement!
    const s = spine.getBoundingClientRect()
    const r = row.getBoundingClientRect()
    return s.left >= r.left - 1 && s.right <= r.right + 1
  })
  expect(fits, 'Dawnshard is clipped by its row').toBe(true)
})

test('M3.6 shelves are 48px apart', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 })

  const gaps = await page.evaluate(() => {
    const shelves = Array.from(document.querySelectorAll<HTMLElement>('[data-shelf]'))
    const gaps: number[] = []
    for (let i = 1; i < shelves.length; i++) {
      const prev = shelves[i - 1]!.getBoundingClientRect()
      const cur = shelves[i]!.getBoundingClientRect()
      gaps.push(Math.round(cur.top - prev.bottom))
    }
    return gaps
  })

  expect(gaps.length, 'expected at least two shelves to measure between').toBeGreaterThan(0)
  for (const gap of gaps) {
    // The gap is measured shelf-box to shelf-box; the shelf's own bottom is the
    // plank, so this is mb-2xl (48px) exactly.
    expect(Math.abs(gap - 48), `gap was ${gap}px, expected 48px`).toBeLessThanOrEqual(1)
  }
})

for (const width of [375, 768, 1440, 2560]) {
  test(`M3.7 axe passes on /library at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(400)

    const results = await audit(page)
    const violations = results.violations.map((v: { id: string; nodes: unknown[] }) => ({
      id: v.id,
      nodes: v.nodes.length,
    }))
    expect(violations, `axe violations at ${width}px`).toEqual([])
  })
}

test('the shelves are reachable with the keyboard alone', async ({ page }) => {
  await page.locator('[data-book-id="the_way_of_kings"]').focus()

  await page.keyboard.press('ArrowRight')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'words_of_radiance')

  await page.keyboard.press('End')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'wind_and_truth')

  await page.keyboard.press('Home')
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'the_way_of_kings')

  // Enter opens, Escape closes, and focus comes back to the spine.
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator(':focus')).toHaveAttribute('data-book-id', 'the_way_of_kings')
})

/**
 * Measure a transient piece of the reader without racing it.
 *
 * Both the front board and the turning leaf exist for under a second, so a test
 * that has to find one in the DOM and then read its box loses whenever the
 * suite's four workers saturate the CPU. This drops a probe with the same
 * classes into the live book, with the animation cancelled, and measures that.
 * The probe is static, the geometry is the same, and the test stops depending
 * on how fast the machine is.
 */
async function probeGeometry(
  page: import('@playwright/test').Page,
  className: string,
): Promise<{ leftFromSpine: number; rightFromSpine: number; width: number; pageWidth: number }> {
  return page.evaluate((cls) => {
    const book = document.querySelector<HTMLElement>('[data-book-spread]')!
    const leftPage = book.querySelector<HTMLElement>('.page--left')!

    const probe = document.createElement('div')
    probe.className = cls
    probe.style.animation = 'none'
    probe.style.transition = 'none'
    probe.style.transform = 'none'
    book.append(probe)

    const spine = book.getBoundingClientRect().left + book.getBoundingClientRect().width / 2
    const box = probe.getBoundingClientRect()
    const page = leftPage.getBoundingClientRect()
    probe.remove()

    return {
      leftFromSpine: box.left - spine,
      rightFromSpine: box.right - spine,
      width: box.width,
      pageWidth: page.width,
    }
  }, className)
}

test('the book opens by swinging its front board on the spine', async ({ page }) => {
  await page.locator('[data-book-id="the_way_of_kings"]').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // The cover is a real element hinged at the spine, and it is gone once the
  // swing has landed — it must be, or it would sit on the title page forever.
  const cover = page.locator('[data-book-cover]')
  await expect(cover).toBeHidden({ timeout: 6000 })

  // Hinged on its left edge, which is the spine: it starts closed over the
  // right half and lands flat on the left.
  const geo = await probeGeometry(page, 'book-cover')
  expect(Math.abs(geo.leftFromSpine), 'the front board must hinge on the spine').toBeLessThan(2)
  expect(geo.width, 'the front board is half the spread').toBeGreaterThan(100)
})

test('a turning leaf is hinged on the spine and one page wide', async ({ page }) => {
  await page.locator('[data-book-id="the_way_of_kings"]').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  /*
   * The leaf used to be positioned at `left: calc(50% + 13px)`, so at the end
   * of the swing it landed 13px to the right of the page it was replacing —
   * a sliver of the old page stayed visible along the gutter on every turn.
   * These numbers are the regression.
   */
  const forward = await probeGeometry(page, 'leaf leaf--forward')
  expect(Math.abs(forward.leftFromSpine), 'a forward leaf hinges on the spine').toBeLessThan(2)
  expect(Math.abs(forward.width - forward.pageWidth), 'a forward leaf must be exactly one page wide').toBeLessThan(2)

  // Mirrored: a backward leaf hinges on its right edge.
  const back = await probeGeometry(page, 'leaf leaf--back')
  expect(Math.abs(back.rightFromSpine), 'a backward leaf hinges on the spine').toBeLessThan(2)
  expect(Math.abs(back.width - back.pageWidth)).toBeLessThan(2)
})

test('a page turn keeps the book open and advances the folio', async ({ page }) => {
  await page.locator('[data-book-id="the_way_of_kings"]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // The book has to finish opening before it can be turned. Otherwise the
  // button looks live and does nothing.
  const next = dialog.getByRole('button', { name: 'Next page' })
  await expect(next).toBeEnabled()

  await expect(dialog.getByRole('button', { name: 'Previous page' })).toBeDisabled()

  await next.click()
  await expect(dialog.locator('[data-page-surface]')).toHaveCount(2)
  await expect(dialog.getByRole('button', { name: 'Previous page' })).toBeEnabled()
})
