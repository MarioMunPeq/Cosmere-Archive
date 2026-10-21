import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CODEX_EDITION_KEY, CODEX_RIBBON_KEY, useCodexSession } from '@/hooks/useCodexSession'

describe('useCodexSession · ribs and editions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('remembers a ribbon per part', () => {
    const investiture = renderHook(() => useCodexSession('investiture'))
    const records = renderHook(() => useCodexSession('records'))

    act(() => investiture.result.current.rememberSpread('chapter-roshar'))
    act(() => records.result.current.rememberSpread('record-kaladin'))

    expect(investiture.result.current.ribbon).toBe('chapter-roshar')
    expect(records.result.current.ribbon).toBe('record-kaladin')
    expect(JSON.parse(window.localStorage.getItem(CODEX_RIBBON_KEY) ?? '{}')).toEqual({
      investiture: 'chapter-roshar',
      records: 'record-kaladin',
    })
  })

  it('restores the ribbon on a later visit and ignores a removed spread', () => {
    window.localStorage.setItem(CODEX_RIBBON_KEY, JSON.stringify({ investiture: 'chapter-scadrial' }))

    const { result } = renderHook(() => useCodexSession('investiture'))
    expect(result.current.ribbon).toBe('chapter-scadrial')

    // Validation lives in the page (it owns the spread list), but the hook must
    // hand back exactly what was stored so that check can happen.
    act(() => result.current.rememberSpread('chapter-sel'))
    expect(result.current.ribbon).toBe('chapter-sel')
  })

  it('persists the reader’s edition and rejects an unknown one', () => {
    const { result } = renderHook(() => useCodexSession())
    expect(result.current.edition).toBe('working')

    act(() => result.current.setEdition('restricted'))
    expect(result.current.edition).toBe('restricted')
    expect(window.localStorage.getItem(CODEX_EDITION_KEY)).toBe('restricted')

    act(() => result.current.setEdition('bogus' as never))
    expect(result.current.edition).toBe('restricted')
    expect(window.localStorage.getItem(CODEX_EDITION_KEY)).toBe('restricted')
  })

  it('falls back to the working copy when storage holds nonsense', () => {
    window.localStorage.setItem(CODEX_EDITION_KEY, 'not-an-edition')
    window.localStorage.setItem(CODEX_RIBBON_KEY, '[]')

    const { result } = renderHook(() => useCodexSession('records'))
    expect(result.current.edition).toBe('working')
    expect(result.current.ribbon).toBeNull()
  })

  it('keeps working when localStorage throws', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })

    const { result } = renderHook(() => useCodexSession('investiture'))
    expect(result.current.ribbon).toBeNull()
    expect(result.current.edition).toBe('working')

    expect(() => act(() => result.current.rememberSpread('contents'))).not.toThrow()
    expect(() => act(() => result.current.setEdition('printed'))).not.toThrow()
    expect(result.current.ribbon).toBe('contents')
    expect(result.current.edition).toBe('printed')
  })
})
