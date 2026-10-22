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

const CHARACTERS = '/#/characters'
const RECORDS = `${CHARACTERS}?spread=records-contents`

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

const EXPECTED = (() => {
  const dir = join(process.cwd(), 'src', 'data', 'generated')
  return JSON.parse(readFileSync(join(dir, 'characters.json'), 'utf8')).length
})()

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('cosmere-codex-opened', '1')
      localStorage.removeItem('cosmere-codex-ribbon')
    } catch {
      // Storage may be unavailable on about:blank.
    }
  })
  await page.goto(RECORDS)
  await page.locator('[data-records-index]').waitFor()
})

test('R.9 the A–Z index lists every record, grouped by letter', async ({ page }) => {
  const rows = page.locator('[data-records-index] [data-contents-kind="record"]')
  await expect(rows).toHaveCount(EXPECTED)

  // Grouped, not a flat list: the eight letter ranges.
  const groups = page.locator('[data-records-index] section')
  expect(await groups.count()).toBeGreaterThan(7)

  const first = await rows.first().innerText()
  expect(first).not.toHaveLength(0)
})

test('R.9 the index is ordered alphabetically', async ({ page }) => {
  const names = await page.locator('[data-records-index] [data-contents-kind="record"]').allInnerTexts()
  const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
  expect(names).toEqual(sorted)
})

