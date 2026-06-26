import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BOOKS, SAGA_BY_ID, ALL_CHARACTERS } from '@/data/static'
import BookCover from '@/components/common/BookCover'
import NotFound from './NotFound'
import PageLayout from '@/components/ui/PageLayout'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function BookPage() {
  const { id } = useParams<{ id: string }>()

  const book = useMemo(() => BOOKS.find((b) => b.id === id), [id])

  useDocumentTitle(book ? `${book.title} — Cosmere Archive` : 'Book — Cosmere Archive')

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
            .map((c) => ({
              ...c,
              firstBook: c.requiredBooks[0],
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [book],
  )

  if (!book) return <NotFound />

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-2xl animate-fade-in-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <BookCover book={book} size="md" />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-100">{book.title}</h1>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
              {saga && (
                <span>
                  Saga: <span className="text-gray-300">{saga.name}</span>
                </span>
              )}
              <span>
                Book #{book.order}
                {saga && book.order > 0 && ` in ${saga.name}`}
              </span>
              {book.year && <span>Published {book.year}</span>}
            </div>

            {book.description && <p className="mt-4 leading-relaxed text-gray-400">{book.description}</p>}
          </div>
        </div>

        {characters.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-gray-200">Characters ({characters.length})</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {characters.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                  <div className="font-medium text-gray-200">{c.name}</div>
                  <div className="mt-0.5 text-xs text-gray-500 capitalize">{c.planet}</div>
                  <div className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{c.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <nav className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
          {prevBook ? (
            <Link
              to={`/books/${prevBook.id}`}
              className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-400"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-right">
                <div className="text-xs text-gray-600">Previous</div>
                <div className="text-sm">{prevBook.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextBook ? (
            <Link
              to={`/books/${nextBook.id}`}
              className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-400"
            >
              <div className="text-left">
                <div className="text-xs text-gray-600">Next</div>
                <div className="text-sm">{nextBook.title}</div>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </PageLayout>
  )
}
