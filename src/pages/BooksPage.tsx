import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, SAGAS } from '@/data/static'
import BookCover from '@/components/common/BookCover'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

function groupBySaga(books: typeof BOOKS) {
  const map = new Map<string, typeof BOOKS>()
  for (const book of books) {
    const existing = map.get(book.saga)
    if (existing) existing.push(book)
    else map.set(book.saga, [book])
  }
  return map
}

export default function BooksPage() {
  const [selectedSaga, setSelectedSaga] = useState<string | null>(null)

  useSEOMeta({
    title: 'Books — Cosmere Archive',
    description: 'Browse all Cosmere books by Brandon Sanderson, organized by saga and reading order',
  })

  const sagaOptions = useMemo(
    () => SAGAS.filter((s) => BOOKS.some((b) => b.saga === s.id)).sort((a, b) => a.order - b.order),
    [],
  )

  const filteredBooks = useMemo(() => {
    if (!selectedSaga) return BOOKS
    return BOOKS.filter((b) => b.saga === selectedSaga)
  }, [selectedSaga])

  const [query, setQuery] = useState('')
  const searched = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return filteredBooks
    return filteredBooks.filter(
      (b) => b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q)),
    )
  }, [filteredBooks, query])

  const grouped = useMemo(() => groupBySaga(searched), [searched])
  const sortedGroups = useMemo(
    () =>
      Array.from(grouped.entries()).sort(([aId], [bId]) => {
        const aSaga = SAGAS.find((s) => s.id === aId)
        const bSaga = SAGAS.find((s) => s.id === bId)
        return (aSaga?.order ?? 0) - (bSaga?.order ?? 0)
      }),
    [grouped],
  )

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>

        <h1 className="text-3xl font-bold text-gray-100">Books</h1>
        <p className="mt-1 text-sm text-gray-500">All Cosmere books, grouped by saga</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedSaga(null)
              setQuery('')
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedSaga === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            All
          </button>
          {sagaOptions.map((saga) => (
            <button
              key={saga.id}
              onClick={() => {
                setSelectedSaga(saga.id)
                setQuery('')
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedSaga === saga.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {saga.name}
            </button>
          ))}
        </div>

        <div className="relative mt-4">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books..."
            aria-label="Search books"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {sortedGroups.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">No books match your search.</p>
        )}

        {sortedGroups.map(([sagaId, books]) => {
          const saga = SAGAS.find((s) => s.id === sagaId)
          return (
            <section key={sagaId} className="mt-8">
              <h2 className="text-lg font-semibold text-gray-200">{saga?.name ?? sagaId}</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 transition-colors hover:border-purple-700/50 hover:bg-gray-900"
                  >
                    <BookCover book={book} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-200">{book.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500">#{book.order}</div>
                      {book.year && <div className="mt-0.5 text-xs text-gray-600">{book.year}</div>}
                      {book.description && (
                        <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{book.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </PageLayout>
  )
}
