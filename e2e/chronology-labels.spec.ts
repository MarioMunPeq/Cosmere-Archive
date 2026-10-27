/**
 * Chronicon Cosmerae — layout collision audit.
 *
 * The chronicle is one very wide SVG (85 distinct years, many only one year
 * apart) followed by a detail panel and a column of zoom buttons. This spec is
 * the acceptance test for the whole layout:
 *
 *   - no two year labels overlap, in any era and with any saga filter active
 *   - no label is covered by the zoom buttons, the detail panel or a bar
 *   - no button, panel or bar overlaps another one
 *
 * Every element is read with `getBoundingClientRect()`, every pair is compared,
 * and every collision is printed with its text and coordinates.
 */

import { test, expect, type Page } from '@playwright/test'

const OVERLAP_EPSILON = 0.5

interface Box {
  kind: string
  name: string
  ownerKind?: string
  ownerName?: string
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

interface Snapshot {
  labels: Box[]
  buttons: Box[]
  bars: Box[]
  panels: Box[]
  controls: Box[]
  scroll: Rect
}

interface Collision {
  combo: string
  first: Box
  second: Box
}

function overlaps(a: Box, b: Box): boolean {
  return (
    a.left < b.right - OVERLAP_EPSILON &&
    b.left < a.right - OVERLAP_EPSILON &&
    a.top < b.bottom - OVERLAP_EPSILON &&
    b.top < a.bottom - OVERLAP_EPSILON
  )
}

function clipToScroll(box: Box, scroll: Rect): Box | null {
  const left = Math.max(box.left, scroll.left)
  const top = Math.max(box.top, scroll.top)
  const right = Math.min(box.right, scroll.right)
  const bottom = Math.min(box.bottom, scroll.bottom)
  if (right - left <= OVERLAP_EPSILON || bottom - top <= OVERLAP_EPSILON) return null
  return { ...box, left, top, right, bottom, width: right - left, height: bottom - top }
}

function findCollisions(
  first: Box[],
  second: Box[],
  combo: string,
  sameSet = false,
): Collision[] {
  const collisions: Collision[] = []
  for (let i = 0; i < first.length; i++) {
    const a = first[i]!
    for (let j = sameSet ? i + 1 : 0; j < second.length; j++) {
      const b = second[j]!
      if (a.kind === b.kind && a.name === b.name && a.left === b.left && a.top === b.top) continue
      // A button sitting inside its own bar or panel is containment, not overlap.
      if (
        a.kind === 'button' &&
        (b.kind === 'bar' || b.kind === 'panel') &&
        a.ownerKind === b.kind &&
        a.ownerName === b.name
      ) {
        continue
      }
      if (
        b.kind === 'button' &&
        (a.kind === 'bar' || a.kind === 'panel') &&
        b.ownerKind === a.kind &&
        b.ownerName === a.name
      ) {
        continue
      }
      if (overlaps(a, b)) collisions.push({ combo, first: a, second: b })
    }
  }
  return collisions
}

function formatBox(box: Box): string {
  return (
    `${box.kind} "${box.name}" at ` +
    `(${box.left.toFixed(1)}, ${box.top.toFixed(1)})–(${box.right.toFixed(1)}, ${box.bottom.toFixed(1)}) ` +
    `[${box.width.toFixed(1)}×${box.height.toFixed(1)}]`
  )
}

function formatCollision(collision: Collision): string {
  return `  ✗ ${collision.combo}\n      ${formatBox(collision.first)}\n      overlaps ${formatBox(collision.second)}`
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const toBox = (element: Element, kind: string, name: string) => {
      const rect = element.getBoundingClientRect()
      return {
        kind,
        name,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      }
    }

    const labels = [...document.querySelectorAll('[data-year-label]')].map((element) =>
      toBox(element, 'label', (element.textContent ?? '').trim()),
    )

    const bars = [...document.querySelectorAll('[data-chronology-bar]')].map((element) =>
      toBox(element, 'bar', element.getAttribute('data-chronology-bar') ?? 'bar'),
    )

    const panels = [...document.querySelectorAll('[data-chronology-panel]')].map((element) =>
      toBox(element, 'panel', element.getAttribute('data-chronology-panel') ?? 'panel'),
    )

    const controls = [
      ...document.querySelectorAll('[data-chronology-controls] button'),
    ].map((element) =>
      toBox(element, 'control', element.getAttribute('aria-label') ?? (element.textContent ?? '').trim()),
    )

    const buttons = [...document.querySelectorAll('button')]
      .filter((element) => !element.closest('[data-chronology-controls]'))
      .map((element) => {
        const name =
          element.getAttribute('aria-label') ??
          element.getAttribute('data-saga-filter') ??
          element.getAttribute('data-era-button') ??
          (element.textContent ?? '').trim()
        const owner = element.closest('[data-chronology-bar],[data-chronology-panel]')
        const ownerKind = owner?.hasAttribute('data-chronology-bar')
          ? 'bar'
          : owner?.hasAttribute('data-chronology-panel')
            ? 'panel'
            : undefined
        const ownerName = owner
          ? (owner.getAttribute('data-chronology-bar') ??
              owner.getAttribute('data-chronology-panel') ??
              undefined)
          : undefined
        return { ...toBox(element, 'button', name), ownerKind, ownerName }
      })

    const scroller = document.querySelector('[data-chronology-scroll]')
    const scrollRect = scroller?.getBoundingClientRect()
    return {
      labels,
      buttons,
      bars,
      panels,
      controls,
      scroll: scrollRect
        ? {
            left: scrollRect.left,
            top: scrollRect.top,
            right: scrollRect.right,
            bottom: scrollRect.bottom,
          }
        : { left: 0, top: 0, right: 0, bottom: 0 },
    }
  })
}

