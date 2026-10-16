import { useMemo, useState } from 'react'
import TransitionLink from '@/components/ui/TransitionLink'
import EmptyState from '@/components/primitives/EmptyState'
import Button from '@/components/primitives/Button'
import { BOOKS, SAGAS, SAGA_NAME_COLORS } from '@/data/static'
import { IconSearch, CloseIcon } from '@/components/common/icons'
import BookCover from '@/components/common/BookCover'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const BG_STARS = Array.from({ length: 20 }, (_, i) => ({
  left: `${((i * 13.7 + 5.3) % 100).toFixed(1)}%`,
  top: `${((i * 19.1 + 3.7) % 100).toFixed(1)}%`,
  delay: `${((i * 0.6) % 4).toFixed(1)}s`,
  size: i % 3 === 0 ? 'h-0.5 w-0.5' : 'h-px w-px',
  opacity: 0.03 + ((i * 0.15) % 0.12),
}))

export default function BooksPage() {
  const [selectedSaga, setSelectedSaga] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useSEOMeta({
    title: 'Books — Cosmere Archive',
    description: 'Browse all Cosmere books by Brandon Sanderson, organized by saga and reading order',
  })

  const sagaOptions = useMemo(
    () => SAGAS.filter((s) => BOOKS.some((b) => b.saga === s.id)).sort((a, b) => a.order - b.order),
    [],
  )

  const filtered = useMemo(() => {
    let books = BOOKS
    if (selectedSaga) books = books.filter((b) => b.saga === selectedSaga)
    const q = query.toLowerCase().trim()
    if (!q) return books
    return books.filter(
      (b) => b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q)),
    )
  }, [selectedSaga, query])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {BG_STARS.map((s, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white animate-twinkle-slow ${s.size}`}
            style={{ left: s.left, top: s.top, animationDelay: s.delay, opacity: s.opacity }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setSelectedSaga(null)
                setQuery('')
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                selectedSaga === null
                  ? 'bg-gradient-to-r from-cyan-700/40 to-purple-700/40 text-cyan-200 shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500/30'
                  : 'ring-1 hover:opacity-80'
              }`}
              style={
                selectedSaga === null
                  ? undefined
                  : { background: 'rgba(80,60,40,0.06)', color: '#8a7050', boxShadow: '0 0 0 1px rgba(80,60,40,0.15)' }
              }
            >
              All
            </button>
            {sagaOptions.map((saga) => {
              const sagaName = saga.name
              const color = SAGA_NAME_COLORS[sagaName] ?? '#6b7280'
              return (
                <button
                  key={saga.id}
                  onClick={() => {
                    setSelectedSaga(saga.id)
                    setQuery('')
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                    selectedSaga === saga.id ? 'text-white shadow-lg ring-1 ring-inset' : 'ring-1 hover:opacity-80'
                  }`}
                  style={
                    selectedSaga === saga.id
                      ? { backgroundColor: `${color}25`, borderColor: `${color}50`, boxShadow: `0 0 12px ${color}20` }
                      : {
                          background: 'rgba(80,60,40,0.06)',
                          color: '#8a7050',
                          boxShadow: '0 0 0 1px rgba(80,60,40,0.15)',
                        }
                  }
                >
                  {sagaName}
                </button>
              )
            })}
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8a7050' }}>
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books..."
              aria-label="Search books"
              className="w-44 rounded-lg px-3 py-1.5 pl-9 text-xs placeholder:text-[#a09070]/50 outline-none transition-all focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-900/10 sm:w-48"
              style={{ border: '1px solid rgba(80,60,40,0.2)', background: 'rgba(80,60,40,0.06)', color: '#5a4a3a' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-80"
                style={{ color: '#8a7050' }}
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            toneMode="paper"
            title="No volumes match that filter"
            description="Every book in the archive is listed here. Clear the filter to see all twenty-two."
            action={
              <Button tone="paper" size="sm" variant="secondary" onClick={() => setQuery('')}>
                Clear filter
              </Button>
            }
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book, i) => {
            const sagaName = SAGAS.find((s) => s.id === book.saga)?.name ?? book.saga
            const color = SAGA_NAME_COLORS[sagaName] ?? '#6b7280'
            return (
              <TransitionLink
                key={book.id}
                to={`/books/${book.id}`}
                className="group flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 animate-fade-in-up"
                style={{
                  animationDelay: `${(i * 0.06).toFixed(2)}s`,
                  ['--card-glow' as string]: `${color}15`,
                  contentVisibility: 'auto',
                  containIntrinsicSize: 'auto 120px',
                  border: '1px solid rgba(80,60,40,0.2)',
                  background: 'rgba(80,60,40,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}50`
                  e.currentTarget.style.boxShadow = `0 0 20px ${color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <BookCover book={book} size="md" />
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div
                    className="text-sm font-bold group-hover:opacity-80 transition-colors leading-tight"
                    style={{ color: '#3a2a1a' }}
                  >
                    {book.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#8a7050' }}>
                    <span>#{book.order}</span>
                    {book.year && (
                      <>
                        <span style={{ color: '#a09070' }}>·</span>
                        <span>{book.year}</span>
                      </>
                    )}
                  </div>
                  {book.description && (
                    <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: '#8a7050' }}>
                      {book.description}
                    </p>
                  )}
                  <div className="mt-auto pt-1">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xxs font-medium"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {sagaName}
                    </span>
                  </div>
                </div>
              </TransitionLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}
