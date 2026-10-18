/**
 * Library checks that only a real browser can answer.
 *
 * Development tool, not a test: `pnpm shots`. It writes screenshots and prints
 * the numbers §5.3.6 asks for — no overflow at four widths, no spine text under
 * 11px, every cover actually painted, Dawnshard fully visible — plus M3.2, the
 * title contrast measured by sampling rendered pixels rather than asserted.
 *
 * The contrast method: screenshot the spine, crop the title's box, and take the
 * *modal* colour in that box as the background. Glyphs cover a minority of a
 * spine title's box, so the mode is the paper behind the letters; the title
 * colour is read from the computed style. That ratio is what a reader actually
 * sees, which a stylesheet assertion cannot tell you.
 */
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/Cosmere-Archive/'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

/** WCAG relative luminance. */
function lum(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const l1 = lum(...a)
  const l2 = lum(...b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function parseColor(css: string): [number, number, number] {
  const m = css.match(/rgba?\(([^)]+)\)/)
  if (!m) return [255, 255, 255]
  const parts = m[1]!
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

/** The most common colour in a raw RGB buffer, quantised to 8 levels per channel. */
function modalColour(data: Buffer, channels: number): { rgb: [number, number, number]; share: number } {
  const bins = new Map<number, { n: number; r: number; g: number; b: number }>()
  const total = (data.length / channels) | 0
  for (let i = 0; i + channels <= data.length; i += channels) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    // 5 bits per channel: the eye cannot tell neighbouring levels apart in a
    // screenshot, and exact values are noisy because of the gradient.
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    const bin = bins.get(key)
    if (bin) {
      bin.n += 1
      bin.r += r
      bin.g += g
      bin.b += b
    } else {
      bins.set(key, { n: 1, r, g, b })
    }
  }
  let best = { n: 0, r: 0, g: 0, b: 0 }
  for (const bin of bins.values()) if (bin.n > best.n) best = bin
  return {
    rgb: [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)],
    share: best.n / total,
  }
}

const browser = await chromium.launch()

/* ---------------------------------------------------------------- contrast */

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await page.goto(`${BASE}#/library`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-book-id]')
await page.waitForTimeout(1200)

const spines = await page.locator('[data-book-id]').all()
const results: { id: string; series: string; ratio: number; share: number }[] = []

for (const spine of spines) {
  const box = await spine.boundingBox()
  const info = await spine.evaluate((el) => {
    // The title carries an explicit hook: `span[aria-hidden]:last-of-type` used
    // to pick up the fore-edge highlight, an empty full-height span, which made
    // this measurement sample the whole spine rather than the title.
    const title = el.querySelector<HTMLElement>('[data-spine-title]')
    const titleBox = title?.getBoundingClientRect()
    return {
      id: el.getAttribute('data-book-id') ?? '',
      series: el.getAttribute('data-series') ?? '',
      foil: title ? getComputedStyle(title).color : '',
      titleBox: titleBox ? { x: titleBox.x, y: titleBox.y, w: titleBox.width, h: titleBox.height } : null,
    }
  })
  if (!box || !info.titleBox) continue

  // Crop to the title box, inset a little so the spine's curved edge (very dark
  // at both sides) does not become the mode.
  const inset = Math.max(2, Math.round(info.titleBox.w * 0.12))
  const clip = {
    x: Math.max(0, Math.round(info.titleBox.x + inset - box.x)),
    y: Math.max(0, Math.round(info.titleBox.y + 6 - box.y)),
    width: Math.max(4, Math.round(info.titleBox.w - inset * 2)),
    height: Math.max(4, Math.round(info.titleBox.h - 12)),
  }
  const png = await spine.screenshot()
  const { data, info: meta } = await sharp(png)
    .extract({ left: clip.x, top: clip.y, width: clip.width, height: clip.height })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { rgb, share } = modalColour(data, meta.channels)
  results.push({
    id: info.id,
    series: info.series,
    ratio: contrast(rgb, parseColor(info.foil)),
    share,
  })
}