function auditSnapshot(snapshotData: Snapshot, combo: string): Collision[] {
  const visibleLabels = snapshotData.labels
    .map((label) => clipToScroll(label, snapshotData.scroll))
    .filter((label): label is Box => label != null)

  const collisions: Collision[] = []

  // Labels are translated with the scroll container; comparing the raw boxes
  // checks the lane layout itself, independent of where the reader has scrolled.
  collisions.push(...findCollisions(snapshotData.labels, snapshotData.labels, combo, true))
  collisions.push(...findCollisions(visibleLabels, snapshotData.controls, combo))
  collisions.push(...findCollisions(visibleLabels, snapshotData.bars, combo))
  collisions.push(...findCollisions(visibleLabels, snapshotData.panels, combo))
  collisions.push(...findCollisions(visibleLabels, snapshotData.buttons, combo))

  collisions.push(...findCollisions(snapshotData.buttons, snapshotData.buttons, combo, true))
  collisions.push(...findCollisions(snapshotData.buttons, snapshotData.panels, combo))
  collisions.push(...findCollisions(snapshotData.buttons, snapshotData.controls, combo))

  collisions.push(...findCollisions(snapshotData.bars, snapshotData.bars, combo, true))
  collisions.push(...findCollisions(snapshotData.bars, snapshotData.panels, combo))
  collisions.push(...findCollisions(snapshotData.bars, snapshotData.controls, combo))

  collisions.push(...findCollisions(snapshotData.panels, snapshotData.panels, combo, true))
  collisions.push(...findCollisions(snapshotData.panels, snapshotData.controls, combo))
  collisions.push(...findCollisions(snapshotData.controls, snapshotData.controls, combo, true))

  return collisions
}

