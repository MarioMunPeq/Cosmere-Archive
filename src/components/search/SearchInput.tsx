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
    <div
      className="flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-all"
      style={{
        borderColor: 'rgba(180,150,100,0.15)',
        backgroundColor: 'rgba(245,239,230,0.35)',
        color: '#5a4a3a',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'rgba(180,150,100,0.35)'
        e.currentTarget.style.backgroundColor = 'rgba(245,239,230,0.5)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(180,150,100,0.15)'
        e.currentTarget.style.backgroundColor = 'rgba(245,239,230,0.35)'
      }}
    >
      <span style={{ color: '#8a7a6a' }}>
        <IconSearch className="shrink-0" />
      </span>
      <kbd
        className="hidden shrink-0 rounded-sm border px-1 text-xs sm:inline"
        style={{ borderColor: 'rgba(180,150,100,0.15)', color: '#8a7a6a' }}
      >
        Ctrl+K
      </kbd>
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
        className="w-full bg-transparent outline-none"
        style={{ color: '#5a4a3a' }}
        onFocusCapture={(e) => {
          ;(e.currentTarget as HTMLInputElement).style.color = '#2d1a0e'
        }}
        onBlurCapture={(e) => {
          ;(e.currentTarget as HTMLInputElement).style.color = '#5a4a3a'
        }}
      />
      {query && (
        <button onClick={onClear} aria-label="Clear search" style={{ color: '#8a7a6a' }}>
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  )
}
