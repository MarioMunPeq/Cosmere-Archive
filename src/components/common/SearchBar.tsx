import { useSearch } from '@/hooks/useSearch'
import SearchInput from '@/components/search/SearchInput'
import SearchResultsList from '@/components/search/SearchResultsList'

export default function SearchBar() {
  const {
    query,
    setQuery,
    results,
    open,
    highlightIdx,
    setHighlightIdx,
    placeholder,
    recent,
    setRecent,
    inputRef,
    listRef,
    close,
    handleKey,
    onFocus,
    onSelect,
  } = useSearch()

  return (
    <div className="relative">
      <SearchInput
        query={query}
        placeholder={placeholder}
        open={open}
        highlightIdx={highlightIdx}
        resultCount={results.length}
        inputRef={inputRef}
        onQueryChange={setQuery}
        onFocus={onFocus}
        onKeyDown={handleKey}
        onClear={close}
      />
      <SearchResultsList
        results={results}
        open={open}
        highlightIdx={highlightIdx}
        recent={recent}
        showRecent={!query.trim()}
        listRef={listRef}
        onHighlight={setHighlightIdx}
        onSelect={onSelect}
        onRecentClick={(s) => {
          setQuery(s)
          setRecent([])
        }}
        onClearRecent={() => {
          localStorage.removeItem('cosmere-recent-searches')
          setRecent([])
        }}
      />
    </div>
  )
}
