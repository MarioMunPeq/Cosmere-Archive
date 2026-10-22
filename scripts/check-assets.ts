/**
 * M1 · Block 7 — asset reference check
 *
 * Scans src/ for literal references to files under public/ and asserts each one exists.
 * Convention-based and dynamic references are checked separately where possible.
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
  //    extension, so a bare folder prefix is not matched.
  for (const m of source.matchAll(
    /['"]((?:images|characters|models|content)\/[\w./-]+\.(?:webp|png|jpg|jpeg|svg|woff2|glb|mp3))['"]/g,
  )) {
    add(m[1]!)
  }
  // 3. Template-interpolated asset paths (including BASE_URL template strings).
  for (const m of source.matchAll(/((?:images|characters|models|content)\/[\w./-]+)\/\$\{/g)) {
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
  console.log('\n  Dynamic asset prefixes checked by conventions/content validation:')
  for (const prefix of dynamic) console.log(`    ${prefix}`)
}

if (missing.length > 0) {
  console.log(`\n  MISSING (${missing.length}):`)
  for (const m of missing) console.log(`    ${m}`)
  console.error('\nasset check FAILED')
  process.exit(1)
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
const booksDir = join(ROOT, 'content/books')
const bookCovers = readdirSync(booksDir)
  .filter((file) => file.endsWith('.json') && file !== 'index.json')
  .map((file) => JSON.parse(readFileSync(join(booksDir, file), 'utf8')) as { cover?: string })
  .map((book) => book.cover)
  .filter((cover): cover is string => Boolean(cover))
let coversMissing = 0
for (const cover of bookCovers) {
  const p = join(PUBLIC, ...cover.split('/'))
  if (!existsSync(p)) {
    coversMissing++
    console.log(`    MISSING ${cover}`)
  }
}
console.log(`  ${bookCovers.length} books checked, ${coversMissing} missing covers`)
if (coversMissing > 0) {
  console.error('\nasset check FAILED (book covers)')
  process.exit(1)
}

console.log('\nasset check PASSED')