results.sort((a, b) => a.ratio - b.ratio)
console.log('\nM3.2 — spine title contrast, worst 8 first (AA needs 4.5):')
for (const r of results.slice(0, 8)) {
  console.log(
    `  ${r.ratio.toFixed(2).padStart(5)}:1  ${r.series.padEnd(20)} ${r.id.padEnd(24)} (mode ${(r.share * 100).toFixed(0)}% of box)`,
  )
}
console.log(`  worst ${results[0]?.ratio.toFixed(2)} · best ${results[results.length - 1]?.ratio.toFixed(2)}`)
await page.close()

/* --------------------------------------------------------------- geometry */

for (const [name, width, height] of [
  ['library-1440', 1440, 900],
  ['library-tall', 1440, 2200],
  ['library-2560', 2560, 1200],
  ['library-768', 768, 1000],
  ['library-375', 375, 800],
] as const) {
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await p.goto(`${BASE}#/library`, { waitUntil: 'networkidle' })
  await p.waitForSelector('[data-book-id]')
  await p.waitForTimeout(900)
  await p.screenshot({ path: `${OUT}/${name}.png` })

  const report = await p.evaluate(() => {
    const spines = Array.from(document.querySelectorAll<HTMLElement>('[data-book-id]'))
    const holder = spines[0]?.closest('[data-shelf]')?.querySelector<HTMLElement>('.flex.items-end')
    const tiny = spines
      .map((s) => s.querySelector<HTMLElement>('[data-spine-title]'))
      .filter((t): t is HTMLElement => !!t)
      .filter((t) => parseFloat(getComputedStyle(t).fontSize) < 11)
      .map((t) => `${t.textContent?.slice(0, 16)}=${getComputedStyle(t).fontSize}`)

    const imgs = spines.map((s) => s.querySelector('img') as HTMLImageElement | null)

    return {
      shelves: document.querySelectorAll('[data-shelf]').length,
      spines: spines.length,
      brokenCovers: imgs.filter((i) => !i || (i.complete && i.naturalWidth === 0)).length,
      tinyText: tiny.slice(0, 4),
      rowOverflowX: holder ? holder.scrollWidth - holder.clientWidth : null,
      docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      dawnshard: spines.find((s) => s.dataset.bookId === 'dawnshard')?.getBoundingClientRect().width ?? null,
      spineWidth: Math.round(spines[0]?.getBoundingClientRect().width ?? 0),
    }
  })
  console.log(name, JSON.stringify(report))
  await p.close()
}

/* ------------------------------------------------------------- open a book */

const open = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await open.goto(`${BASE}#/library`, { waitUntil: 'networkidle' })
await open.waitForSelector('[data-book-id]')
await open.click('[data-book-id="the_way_of_kings"]')
// Mid-swing: the cover is on its way over. This frame decides whether the
// opening reads as a book being opened or as a fade.
await open.waitForSelector('[data-book-cover]')
await open.waitForTimeout(320)
await open.screenshot({ path: `${OUT}/reader-opening.png` })
await open.waitForTimeout(220)
await open.screenshot({ path: `${OUT}/reader-opening-b.png` })
await open.waitForTimeout(1200)
await open.screenshot({ path: `${OUT}/reader-open.png` })
await open.click('button[aria-label="Next page"]')
// Three points across the swing. The middle one is the interesting frame: past
// the spine the back face must be showing, un-mirrored.
await open.waitForTimeout(120)
await open.screenshot({ path: `${OUT}/reader-turning-a.png` })
await open.waitForTimeout(200)
await open.screenshot({ path: `${OUT}/reader-turning.png` })
await open.waitForTimeout(500)
await open.screenshot({ path: `${OUT}/reader-open-2.png` })
await open.locator('body').press('Escape')
await open.waitForTimeout(260)
await open.screenshot({ path: `${OUT}/reader-closing.png` })
await open.waitForTimeout(600)

// the list view
const list = await browser.newPage({ viewport: { width: 1440, height: 900 } })
// With HashRouter the query lives inside the hash: `#/library?view=list`.
await list.goto(`${BASE}#/library?view=list`, { waitUntil: 'networkidle' })
await list.waitForTimeout(700)
await list.screenshot({ path: `${OUT}/library-list.png` })
console.log('open book + list captured')
await browser.close()
