import type { RefObject } from 'react'
import type { SearchResult } from '@/types/search'
import { SearchIcon } from '@/components/common/icons'
import EmptyState from '@/components/ui/EmptyState'

interface Props {
  results: SearchResult[]
  open: boolean
  highlightIdx: number
  recent: string[]
  showRecent: boolean
  listRef: RefObject<HTMLDivElement | null>
  onHighlight: (idx: number) => void
  onSelect: (label: string, action: () => void) => void
  onRecentClick: (label: string) => void
  onClearRecent: () => void
}

export default function SearchResultsList({
  results,
  open,
  highlightIdx,
  recent,
  showRecent,
  listRef,
  onHighlight,
  onSelect,
  onRecentClick,
  onClearRecent,
}: Props) {
  if (!open) return null

  return (
    <div
      id="search-results"
      className="fixed left-2 right-2 top-auto z-50 mt-2 w-auto overflow-hidden shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:w-80 lg:w-96"
      style={{
        backgroundColor: '#f5efe6',
        border: '0.5px solid rgba(180,150,100,0.2)',
        borderRadius: '2px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
      }}
      onMouseDown={(e) => e.preventDefault()}
      role={results.length > 0 ? 'listbox' : 'dialog'}
      aria-label="Search results"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'} found.` : ''}
      </div>
      <div ref={listRef} className="max-h-80 overflow-y-auto" role="presentation">
        {results.length > 0 ? (
          results.map((r, i) => {
            if (r.type === 'header') {
              return (
                <div
                  key={r.label}
                  className="px-4 py-1.5 text-xxs font-semibold uppercase tracking-wider"
                  style={{ color: '#8a7a6a' }}
                >
                  {r.label}
                </div>
              )
            }
            const idx = i
            return (
              <button
                key={r.type + r.label}
                id={`search-opt-${idx}`}
                onClick={() => onSelect(r.label, r.action)}
                onMouseEnter={() => {
                  onHighlight(idx)
                }}
                role="option"
                aria-selected={highlightIdx === idx}
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  color: highlightIdx === idx ? '#2d1a0e' : '#5a4a3a',
                  backgroundColor: highlightIdx === idx ? 'rgba(184,137,48,0.12)' : 'transparent',
                }}
                onMouseLeave={(e) => {
                  if (highlightIdx !== idx) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: '#8a7a6a' }}>
                  <SearchIcon type={r.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.label}</div>
                  <div className="truncate text-xs" style={{ color: '#8a7a6a' }}>
                    {r.sublabel}
                  </div>
                </div>
              </button>
            )
          })
        ) : showRecent && recent.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xxs font-semibold uppercase tracking-wider" style={{ color: '#8a7a6a' }}>
                Recent
              </span>
              <button
                onClick={onClearRecent}
                className="text-xxs transition-colors"
                style={{ color: '#8a7a6a' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = '#5a4a3a'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = '#8a7a6a'
                }}
              >
                Clear
              </button>
            </div>
            {recent.map((s, i) => (
              <button
                key={s}
                onClick={() => onRecentClick(s)}
                onMouseEnter={(e) => {
                  onHighlight(i)
                  e.currentTarget.style.color = '#5a4a3a'
                  e.currentTarget.style.backgroundColor = 'rgba(160,140,110,0.08)'
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors"
                style={{ color: '#8a7a6a' }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8a7a6a'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  style={{ color: '#8a7a6a' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s}
              </button>
            ))}
          </div>
        ) : (
          <EmptyState message="No results found" />
        )}
      </div>
    </div>
  )
}
