import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLANETS, BOOKS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { HERALDS } from '@/data/static/heralds'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { SEARCH_DEBOUNCE_MS, PLACEHOLDER_ROTATE_MS } from '@/constants'
import type { SearchResult } from '@/types/search'

const MAX_PER_CATEGORY = 4
const MAX_RECENT = 5
const RECENT_KEY = 'cosmere-recent-searches'

const CAT_LABELS: Record<string, string> = {
  planet: 'Planets',
  character: 'Characters',
  worldhopper: 'Worldhoppers',
  event: 'Events',
  book: 'Books',
  glossary: 'Glossary',
  magic: 'Magic Systems',
  herald: 'Heralds',
}

const PLACEHOLDERS = [
  'Search planets, characters, events...',
  'Which planet is Preservation on?',
  'Find a worldhopper...',
  'Search by book title...',
  'Look up a character...',
]

function addRecent(label: string, setRecent: (v: string[] | ((prev: string[]) => string[])) => void) {
  setRecent((prev) => [label, ...prev.filter((s) => s !== label)].slice(0, MAX_RECENT))
}

function headerFor(type: SearchResult['type']): SearchResult {
  return { type: 'header', label: CAT_LABELS[type] ?? type, sublabel: '', action: () => {} }
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]!)
  const [recent, setRecent] = useLocalStorage<string[]>(RECENT_KEY, [])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholder((prev) => {
        const idx = PLACEHOLDERS.indexOf(prev)
        return PLACEHOLDERS[(idx + 1) % PLACEHOLDERS.length]!
      })
    }, PLACEHOLDER_ROTATE_MS)
    return () => clearInterval(timer)
  }, [])

  const runSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim().toLowerCase()
      if (!trimmed) {
        setResults([])
        setOpen(false)
        return
      }

      const match = (text: string) => text.toLowerCase().includes(trimmed)

      const hits: SearchResult[] = []
      const counts: Record<string, number> = {}

      function addCategory(type: SearchResult['type'], items: SearchResult[]) {
        if (items.length === 0) return
        if (hits.length > 0) hits.push(headerFor(type))
        hits.push(...items)
        counts[type] = items.length
      }

      const planets: SearchResult[] = []
      for (const p of PLANETS) {
        if (planets.length >= MAX_PER_CATEGORY) break
        if (match(p.name) || (p.shard && match(p.shard)) || (p.description && match(p.description))) {
          planets.push({
            type: 'planet',
            label: p.name,
            sublabel: p.shard || '',
            action: () => navigate('/map?focus=planet&id=' + p.id),
          })
        }
      }
      addCategory('planet', planets)

      const chars: SearchResult[] = []
      for (const c of CHARACTER_SPANS) {
        if (chars.length >= MAX_PER_CATEGORY) break
        if (match(c.name) || c.titles.some((t) => match(t))) {
          chars.push({
            type: 'character',
            label: c.name,
            sublabel: c.planet + ' — ' + c.titles[0],
            action: () => navigate('/map?focus=character&id=' + c.id + '&planet=' + c.planet.toLowerCase()),
          })
        }
      }
      addCategory('character', chars)

      const whs: SearchResult[] = []
      for (const wh of WORLDHOPPER_MOVEMENTS) {
        if (whs.length >= MAX_PER_CATEGORY) break
        if (match(wh.name)) {
          whs.push({
            type: 'worldhopper',
            label: wh.name,
            sublabel: wh.movements.length + ' movements',
            action: () => navigate('/map?focus=worldhopper&id=' + wh.id),
          })
        }
      }
      addCategory('worldhopper', whs)

      const events: SearchResult[] = []
      for (const e of TIMELINE_EVENTS) {
        if (events.length >= MAX_PER_CATEGORY) break
        if (match(e.title) || match(e.description)) {
          events.push({
            type: 'event',
            label: e.title,
            sublabel: e.saga + ' — ' + e.year,
            action: () => navigate('/map?focus=event&id=' + e.id),
          })
        }
      }
      addCategory('event', events)

      const books: SearchResult[] = []
      for (const b of BOOKS) {
        if (books.length >= MAX_PER_CATEGORY) break
        if (match(b.title) || (b.description && match(b.description))) {
          books.push({
            type: 'book',
            label: b.title,
            sublabel: b.saga,
            action: () => navigate('/map?focus=book&id=' + b.id),
          })
        }
      }
      addCategory('book', books)

      const magic: SearchResult[] = []
      for (const m of MAGIC_SYSTEMS) {
        if (magic.length >= MAX_PER_CATEGORY) break
        if (match(m.name) || match(m.description)) {
          magic.push({
            type: 'magic',
            label: m.name,
            sublabel: m.planetId + ' — ' + m.shard,
            action: () => navigate('/magic'),
          })
        }
      }
      addCategory('magic', magic)

      const heralds: SearchResult[] = []
      for (const h of HERALDS) {
        if (heralds.length >= MAX_PER_CATEGORY) break
        if (match(h.name) || match(h.title) || h.surges.some((s) => match(s))) {
          heralds.push({
            type: 'herald',
            label: h.name,
            sublabel: h.title,
            action: () => navigate('/heralds'),
          })
        }
      }
      addCategory('herald', heralds)

      setResults(hits)
      setOpen(hits.length > 0)
      setHighlightIdx(-1)
    },
    [navigate],
  )

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
  }, [])

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return
      const skipHeaders = (idx: number, dir: 1 | -1): number => {
        let next = idx + dir
        while (next >= 0 && next < results.length && results[next]?.type === 'header') next += dir
        return Math.max(0, Math.min(next, results.length - 1))
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIdx((i) => skipHeaders(i, 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIdx((i) => skipHeaders(i, -1))
      }
      if (e.key === 'Enter' && highlightIdx >= 0 && results[highlightIdx]?.type !== 'header') {
        results[highlightIdx]!.action()
        close()
      }
      if (e.key === 'Escape') {
        close()
        inputRef.current?.blur()
      }
      if (e.key === 'Tab') {
        close()
      }
    },
    [open, results, highlightIdx, close],
  )

  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return
    const el = listRef.current.children[highlightIdx]
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' })
  }, [highlightIdx])

  return {
    query,
    setQuery,
    results,
    open,
    setOpen,
    highlightIdx,
    setHighlightIdx,
    placeholder,
    recent,
    setRecent,
    inputRef,
    listRef,
    close,
    handleKey,
    onFocus: useCallback(() => {
      if (results.length) setOpen(true)
      else if (!query.trim() && recent.length) {
        setOpen(true)
      }
    }, [results.length, query, recent, setOpen]),
    onSelect: useCallback(
      (label: string, action: () => void) => {
        addRecent(label, setRecent)
        action()
        close()
      },
      [close, setRecent],
    ),
    clearRecent: useCallback(() => setRecent([]), [setRecent]),
  }
}
