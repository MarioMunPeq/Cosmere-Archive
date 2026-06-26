import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { GlossaryCategory } from '@/types/glossary'
import { GLOSSARY_ENTRIES } from '@/data/static/glossary'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/glossary'
import { useElementWidth } from '@/hooks/useResizeObserver'
import { useTextFilter } from '@/hooks/useTextFilter'

const CATEGORIES: GlossaryCategory[] = ['shard', 'magic', 'concept', 'group', 'event', 'phenomenon']

function TermCard({
  entry,
  expanded,
  onToggle,
  onSearch,
}: {
  entry: (typeof GLOSSARY_ENTRIES)[number]
  expanded: boolean
  onToggle: () => void
  onSearch: (term: string) => void
}) {
  const navigate = useNavigate()
  return (
    <div
      className={`cursor-pointer rounded-lg border px-3.5 py-2.5 transition-colors ${
        expanded
          ? 'border-purple-500/40 bg-purple-900/15'
          : 'border-gray-700/40 bg-gray-800/40 hover:border-gray-600/60'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle()
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-200">{entry.term}</span>
        <span
          className="rounded px-1.5 py-0.5 text-xxs font-medium"
          style={{ backgroundColor: CATEGORY_COLORS[entry.category] + '20', color: CATEGORY_COLORS[entry.category] }}
        >
          {CATEGORY_LABELS[entry.category]}
        </span>
      </div>
      <p className={`mt-1 text-xs leading-relaxed text-gray-500 ${expanded ? '' : 'line-clamp-2'}`}>
        {entry.definition}
      </p>
      {expanded && entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.relatedTerms.map((rel) => {
            const related = GLOSSARY_ENTRIES.find((e) => e.id === rel)
            if (!related) return null
            return (
              <button
                key={rel}
                onClick={(e) => {
                  e.stopPropagation()
                  onSearch(related.term)
                }}
                className="rounded bg-gray-700/40 px-2 py-0.5 text-xxs text-purple-400 transition-colors hover:bg-gray-700/80"
              >
                {related.term}
              </button>
            )
          })}
        </div>
      )}
      {expanded && entry.planet && (
        <p className="mt-1.5 text-xxs text-gray-600">
          Planet:{' '}
          <span
            role="link"
            tabIndex={0}
            className="cursor-pointer capitalize text-cyan-400 hover:text-cyan-300"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/?focus=planet&id=${entry.planet}`)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                navigate(`/?focus=planet&id=${entry.planet}`)
              }
            }}
          >
            {entry.planet.replace(/_/g, ' ')}
          </span>
        </p>
      )}
    </div>
  )
}

export default function GlossaryPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridWidth = useElementWidth(gridRef)
  const columns = gridWidth < 640 ? 1 : gridWidth < 1024 ? 2 : 3

  const textFiltered = useTextFilter(GLOSSARY_ENTRIES, search, ['term', 'definition', 'category'])
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return textFiltered
    return textFiltered.filter((e) => e.category === activeCategory)
  }, [textFiltered, activeCategory])

  const rows = useMemo(() => {
    const r: (typeof GLOSSARY_ENTRIES)[number][][] = []
    for (let i = 0; i < filtered.length; i += columns) {
      r.push(filtered.slice(i, i + columns))
    }
    return r
  }, [filtered, columns])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 3,
  })

  function handleSearch(term: string) {
    setSearch(term)
    setExpandedId(null)
  }

  return (
    <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Glossary</h1>
        <input
          type="search"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-44 rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-purple-500/50 sm:w-56"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-purple-700/40 text-purple-300'
              : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
          }`}
        >
          All ({GLOSSARY_ENTRIES.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = GLOSSARY_ENTRIES.filter((e) => e.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                activeCategory === cat ? 'text-gray-100' : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
              }`}
              style={{
                backgroundColor: activeCategory === cat ? CATEGORY_COLORS[cat] + '30' : undefined,
                color: activeCategory === cat ? CATEGORY_COLORS[cat] : undefined,
              }}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          )
        })}
      </div>

      <div ref={gridRef} className="relative flex-1" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index]!
          return (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 right-0 flex gap-2"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {Array.from({ length: columns }).map((_, col) => {
                const entry = rowItems[col]
                if (!entry) return <div key={`spacer-${col}`} className="flex-1" />
                return (
                  <div key={entry.id} className="flex-1" style={{ minWidth: 0 }}>
                    <TermCard
                      entry={entry}
                      expanded={expandedId === entry.id}
                      onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      onSearch={handleSearch}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">No glossary terms match your search.</p>
      )}
    </div>
  )
}