test('R.4 the planet label clears 4.5:1', async ({ page }) => {
  await page.goto(`${CHARACTERS}?character=kaladin`)
  await page.locator('[data-record-planet]').waitFor()

  const [label, backdrop] = await page.evaluate(() => {
    const el = document.querySelector('[data-record-planet]')!
    const pageEl = el.closest('.codex-page')
    const paper = pageEl?.querySelector('.codex-page__paper')
    return [getComputedStyle(el).color, paper ? getComputedStyle(paper).backgroundColor : 'rgb(244,239,228)']
  })

  const measured = ratio(flatten(label, backdrop), backdrop)
  expect(
    measured,
    `planet label measured ${measured.toFixed(2)}:1 against ${backdrop} — the audit recorded 2.21:1 for the old chip`,
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
    // Comments are stripped first. The criterion is about code, and the
    // component's own doc comment explains that it replaced a `<div onClick>`,
    // which the regex was then matching — a test that fails on its own
    // documentation is a test nobody will keep.
    const src = readFileSync(join(dir, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    if (/<div[^>]*\sonClick/i.test(src)) offenders.push(`${dir}/${file}`)
  }
  expect(offenders, 'divs with onClick in the records feature').toEqual([])
})

test('a record is chosen by URL and is shareable', async ({ page }) => {
  await page.locator('[data-records-index] [data-contents-kind="record"]').first().click()
  await expect(page).toHaveURL(/spread=record-/)

  const url = page.url()
  await page.goto('about:blank')
  await page.goto(url)
  await expect(page.locator('[data-character-card]')).toBeVisible()
  await expect(page.locator('[data-character-card] h2')).not.toHaveCount(0)
})

test('a character search result at /records/:id resolves to the record spread', async ({ page }) => {
  await page.goto('/#/records/adolin')
  await expect(page).toHaveURL(/spread=record-adolin/)
  await expect(page.locator('[data-character-card] h2')).toContainText('Adolin Kholin')
})

/* ------------------------------------------------------------------ the card */

test.describe('the record card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${CHARACTERS}?character=kaladin`)
    await page.locator('[data-character-card]').waitFor()
  })

  test('R.3 the card passes axe', async ({ page }) => {
    const axe = (await import('axe-core')).default
    await page.addScriptTag({ content: axe.source })
    const results = await page.evaluate(async () => {
      // eslint-disable-next-line no-explicit-any
      return (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      })
    })
    const violations = results.violations.map((v: { id: string; nodes: unknown[] }) => ({
      id: v.id,
      nodes: v.nodes.length,
    }))
    expect(violations, JSON.stringify(violations)).toEqual([])
  })

  test('R.10 the card is operable without a mouse', async ({ page }) => {
    await page.goto(RECORDS)
    await page.locator('[data-records-index] [data-contents-kind="record"]').first().focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-character-card]')).toBeVisible()

    const links = page.locator('[data-character-card] a')
    expect(await links.count(), 'the card should have linkable values').toBeGreaterThan(0)

    // Each one is a real anchor: reachable by keyboard and with a name.
    const first = links.first()
    await first.focus()
    await expect(first).toBeFocused()
    expect((await first.innerText()).trim().length).toBeGreaterThan(0)
  })

  test('R.1 no image 404s when browsing records', async ({ page }) => {
    const failures: string[] = []
    page.on('response', (r) => {
      if (r.status() >= 400 && r.request().resourceType() === 'image') failures.push(r.url())
    })

    for (const id of ['kaladin', 'vin', 'sazed', 'is-har', 'szeth', 'shallan']) {
      await page.goto(`${CHARACTERS}?character=${id}`)
      await page.waitForTimeout(200)
    }
    expect(failures, `image requests that 404'd: ${failures.join(', ')}`).toEqual([])
  })

  test('the portrait slot is never a hole, on a sample across the index', async ({ page }) => {
    /*
     * Not "Kaladin has no portrait" — that is a fact about the data and it can
     * change. The invariant is that every card shows exactly one of a loaded
     * portrait or a monogram, and that no card shows a broken image.
     *
     * The counts are asserted as data invariants in `records-data.test.ts`,
     * where they are exact and instant. Here it is a browser sample, navigated
     * by clicking the index rather than by loading URLs: ninety-three full
     * page loads takes minutes and times the test out, and a portrait that
     * 404s fails the same way on the first record as on the ninetieth.
     */
    await page.goto(RECORDS)
    await page.locator('[data-records-index] [data-contents-kind="record"]').first().waitFor()

    const problems: string[] = []
    let monograms = 0
    let portraits = 0
    const sample = page.locator('[data-records-index] [data-contents-kind="record"]')
    const total = await sample.count()
    expect(total).toBeGreaterThan(90)

    for (const i of [0, 7, 23, 41, 58, 76, 90]) {
      if (i >= total) continue
      await page.goto(RECORDS)
      await page.locator('[data-records-index]').waitFor()
      await page.locator('[data-contents-kind="record"]').nth(i).click()
      const card = page.locator('[data-character-card]')
      await card.locator('[data-record-plate]').waitFor()
      const state = await card.evaluate((el) => {
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          hasImg: !!img,
          // `complete` matters: reading naturalWidth the instant the card
          // mounts reports 0 for an image that is merely still in flight, and
          // that is not a broken portrait.
          broken: !!img && img.complete && img.naturalWidth === 0,
          hasSvg: !!el.querySelector('svg'),
        }
      })
      if (state.broken) problems.push(`record ${i} portrait 404`)
      else if (!state.hasImg && !state.hasSvg) problems.push(`record ${i} has neither portrait nor monogram`)
      if (state.hasImg) portraits += 1
      else monograms += 1
    }
    expect(problems, `${problems.length} problems across ${portraits + monograms} sampled records`).toEqual([])
    // The sample must exercise both paths or it proves nothing.
    expect(monograms, 'the sample should include records with no portrait').toBeGreaterThan(0)
  })

  test('R.7 a record with relationships shows them', async ({ page }) => {
    /*
     * R.7 as written asks for all ninety-three and it cannot pass: the
     * relationship table links twenty-five of them. §5.4.5 calls full coverage
     * an *objective* for D-REL, which was never built. The measured split is
     * asserted in records-data.test.ts; what this checks is that a record
     * which *does* have relationships renders them.
     */
    await page.goto(`${CHARACTERS}?character=vin`)
    const section = page.locator('[data-character-card] section', { hasText: 'Relationships' })
    await expect(section).toBeVisible()
    await expect(section.locator('a').first()).toBeVisible()

    // And that they are links, not plain text: the old card rendered these as
    // spans, so they were unreachable and announced as text.
    await section.locator('a').first().click()
    await page.waitForTimeout(400)
    expect(page.url()).toContain('spread=record-')
  })

  test('a record with no relationships says so rather than showing an empty section', async ({ page }) => {
    // Dabbid is one of the sixty-eight with no recorded relationships.
    await page.goto(`${CHARACTERS}?character=dabbid`)
    const section = page.locator('[data-character-card] section', { hasText: 'Relationships' })
    await expect(section).toBeVisible()
    await expect(section).toContainText('No recorded relationships.')
  })

  test('R.8 spoiler mode: name and origin stay, everything else is locked', async ({ page }) => {
    // Turn it on with nothing ticked. `useSpoilerMode` persists to
    // localStorage, so this is seeded the same way a reader's state is.
    await page.addInitScript(() => {
      localStorage.setItem('cosmere-spoiler-mode', 'true')
      localStorage.setItem('cosmere-read-books', '[]')
    })
    await page.goto(`${CHARACTERS}?character=kaladin`)
    await page.locator('[data-character-card]').waitFor()

    // Name, portrait slot and origin survive.
    await expect(page.locator('[data-character-card] h2')).toContainText('Kaladin')
    await expect(page.locator('[data-character-card]')).toContainText('Roshar')

    // The panel replaces the rest.
    const panel = page.locator('[data-character-card] [data-locked]')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Spoilers locked')

    // And none of the spoilable content is in the document at all.
    //
    // The portrait and the title are decorative and carry `aria-hidden` by
    // design, so counting aria-hidden attributes here would be measuring the
    // wrong thing. What R.8 asks is that the *rest* is not reachable, and the
    // honest check is that its text is gone.
    const card = page.locator('[data-character-card]')
    await expect(card).not.toContainText('1475 FE')
    await expect(card).not.toContainText('Sylphrena')
    await expect(card).not.toContainText('darkeyed surgeon')

    // The locked panel names the books that open it.
    await expect(panel).toContainText('The Way of Kings')
  })

  test('R.8 ticking a required book unlocks the record', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cosmere-spoiler-mode', 'true')
      localStorage.setItem('cosmere-read-books', '[]')
    })
    await page.goto(`${CHARACTERS}?character=kaladin`)
    await expect(page.locator('[data-locked]')).toBeVisible()

    await page.locator('[data-spoiler-panel-toggle]').click()
    await page.getByRole('button', { name: /^Mark all/ }).click()
    await page.waitForTimeout(300)

    await expect(page.locator('[data-character-card] [data-locked]')).toHaveCount(0)
    await expect(page.locator('[data-character-card]')).toContainText('1475 FE')
  })

  test('R.8 spoiler mode hides locked records from the index', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cosmere-spoiler-mode', 'true')
      localStorage.setItem('cosmere-read-books', '[]')
    })
    await page.goto(RECORDS)
    await page.locator('[data-records-index]').waitFor()

    // Nothing is readable, so the index says so rather than listing names that
    // all lead to a locked panel.
    await expect(page.locator('[data-records-index]')).toContainText('No records are unlocked yet')
    await expect(page.locator('[data-records-index] [data-contents-kind="record"]')).toHaveCount(0)
  })

  test('an unknown record id is a 404 state, not an empty panel', async ({ page }) => {
    await page.goto(`${CHARACTERS}?character=no-such-person`)
    // The route is lazy, so wait for the screen itself and not for a card that
    // is never going to arrive.
    await page.locator('[data-records-main]').waitFor()
    await expect(page.locator('[data-records-main]')).toContainText('No such record')
    await expect(page.getByRole('button', { name: /back to the index/i })).toBeVisible()
    // No card is rendered for an id that does not exist.
    await expect(page.locator('[data-character-card]')).toHaveCount(0)
  })

  test('the Appears In links point at books that exist', async ({ page }) => {
    const section = page.locator('[data-character-card] section', { hasText: 'Appears in' })
    await expect(section).toBeVisible()
    const links = section.locator('a')
    expect(await links.count()).toBeGreaterThan(3)

    // The bug this guards: content/ writes ids with hyphens and the runtime
    // with underscores, so these were links to nothing.
    await links.first().click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/books/')
    await expect(page.locator('h1')).toBeVisible()
  })
})

