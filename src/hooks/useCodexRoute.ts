import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { canonicalSpreadParams, resolveLegacySpread, spreadIndexById, type CodexSpread } from '@/utils/codex-pages'

/**
 * Codex · URL as the open spread
 *
 * One semantic rule decides the whole history model:
 *
 *   entry changes push          openSpread (contents, a chapter, an index)
 *   page turns replace          turnTo (the leaf you are turning)
 *
 * So Back after five page turns returns to the entry where the reader entered
 * the chapter, not through five identical states. Legacy links (`?system=`,
 * `?character=`, `?family=`, `?tab=`, `?q=`) resolve to a spread once, then the
 * URL is rewritten with `replace` into the canonical `?spread=`.
 */

interface Options {
  spreads: readonly CodexSpread[]
  fallbackId?: string | null
}

export interface CodexRoute {
  index: number
  spread: CodexSpread | undefined
  total: number
  /** Entry navigation: records a history entry. */
  openSpread: (spreadId: string) => void
  /** Page turn: replaces the current entry. */
  turnTo: (spreadId: string) => void
  turnBy: (delta: number) => void
  first: () => void
  last: () => void
  isFirst: boolean
  isLast: boolean
}

export function useCodexRoute({ spreads, fallbackId }: Options): CodexRoute {
  const [params, setParams] = useSearchParams()

  const resolved = useMemo(() => {
    const direct = params.get('spread')
    if (direct) {
      const index = spreadIndexById(spreads, direct)
      if (index >= 0) return index
    }

    const legacy = resolveLegacySpread(spreads, params)
    if (legacy) {
      const index = spreadIndexById(spreads, legacy.id)
      if (index >= 0) return index
    }

    if (fallbackId) {
      const index = spreadIndexById(spreads, fallbackId)
      if (index >= 0) return index
    }

    return 0
  }, [fallbackId, params, spreads])

  const spread = spreads[resolved]
  const query = params.get('q')

  const canonical = useMemo(() => (spread ? canonicalSpreadParams(spread, query) : null), [query, spread])
  const canonicalString = canonical?.toString() ?? ''

  useEffect(() => {
    if (!canonical) return
    if (params.toString() === canonicalString) return
    setParams(canonical, { replace: true })
  }, [canonical, canonicalString, params, setParams])

  const go = useCallback(
    (spreadId: string, replace: boolean) => {
      const index = spreadIndexById(spreads, spreadId)
      if (index < 0) return
      const target = spreads[index]
      if (!target) return
      // Entry navigation should not push a duplicate entry for the spread that
      // is already open. Page turns always go through, even when the route
      // state has not caught up with a just-issued turn: a rapid Home after End
      // must not be swallowed by a stale `spread` closure.
      if (!replace && target.id === spread?.id) return
      setParams(canonicalSpreadParams(target, query), { replace })
    },
    [query, setParams, spread?.id, spreads],
  )

  const openSpread = useCallback((spreadId: string) => go(spreadId, false), [go])
  const turnTo = useCallback((spreadId: string) => go(spreadId, true), [go])

  const turnBy = useCallback(
    (delta: number) => {
      const target = spreads[resolved + delta]
      if (target) go(target.id, true)
    },
    [go, resolved, spreads],
  )

  const first = useCallback(() => {
    const target = spreads[0]
    if (target) go(target.id, true)
  }, [go, spreads])

  const last = useCallback(() => {
    const target = spreads[spreads.length - 1]
    if (target) go(target.id, true)
  }, [go, spreads])

  return {
    index: resolved,
    spread,
    total: spreads.length,
    openSpread,
    turnTo,
    turnBy,
    first,
    last,
    isFirst: resolved <= 0,
    isLast: resolved >= spreads.length - 1,
  }
}
