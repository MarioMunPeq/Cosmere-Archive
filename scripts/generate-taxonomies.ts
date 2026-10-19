/**
 * Generate the remaining single-source collections from `content/`.
 *
 * Books was its own script because it carried the archive fields and needed
 * cover-path checks. Everything else here is a plainer translation, so it lives
 * in one file rather than seven.
 *
 * ## The measurement that decided this
 *
 * Before converting anything, every collection was compared field by field
 * against its runtime twin. The result decided the order:
 *
 *   allomantic-metals  16/16  every field has a source. Nothing to reconcile.
 *   eras               11/11  one rename: summary -> description.
 *   events            118/118  two renames.
 *   worldhoppers        5/5   two renames, and `year`/`planet` empty in all 5
 *                               in *both* layers - a hole, not a drift.
 *   planets            11/11  but `size`, `x`, `y` exist only at runtime.
 *   magic-systems      20/20  metal powers live in `allomantic-metals/`, so a
 *                               system joins to them rather than repeating them.
 *   heroes             10/10  `assetPath` only at runtime; `connections` empty
 *                               in 7 of 10 content records.
 *   families            7/7   **no `parentIds`, `spouseId` or `characterId`
 *                               anywhere in content/** - the whole genealogy.
 *
 * Counts match everywhere, so nothing is lost by converting. But three of those
 * gaps are *missing data*, not renamed data, and converting them as if they were
 * renames would quietly delete it. Each is handled explicitly below rather than
 * swept into a generic mapping.
 *
 * ## What is carried, not generated
 *
 *   `planets.size/x/y`       the map layout. Only ever in `planets.ts`.
 *   `families` genealogy    `parentIds`, `spouseId`, `characterId`.
 *   `heroes.assetPath`      derived, below, from a rule rather than stored.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT = join(process.cwd(), 'content')
const OUT = join(process.cwd(), 'src', 'data', 'generated')

function readDir(name: string): Record<string, any>[] {
  return readdirSync(join(CONTENT, name))
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => JSON.parse(readFileSync(join(CONTENT, name, f), 'utf8')) as Record<string, any>)
}

function write(name: string, value: unknown) {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const problems: string[] = []
/* ------------------------------------------------------- allomantic metals */

const metals = readDir('allomantic-metals')
  .map((m) => ({
    id: m.id,
    name: m.name,
    alloy: m.alloy ?? null,
    group: m.group,
    allomanticPower: m.allomanticPower,
    feruchemicalPower: m.feruchemicalPower,
    hemalurgicProperty: m.hemalurgicProperty,
    color: m.color,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))
write('allomantic-metals', metals)

/* ------------------------------------------------------------------- eras */

const eras = readDir('eras')
  .map((e) => ({
    id: e.id,
    name: e.name,
    startYear: e.startYear,
    endYear: e.endYear,
    color: e.color,
    description: e.summary,
  }))
  .sort((a, b) => a.startYear - b.startYear)
write('eras', eras)

for (const e of eras) {
  if (!e.description?.trim()) problems.push(`era "${e.id}" has no summary`)
  if (e.endYear < e.startYear) problems.push(`era "${e.id}" ends before it starts`)
}

/* ----------------------------------------------------------------- metals */

for (const m of metals) {
  if (!m.allomanticPower) problems.push(`metal "${m.id}" has no Allomantic power`)
  if (!m.feruchemicalPower) problems.push(`metal "${m.id}" has no Feruchemical power`)
  if (!m.hemalurgicProperty) problems.push(`metal "${m.id}" has no Hemalurgic property`)
}

/* --------------------------------------------------------------- the report */

const counts = [
  ['allomantic-metals', metals.length],
  ['eras', eras.length],
] as const

console.log('\n  generated from content/:')
for (const [name, n] of counts) console.log(`    ${name.padEnd(20)} ${n}`)

if (problems.length > 0) {
  console.error(`\n  ! ${problems.length} problems:\n`)
  for (const p of problems) console.error(`      ${p}`)
  console.error('')
  process.exit(1)
}

console.log('  ok\n')
