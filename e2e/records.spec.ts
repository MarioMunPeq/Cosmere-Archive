/**
 * Records checks that only a real browser can answer.
 *
 * M4 · block 1. §5.4's acceptance criteria for the index and the frame:
 *
 *   R.2  no horizontal overflow at 375px
 *   R.4  the planet chip in the index clears 4.5:1 — it measured 2.21:1
 *   R.5  the search placeholder clears 4.5:1 — it measured 1.68:1
 *   R.6  no `<div onClick>` anywhere in the records feature
 *   R.9  the A–Z index lists all 93 entries, grouped
 *   R.11 no text on the screen under 11px
 *
 * The rest of R (R.1, R.3, R.7, R.8, R.10) belong to the record card and land
 * with block 2.
 */

import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const RECORDS = '/#/characters'

/** WCAG relative luminance from an `rgb()` string. */
function luminance(css: string): number {
  const m = css.match(/rgba?\(([^)]+)\)/)
  if (!m) return 0
  const [r, g, b] = m[1]!
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number)
  const f = (v = 0) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Composites a possibly-translucent colour over an opaque backdrop. */
function flatten(fg: string, bg: string): string {
  const alpha = Number(fg.match(/\/\s*([\d.]+)\s*\)/)?.[1] ?? 1)
  if (alpha >= 1) return fg
  const p = (c: string, i: number) => Number(c.split(/[,\s/]+/).filter(Boolean)[i] ?? 0)
  const mixed = [0, 1, 2].map((i) => Math.round(p(fg, i) * alpha + p(bg, i) * (1 - alpha)))
  return `rgb(${mixed.join(',')})`
}

function ratio(fg: string, bg: string): number {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Walks up for the first opaque background behind an element. */
async function backdropOf(page: import('@playwright/test').Page, selector: string): Promise<string> {
  return page.evaluate((sel) => {
    const bgOf = (el: Element | null): string => {
      while (el) {
        const bg = getComputedStyle(el).backgroundColor
        const alpha = Number(bg.match(/\/\s*([\d.]+)\s*\)/)?.[1] ?? 1)
        if (alpha > 0.95) return bg
        el = el.parentElement
      }
      return 'rgb(255,255,255)'
    }
    const el = document.querySelector(sel)
    return bgOf(el)
  }, selector)
}

const EXPECTED = (() => {
  const dir = join(process.cwd(), 'src', 'data', 'generated')
  return JSON.parse(readFileSync(join(dir, 'characters.json'), 'utf8')).length
})()

test.beforeEach(async ({ page }) => {
  await page.goto(RECORDS)
  await page.locator('[data-records-index]').waitFor()
})

test('R.9 the A–Z index lists every record, grouped by letter', async ({ page }) => {
  const rows = page.locator('[data-records-index] nav a')
  await expect(rows).toHaveCount(EXPECTED)

  // Grouped, not a flat list: at least a dozen letter headings.
  const groups = page.locator('[data-records-index] section')
  expect(await groups.count()).toBeGreaterThan(10)

  const first = await rows.first().innerText()
  expect(first).not.toHaveLength(0)
})

test('R.9 the index is ordered alphabetically', async ({ page }) => {
  const names = await page.locator('[data-records-index] nav a > span:nth-child(2)').allInnerTexts()
  const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
  expect(names).toEqual(sorted)
})

test('R.4 the planet chip clears 4.5:1', async ({ page }) => {
  const backdrop = await backdropOf(page, '[data-records-index] nav a span:last-child')
  const chip = await page
    .locator('[data-records-index] nav a span:last-child')
    .first()
    .evaluate((el) => getComputedStyle(el).color)

  const measured = ratio(flatten(chip, backdrop), backdrop)
  expect(
    measured,
    `planet chip measured ${measured.toFixed(2)}:1 against ${backdrop} — the audit recorded 2.21:1 for the old one`,
  ).toBeGreaterThanOrEqual(4.5)
})

test('R.5 the search placeholder clears 4.5:1', async ({ page }) => {
  const input = page.locator('#record-search')
  await expect(input).toBeVisible()

  const [colour, backdrop] = await page.evaluate(() => {
    const el = document.querySelector('#record-search')!
    // Chromium resolves ::placeholder through getComputedStyle. Reading the
    // value off the stylesheet instead — which was the first attempt — does
    // not work, because the colour is a `var()` resolved at computed-value
    // time and the rule's declared text is not the colour.
    const placeholder = getComputedStyle(el, '::placeholder').color

    let bg = 'rgb(0,0,0)'
    let node: Element | null = el
    while (node) {
      const c = getComputedStyle(node).backgroundColor
      if (Number(c.match(/\/\s*([\d.]+)\s*\)/)?.[1] ?? 1) > 0.95) {
        bg = c
        break
      }
      node = node.parentElement
    }
    return [placeholder, bg]
  })

  const measured = ratio(flatten(colour, backdrop), backdrop)
  expect(
    measured,
    `search placeholder measured ${measured.toFixed(2)}:1 (${colour} on ${backdrop}) — the audit recorded 1.68:1 for the old one`,
  ).toBeGreaterThanOrEqual(4.5)
})

test('R.2 no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.waitForTimeout(300)
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(over, `document overflows by ${over}px`).toBeLessThanOrEqual(0)
})

test('R.11 no text under 11px anywhere on the screen', async ({ page }) => {
  const tiny = await page.evaluate(() => {
    const out: string[] = []
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const direct = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
      )
      if (!direct) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size < 11) out.push(`${el.tagName}.${el.className}`.slice(0, 60) + ` = ${size}px`)
    }
    return out
  })
  expect(tiny, `text under 11px: ${tiny.slice(0, 5).join(' | ')}`).toEqual([])
})

test('R.6 no div-onclick anywhere in the records feature', async () => {
  const dir = join(process.cwd(), 'src', 'components', 'records')
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))
  const offenders: string[] = []
  for (const file of files) {
    const src = readFileSync(join(dir, file), 'utf8')
    if (/<div[^>]*\sonClick/i.test(src)) offenders.push(`${dir}/${file}`)
  }
  expect(offenders, 'divs with onClick in the records feature').toEqual([])
})

test('a record is chosen by URL and is shareable', async ({ page }) => {
  await page.locator('[data-records-index] nav a').first().click()
  await expect(page).toHaveURL(/character=/)

  const url = page.url()
  await page.goto('about:blank')
  await page.goto(url)
  await expect(page.locator('[data-records-index] a[aria-current="true"]')).toHaveCount(1)
})

test('the index filters by name, description and world', async ({ page }) => {
  const all = page.locator('[data-records-index] nav a')
  const total = await all.count()

  await page.locator('#record-search').fill('kaladin')
  // Six records mention Kaladin in their description, so the filter narrows
  // rather than pins. That is the intent: the old index searched name,
  // description and planet, and losing that would be a regression.
  const narrowed = await all.count()
  expect(narrowed).toBeGreaterThan(0)
  expect(narrowed).toBeLessThan(total)
  // Not necessarily first: the index is alphabetical, and other records whose
  // descriptions mention Kaladin sort ahead of him.
  await expect(all.filter({ hasText: 'Kaladin' })).toHaveCount(1)

  // A world name is searchable too.
  await page.locator('#record-search').fill('scadrial')
  expect(await all.count()).toBeGreaterThan(0)

  // A query with no match says so, and offers a way out.
  await page.locator('#record-search').fill('zzzzz')
  await expect(page.locator('[data-records-index]')).toContainText('No records match')
  await page.getByRole('button', { name: /clear search/i }).click()
  await expect(all).toHaveCount(total)
})
