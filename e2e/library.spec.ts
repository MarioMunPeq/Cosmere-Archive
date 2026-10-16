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
  const report = await page.evaluate(() => {
    const spines = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
    const imgs = spines.map((s) => s.querySelector('img[data-cover]') as HTMLImageElement | null)
    return {
      spines: spines.length,
      missing: imgs.filter((i) => !i).length,
      broken: imgs.filter((i) => i && (!i.complete || i.naturalWidth === 0)).map((i) => i.src),
    }
  })

  expect(report.spines, 'the shelf should hold all 22 volumes').toBe(22)
  expect(report.missing, 'every spine needs a cover element').toBe(0)
  expect(report.broken, 'covers that failed to load').toEqual([])
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
      // The widest offender, so the failure names the element rather than just
      // the number.
      const widest = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
        .map((el) => ({ id: el.dataset.bookId ?? '', right: Math.round(el.getBoundingClientRect().right) }))
        .sort((a, b) => b.right - a.right)[0]
      return {
        doc: doc.scrollWidth - doc.clientWidth,
        widest,
      }
    })

    expect(overflow.doc, `document overflows by ${overflow.doc}px`).toBeLessThanOrEqual(0)
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

test('M3.8 the List view carries the same 22 volumes', async ({ page }) => {
  const shelfCount = await page.locator(SPINES).count()

  await page.getByRole('tab', { name: 'list' }).click()
  const rows = page.locator('[data-list-row]')
  await expect(rows).toHaveCount(shelfCount)

  // The view is in the URL, so it is linkable and survives a reload.
  await expect(page).toHaveURL(/view=list/)
  await page.reload()
  await expect(page.getByRole('tab', { name: 'list' })).toHaveAttribute('aria-selected', 'true')
})

test('M3.8 the List view sorts', async ({ page }) => {
  await page.getByRole('tab', { name: 'list' }).click()
  const rows = page.locator('[data-list-row]')

  const first = async () => (await rows.first().getAttribute('data-list-row')) ?? ''

  const defaultFirst = await first()
  await page.getByRole('button', { name: /published/i }).click()
  const byYear = await first()

  await page.getByRole('button', { name: /title/i }).click()
  const byTitle = await first()

  expect(byTitle.toLowerCase()).toBe('arcanum_unbounded')
  expect(byYear).not.toBe(defaultFirst)
})

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

test('a page turn keeps the book open and advances the folio', async ({ page }) => {
  await page.locator('[data-book-id="the_way_of_kings"]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  const before = await dialog.getByRole('button', { name: 'Previous page' })
  await expect(before).toBeDisabled()

  await dialog.getByRole('button', { name: 'Next page' }).click()
  await expect(dialog.locator('[data-page-surface]')).toHaveCount(2)
  await expect(dialog.getByRole('button', { name: 'Previous page' })).toBeEnabled()
})
