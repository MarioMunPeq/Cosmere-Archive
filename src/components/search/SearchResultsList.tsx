import type { RefObject } from 'react'
import type { SearchResult } from '@/hooks/useSearch'
import SearchIcon from './SearchIcon'

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
      className="fixed left-2 right-2 top-auto z-50 mt-2 w-auto overflow-hidden rounded-xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:w-80 lg:w-96"
      onMouseDown={(e) => e.preventDefault()}
      role={results.length > 0 ? 'listbox' : 'dialog'}
      aria-label="Search results"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'} found.` : ''}
      </div>
      <div ref={listRef} className="max-h-80 overflow-y-auto py-1" role="presentation">
        {results.length > 0 ? (
          results.map((r, i) => {
            if (r.type === 'header') {
              return (
                <div
                  key={r.label}
                  className="px-4 py-1.5 text-xxs font-semibold uppercase tracking-wider text-gray-600"
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
                onMouseEnter={() => onHighlight(idx)}
                role="option"
                aria-selected={highlightIdx === idx}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  highlightIdx === idx ? 'bg-purple-900/40 text-white' : 'text-gray-300 hover:bg-gray-800/60'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  <SearchIcon type={r.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.label}</div>
                  <div className="truncate text-xs text-gray-500">{r.sublabel}</div>
                </div>
              </button>
            )
          })
        ) : showRecent && recent.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xxs font-semibold uppercase tracking-wider text-gray-600">Recent</span>
              <button onClick={onClearRecent} className="text-xxs text-gray-600 hover:text-gray-400">
                Clear
              </button>
            </div>
            {recent.map((s, i) => (
              <button
                key={s}
                onClick={() => onRecentClick(s)}
                onMouseEnter={() => onHighlight(i)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800/60"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">No results found</div>
        )}
      </div>
    </div>
  )
}
