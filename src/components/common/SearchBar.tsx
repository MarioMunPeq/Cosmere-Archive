import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLANETS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { BOOKS } from '@/data/static/books'

interface SearchResult {
  type: 'planet' | 'character' | 'worldhopper' | 'event' | 'book'
  label: string
  sublabel: string
  action: () => void
}

const MAX_PER_CATEGORY = 4

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim().toLowerCase()
    if (!trimmed) { setResults([]); setOpen(false); return }

    const hits: SearchResult[] = []
    const add = (r: SearchResult) => { if (hits.length < MAX_PER_CATEGORY * 5) hits.push(r) }

    const match = (text: string) => text.toLowerCase().includes(trimmed)

    // Planets
    let planetCount = 0
    for (const p of PLANETS) {
      if (planetCount >= MAX_PER_CATEGORY) break
      if (match(p.name) || (p.shard && match(p.shard)) || (p.description && match(p.description))) {
        add({
          type: 'planet', label: p.name, sublabel: p.shard || '',
          action: () => navigate('/?focus=planet&id=' + p.id),
        })
        planetCount++
      }
    }

    // Characters
    let charCount = 0
    for (const c of CHARACTER_SPANS) {
      if (charCount >= MAX_PER_CATEGORY) break
      if (match(c.name) || c.titles.some(t => match(t))) {
        add({
          type: 'character', label: c.name, sublabel: c.planet + ' — ' + c.titles[0],
          action: () => navigate('/?focus=character&id=' + c.id + '&planet=' + c.planet.toLowerCase()),
        })
        charCount++
      }
    }

    // Worldhoppers
    let whCount = 0
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      if (whCount >= MAX_PER_CATEGORY) break
      if (match(wh.name)) {
        add({
          type: 'worldhopper', label: wh.name, sublabel: wh.movements.length + ' movements',
          action: () => navigate('/?focus=worldhopper&id=' + wh.id),
        })
        whCount++
      }
    }

    // Events
    let evCount = 0
    for (const e of TIMELINE_EVENTS) {
      if (evCount >= MAX_PER_CATEGORY) break
      if (match(e.title) || match(e.description)) {
        add({
          type: 'event', label: e.title, sublabel: e.saga + ' — ' + e.year,
          action: () => navigate('/?focus=event&id=' + e.id),
        })
        evCount++
      }
    }

    // Books
    let bookCount = 0
    for (const b of BOOKS) {
      if (bookCount >= MAX_PER_CATEGORY) break
      if (match(b.title) || (b.description && match(b.description))) {
        add({
          type: 'book', label: b.title, sublabel: b.saga,
          action: () => navigate('/?focus=book&id=' + b.id),
        })
        bookCount++
      }
    }

    setResults(hits)
    setOpen(hits.length > 0)
    setHighlightIdx(-1)
  }, [navigate])

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  const close = useCallback(() => { setOpen(false); setQuery(''); setResults([]) }, [])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && highlightIdx >= 0) { results[highlightIdx].action(); close() }
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
          onFocus={() => { if (results.length) setOpen(true) }}
          onKeyDown={handleKey}
          placeholder="Search planets, characters, events..."
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
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
            {results.length > 0 ? results.map((r, i) => (
              <button
                key={r.type + r.label}
                onClick={() => { r.action(); close() }}
                onMouseEnter={() => setHighlightIdx(i)}
                role="option"
                aria-selected={i === highlightIdx}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === highlightIdx ? 'bg-purple-900/40 text-white' : 'text-gray-300 hover:bg-gray-800/60'
                }`}
              >
                <span className="mt-0.5 shrink-0">{iconFor(r.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.label}</div>
                  <div className="truncate text-xs text-gray-500">{r.sublabel}</div>
                </div>
              </button>
            )) : (
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
