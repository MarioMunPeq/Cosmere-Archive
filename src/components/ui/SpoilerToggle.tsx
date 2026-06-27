import { useSpoilerMode } from '@/hooks/useSpoilerMode'
import { SAGAS } from '@/data/static'

export default function SpoilerToggle() {
  const {
    enabled,
    toggle,
    panelOpen,
    setPanelOpen,
    readBooks,
    toggleBook,
    isBookRead,
    markAllBooks,
    markNoBooks,
    spoilerCount,
    books,
  } = useSpoilerMode()

  const allRead = books.length > 0 && books.every((b) => isBookRead(b.id))
  const noneRead = readBooks.length === 0

  return (
    <div className="relative">
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          enabled
            ? 'bg-purple-900/40 text-purple-400 hover:bg-purple-900/60'
            : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
        }`}
        aria-label={`Spoiler mode: ${enabled ? 'on' : 'off'}. Click to manage.`}
        title={`Spoiler mode: ${enabled ? 'on' : 'off'}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        {spoilerCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 text-xxs text-white">
            {spoilerCount}
          </span>
        )}
      </button>

      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-black/40">
            <div className="border-b border-gray-700/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-200">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={toggle}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/40"
                  />
                  Spoiler mode
                </label>
                <span className="text-xxs text-gray-600">{spoilerCount} hidden</span>
              </div>
              <p className="mt-1 text-xxs text-gray-600">Characters you haven&apos;t read about yet are hidden.</p>
            </div>

            <div className="max-h-64 overflow-y-auto px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xxs font-semibold uppercase tracking-wider text-gray-600">Books read</span>
                {!allRead && (
                  <button
                    onClick={() => markAllBooks(books.map((b) => b.id))}
                    className="text-xxs text-purple-400 hover:text-purple-300"
                  >
                    Mark all
                  </button>
                )}
                {!noneRead && (
                  <button onClick={markNoBooks} className="text-xxs text-gray-500 hover:text-gray-400">
                    Clear
                  </button>
                )}
              </div>

              {SAGAS.sort((a, b) => a.order - b.order).map((saga) => {
                const sagaBooks = books.filter((b) => b.saga === saga.id)
                if (sagaBooks.length === 0) return null
                return (
                  <div key={saga.id} className="mb-2">
                    <div className="mb-1 text-xxs font-medium text-gray-500">{saga.name}</div>
                    {sagaBooks.map((book) => (
                      <label
                        key={book.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-gray-800/60"
                      >
                        <input
                          type="checkbox"
                          checked={isBookRead(book.id)}
                          onChange={() => toggleBook(book.id)}
                          className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/40"
                        />
                        <span className="text-xs text-gray-300">{book.title}</span>
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