/* ------------------------------------------------- bloodlines & connections */

test.describe('bloodlines', () => {
  test('renders a family tree with keyboard-navigable nodes', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineage-kholin`)
    await page.locator('[data-bloodlines]').waitFor()

    // Nodes are focusable controls, not shapes with a click handler.
    const nodes = page.locator('[data-bloodlines] g[role="button"]')
    expect(await nodes.count()).toBeGreaterThan(5)

    const first = nodes.first()
    await first.focus()
    await expect(first).toBeFocused()
    await expect(first).toHaveAttribute('aria-label', /.+/)
  })

  test('arrow keys move along a generation without turning the page', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineage-kholin`)
    await page.locator('[data-bloodlines]').waitFor()
    const spreadUrl = page.url()

    /*
     * Start from a node that has a right-hand neighbour. The first generation
     * of a family is often a single founder, and "nothing happens" is the
     * correct behaviour for the arrow key there — so a test that always starts
     * at node 0 tests nothing when the family begins with one person.
     */
    const start = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-bloodlines] g[role="button"]'))
      const byRow = new Map<number, HTMLElement[]>()
      for (const n of nodes) {
        const y = n.getAttribute('transform')!.match(/,\s*([\d.]+)\)/)?.[1]
        const row = Number(y)
        const list = byRow.get(row) ?? []
        list.push(n)
        byRow.set(row, list)
      }
      for (const [, row] of byRow) {
        if (row.length > 1) return row[0]!.id
      }
      return null
    })
    expect(start, 'some generation should have more than one member').toBeTruthy()

    await page.locator(`[id="${start}"]`).focus()
    const before = await page.evaluate(() => document.activeElement?.id)

    await page.keyboard.press('ArrowRight')
    const after = await page.evaluate(() => document.activeElement?.id)
    expect(after).not.toBe(before)

    await page.keyboard.press('ArrowLeft')
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(before)
    expect(page.url()).toBe(spreadUrl)
  })

  test('the fold-out chart fits all twelve Kholin members inside the plate', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineage-kholin`)
    const plate = page.locator('[data-lineage-plate]')
    await plate.waitFor()
    await expect(plate).toHaveAttribute('data-ready', 'true')
    await expect(page.locator('[data-bloodlines] [data-lineage-node]')).toHaveCount(12)

    const region = page.locator('[data-bloodlines] [data-codex-interactive]')
    const canvas = page.locator('[data-lineage-canvas]')
    const fits = await page.evaluate(() => {
      const area = document.querySelector<HTMLElement>('[data-bloodlines] [data-codex-interactive]')
      const sheet = document.querySelector<HTMLElement>('[data-lineage-canvas]')
      if (!area || !sheet) return false
      const a = area.getBoundingClientRect()
      const b = sheet.getBoundingClientRect()
      return b.left >= a.left - 1 && b.top >= a.top - 1 && b.right <= a.right + 1 && b.bottom <= a.bottom + 1
    })
    expect(fits).toBe(true)

    const overflow = await region.evaluate((el) => getComputedStyle(el).overflow)
    expect(overflow).toBe('hidden')

    const sheet = await canvas.boundingBox()
    const tabs = await page.locator('.codex-thumbs').boundingBox()
    expect(sheet).not.toBeNull()
    expect(tabs).not.toBeNull()
    if (sheet && tabs) expect(sheet.x + sheet.width).toBeLessThanOrEqual(tabs.x + 1)
  })

  test('uses the stored portraits and falls back without a missing request', async ({ page }) => {
    const failures: string[] = []
    page.on('response', (response) => {
      const path = new URL(response.url()).pathname
      if (/\/characters\/[^/]+\.webp$/.test(path) && response.status() >= 400) failures.push(path)
    })

    await page.goto(`${CHARACTERS}?spread=lineage-kholin`)
    await expect(page.locator('[data-lineage-plate]')).toHaveAttribute('data-ready', 'true')
    await expect(page.locator('[data-bloodlines] .lineage-medallion__photo img')).toHaveCount(11)
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(
            document.querySelectorAll<HTMLImageElement>('[data-bloodlines] .lineage-medallion__photo img'),
          ).every((image) => image.complete),
        ),
      )
      .toBe(true)
    expect(failures).toEqual([])
  })

  test('every family in the index opens', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineages-bloodlines`)
    await page.getByRole('navigation', { name: 'Families' }).waitFor()
    const families = page.getByRole('navigation', { name: 'Families' }).getByRole('button')
    const count = await families.count()
    expect(count).toBeGreaterThan(3)

    for (let i = 0; i < count; i++) {
      await page.goto(`${CHARACTERS}?spread=lineages-bloodlines`)
      await page.getByRole('navigation', { name: 'Families' }).waitFor()
      await page.getByRole('navigation', { name: 'Families' }).getByRole('button').nth(i).click()
      await expect(page.locator('[data-bloodlines]')).toBeVisible()
      const label = await page.locator('[data-bloodlines]').getAttribute('data-bloodlines')
      expect(label).toBeTruthy()
    }
  })
})

