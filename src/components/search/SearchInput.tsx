import type { RefObject } from 'react'
import { IconSearch, CloseIcon } from '@/components/common/icons'

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
      <IconSearch className="shrink-0 text-gray-500" />
      <kbd className="hidden shrink-0 rounded border border-gray-700 px-1 text-xs text-gray-600 sm:inline">Ctrl+K</kbd>
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
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  )
}
