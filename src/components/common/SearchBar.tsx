import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLANETS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { BOOKS } from '@/data/static/books'

interface SearchResult {
  type: 'planet' | 'character' | 'worldhopper' | 'event' | 'book' | 'header'
  label: string
  sublabel: string
  action: () => void
}

const MAX_PER_CATEGORY = 4
const MAX_RECENT = 5
const RECENT_KEY = 'cosmere-recent-searches'

const CAT_LABELS: Record<string, string> = {
  planet: 'Planets', character: 'Characters', worldhopper: 'Worldhoppers',
  event: 'Events', book: 'Books',
}

const PLACEHOLDERS = [
  'Search planets, characters, events...',
  'Which planet is Preservation on?',
  'Find a worldhopper...',
  'Search by book title...',
  'Look up a character...',
]

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRecent(items: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(items)) } catch { /* noop */ }
}

function addRecent(label: string) {
  const prev = loadRecent().filter(s => s !== label)
  saveRecent([label, ...prev].slice(0, MAX_RECENT))
}

function headerFor(type: SearchResult['type']): SearchResult {
  return { type: 'header', label: CAT_LABELS[type] ?? type, sublabel: '', action: () => {} }
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]!)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => { setRecent(loadRecent()) }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholder(prev => {
        const idx = PLACEHOLDERS.indexOf(prev)
        return PLACEHOLDERS[(idx + 1) % PLACEHOLDERS.length] ?? PLACEHOLDERS[0]!
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim().toLowerCase()
    if (!trimmed) { setResults([]); setOpen(false); return }

    const match = (text: string) => text.toLowerCase().includes(trimmed)

    const hits: SearchResult[] = []
    const counts: Record<string, number> = {}

    function addCategory(type: SearchResult['type'], items: SearchResult[]) {
      if (items.length === 0) return
      if (hits.length > 0) hits.push(headerFor(type))
      hits.push(...items)
      counts[type] = items.length
    }

    // Planets
    const planets: SearchResult[] = []
    for (const p of PLANETS) {
      if (planets.length >= MAX_PER_CATEGORY) break
      if (match(p.name) || (p.shard && match(p.shard)) || (p.description && match(p.description))) {
        planets.push({
          type: 'planet', label: p.name, sublabel: p.shard || '',
          action: () => navigate('/?focus=planet&id=' + p.id),
        })
      }
    }
    addCategory('planet', planets)

    // Characters
    const chars: SearchResult[] = []
    for (const c of CHARACTER_SPANS) {
      if (chars.length >= MAX_PER_CATEGORY) break
      if (match(c.name) || c.titles.some(t => match(t))) {
        chars.push({
          type: 'character', label: c.name, sublabel: c.planet + ' — ' + c.titles[0],
          action: () => navigate('/?focus=character&id=' + c.id + '&planet=' + c.planet.toLowerCase()),
        })
      }
    }
    addCategory('character', chars)

    // Worldhoppers
    const whs: SearchResult[] = []
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      if (whs.length >= MAX_PER_CATEGORY) break
      if (match(wh.name)) {
        whs.push({
          type: 'worldhopper', label: wh.name, sublabel: wh.movements.length + ' movements',
          action: () => navigate('/?focus=worldhopper&id=' + wh.id),
        })
      }
    }
    addCategory('worldhopper', whs)

    // Events
    const events: SearchResult[] = []
    for (const e of TIMELINE_EVENTS) {
      if (events.length >= MAX_PER_CATEGORY) break
      if (match(e.title) || match(e.description)) {
        events.push({
          type: 'event', label: e.title, sublabel: e.saga + ' — ' + e.year,
          action: () => navigate('/?focus=event&id=' + e.id),
        })
      }
    }
    addCategory('event', events)

    // Books
    const books: SearchResult[] = []
    for (const b of BOOKS) {
      if (books.length >= MAX_PER_CATEGORY) break
      if (match(b.title) || (b.description && match(b.description))) {
        books.push({
          type: 'book', label: b.title, sublabel: b.saga,
          action: () => navigate('/?focus=book&id=' + b.id),
        })
      }
    }
    addCategory('book', books)

    setResults(hits)
    setOpen(hits.length > 0)
    setHighlightIdx(-1)
    setRecent([])
  }, [navigate])

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  const close = useCallback(() => { setOpen(false); setQuery(''); setResults([]); setRecent(loadRecent()) }, [])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    const skipHeaders = (idx: number, dir: 1 | -1): number => {
      let next = idx + dir
      while (next >= 0 && next < results.length && results[next]?.type === 'header') next += dir
      return Math.max(0, Math.min(next, results.length - 1))
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => skipHeaders(i, 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => skipHeaders(i, -1)) }
    if (e.key === 'Enter' && highlightIdx >= 0 && results[highlightIdx]?.type !== 'header') { results[highlightIdx]!.action(); close() }
    if (e.key === 'Escape') { close(); inputRef.current?.blur() }
    if (e.key === 'Tab') { close() }
  }, [open, results, highlightIdx, close])

  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return
    const el = listRef.current.children[highlightIdx]
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' })
  }, [highlightIdx])

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-gray-700/60 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-300 transition-all focus-within:border-purple-500/60 focus-within:bg-gray-900">
        <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <label htmlFor="cosmere-search" className="sr-only">Search the Cosmere</label>
        <input
          id="cosmere-search"
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length) setOpen(true)
            else if (!query.trim()) {
              const r = loadRecent()
              if (r.length) { setRecent(r); setOpen(true) }
            }
          }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={highlightIdx >= 0 && results[highlightIdx]?.type !== 'header' ? `search-opt-${highlightIdx}` : undefined}
          className="w-full bg-transparent outline-none placeholder:text-gray-600"
        />
        {query && (
          <button onClick={close} aria-label="Clear search" className="text-gray-600 hover:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {open ? `${results.length} result${results.length === 1 ? '' : 's'} found.` : ''}
      </div>

      {open && (
        <div
          id="search-results"
          className="fixed left-2 right-2 top-auto z-50 mt-2 w-auto overflow-hidden rounded-xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:w-80 lg:w-96"
          onMouseDown={e => e.preventDefault()}
          role="listbox"
        >
          <div ref={listRef} className="max-h-80 overflow-y-auto py-1" role="presentation">
            {results.length > 0 ? results.map((r, i) => {
              if (r.type === 'header') {
                return (
                  <div key={r.label} className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    {r.label}
                  </div>
                )
              }
              const idx = i
              return (
                <button
                  key={r.type + r.label}
                  id={`search-opt-${idx}`}
                  onClick={() => { addRecent(r.label); r.action(); close() }}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  role="option"
                  aria-selected={highlightIdx === idx}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    highlightIdx === idx ? 'bg-purple-900/40 text-white' : 'text-gray-300 hover:bg-gray-800/60'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{iconFor(r.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.label}</div>
                    <div className="truncate text-xs text-gray-500">{r.sublabel}</div>
                  </div>
                </button>
              )
            }) : recent.length > 0 && !query.trim() ? (
              <div>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Recent</span>
                  <button
                    onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]) }}
                    className="text-[10px] text-gray-600 hover:text-gray-400"
                  >
                    Clear
                  </button>
                </div>
                {recent.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); setRecent([]) }}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800/60"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function iconFor(type: SearchResult['type']) {
  const cls = "h-4 w-4 shrink-0 text-gray-500"
  switch (type) {
    case 'planet':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="10" strokeDasharray="3 3"/></svg>
    case 'character':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 016-6h4a6 6 0 016 6v2"/></svg>
    case 'worldhopper':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z"/></svg>
    case 'event':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    case 'book':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
  }
}
