/**
 * useGlobalSearch — one search, one index, one set of shortcuts.
 *
 * Replaces two independent implementations:
 *
 *  - hooks/useSearch.ts, a `String.includes` substring scan over five data
 *    sources on every keystroke, with a `setInterval` rotating the placeholder
 *    every 4s (four re-renders a minute to change a decoration) and a bug that
 *    wiped the recents list on every click of a recent.
 *  - ui/CommandPalette.tsx, a second search with no debounce, no cap and 133
 *    buttons rendered up front, calling /celestial-charts "home".
 *
 * The index is fetched on first use, not at load: it is 212 KB of JSON and a
 * reader who never searches should not pay for it. §5.8 Q.6 caps the main chunk
 * at 180 KB gzip, and keeping minisearch and the index out of the entry chunk is
 * what leaves room for it.
 *
 * No state is synchronised from an effect. The highlighted index is derived,
 * not stored, when the reader has not chosen one; the reset happens in the
 * close handler rather than in an effect watching `open`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MiniSearch from 'minisearch'

import { search } from './ranking'
import { CATEGORY_LABEL } from './types'
import type { SearchIndexFile, SearchResult, SearchType } from './types'

/** §5.8: 120 ms. Long enough not to re-rank on every keypress of a fast typist. */
export const SEARCH_DEBOUNCE_MS = 120

export interface GroupedResult {
  type: SearchType
  label: string
  results: SearchResult[]
}

interface LoadedIndex {
  index: MiniSearch
  typeBoost: Record<string, number>
}

/** Cached across hook instances, so opening the dialog twice costs nothing. */
let cache: Promise<LoadedIndex> | null = null

function loadIndex(): Promise<LoadedIndex> {
  cache ??= import('@/data/search-index.json').then(({ default: raw }) => {
    const file = raw as unknown as SearchIndexFile
    return {
      index: MiniSearch.loadJSON(JSON.stringify(file.index), {
        fields: ['title', 'subtitle', 'body', 'aliases'],
        storeFields: ['title', 'subtitle', 'type', 'route'],
      }),
      typeBoost: file.typeBoost ?? {},
    }
  })
  return cache
}

export interface GlobalSearch {
  query: string
  setQuery: (q: string) => void
  /** Debounced and capped. Empty until the first result arrives. */
  groups: GroupedResult[]
  /** Flat list in display order, for keyboard navigation. */
  results: SearchResult[]
  /** Flat index of the highlighted result, or -1. */
  activeIndex: number
  /** True once a query has run and produced nothing. */
  isEmpty: boolean
  /** Still waiting on the debounce; avoids flashing "no matches" per keystroke. */
  isPending: boolean
  move: (delta: number) => void
  /** Jump the highlight to a flat index, e.g. when the pointer enters a row. */
  highlight: (index: number) => void
  /** Called by the dialog when it closes. An event, not an effect. */
  reset: () => void
}

export function useGlobalSearch(open: boolean): GlobalSearch {
  const [query, setQueryRaw] = useState('')
  const [debounced, setDebounced] = useState('')
  const [loaded, setLoaded] = useState<LoadedIndex | null>(null)
  /** -1 means "the reader has not moved the highlight yet". */
  const [chosen, setChosen] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // The one timer in this module, and the one the old implementation abused:
  // debouncing is a legitimate use, animating a placeholder was not.
  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(q), SEARCH_DEBOUNCE_MS)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  // Load on first open, not on mount.
  useEffect(() => {
    if (!open || loaded) return
    let cancelled = false
    void loadIndex().then((i) => {
      if (!cancelled) setLoaded(i)
    })
    return () => {
      cancelled = true
    }
  }, [open, loaded])

  // Ranking is pure: same debounced term and same index give the same list, so
  // it is derived during render rather than stored. An earlier version wrote to
  // a ref from an effect, which meant the list was computed after the render
  // that was supposed to display it.
  const results = useMemo(() => {
    const term = debounced.trim()
    if (!loaded || term.length === 0) return [] as SearchResult[]
    return search(loaded.index, term, loaded.typeBoost)
  }, [debounced, loaded])

  // A new result set starts with the first one highlighted, so Enter does
  // something without a second keypress. Derived rather than stored in an
  // effect: there is no "has it changed yet" to track.
  const activeIndex = chosen >= 0 && chosen < results.length ? chosen : results.length > 0 ? 0 : -1

  /**
   * Results grouped by type with a separator, per §5.8.
   *
   * The groups are ordered by their best result, not by a fixed category
   * order. With a fixed order, searching "preserv" put four characters above the
   * Preservation Shard, which is the answer: the reader asked for Preservation
   * and got Sazed first. The best match decides which section opens.
   */
  const groups = useMemo(() => {
    const byType = new Map<SearchType, SearchResult[]>()
    for (const r of results) {
      const list = byType.get(r.type) ?? []
      list.push(r)
      byType.set(r.type, list)
    }
    return [...byType.entries()]
      .map(([type, list]) => ({
        type,
        label: CATEGORY_LABEL[type],
        // results is already sorted by score, so the head is the group maximum.
        results: list,
      }))
      .sort((a, b) => b.results[0]!.score - a.results[0]!.score)
  }, [results])

  const move = useCallback(
    (delta: number) => {
      if (results.length === 0) return
      // Based on the *effective* index, not on `chosen`. `chosen` is -1 until
      // the reader moves, so basing on it would make the first ArrowDown a
      // no-op: it would set chosen to 0, which is already the derived default.
      const next = activeIndex + delta
      setChosen(next < 0 ? results.length - 1 : next >= results.length ? 0 : next)
    },
    [results.length, activeIndex],
  )

  const highlight = useCallback((index: number) => setChosen(index), [])

  const reset = useCallback(() => {
    setQueryRaw('')
    setDebounced('')
    setChosen(-1)
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return {
    query,
    setQuery,
    groups,
    results,
    activeIndex,
    isEmpty: debounced.trim().length > 0 && results.length === 0 && loaded !== null,
    isPending: debounced.trim().length > 0 && debounced !== query,
    move,
    highlight,
    reset,
  }
}
