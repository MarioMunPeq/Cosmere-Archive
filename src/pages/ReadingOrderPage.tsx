import { useCallback, useMemo } from 'react'
import BackToMapButton from '@/components/ui/BackToMapButton'
import TransitionLink from '@/components/ui/TransitionLink'
import { BOOKS, SAGAS } from '@/data/static'
import { READING_ORDER, READING_ORDER_KEY } from '@/data/static'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { IconCheck } from '@/components/common/icons'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function ReadingOrderPage() {
  useSEOMeta({
    title: 'Reading Order — Cosmere Archive',
    description: 'Suggested reading order for the Cosmere series by Brandon Sanderson',
  })

  const [completedIds, setCompletedIds] = useLocalStorage<string[]>(READING_ORDER_KEY, [])

  const toggle = useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        return [...prev, id]
      })
    },
    [setCompletedIds],
  )

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
  const done = completedIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-2xl animate-fade-in-up">
        <BackToMapButton className="mb-6" />

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
          onClick={() => setCompletedIds([])}
          className="mt-3 text-xs text-gray-600 transition-colors hover:text-gray-400"
        >
          Reset progress
        </button>

        <ul className="mt-6 space-y-1">
          {entries.map(({ id, book, saga, index }) => {
            if (!book) return null
            const isDone = completedIds.includes(id)

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
                  {isDone && <IconCheck size={12} />}
                </button>

                <TransitionLink
                  to={`/books/${id}`}
                  className={`min-w-0 flex-1 transition-colors ${
                    isDone ? 'text-gray-500 line-through' : 'text-gray-200 hover:text-purple-400'
                  }`}
                >
                  <span className="text-sm font-medium">{book.title}</span>
                  {saga && <span className="ml-2 text-xs text-gray-600">— {saga.name}</span>}
                </TransitionLink>

                {isDone && <span className="shrink-0 text-xs text-purple-500">Read</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </PageLayout>
  )
}
