import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, SAGAS } from '@/data/static'
import { READING_ORDER, READING_ORDER_KEY } from '@/data/static/reading-order'
import PageLayout from '@/components/ui/PageLayout'

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(READING_ORDER_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveProgress(ids: Set<string>) {
  localStorage.setItem(READING_ORDER_KEY, JSON.stringify(Array.from(ids)))
}

export default function ReadingOrderPage() {
  const [completed, setCompleted] = useState<Set<string>>(() => loadProgress())

  useEffect(() => {
    saveProgress(completed)
  }, [completed])

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const bookMap = useMemo(() => {
    const m = new Map(BOOKS.map((b) => [b.id, b]))
    return m
  }, [])

  const sagaMap = useMemo(() => {
    const m = new Map(SAGAS.map((s) => [s.id, s]))
    return m
  }, [])

  const entries = useMemo(
    () =>
      READING_ORDER.map((id, idx) => ({
        id,
        book: bookMap.get(id),
        saga: sagaMap.get(bookMap.get(id)?.saga ?? ''),
        index: idx,
      })),
    [bookMap, sagaMap],
  )

  const total = entries.length
  const done = completed.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

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

        <h1 className="text-3xl font-bold text-gray-100">Reading Order</h1>
        <p className="mt-1 text-sm text-gray-500">Recommended reading order by Brandon Sanderson</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
            <span>
              {done} of {total} books read
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setCompleted(new Set())
            saveProgress(new Set())
          }}
          className="mt-3 text-xs text-gray-600 transition-colors hover:text-gray-400"
        >
          Reset progress
        </button>

        <ul className="mt-6 space-y-1">
          {entries.map(({ id, book, saga, index }) => {
            if (!book) return null
            const isDone = completed.has(id)

            return (
              <li
                key={id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isDone ? 'bg-gray-900/30' : 'hover:bg-gray-900/30'
                }`}
              >
                <span className="w-6 text-right text-xs text-gray-600">{index + 1}</span>

                <button
                  onClick={() => toggle(id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isDone ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-600 hover:border-purple-500'
                  }`}
                  aria-label={`Toggle ${book.title}`}
                >
                  {isDone && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                      <path d="M4 8l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <Link
                  to={`/books/${id}`}
                  className={`min-w-0 flex-1 transition-colors ${
                    isDone ? 'text-gray-500 line-through' : 'text-gray-200 hover:text-purple-400'
                  }`}
                >
                  <span className="text-sm font-medium">{book.title}</span>
                  {saga && <span className="ml-2 text-xs text-gray-600">— {saga.name}</span>}
                </Link>

                {isDone && <span className="shrink-0 text-xs text-purple-500">Read</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </PageLayout>
  )
}
