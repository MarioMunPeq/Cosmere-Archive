/**
 * M1 · Block 7 — asset reference check
 *
 * Scans src/ for references to files under public/ and asserts each one exists.
 * This is the check that would have caught the 69 missing character portraits and
 * the 5 missing book emblems that shipped before M1.
 *
 * Covered patterns:
 *   `${import.meta.env.BASE_URL}<path>` and `<BASE_URL><path>` literals
 *   `<path>` string literals that start with a known public/ subfolder
 *
 * Usage: pnpm test:assets
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const PUBLIC = join(ROOT, 'public')
const SRC = join(ROOT, 'src')

/** Folders under public/ that assets may live in. */
const ASSET_DIRS = ['images', 'characters', 'content', 'models']

/**
 * Pre-existing breakage that needs a human, not a code change. Listed
 * explicitly so the check still fails on anything NEW while these stay visible.
 */
const KNOWN_MISSING: Record<string, string> = {
  'images/about/signature.png':
    'Author signature, referenced by src/components/about/Signature.tsx. Not present in the repo. Supply the image, or drop the <img> in M7 when /about moves to Historical.',
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p)
  }
  return out
}

const files = walk(SRC)

const referenced = new Map<string, string[]>() // assetPath -> [source files]

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, '/')

  const add = (raw: string) => {
    const clean = raw.split('?')[0]!.split('#')[0]!.trim()
    if (!clean) return
    const bucket = referenced.get(clean) ?? []
    bucket.push(rel)
    referenced.set(clean, bucket)
  }

  // 1. Explicit BASE_URL literals: images/covers/foo.webp
  for (const m of source.matchAll(
    /import\.meta\.env\.BASE_URL\}?`?([\w./-]+\.(?:webp|png|jpg|jpeg|svg|woff2|glb|mp3))/g,
  )) {
    add(m[1]!)
  }
  // 2. Quoted literal that already starts with an asset folder and ends in a file
  //    extension, so a bare folder such as 'images/emblems/' is not matched.
  for (const m of source.matchAll(
    /['"]((?:images|characters|models|content)\/[\w./-]+\.(?:webp|png|jpg|jpeg|svg|woff2|glb|mp3))['"]/g,
  )) {
    add(m[1]!)
  }
  // 3. Template-interpolated emblem folder: images/emblems/${x}
  for (const m of source.matchAll(/['"]((?:images|characters|models|content)\/[a-z-]+)\/\$\{/g)) {
    add(`${m[1]}/<dynamic>`)
  }
}

const missing: string[] = []
const dynamic = new Set<string>()

for (const [asset, sources] of [...referenced].sort(([a], [b]) => a.localeCompare(b))) {
  if (asset.endsWith('<dynamic>')) {
    dynamic.add(asset)
    continue
  }
  const full = join(PUBLIC, asset)
  if (!existsSync(full) || !statSync(full).isFile()) {
    missing.push(`${asset}  <- ${[...new Set(sources)].join(', ')}`)
  }
}

console.log('asset reference check · public/\n')
console.log(`  scanned ${files.length} source files`)
console.log(`  ${referenced.size - dynamic.size} concrete asset references`)
console.log(`  ${dynamic.size} dynamic folder prefixes (skipped): ${[...dynamic].join(', ') || 'none'}`)

if (dynamic.size > 0) {
  console.log('\n  NOTE: dynamic prefixes need a manual check. Known case:')
  console.log('    images/emblems/${emblem} — 5 of the 7 declared emblems do not exist')
  console.log('    on disk, which is why BookSpine falls back to a placeholder glyph.')
  console.log('    M3 replaces this whole mechanism with the real book covers.')
}

if (missing.length > 0) {
  const unknown = missing.filter((m) => !(m.split('  <- ')[0] in KNOWN_MISSING))
  const known = missing.filter((m) => m.split('  <- ')[0] in KNOWN_MISSING)

  if (known.length > 0) {
    console.log(`\n  KNOWN MISSING (${known.length}, listed in KNOWN_MISSING — not failing the build):`)
    for (const m of known) {
      const asset = m.split('  <- ')[0]!
      console.log(`    ${asset}`)
      console.log(`      -> ${KNOWN_MISSING[asset]}`)
    }
  }

  if (unknown.length > 0) {
    console.log(`\n  MISSING (${unknown.length}):`)
    for (const m of unknown) console.log(`    ${m}`)
    console.error('\nasset check FAILED')
    process.exit(1)
  }
}

/**
 * Convention-based check.
 *
 * Most assets in this project are not referenced by a literal: the cover path is
 * built as `images/covers/${book.id}.webp`, so a literal scan cannot see it. This
 * resolves the convention against the real data instead.
 *
 * Covered here: book covers (all 22 exist). Character portraits follow a name
 * heuristic and are only 24/93 resolvable — the Monogram work in M1 Blocks 5–6
 * removes that dependency, and the check is extended there.
 */
console.log('\nconvention check · images/covers/{book.id}.webp\n')
const booksSource = readFileSync(join(SRC, 'data/static/books.ts'), 'utf8')
const bookIds = [...booksSource.matchAll(/^\s*id:\s*'([a-z0-9_]+)',/gm)].map((m) => m[1]!)
let coversMissing = 0
for (const id of bookIds) {
  const p = join(PUBLIC, 'images/covers', `${id}.webp`)
  if (!existsSync(p)) {
    coversMissing++
    console.log(`    MISSING images/covers/${id}.webp`)
  }
}
console.log(`  ${bookIds.length} books checked, ${coversMissing} missing covers`)
if (coversMissing > 0) {
  console.error('\nasset check FAILED (book covers)')
  process.exit(1)
}

console.log('\nasset check PASSED')
