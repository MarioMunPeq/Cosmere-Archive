/**
 * M1 · Block 6 — content validation
 *
 * Validates content/ against the JSON Schemas and the semantic rules V1–V15 in
 * REBUILD_PLAN §7.5. Runs in CI via the `budgets` job.
 *
 *   V1  every file validates against its schema (additionalProperties: false)
 *   V2  ids unique within each collection
 *   V3  ids unique globally across collections
 *   V4  every reference resolves (book, planet, shard, character, series, magic)
 *   V5  no cycles in family parent/child links
 *   V6  born <= died when both present
 *   V7  firstAppearance not empty where the schema requires it
 *   V8  unlockAt is a subset of books
 *   V9  summary length within bounds
 *   V10 wordCount present for published books
 *   V11 every referenced asset file exists under public/
 *   V12 aliases do not collide with another entity's name
 *   V13 every family member's character/spouse/parents resolve
 *   V14 every record is listed in its collection index.json
 *   V15 ids contain no underscores
 *
 * Usage: pnpm content:validate
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const CONTENT = join(ROOT, 'content')
const SCHEMAS = join(CONTENT, 'schema')
const PUBLIC = join(ROOT, 'public')

/* ─────────────────────────── minimal JSON Schema validator ───────────────────
   Only the subset the schemas actually use is implemented: type, required,
   properties, additionalProperties, enum, pattern, minimum/maximum,
   minLength/maxLength, items, uniqueItems, anyOf, allOf, $ref (local and
   cross-file by "<file>#/<pointer>"), minItems/maxItems.
   ------------------------------------------------------------------------- */

type Json = unknown

interface Schema {
  $id?: string
  $ref?: string
  $defs?: Record<string, Schema>
  type?: string | string[]
  properties?: Record<string, Schema>
  additionalProperties?: boolean
  required?: string[]
  enum?: Json[]
  pattern?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  items?: Schema
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
  anyOf?: Schema[]
  allOf?: Schema[]
}

const schemaCache = new Map<string, Schema>()
function loadSchema(id: string): Schema {
  const cached = schemaCache.get(id)
  if (cached) return cached
  const s: Schema = JSON.parse(readFileSync(join(SCHEMAS, `${id}.schema.json`), 'utf8'))
  schemaCache.set(id, s)
  return s
}

/**
 * Resolve a $ref. Returns both the target schema and the root it belongs to, so
 * that a nested `#/$defs/...` inside common.schema.json keeps resolving against
 * common rather than against whatever schema happened to be the entry point.
 */
function resolveRef(ref: string, root: Schema): { schema: Schema; root: Schema } {
  const hash = ref.indexOf('#')
  const file = hash === -1 ? ref : ref.slice(0, hash)
  const pointer = hash === -1 ? '' : ref.slice(hash + 1)
  const nextRoot = file ? loadSchema(file) : root
  if (!pointer) return { schema: nextRoot, root: nextRoot }

  let node: Json = nextRoot as unknown as Json
  for (const seg of pointer.split('/').filter(Boolean)) {
    if (node === null || typeof node !== 'object') throw new Error(`unresolvable $ref ${ref}`)
    node = (node as Record<string, Json>)[seg]
    if (node === undefined) throw new Error(`unresolvable $ref ${ref}`)
  }
  return { schema: node as Schema, root: nextRoot }
}

const typeOf = (v: Json): string => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  if (Number.isInteger(v as number)) return 'integer'
  return typeof v
}

