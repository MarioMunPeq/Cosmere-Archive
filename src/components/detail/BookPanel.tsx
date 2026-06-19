import { memo } from 'react'
import type { Book } from '@/types'
import type { Saga } from '@/data/static/sagas'
import { SAGAS } from '@/data/static'
import { CloseIcon } from '@/components/common/icons'

interface Props {
  book: Book
  onClose: () => void
}

function BookPanel({ book, onClose }: Props) {
  const saga = SAGAS.find((s: Saga) => s.id === book.saga)

  return (
    <div className="absolute bottom-4 left-4 right-4 top-auto w-auto animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-80 sm:p-5">
      <button
        onClick={onClose}
        aria-label="Close book panel"
        className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
      >
        <CloseIcon />
      </button>

      <h3 className="pr-4 text-lg font-bold text-gray-100">{book.title}</h3>

      {saga && <p className="mt-1 text-xs font-medium text-gray-500">{saga.name}</p>}

      {book.year && <p className="mt-1 text-xs text-gray-600">Published {book.year}</p>}

      {book.description && <p className="mt-3 text-sm leading-relaxed text-gray-400">{book.description}</p>}

      {book.saga && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Saga</h4>
          <span className="inline-block rounded bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
            {saga?.name ?? book.saga}
          </span>
        </div>
      )}
    </div>
  )
}

export default memo(BookPanel)
