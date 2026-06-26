import type { RefObject } from 'react'

interface Props {
  query: string
  placeholder: string
  open: boolean
  highlightIdx: number
  resultCount: number
  inputRef: RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onClear: () => void
}

export default function SearchInput({
  query,
  placeholder,
  open,
  highlightIdx,
  resultCount,
  inputRef,
  onQueryChange,
  onFocus,
  onKeyDown,
  onClear,
}: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-700/60 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-300 transition-all focus-within:border-purple-500/60 focus-within:bg-gray-900">
      <svg
        className="h-4 w-4 shrink-0 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <label htmlFor="cosmere-search" className="sr-only">
        Search the Cosmere
      </label>
      <input
        id="cosmere-search"
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results"
        aria-autocomplete="list"
        aria-activedescendant={highlightIdx >= 0 && resultCount > 0 ? `search-opt-${highlightIdx}` : undefined}
        className="w-full bg-transparent outline-none placeholder:text-gray-600"
      />
      {query && (
        <button onClick={onClear} aria-label="Clear search" className="text-gray-600 hover:text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