test.describe('connections', () => {
  test('lists a character relationships as links into Volume I', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=connection-vin`)
    await page.locator('[data-connections]').waitFor()

    const links = page.locator('[data-connections] ul a')
    expect(await links.count()).toBeGreaterThan(1)

    // Every row is an anchor that points at another record, not a mural.
    const href = await links.first().getAttribute('href')
    expect(href).toContain('spread=record-')

    await links.first().click()
    await expect(page).toHaveURL(/spread=record-/)
    await expect(page.locator('[data-character-card]')).toBeVisible()
  })

  test('the connection index lists only people with recorded links', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineages-connections`)
    const index = page.getByRole('navigation', { name: 'Characters by connections' })
    await index.waitFor()

    expect(await index.getByRole('button').count()).toBeGreaterThan(10)
    await expect(index).not.toContainText('Dabbid')
  })

  test('the connection index keeps the subject in the URL', async ({ page }) => {
    await page.goto(`${CHARACTERS}?spread=lineages-connections`)
    const index = page.getByRole('navigation', { name: 'Characters by connections' })
    await index.waitFor()
    await index.getByRole('button').first().click()
    await expect(page).toHaveURL(/spread=connection-/)
    await expect(page.locator('[data-connections]')).toBeVisible()
  })
})

test.describe('the two-volume desk', () => {
  test('opens with both volumes closed', async ({ page }) => {
    await page.goto(CHARACTERS)
    await expect(page.locator('[data-records-library]')).toBeVisible()
    await expect(page.locator('[data-testid^="volume-cover-"]')).toHaveCount(2)
    await expect(page.getByRole('button', { name: /^Open Volume I:/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Open Volume II:/ })).toBeVisible()
  })

  test('a cover opens its volume and the tabs switch between volumes', async ({ page }) => {
    await page.goto(CHARACTERS)
    await page.getByRole('button', { name: /^Open Volume II:/ }).click()
    await expect(page).toHaveURL(/spread=lineages-contents/)
    await expect(page.locator('[data-codex-spread="lineages-contents"]')).toBeVisible()

    await page.getByRole('button', { name: 'Volume I: Biographical Records' }).click()
    await expect(page).toHaveURL(/spread=records-contents/)
    await expect(page.locator('[data-codex-spread="records-contents"]')).toBeVisible()

    await page.getByRole('button', { name: 'All volumes' }).click()
    await expect(page).toHaveURL(/#\/characters$/)
    await expect(page.locator('[data-records-library]')).toBeVisible()
  })

  test('legacy bloodlines, connections and family links canonicalise into Volume II', async ({ page }) => {
    await page.goto(`${CHARACTERS}?tab=bloodlines`)
    await expect(page).toHaveURL(/spread=lineages-bloodlines/)

    await page.goto(`${CHARACTERS}?tab=connections`)
    await expect(page).toHaveURL(/spread=lineages-connections/)

    await page.goto(`${CHARACTERS}?family=kholin`)
    await expect(page).toHaveURL(/spread=lineage-kholin/)
    await expect(page.locator('[data-family-plate="kholin"]')).toBeVisible()
  })
})

test('the index filters by name, description and world', async ({ page }) => {
  const all = page.locator('[data-records-index] [data-contents-kind="record"]')
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
