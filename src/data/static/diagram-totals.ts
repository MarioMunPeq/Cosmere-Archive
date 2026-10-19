/**
 * The tallies on the wall.
 *
 * Three numbers that are not about a saga, a planet or a book: how many series
 * exist, how many events, how many Shards. They used to be passed down from
 * `StatsPage` as props, which meant the wall could only exist where the
 * statistics page did — and D.5 asks the Diagram to be a destination, not a
 * section of somewhere else.
 *
 * Counting them here means the same fact is computed once, from the same
 * generated collections, and both screens read it.
 */

import { SAGAS } from '@/data/static/sagas'
import { SHARD_COLORS } from '@/data/static/static-data'
import eventsData from '@/data/generated/events.json'
import shardsData from '@/data/generated/planets.json'

export const MAGICS = {
  /** The series. `sagas.ts` is generated from `content/series/`. */
  seriesCount: SAGAS.length,
  /** Every event in the timeline, across every era. */
  eventCount: (eventsData as unknown[]).length,
  /**
   * The Shards.
   *
   * Counted from the **planets' own `shardIds`**, not from a list kept beside
   * them: Yolen lists Adonalsium and Roshar lists three, and a hand-kept count
   * of "18 Shards" would be a second answer to a question the planets already
   * answer.
   */
  shardCount: countShards(),
}

function countShards(): number {
  const seen = new Set<string>()
  for (const planet of shardsData as { shardIds?: string[] }[]) {
    for (const id of planet.shardIds ?? []) seen.add(id)
  }
  // `SHARD_COLORS` is the palette; a shard with no colour is not on the wall.
  return [...seen].filter((id) => id in SHARD_COLORS).length
}