test.describe('Chronicon Cosmerae — layout collision audit', () => {
  test('labels, buttons, panels and bars never overlap in any era or filter state', async ({
    page,
  }) => {
    test.setTimeout(180_000)

    await page.goto('/#/chronology')
    await expect(page.getByRole('heading', { name: /chronicon cosmerae/i })).toBeVisible({ timeout: 15_000 })

    // Neutralise the zoom transform so SVG units and screen pixels are 1:1.
    const fit = page.getByRole('button', { name: 'Fit', exact: true })
    await expect(fit).toBeVisible()
    await fit.click()

    const svg = page.locator('svg[data-label-layout]')
    await expect(svg).toHaveCount(1)

    // The component flips this to "ready" only after the real Caveat face has
    // loaded and every label has been measured with getBBox().
    await page.evaluate(async () => {
      await document.fonts.load('17px "Caveat Variable"')
      await document.fonts.ready
    })
    await expect(svg).toHaveAttribute('data-label-layout', 'ready', { timeout: 15_000 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )

    const labels = await page.locator('[data-year-label]').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          text: (node.textContent ?? '').trim(),
          year: Number(node.dataset.year),
          era: node.dataset.era ?? 'unplaced',
          lane: Number(node.dataset.lane ?? 0),
          side: node.dataset.labelSide ?? 'above',
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        }
      }),
    )

    expect(labels.length, 'expected the chronicle to render its year labels').toBeGreaterThan(80)

    const emptyLabels = labels.filter((label) => !label.text || label.width <= 0 || label.height <= 0)
    expect(emptyLabels, 'every year label must have a real, positive-size box').toEqual([])

    /*
     * One label per repeated year. A year such as -10000 has two events, but
     * only the most important one is allowed to carry the label.
     */
    const labelsByYear = new Map<number, { text: string }[]>()
    for (const label of labels) {
      const existing = labelsByYear.get(label.year)
      if (existing) existing.push(label)
      else labelsByYear.set(label.year, [label])
    }
    const duplicateYears = [...labelsByYear.entries()].filter(([, entries]) => entries.length > 1)
    expect(
      duplicateYears.map(([year, entries]) => `${year} has ${entries.length} labels`),
      'repeated years must carry exactly one label',
    ).toEqual([])

    // The pair the lane layout was written for: years one apart at the left edge.
    const citedPair = labels
      .filter((label) => label.year === -10000 || label.year === -9999)
      .sort((a, b) => a.year - b.year)
    expect(citedPair.length, '10000 BC and 9999 BC must both be labelled').toBe(2)
    expect(overlaps(citedPair[0]!, citedPair[1]!), '10000 BC and 9999 BC must not overlap').toBe(false)

    /*
     * Minimum point spacing. `data-point-x` is the SVG layout coordinate;
     * with zoom reset to 1, one SVG unit is one CSS pixel.
     */
    const points = await page.locator('[data-point-year]').evaluateAll((nodes) =>
      nodes.map((node) => ({
        year: Number(node.dataset.pointYear),
        x: Number(node.dataset.pointX),
      })),
    )
    const xByYear = new Map<number, number>()
    for (const point of points) xByYear.set(point.year, point.x)
    const sortedX = [...xByYear.values()].sort((a, b) => a - b)
    const gaps = sortedX.slice(1).map((x, index) => x - sortedX[index]!)
    const minGap = Math.min(...gaps)

    const sides = new Map<string, number>()
    for (const label of labels) sides.set(label.side, (sides.get(label.side) ?? 0) + 1)
    const lanes = new Map<number, number>()
    for (const label of labels) lanes.set(label.lane, (lanes.get(label.lane) ?? 0) + 1)

    console.log(`\nLayout collision audit — ${labels.length} labels across ${new Set(labels.map((l) => l.era)).size} eras`)
    console.log(`  ✓ labels            one per repeated year; lanes ${[...lanes.entries()].sort(([a], [b]) => a - b).map(([lane, count]) => `${lane}:${count}`).join(', ')}`)
    console.log(`  ✓ sides             ${[...sides.entries()].map(([side, count]) => `${side}:${count}`).join(', ')}`)
    console.log(`  ✓ points            ${String(xByYear.size).padStart(3)} distinct years — min gap ${minGap.toFixed(1)}px`)
    expect(minGap, 'distinct years must sit at least 70px apart').toBeGreaterThanOrEqual(69.9)

    const eraButtons = page.locator('[data-era-button]')
    const eraCount = await eraButtons.count()
    expect(eraCount, 'expected the era bar to render every era').toBeGreaterThan(0)

    const filterButtons = page.locator('[data-saga-filter]')
    const filterCount = await filterButtons.count()
    expect(filterCount, 'expected the saga filter bar to render every saga').toBeGreaterThan(0)

    const eraIds = await eraButtons.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-era-button') ?? 'era'),
    )
    const filterIds = await filterButtons.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-saga-filter') ?? 'filter'),
    )

    const collisions: Collision[] = []
    const combos: string[] = []
    const audit = async (combo: string) => {
      const data = await snapshot(page)
      const found = auditSnapshot(data, combo)
      collisions.push(...found)
      combos.push(combo)
      const visibleLabels = data.labels.length
      if (found.length === 0) {
        console.log(`  ✓ ${combo.padEnd(52)} ${String(visibleLabels).padStart(3)} labels — 0 collisions`)
      } else {
        console.log(`  ✗ ${combo.padEnd(52)} ${String(visibleLabels).padStart(3)} labels — ${found.length} COLLISIONS`)
        for (const collision of found) console.log(formatCollision(collision))
      }
    }

    console.log('\nEra × filter sweep')

    for (let eraIndex = 0; eraIndex < eraCount; eraIndex++) {
      const eraButton = eraButtons.nth(eraIndex)
      const eraId = eraIds[eraIndex]!
      const eraName = (await eraButton.evaluate((element) => (element.textContent ?? '').trim())) || eraId

      await eraButton.click()
      await expect(eraButton).toHaveAttribute('data-active', 'true')
      // The page scrolls smoothly to the first event of the era.
      await page.waitForTimeout(450)

      // The detail panel must follow the active era, not stay on the first one.
      await expect(page.locator('[data-chronology-panel="detail"]')).toContainText(eraName)

      const clear = page.getByRole('button', { name: 'Clear', exact: true })
      if ((await clear.count()) > 0) await clear.click()

      await audit(`${eraId} / filter:none`)
      await expect(page.locator('[data-chronology-panel="detail"]')).toContainText(eraName)

      for (let filterIndex = 0; filterIndex < filterCount; filterIndex++) {
        const filter = filterButtons.nth(filterIndex)
        const filterId = filterIds[filterIndex]!
        await filter.click()
        await expect(filter).toHaveAttribute('data-active', 'true')
        await audit(`${eraId} / filter:${filterId}`)
        await filter.click()
        await expect(filter).toHaveAttribute('data-active', 'false')
      }
    }

    console.log(
      `\n  ${collisions.length === 0 ? '✓' : '✗'} sweep               ` +
        `${combos.length} states (${eraCount} eras × ${filterCount + 1} filter states) — ` +
        `${collisions.length} collision${collisions.length === 1 ? '' : 's'}\n`,
    )

    /*
     * Selected-point state: the detail panel grows, the line area shrinks and
     * the panel must still show year, title, saga and description without
     * covering the line or any label.
     */
    const selectedPoint = page.locator('[data-timeline-point="hoid-offered-shard"]')
    const selectedTitle = (await selectedPoint.getAttribute('aria-label')) ?? ''
    await page.locator('[data-point-hit="hoid-offered-shard"]').click({ force: true })
    await page.waitForTimeout(450)
    const detailPanel = page.locator('[data-chronology-panel="detail"]')
    await expect(detailPanel).toContainText('10000 BC')
    if (selectedTitle) {
      await expect(detailPanel).toContainText(selectedTitle.replace(/\s+\u2014\s+\d+.*$/, ''))
    }
    await audit('selected point / -10000')
    await page.getByRole('button', { name: 'Close event details' }).click()
    await expect(detailPanel).toContainText('Cosmere Awakening')

    const report = collisions.map(formatCollision).join('\n')
    expect(report, 'labels, buttons, panels and bars must not overlap').toBe('')
  })
})
