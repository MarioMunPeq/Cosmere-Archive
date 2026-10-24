/**
 * Generate `src/data/generated/relationships.json` from
 * `content/relationships/relationships.json`.
 *
 * The content collection stores an edge as `from`/`to`; the Records code reads
 * `characters: [from, to]`. Keeping the mapping here means the runtime table is
 * never authored by hand, and a duplicate id fails before it can be silently
 * collapsed by the validator.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface ContentRelationship {
  id: string
  from: string
  to: string
  type: string
  label?: string | null
  inverseLabel?: string | null
  kind: string
}

interface RuntimeRelationship {
  characters: [string, string]
  type: string
  label?: string
  inverseLabel?: string
}

const SOURCE = join(process.cwd(), 'content', 'relationships', 'relationships.json')
const OUT = join(process.cwd(), 'src', 'data', 'generated', 'relationships.json')

const content = JSON.parse(readFileSync(SOURCE, 'utf8')) as ContentRelationship[]

const seen = new Set<string>()
for (const rel of content) {
  if (seen.has(rel.id)) throw new Error(`duplicate relationship id "${rel.id}"`)
  seen.add(rel.id)
  if (rel.from === rel.to) throw new Error(`relationship "${rel.id}" links "${rel.from}" to itself`)
}

const generated: RuntimeRelationship[] = content.map((rel) => {
  const edge: RuntimeRelationship = {
    characters: [rel.from, rel.to],
    type: rel.type,
  }
  if (rel.label) edge.label = rel.label
  if (rel.inverseLabel) edge.inverseLabel = rel.inverseLabel
  return edge
})

writeFileSync(OUT, `${JSON.stringify(generated, null, 2)}\n`, 'utf8')

console.log(`relationships: ${generated.length} edges from content/relationships/`)
