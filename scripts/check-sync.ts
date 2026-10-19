/**
 * `pnpm test:sync` — the committed generated files match their sources.
 *
 * ## Why this is a script and not a unit test
 *
 * It reads the filesystem, and `tsconfig.app.json` deliberately does not give
 * application code the `node` types: if `src/` could `import 'node:fs'`, the
 * browser build would stop being a browser build one careless import at a time.
 *
 * So the check lives here, beside the other gates, and is wired into `ci`
 * alongside `test:budget` and `test:assets`. It is the same class of thing: a
 * build fails if it would produce a different artefact than the one committed.
 *
 * ## What it catches
 *
 * A generated file that is committed and then edited by hand is worse than a
 * duplicated one. A duplication is visible; a stale generated file is invisible
 * until someone runs the build and gets a diff they cannot explain. This runs
 * the generators and asks git whether anything moved.
 *
 * ## Why it writes first
 *
 * Re-deriving the output in the check would mean re-implementing the
 * generators, and a second implementation of a mapping is a second thing that
 * can be wrong. So the check runs the real ones and asks git what changed. It
 * is idempotent on a clean tree, and on a dirty one it fails — which is the
 * correct answer either way.
 */

import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const GENERATED = [
  'src/data/generated/characters.json',
  'src/data/generated/books.json',
  'src/data/generated/series.json',
]

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
}

/* ---- 1. the generators must succeed ---- */

run('npx', ['tsx', 'scripts/generate-characters.ts'])
run('npx', ['tsx', 'scripts/generate-books.ts'])
run('npx', ['tsx', '--tsconfig', 'tsconfig.scripts.json', 'scripts/generate-taxonomies.ts'])
run('npx', ['tsx', '--tsconfig', 'tsconfig.scripts.json', 'scripts/generate-timeline.ts'])
run('npx', ['tsx', '--tsconfig', 'tsconfig.scripts.json', 'scripts/generate-worlds.ts'])

/* ---- 2. and they must not have moved anything ---- */

let dirty: string[] = []
try {
  const out = execFileSync('git', ['status', '--porcelain', '--', 'src/data/generated'], {
    encoding: 'utf8',
  })
  dirty = out.split('\n').filter(Boolean)
} catch (err) {
  console.error('  ! could not ask git whether the generated files changed:', err)
  process.exit(1)
}

if (dirty.length > 0) {
  console.error('\n  ! the committed generated files do not match their sources.\n')
  for (const line of dirty) console.error(`      ${line}`)
  console.error('\n    Run `pnpm data:build` and commit the result.\n')
  process.exit(1)
}

/* ---- 3. and the cross-references still resolve ---- */

const books = JSON.parse(readFileSync(join(process.cwd(), 'src/data/generated/books.json'), 'utf8')) as {
  id: string
  saga: string
  cover: string
  archiveDescription: string
}[]
const series = JSON.parse(readFileSync(join(process.cwd(), 'src/data/generated/series.json'), 'utf8')) as {
  id: string
}[]
const characters = JSON.parse(readFileSync(join(process.cwd(), 'src/data/generated/characters.json'), 'utf8')) as {
  id: string
  requiredBooks: string[]
}[]

const problems: string[] = []

const bookIds = new Set(books.map((b) => b.id))
for (const c of characters) {
  for (const b of c.requiredBooks ?? []) {
    if (!bookIds.has(b)) problems.push(`${c.id} requires "${b}", which is not a book`)
  }
}

const seriesIds = new Set(series.map((s) => s.id))
for (const b of books) {
  if (!seriesIds.has(b.saga)) problems.push(`${b.id} is in series "${b.saga}", which does not exist`)
  if (!b.cover) problems.push(`${b.id} has no cover`)
  if (!b.archiveDescription?.trim()) problems.push(`${b.id} has no archive description`)
}

/*
 * Every content file must have produced a record.
 *
 * The generator's own guards catch an empty field; this catches a file that was
 * added to `content/` and never emitted. A new book that exists in the source
 * and not in the site is exactly the half-finished state this gate is for.
 */
const bookFiles = readdirSync(join(process.cwd(), 'content', 'books')).filter(
  (f) => f.endsWith('.json') && f !== 'index.json',
)
if (bookFiles.length !== books.length) {
  problems.push(`content/books has ${bookFiles.length} files but ${books.length} records were generated`)
}
const seriesFiles = readdirSync(join(process.cwd(), 'content', 'series')).filter(
  (f) => f.endsWith('.json') && f !== 'index.json',
)
if (seriesFiles.length !== series.length) {
  problems.push(`content/series has ${seriesFiles.length} files but ${series.length} records were generated`)
}

if (problems.length > 0) {
  console.error(`\n  ! ${problems.length} unresolved references between the generated files:\n`)
  for (const p of problems) console.error(`      ${p}`)
  console.error('')
  process.exit(1)
}

console.log(`\n  sync check PASSED — ${books.length} books, ${series.length} series, ${characters.length} characters\n`)
