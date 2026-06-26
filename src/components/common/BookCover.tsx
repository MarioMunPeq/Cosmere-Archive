import { SAGA_BY_ID } from '@/data/static'
import type { Book } from '@/types/book'
import { FALLBACK_COLOR } from '@/utils/constants'
import { SAGA_NAME_COLORS as SAGA_COLORS, SAGA_BG } from '@/data/static/colors'

function getSaga(book: Book): string {
  const saga = SAGA_BY_ID.get(book.saga)
  return saga?.name ?? book.saga
}

export default function BookCover({ book, size = 'sm' }: { book: Book; size?: 'sm' | 'md' }) {
  const saga = getSaga(book)
  const accent = SAGA_COLORS[saga] ?? FALLBACK_COLOR
  const bg = SAGA_BG[saga] ?? '#1f2937'
  const w = size === 'md' ? 120 : 80
  const h = size === 'md' ? 180 : 120
  const fs = size === 'md' ? 9 : 7

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0 rounded-md"
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <rect width={w} height={h} rx="4" fill={bg} />
      <rect x="0" y="0" width="4" height={h} fill={accent} opacity="0.8" />
      <line x1="4" y1={h * 0.25} x2={w - 4} y2={h * 0.25} stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <text
        x={w / 2}
        y={h * 0.4}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize={fs}
        fontWeight="bold"
        fontFamily="system-ui"
      >
        {book.title.length > 20 ? book.title.slice(0, 18) + '…' : book.title}
      </text>
      <text
        x={w / 2}
        y={h * 0.52}
        textAnchor="middle"
        fill={accent}
        fontSize={fs - 1}
        fontFamily="system-ui"
        opacity="0.7"
      >
        #{book.order}
      </text>
      <text x={w / 2} y={h * 0.85} textAnchor="middle" fill={FALLBACK_COLOR} fontSize={fs - 2} fontFamily="system-ui">
        {saga.length > 16 ? saga.slice(0, 14) + '…' : saga}
      </text>
    </svg>
  )
}
