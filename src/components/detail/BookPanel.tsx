import { memo } from 'react'
import type { Book } from '@/types'

import { SAGA_BY_ID } from '@/data/static'
import DetailPanel from '@/components/ui/DetailPanel'

interface Props {
  book: Book
  onClose: () => void
}

function BookPanel({ book, onClose }: Props) {
  const saga = SAGA_BY_ID.get(book.saga)

  return (
    <DetailPanel onClose={onClose} ariaLabel="Close book panel">
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
    </DetailPanel>
  )
}

export default memo(BookPanel)