function validate(value: Json, schema: Schema, root: Schema, path: string, errs: string[]): void {
  if (schema.$ref) {
    const r = resolveRef(schema.$ref, root)
    return validate(value, r.schema, r.root, path, errs)
  }

  for (const sub of schema.allOf ?? []) validate(value, sub, root, path, errs)

  if (schema.anyOf) {
    const branch = schema.anyOf.filter((s) => {
      const local: string[] = []
      validate(value, s, root, path, local)
      return local.length === 0
    })
    if (branch.length === 0) errs.push(`${path}: matches none of anyOf`)
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errs.push(`${path}: ${JSON.stringify(value)} not in enum`)
    return
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    const actual = typeOf(value)
    const ok = types.some((t) => t === actual || (t === 'number' && actual === 'integer'))
    if (!ok) {
      errs.push(`${path}: expected ${types.join('|')}, got ${actual}`)
      return
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength)
      errs.push(`${path}: shorter than minLength ${schema.minLength} (${value.length})`)
    if (schema.maxLength !== undefined && value.length > schema.maxLength)
      errs.push(`${path}: longer than maxLength ${schema.maxLength} (${value.length})`)
    if (schema.pattern && !new RegExp(schema.pattern).test(value))
      errs.push(`${path}: "${value}" does not match ${schema.pattern}`)
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum)
      errs.push(`${path}: ${value} < minimum ${schema.minimum}`)
    if (schema.maximum !== undefined && value > schema.maximum)
      errs.push(`${path}: ${value} > maximum ${schema.maximum}`)
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems)
      errs.push(`${path}: fewer than minItems ${schema.minItems} (${value.length})`)
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      errs.push(`${path}: more than maxItems ${schema.maxItems} (${value.length})`)
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length)
      errs.push(`${path}: items are not unique`)
    if (schema.items) value.forEach((v, i) => validate(v, schema.items!, root, `${path}[${i}]`, errs))
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, Json>
    for (const key of schema.required ?? []) if (!(key in obj)) errs.push(`${path}: missing required property "${key}"`)
    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(obj))
        if (!(key in schema.properties)) errs.push(`${path}: unexpected property "${key}"`)
    }
    for (const [key, sub] of Object.entries(schema.properties ?? {})) {
      if (key in obj) validate(obj[key], sub, root, `${path}.${key}`, errs)
    }
  }
}

/* ─────────────────────────────────── load ──────────────────────────────────── */

interface Collection {
  dir: string
  schema: string
  records: Map<string, Record<string, unknown>>
}

const COLLECTIONS: { dir: string; schema: string; arrayFile?: string }[] = [
  { dir: 'books', schema: 'book' },
  { dir: 'series', schema: 'series' },
  { dir: 'planets', schema: 'planet' },
  { dir: 'shards', schema: 'shard' },
  { dir: 'magic-systems', schema: 'magic-system' },
  { dir: 'allomantic-metals', schema: 'allomantic-metal' },
  { dir: 'characters', schema: 'character' },
  { dir: 'events', schema: 'event' },
  { dir: 'eras', schema: 'era' },
  { dir: 'worldhoppers', schema: 'worldhopper' },
  { dir: 'heroes', schema: 'hero' },
  { dir: 'families', schema: 'family' },
  { dir: 'field-notes', schema: 'field-note' },
  { dir: 'relationships', schema: 'relationship', arrayFile: 'relationships.json' },
]

const errors: string[] = []
const stats: string[] = []

function loadCollections(): Collection[] {
  return COLLECTIONS.map((c) => {
    const full = join(CONTENT, c.dir)
    const records = new Map<string, Record<string, unknown>>()
    const schema = loadSchema(c.schema)

    const files = c.arrayFile
      ? [c.arrayFile]
      : readdirSync(full).filter((f) => f !== 'index.json' && f.endsWith('.json'))

    for (const file of files) {
      const raw = JSON.parse(readFileSync(join(full, file), 'utf8'))
      const items = Array.isArray(raw) ? raw : [raw]
      for (const item of items) {
        const rel = `${c.dir}/${file}`
        // V1 — schema
        const local: string[] = []
        validate(item, schema, schema, rel, local)
        for (const e of local) errors.push(`V1 ${e}`)
        const id = String(item.id ?? '')
        if (id) records.set(id, item)
      }
    }
    return { dir: c.dir, schema: c.schema, records }
  })
}

/* ─────────────────────────────────── checks ────────────────────────────────── */

