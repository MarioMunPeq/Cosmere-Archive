/**
 * Ranking — the part of search that is not MiniSearch.
 *
 * MiniSearch scores a document by field weights and edit distance. That is the
 * wrong question for a name search, so two rules are applied on top:
 *
 *  1. Type weight. "saz" matches the event "Birth of Sazed" harder than the
 *     character Sazed, because an event title is short and dense while a
 *     character record spreads the same name across a long summary. People
 *     search for people, so a character outranks an event of equal relevance.
 *
 *  2. Title prefix. A record whose title begins with the whole query is almost
 *     certainly what was typed. This is what puts Shallan Davar above Wan
 *     ShaiLu for "shall", where both are matched but only one is what was meant.
 *
 *  3. Short-term backoff. For a query of three to five characters the search is
 *     run a second time without the final character, at a penalty. "kaz" is one
 *     edit from the prefix "kal", which is the only reason §5.8's
 *     `kaz -> Kaladin` is reachable at all: with a three-character term there is
 *     no room for fuzzy matching inside MiniSearch itself.
 *
 * This module takes the MiniSearch instance as an argument so the build-time
 * acceptance check and the runtime search box run identical code. A ranking rule
 * that only exists in the browser is a rule the build cannot verify.
 */

import { MAX_RESULTS, TYPE_BOOST } from './types'
import type { SearchResult, SearchType } from './types'

/**
 * The slice of MiniSearch this module needs. Declared structurally rather than
 * importing the class so the ranking can be unit-tested against a stub and so
 * the generics on MiniSearch<IndexedDoc> do not leak in here.
 */
export interface SearchableIndex {
  search: (query: string, options?: Record<string, unknown>) => { id: string; score: number }[]
  getStoredFields: (id: string) => Record<string, unknown> | undefined
}

const EXACT_BONUS = 8
const PREFIX_BONUS = 4
/** Multiplier applied to the backoff pass, so it fills gaps and never leads. */
const BACKOFF_PENALTY = 0.6
const BACKOFF_MIN = 3
const BACKOFF_MAX = 5

export function makeSearchOptions(typeBoost: Record<string, number> = TYPE_BOOST) {
  return {
    prefix: true,
    // Low enough that it only catches real typos. At 0.35 "kaz" also matches
    // "Kiin", and short queries start matching everything.
    fuzzy: 0.2,
    boost: { title: 6, aliases: 3, subtitle: 1.5, body: 1 },
    // MiniSearch passes the stored fields of the matched document, so the type
    // weight needs no lookup.
    boostDocument: (_id: string, _term: string, stored?: Record<string, unknown>) => {
      const type = stored?.type as SearchType | undefined
      return (type && typeBoost[type]) ?? 1
    },
  }
}

export function search(
  index: SearchableIndex,
  query: string,
  typeBoost?: Record<string, number>,
  /**
   * §5.8: at most 12 visible results. The cap lives here rather than in the
   * hook so it cannot be forgotten by a caller that slices elsewhere, and so the
   * build-time acceptance check is measured the same way the reader is.
   */
  limit: number = MAX_RESULTS,
): SearchResult[] {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  const options = makeSearchOptions(typeBoost ?? TYPE_BOOST)
  const scores = new Map<string, number>()

  for (const hit of index.search(trimmed, options)) scores.set(hit.id, hit.score)

  // Rule 3: backoff for short terms.
  if (trimmed.length >= BACKOFF_MIN && trimmed.length <= BACKOFF_MAX) {
    for (const hit of index.search(trimmed.slice(0, -1), options)) {
      if (!scores.has(hit.id)) scores.set(hit.id, hit.score * BACKOFF_PENALTY)
    }
  }

  const lower = trimmed.toLowerCase()
  return [...scores.entries()]
    .map(([id, base]) => {
      const stored = index.getStoredFields(id) ?? {}
      const title = String(stored.title ?? '')
      const t = title.toLowerCase()

      let bonus = 0
      if (t === lower) bonus = EXACT_BONUS
      else if (t.startsWith(lower)) bonus = PREFIX_BONUS

      return {
        id,
        route: String(stored.route ?? '/'),
        type: (stored.type as SearchType) ?? 'character',
        title,
        subtitle: String(stored.subtitle ?? ''),
        icon: stored.icon as SearchResult['icon'] | undefined,
        score: base + bonus,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
