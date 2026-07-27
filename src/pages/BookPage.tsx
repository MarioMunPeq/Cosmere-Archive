import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import TransitionLink from '@/components/ui/TransitionLink'
import { IconChevronLeft, IconChevronRight } from '@/components/common/icons'
import { BOOKS, SAGA_BY_ID, ALL_CHARACTERS, PLANETS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import BookCover from '@/components/common/BookCover'
import NotFound from './NotFound'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

export default function BookPage() {
  const { id } = useParams<{ id: string }>()

  const book = useMemo(() => BOOKS.find((b) => b.id === id), [id])

  useSEOMeta(
    book
      ? {
          title: `${book.title} — Cosmere Archive`,
          description: `Details about ${book.title} — part of the Cosmere series by Brandon Sanderson`,
        }
      : {
          title: 'Book — Cosmere Archive',
          description: 'Details about a book — part of the Cosmere series by Brandon Sanderson',
        },
  )

  const saga = book ? SAGA_BY_ID.get(book.saga) : undefined

  const sagaBooks = useMemo(
    () => (book ? BOOKS.filter((b) => b.saga === book.saga).sort((a, b) => a.order - b.order) : []),
    [book],
  )
  const currentIdx = book ? sagaBooks.findIndex((b) => b.id === book.id) : -1
  const prevBook = currentIdx > 0 ? sagaBooks[currentIdx - 1] : undefined
  const nextBook = currentIdx < sagaBooks.length - 1 ? sagaBooks[currentIdx + 1] : undefined

  const characters = useMemo(
    () =>
      book
        ? ALL_CHARACTERS.filter((c) => c.requiredBooks.includes(book.id))
            .map((c) => ({ ...c, firstBook: c.requiredBooks[0] }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [book],
  )

  const planets = useMemo(() => (book ? PLANETS.filter((p) => p.books?.includes(book.id)) : []), [book])

  const magicSystems = useMemo(() => (book ? MAGIC_SYSTEMS.filter((ms) => ms.bookIds.includes(book.id)) : []), [book])

  if (!book) return <NotFound />

  return (
    <PageLayout variant="none">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <TransitionLink
            to="/books"
            className="inline-flex items-center gap-1.5 text-xs transition-colors mb-6 hover:opacity-80"
            style={{ color: '#8a7050' }}
          >
            <IconChevronLeft size={12} />
            Back to books
          </TransitionLink>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <BookCover book={book} size="lg" />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-100">{book.title}</h1>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: '#8a7050' }}>
                {saga && (
                  <span>
                    Saga: <span style={{ color: '#5a4a3a' }}>{saga.name}</span>
                  </span>
                )}
                <span>
                  Book #{book.order}
                  {saga && book.order > 0 && ` in ${saga.name}`}
                </span>
                {book.year && <span>Published {book.year}</span>}
              </div>

              {book.description && (
                <p className="mt-4 leading-relaxed" style={{ color: '#8a7050' }}>
                  {book.description}
                </p>
              )}
            </div>
          </div>

          {planets.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold" style={{ color: '#3a2a1a' }}>
                Planets ({planets.length})
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {planets.map((p) => (
                  <TransitionLink
                    key={p.id}
                    to={`/locations?tab=planets&planet=${p.id}`}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      ['--card-glow' as string]: `${p.color}15`,
                      background: 'rgba(80,60,40,0.06)',
                      borderColor: 'rgba(80,60,40,0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${p.color}50`
                      e.currentTarget.style.boxShadow = `0 0 16px ${p.color}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(80,60,40,0.2)'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#3a2a1a' }}>
                        {p.name}
                      </div>
                      {p.shard && (
                        <div className="text-xs" style={{ color: '#8a7050' }}>
                          {p.shard}
                        </div>
                      )}
                    </div>
                  </TransitionLink>
                ))}
              </div>
            </section>
          )}

          {magicSystems.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold" style={{ color: '#3a2a1a' }}>
                Magic Systems ({magicSystems.length})
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {magicSystems.map((ms) => (
                  <TransitionLink
                    key={ms.id}
                    to={`/magic?system=${ms.id}`}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      ['--card-glow' as string]: `${ms.color}15`,
                      background: 'rgba(80,60,40,0.06)',
                      borderColor: 'rgba(80,60,40,0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${ms.color}50`
                      e.currentTarget.style.boxShadow = `0 0 16px ${ms.color}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(80,60,40,0.2)'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ms.color }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#3a2a1a' }}>
                        {ms.name}
                      </div>
                      <div className="text-xs" style={{ color: '#8a7050' }}>
                        {ms.shard}
                      </div>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            </section>
          )}

          {characters.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold" style={{ color: '#3a2a1a' }}>
                Characters ({characters.length})
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {characters.map((c) => (
                  <TransitionLink
                    key={c.id}
                    to={`/characters?character=${c.id}`}
                    className="rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    style={{
                      background: 'rgba(80,60,40,0.06)',
                      borderColor: 'rgba(80,60,40,0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div className="font-medium text-sm" style={{ color: '#3a2a1a' }}>
                      {c.name}
                    </div>
                    <div className="mt-0.5 text-xs capitalize" style={{ color: '#8a7050' }}>
                      {c.planet}
                    </div>
                    <div className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: '#8a7050' }}>
                      {c.description}
                    </div>
                  </TransitionLink>
                ))}
              </div>
            </section>
          )}

          <nav
            className="mt-10 flex items-center justify-between pt-6"
            style={{ borderTop: '1px solid rgba(80,60,40,0.2)' }}
          >
            {prevBook ? (
              <TransitionLink
                to={`/books/${prevBook.id}`}
                className="group flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                style={{ color: '#8a7050' }}
              >
                <IconChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                <div className="text-right">
                  <div className="text-xs" style={{ color: '#a09070' }}>
                    Previous
                  </div>
                  <div className="text-sm">{prevBook.title}</div>
                </div>
              </TransitionLink>
            ) : (
              <div />
            )}

            {nextBook ? (
              <TransitionLink
                to={`/books/${nextBook.id}`}
                className="group flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                style={{ color: '#8a7050' }}
              >
                <div className="text-left">
                  <div className="text-xs" style={{ color: '#a09070' }}>
                    Next
                  </div>
                  <div className="text-sm">{nextBook.title}</div>
                </div>
                <IconChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </TransitionLink>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </div>
    </PageLayout>
  )
}