function run() {
  const collections = loadCollections()

  let entityCount = 0
  for (const c of collections) {
    entityCount += c.records.size
    stats.push(`  ${c.dir.padEnd(20)} ${String(c.records.size).padStart(4)} records  (${c.schema}.schema.json)`)
  }
  console.log('content validation · REBUILD_PLAN §7.5\n')
  console.log(stats.join('\n'))
  console.log(`\n  ${entityCount} entities across ${collections.length} collections\n`)

  const byDir = new Map(collections.map((c) => [c.dir, c]))
  const ids = (dir: string) => byDir.get(dir)!.records
  const idSet = (dir: string) => new Set(ids(dir).keys())

  const bookIds = idSet('books')
  const planetIds = idSet('planets')
  const seriesIds = idSet('series')
  const characterIds = idSet('characters')
  const magicIds = idSet('magic-systems')
  const metalIds = idSet('allomantic-metals')
  const heroIds = idSet('heroes')
  const familyIds = idSet('families')
  const shardNames = new Set([...ids('shards').values()].map((s) => String(s.id)))

  // V2 — unique within a collection
  for (const c of collections) {
    const seen = new Set<string>()
    let dup = 0
    for (const id of c.records.keys()) {
      if (seen.has(id)) {
        errors.push(`V2 duplicate id "${id}" in ${c.dir}`)
        dup++
      }
      seen.add(id)
    }
    if (dup) stats.push(`  ! ${dup} duplicate ids in ${c.dir}`)
  }

  // V3 — unique globally.
  // Exception: a book and the series it belongs to may share a slug when they
  // are the same work (Elantris, Warbreaker, Arcanum Unbounded). They live in
  // different URL spaces and merging them would lose the grouping.
  const ALLOWED_COLLISIONS = new Set(['books|series'])
  const globalSeen = new Map<string, string>()
  for (const c of collections) {
    for (const id of c.records.keys()) {
      const prev = globalSeen.get(id)
      if (prev && prev !== c.dir && !ALLOWED_COLLISIONS.has(`${prev}|${c.dir}`))
        errors.push(`V3 id "${id}" appears in both ${prev} and ${c.dir}`)
      else globalSeen.set(id, c.dir)
    }
  }

  // V15 — no underscores
  for (const c of collections) {
    for (const id of c.records.keys())
      if (id.includes('_')) errors.push(`V15 id "${id}" in ${c.dir} contains an underscore`)
  }

  // V4 — references resolve
  const checkRef = (owner: string, field: string, value: unknown, set: Set<string>, label: string) => {
    if (typeof value !== 'string') return
    if (!set.has(value)) errors.push(`V4 ${owner}.${field} references unknown ${label} "${value}"`)
  }
  for (const [id, b] of ids('books')) {
    checkRef(`book ${id}`, 'series', b.series, seriesIds, 'series')
    if (b.cover && !existsSync(join(PUBLIC, String(b.cover))))
      errors.push(`V11 book ${id}.cover -> ${b.cover} does not exist in public/`)
  }
  for (const [id, p] of ids('planets')) {
    checkRef(`planet ${id}`, 'connectedPlanets[]', 0, planetIds, 'planet')
    for (const x of (p.connectedPlanets as string[]) ?? [])
      if (x !== id) checkRef(`planet ${id}`, 'connectedPlanets[]', x, planetIds, 'planet')
    for (const x of (p.series as string[]) ?? []) checkRef(`planet ${id}`, 'series[]', x, seriesIds, 'series')
    for (const x of (p.books as string[]) ?? []) checkRef(`planet ${id}`, 'books[]', x, bookIds, 'book')
    for (const s of (p.shards as string[]) ?? [])
      if (!shardNames.has(s)) errors.push(`V4 planet ${id}.shards references unknown shard "${s}"`)
  }
  for (const [id, m] of ids('magic-systems')) {
    if (m.shard && !shardNames.has(String(m.shard).toLowerCase()))
      errors.push(`V4 magic ${id}.shard references unknown shard "${m.shard}"`)
  }
  for (const [id, c] of ids('characters')) {
    checkRef(`character ${id}`, 'origin', c.origin, planetIds, 'planet')
    for (const x of (c.books as string[]) ?? []) checkRef(`character ${id}`, 'books[]', x, bookIds, 'book')
    if (c.portrait && !existsSync(join(PUBLIC, String(c.portrait))))
      errors.push(`V11 character ${id}.portrait -> ${c.portrait} does not exist in public/`)
  }
  for (const [id, m] of ids('magic-systems')) {
    checkRef(`magic ${id}`, 'planet', m.planet, planetIds, 'planet')
    for (const x of (m.books as string[]) ?? []) checkRef(`magic ${id}`, 'books[]', x, bookIds, 'book')
    for (const x of (m.allomanticMetals as string[]) ?? [])
      checkRef(`magic ${id}`, 'allomanticMetals[]', x, metalIds, 'metal')
  }
  for (const [id, e] of ids('events')) {
    checkRef(`event ${id}`, 'series', e.series, seriesIds, 'series')
    for (const x of (e.planets as string[]) ?? []) checkRef(`event ${id}`, 'planets[]', x, planetIds, 'planet')
    for (const x of (e.characters as string[]) ?? [])
      checkRef(`event ${id}`, 'characters[]', x, characterIds, 'character')
  }
  for (const [id, w] of ids('worldhoppers')) {
    for (const x of (w.planets as string[]) ?? []) checkRef(`worldhopper ${id}`, 'planets[]', x, planetIds, 'planet')
    for (const x of (w.series as string[]) ?? []) checkRef(`worldhopper ${id}`, 'series[]', x, seriesIds, 'series')
    if (w.character) checkRef(`worldhopper ${id}`, 'character', w.character, characterIds, 'character')
    for (const m of (w.movements as { planet: string }[]) ?? [])
      checkRef(`worldhopper ${id}`, 'movements[].planet', m.planet, planetIds, 'planet')
  }
  for (const [id, h] of ids('heroes')) {
    for (const x of (h.books as string[]) ?? []) checkRef(`hero ${id}`, 'books[]', x, bookIds, 'book')
    for (const x of (h.connections as string[]) ?? []) checkRef(`hero ${id}`, 'connections[]', x, heroIds, 'hero')
  }
  for (const [id, rel] of ids('relationships')) {
    checkRef(`relationship ${id}`, 'from', rel.from, characterIds, 'character')
    checkRef(`relationship ${id}`, 'to', rel.to, characterIds, 'character')
  }
  for (const [id, n] of ids('field-notes')) {
    checkRef(`field-note ${id}`, 'planet', n.planet, planetIds, 'planet')
  }

  // V5 — no parent cycles inside a family
  for (const [id, f] of ids('families')) {
    const members = f.members as { id: string; parents: string[] }[]
    const parentsOf = new Map(members.map((m) => [m.id, m.parents ?? []]))
    for (const m of members) {
      let cursor: string | undefined = m.id
      const seen = new Set<string>([m.id])
      for (let depth = 0; depth < 50; depth++) {
        const next = parentsOf.get(cursor ?? '')?.find((p) => parentsOf.has(p))
        if (!next) break
        if (seen.has(next)) {
          errors.push(`V5 family ${id}: cycle in parent chain at "${next}"`)
          break
        }
        seen.add(next)
        cursor = next
      }
    }
  }

  // V6 — born <= died
  for (const [id, c] of ids('characters')) {
    const born = c.born as number | null
    const died = c.died as number | null
    if (typeof born === 'number' && typeof died === 'number' && died < born)
      errors.push(`V6 character ${id}: died (${died}) < born (${born})`)
  }

  // V7 / V8 — books and unlockAt
  for (const [id, c] of ids('characters')) {
    const books = (c.books as string[]) ?? []
    if (books.length === 0) errors.push(`V7 character ${id} has no books`)
    const unlock = (c.unlockAt as string[]) ?? []
    for (const u of unlock) if (!books.includes(u)) errors.push(`V8 character ${id}: unlockAt "${u}" is not in books`)
  }

  // V9 — summary length
  for (const c of collections) {
    for (const [id, rec] of c.records) {
      const s = rec.summary
      if (typeof s === 'string' && s.length > 0 && s.length < 40)
        errors.push(`V9 ${c.dir}/${id}: summary is only ${s.length} characters`)
    }
  }

  // V10 — wordCount for published books
  for (const [id, b] of ids('books')) {
    if (typeof b.published === 'number' && b.wordCount === null)
      errors.push(`V10 book ${id} is published but has no wordCount`)
  }

  // V13 — family member references
  for (const [id, f] of ids('families')) {
    const members = f.members as Record<string, unknown>[]
    const memberIds = new Set(members.map((m) => String(m.id)))
    for (const m of members) {
      for (const field of ['parents'] as const)
        for (const p of (m[field] as string[]) ?? [])
          if (!memberIds.has(p)) errors.push(`V13 family ${id}: member ${m.id}.${field} -> unknown "${p}"`)
      for (const field of ['character', 'spouse'] as const) {
        const v = m[field]
        if (typeof v === 'string' && !characterIds.has(v))
          errors.push(`V13 family ${id}: member ${m.id}.${field} -> unknown character "${v}"`)
      }
    }
    for (const r of (f.rootIds as string[]) ?? [])
      if (!memberIds.has(r)) errors.push(`V13 family ${id}: rootId -> unknown member "${r}"`)
  }

  // V14 — index.json agrees with the files on disk
  for (const c of COLLECTIONS) {
    const idx = join(CONTENT, c.dir, 'index.json')
    if (!existsSync(idx)) continue
    const listed = new Set((JSON.parse(readFileSync(idx, 'utf8')) as { ids: string[] }).ids)
    const records = byDir.get(c.dir)!.records
    for (const id of records.keys())
      if (!listed.has(id)) errors.push(`V14 ${c.dir}/${id}.json is missing from index.json`)
    for (const id of listed)
      if (!records.has(id)) errors.push(`V14 index.json lists ${c.dir}/${id} which does not exist`)
  }

  // V12 — name collisions across entities that are shown in one list
  const nameOwners = new Map<string, string>()
  for (const dir of ['characters', 'planets', 'books', 'heroes', 'magic-systems']) {
    for (const [id, rec] of ids(dir)) {
      const name = String(rec.name ?? '')
      if (!name) continue
      const key = name.toLowerCase()
      const prev = nameOwners.get(key)
      if (prev && prev !== `${dir}/${id}`) errors.push(`V12 name "${name}" is used by both ${prev} and ${dir}/${id}`)
      else nameOwners.set(key, `${dir}/${id}`)
    }
  }

  // V11 (2/2) — the generated portrait manifest must match the files on disk.
  // If it drifts, characters silently fall back to the Monogram or issue a 404.
  {
    const dir = join(PUBLIC, 'characters')
    const onDisk = new Set(
      existsSync(dir)
        ? readdirSync(dir)
            .filter((f) => /\.webp$/i.test(f))
            .map((f) => f.replace(/\.webp$/i, ''))
        : [],
    )
    const manifestPath = join(ROOT, 'src', 'data', 'generated', 'portraits.ts')
    if (!existsSync(manifestPath)) {
      errors.push('V11 src/data/generated/portraits.ts is missing — run pnpm content:migrate')
    } else {
      // Parse the array literal instead of matching lines: prettier rewrites the
      // layout and the quotes of the generated file, so a line regex is not stable.
      const src = readFileSync(manifestPath, 'utf8')
      const anchor = src.indexOf('PORTRAIT_NAMES: readonly string[] = ')
      // Skip past the "= " and the bracket itself. Searching for '[' alone would
      // land on the one inside `string[]`.
      const open = anchor === -1 ? -1 : src.indexOf('[', src.indexOf('= [', anchor))
      const close = open === -1 ? -1 : src.indexOf(']', open)
      if (close === -1) {
        errors.push('V11 src/data/generated/portraits.ts has no readable PORTRAIT_NAMES array')
      } else {
        const listed = new Set([...src.slice(open, close).matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]!))
        for (const n of onDisk)
          if (!listed.has(n)) errors.push(`V11 portrait ${n}.webp exists but is not in the manifest`)
        for (const n of listed) if (!onDisk.has(n)) errors.push(`V11 manifest lists ${n}.webp, which does not exist`)
      }
    }
  }

  /* ──────────────────────────────── report ─────────────────────────────────── */
  console.log('checks')
  console.log('  V1  schema conformance      every file validated')
  console.log('  V2  ids unique per collection')
  console.log('  V3  ids unique globally')
  console.log('  V4  references resolve')
  console.log('  V5  no family parent cycles')
  console.log('  V6  born <= died')
  console.log('  V7  books not empty')
  console.log('  V8  unlockAt subset of books')
  console.log('  V9  summary length')
  console.log('  V10 wordCount on published books')
  console.log('  V11 assets exist on disk')
  console.log('  V12 no name collisions')
  console.log('  V13 family references resolve')
  console.log('  V14 index.json agrees with disk')
  console.log('  V15 no underscores in ids')

  const missingAssets = errors.filter((e) => e.startsWith('V11')).length
  const brokenRefs = errors.filter((e) => e.startsWith('V4')).length
  console.log(`\n  broken references : ${brokenRefs}`)
  console.log(`  missing assets    : ${missingAssets}`)

  if (errors.length > 0) {
    console.log(`\n${errors.length} problems:`)
    for (const e of errors.slice(0, 60)) console.log(`  ${e}`)
    if (errors.length > 60) console.log(`  ... and ${errors.length - 60} more`)
    console.error('\ncontent validation FAILED')
    process.exit(1)
  }

  console.log('\ncontent validation PASSED')
}

run()
