/**
 * Search types, shared by the build-time index generator and the runtime hook.
 *
 * The generator writes the index in this shape, so a change here breaks the
 * build rather than the search box at runtime.
 */

import type { IconName } from '../navigation'

export type SearchType = 'character' | 'planet' | 'book' | 'magic' | 'event' | 'hero' | 'series' | 'shard' | 'page'

export interface SearchResult {
  id: string
  /** Fragment route. The app navigates to `#${route}`. */
  route: string
  type: SearchType
  title: string
  subtitle: string
  score: number
  /** Section glyph, when the result is a navigation destination. */
  icon?: IconName
}

/** Shape of src/data/search-index.json, as written by the generator. */
export interface SearchIndexFile {
  generatedFrom: string
  documentCount: number
  searchOptions: Record<string, unknown>
  /** type -> multiplier, applied by MiniSearch's boostDocument. */
  typeBoost: Record<string, number>
  index: unknown
}

/**
 * How much each kind of record outranks the others for the same relevance.
 *
 * Without this, searching "saz" returns the event "Birth of Sazed" above the
 * character Sazed, because an event title is short and dense and takes the full
 * title boost, while a character record has the same name spread across a long
 * summary. People search for people, so people win ties.
 */
export const TYPE_BOOST: Record<SearchType, number> = {
  character: 3,
  planet: 3,
  shard: 2.5,
  book: 2,
  series: 2,
  magic: 1.5,
  hero: 1.5,
  event: 1,
  page: 1,
}

/**
 * Section label per category.
 *
 * There is deliberately no fixed category order: `useGlobalSearch` orders the
 * sections by their best result, so the answer the reader wanted is the first
 * thing on screen. A fixed order put four characters above the Preservation
 * Shard for the query "preserv".
 */
export const CATEGORY_LABEL: Record<SearchType, string> = {
  character: 'Characters',
  planet: 'Worlds',
  book: 'Volumes',
  shard: 'Shards',
  series: 'Series',
  magic: 'Magic',
  hero: 'Heralds',
  event: 'Events',
  page: 'Sections',
}

/** §5.8: at most 12 results, grouped by type with separators. */
export const MAX_RESULTS = 12
