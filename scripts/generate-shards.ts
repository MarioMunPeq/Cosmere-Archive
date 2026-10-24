/**
 * Generate `src/data/generated/shards.json` from `content/shards/`.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT = join(process.cwd(), 'content', 'shards')
const OUT = join(process.cwd(), 'src', 'data', 'generated', 'shards.json')

const files = readdirSync(CONTENT).filter((f) => f.endsWith('.json') && f !== 'index.json')
const shards = files
  .map((f) => JSON.parse(readFileSync(join(CONTENT, f), 'utf8')) as Record<string, unknown>)
  .sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id), 'en'))

writeFileSync(OUT, `${JSON.stringify(shards, null, 2)}\n`, 'utf8')
console.log(`shards: ${shards.length} from content/shards/`)
