/**
 * M3 block 1: cover re-encode.
 *
 * Section 5.3 criterion B.9: no file under public/images/covers/ may exceed
 * 220 KB. Twelve of the twenty-two did, the largest at 883 KB, and the set
 * totalled 5.5 MB, all of it downloaded to draw a 56 px strip on a spine.
 *
 * The pristine covers live in `assets/covers-source/`, outside `public/`, and
 * this script always encodes from there. An earlier version re-encoded in
 * place, so a second run compressed already-compressed files and the set
 * degraded a little further each time. Keeping the sources makes the build
 * idempotent, the output reproducible, and `assets/` never reaches `dist`.
 *
 * One width for every use. Section 5.3 asks for a separate spine variant on the
 * assumption that a 56 px strip wants a smaller file than the list view.
 * Measured, it does not:
 *
 *   spine   56 px wide, 300 px tall, DPR 2  -> needs 112 x 600
 *   list   ~200 px wide, DPR 2               -> needs 400
 *   page   ~400 px wide, DPR 2               -> needs 800, served at 640
 *
 * Two widths cost 2.8 MB across the set for bytes no screen ever displays.
 *
 * Run: pnpm covers:build
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const SOURCE = join(ROOT, 'assets', 'covers-source')
const COVERS = join(ROOT, 'public', 'images', 'covers')

/** B.9 */
const CEILING_KB = 220
const WIDTH = 640

/**
 * The shipped format is WebP. The former AVIF copies were only used by one
 * landing-page illustration while all other AVIF files were never requested.
 * Keeping one format avoids shipping duplicate cover artwork and keeps the
 * landing and library on the exact same generated image.
 *
 * The floors are deliberate. Below WebP 60 the title on the White Sand covers
 * starts to smear, and a spine title that cannot be read is a worse outcome than
 * a large file. If a floor is reached and the ceiling is still missed, the build
 * fails loudly rather than shipping something unreadable.
 */
const WEBP_QUALITY_LADDER = [76, 72, 68, 64, 60] as const

/**
 * Encodes at the highest quality on the format's ladder that fits under the
 * ceiling. Returns the buffer and the quality actually used.
 *
 * `source` is a Buffer, not a path: sharp holds a file handle for the lifetime
 * of a pipeline, and on Windows that makes writing over the same path fail with
 * EPERM. The 22 covers come to about 6 MB in memory once.
 */
async function encodeUnderCeiling(source: Buffer, width: number): Promise<{ buffer: Buffer; quality: number }> {
  const ladder = WEBP_QUALITY_LADDER
  let best: Buffer | null = null
  for (const quality of ladder) {
    const pipeline = sharp(source).resize({ width, withoutEnlargement: true })
    const buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer()
    best = buffer
    if (buffer.length / 1024 <= CEILING_KB) return { buffer, quality }
  }
  // Nothing on the ladder fit. Return the lowest so the report can name it.
  return { buffer: best!, quality: ladder[ladder.length - 1] }
}

interface Row {
  id: string
  sourceW: number
  sourceH: number
  sourceKb: number
  webpKb: number
  quality: number
}

mkdirSync(COVERS, { recursive: true })

const sources = readdirSync(SOURCE).filter((f) => f.endsWith('.webp'))
const rows: Row[] = []

for (const file of sources) {
  const id = file.replace(/\.webp$/, '')
  const source = readFileSync(join(SOURCE, file))
  const meta = await sharp(source).metadata()

  const webp = await encodeUnderCeiling(source, WIDTH)

  writeFileSync(join(COVERS, file), webp.buffer)
  const obsoleteAvif = join(COVERS, `${id}.avif`)
  if (existsSync(obsoleteAvif)) unlinkSync(obsoleteAvif)

  rows.push({
    id,
    sourceW: meta.width ?? 0,
    sourceH: meta.height ?? 0,
    sourceKb: source.length / 1024,
    webpKb: webp.buffer.length / 1024,
    quality: webp.quality,
  })
}

/* report ------------------------------------------------------------------- */

const sum = (pick: (r: Row) => number) => rows.reduce((a, r) => a + pick(r), 0) / 1024
const over = rows.filter((r) => r.webpKb > CEILING_KB)
const fmt = (kb: number) => `${kb.toFixed(0).padStart(5)} KB`

console.log(`covers: ${rows.length} encoded from assets/covers-source/ at ${WIDTH}px\n`)
console.log('  id                              source      webp  q')
for (const r of rows.sort((a, b) => b.sourceKb - a.sourceKb)) {
  console.log(`  ${r.id.padEnd(30)} ${fmt(r.sourceKb)} ${fmt(r.webpKb)} ${String(r.quality).padStart(3)}`)
}

console.log(`\n  source ${sum((r) => r.sourceKb).toFixed(2)} MB -> shipped ${sum((r) => r.webpKb).toFixed(2)} MB webp`)

if (over.length > 0) {
  console.error(
    `\nB.9 FAILED: ${over.length} cover(s) still over ${CEILING_KB} KB: ${over.map((r) => r.id).join(', ')}`,
  )
  process.exit(1)
}

/* provenance --------------------------------------------------------------- */

const provenance = join(ROOT, 'public', 'content', 'PROVENANCE.md')
const existing = readFileSync(provenance, 'utf8')
const marker = '<!-- M3 covers:generated'
const section = `${marker} - do not edit, regenerate with \`pnpm covers:build\` -->

## Cover variants (M3, block 1)

Every shipped cover is re-encoded at ${WIDTH}px from the pristine files in
\`assets/covers-source/\`, which are not published. Re-encoding is lossy; the
dimensions below are what the archive received.

| Cover | Source | Shipped webp |
| ----- | ------ | ------------ |
${rows
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((r) => `| \`${r.id}\` | ${r.sourceW}x${r.sourceH}, ${fmt(r.sourceKb).trim()} | ${fmt(r.webpKb).trim()} |`)
  .join('\n')}

No shipped file exceeds ${CEILING_KB} KB (criterion B.9). The landing and library
share these WebP files so no duplicate cover format needs to be shipped.
`

const next = existing.includes(marker)
  ? existing.slice(0, existing.indexOf(marker)) + section
  : existing.trimEnd() + '\n\n' + section
writeFileSync(provenance, next, 'utf8')
console.log(`\n  provenance updated: ${provenance.replace(ROOT, '.')}`)
