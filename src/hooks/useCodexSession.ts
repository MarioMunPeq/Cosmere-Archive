import { useCallback, useState } from 'react'
import type { CodexEdition, CodexPartId } from '@/utils/codex-pages'
import { hasOpenedCodex, markCodexOpened } from '@/components/codex/codex-session'

/**
 * Codex · reader memory
 *
 * Three different lifetimes live here, and mixing them would be wrong:
 *
 *   cover    sessionStorage. A new tab deserves the ritual; a reload does not.
 *   ribbon   localStorage. The bookmark is the point of a bookmark.
 *   edition  localStorage. A reader's choice of copy outlives the tab.
 *
 * Every storage access is guarded. Safari private mode and embedded webviews
 * throw on `localStorage`; losing a bookmark is recoverable, a locked book is
 * not.
 */

export const CODEX_RIBBON_KEY = 'cosmere-codex-ribbon'
export const CODEX_EDITION_KEY = 'cosmere-codex-edition'

const EDITIONS: readonly CodexEdition[] = ['working', 'printed', 'restricted']

function local(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readRibbons(): Record<string, string> {
  try {
    const raw = local()?.getItem(CODEX_RIBBON_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [part, spread] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof spread === 'string' && spread.length > 0) out[part] = spread
    }
    return out
  } catch {
    return {}
  }
}

function writeRibbons(value: Record<string, string>): void {
  try {
    local()?.setItem(CODEX_RIBBON_KEY, JSON.stringify(value))
  } catch {
    // The bookmark still works for this visit through React state.
  }
}

function readEdition(): CodexEdition {
  try {
    const raw = local()?.getItem(CODEX_EDITION_KEY)
    return EDITIONS.includes(raw as CodexEdition) ? (raw as CodexEdition) : 'working'
  } catch {
    return 'working'
  }
}

function writeEdition(value: CodexEdition): void {
  try {
    local()?.setItem(CODEX_EDITION_KEY, value)
  } catch {
    // Selection still applies to this visit.
  }
}

export interface CodexCoverMemory {
  coverSeen: boolean
  markCoverSeen: () => void
}

export function useCodexCover(): CodexCoverMemory {
  const [coverSeen, setCoverSeen] = useState<boolean>(() => hasOpenedCodex())

  const markCoverSeen = useCallback(() => {
    markCodexOpened()
    setCoverSeen(true)
  }, [])

  return { coverSeen, markCoverSeen }
}

export interface CodexSession extends CodexCoverMemory {
  part: CodexPartId
  /** Last spread left open in this part, if it still exists. */
  ribbon: string | null
  rememberSpread: (spreadId: string) => void
  edition: CodexEdition
  setEdition: (edition: CodexEdition) => void
}

export function useCodexSession(part: CodexPartId = 'investiture'): CodexSession {
  const cover = useCodexCover()
  const [ribbons, setRibbons] = useState<Record<string, string>>(readRibbons)
  const [edition, setEditionState] = useState<CodexEdition>(readEdition)

  const rememberSpread = useCallback(
    (spreadId: string) => {
      setRibbons((previous) => {
        // Read the disk again before writing. Two parts can be mounted at once
        // (a test, a future split view); merging keeps one part's bookmark from
        // clobbering the other's.
        const next = { ...readRibbons(), ...previous, [part]: spreadId }
        if (previous[part] === spreadId) return previous
        writeRibbons(next)
        return next
      })
    },
    [part],
  )

  const setEdition = useCallback((next: CodexEdition) => {
    if (!EDITIONS.includes(next)) return
    writeEdition(next)
    setEditionState(next)
  }, [])

  return {
    ...cover,
    part,
    ribbon: ribbons[part] ?? null,
    rememberSpread,
    edition,
    setEdition,
  }
}
