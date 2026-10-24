/**
 * Shards, generated from `content/shards/`.
 */
import shardsData from '@/data/generated/shards.json'
import { PLANETS } from '@/data/static/planets'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { BOOKS } from '@/data/static/books'
import type { Planet } from '@/types/planet'

export interface ShardData {
  id: string
  name: string
  color?: string
  summary?: string
  reviewed?: boolean
}

export const SHARDS: ShardData[] = (shardsData as ShardData[]).slice().sort((a, b) =>
  a.name.localeCompare(b.name, 'en'),
)

export function getShardById(id: string): ShardData | undefined {
  return SHARDS.find((s) => s.id === id)
}

export function getPlanetsWithShard(shardId: string): Planet[] {
  const target = getShardById(shardId)
  if (!target) return []
  const name = target.name
  return PLANETS.filter((p) => {
    if (!p.shard) return false
    const shards = p.shard.split(/[&/,]/).map((s) => s.trim())
    return shards.includes(name) || shards.includes(shardId)
  })
}

export function getMagicSystemsWithShard(shardId: string): typeof MAGIC_SYSTEMS {
  const target = getShardById(shardId)
  if (!target) return []
  const name = target.name
  return MAGIC_SYSTEMS.filter((m) => (m as any).shard === name || (m as any).shard === shardId)
}

export function getBooksWithShard(shardId: string): typeof BOOKS {
  const planets = getPlanetsWithShard(shardId)
  const magic = getMagicSystemsWithShard(shardId)
  const bookIds = new Set<string>()
  for (const p of planets) {
    for (const b of p.books ?? []) bookIds.add(b)
  }
  for (const m of magic) {
    for (const b of (m as any).bookIds ?? []) bookIds.add(b)
  }
  return BOOKS.filter((b) => bookIds.has(b.id))
}
