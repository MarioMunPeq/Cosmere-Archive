import { memo, useState } from 'react'
import { SAGA_BY_ID, FALLBACK_COLOR, SAGA_NAME_COLORS as SAGA_COLORS, SAGA_BG } from '@/data/static'
import type { Book } from '@/types/book'

function getSaga(book: Book): string {
  const saga = SAGA_BY_ID.get(book.saga)
  return saga?.name ?? book.saga
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return (h >>> 0) / 0xffffffff
}

const SIZES = { sm: { w: 90, h: 135 }, md: { w: 116, h: 174 }, lg: { w: 160, h: 240 } } as const

function BookCover({ book, size = 'sm' }: { book: Book; size?: 'sm' | 'md' | 'lg' }) {
  const [loaded, setLoaded] = useState(false)
  const dims = SIZES[size]

  if (book.cover) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-md bg-gray-800"
        style={{ width: dims.w, height: dims.h }}
      >
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-700" />}
        <img
          src={book.cover}
          alt={`Cover of ${book.title}`}
          width={dims.w}
          height={dims.h}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    )
  }

  const saga = getSaga(book)
  const accent = SAGA_COLORS[saga] ?? FALLBACK_COLOR
  const bg = SAGA_BG[saga] ?? '#1f2937'
  const fs = size === 'lg' ? 11 : size === 'md' ? 9 : 7
  const stars = Array.from({ length: 12 }, (_, i) => {
    const s = hashSeed(`${book.id}-${i}`)
    return { x: 4 + ((s * 92) % (dims.w - 8)), y: 4 + ((s * 47 + i * 13) % (dims.h - 8)), r: s > 0.7 ? 0.8 : 0.4 }
  })

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      className="shrink-0 rounded-md"
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <defs>
        <linearGradient id={`bg-${book.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={bg} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`accent-${book.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width={dims.w} height={dims.h} rx="4" fill={`url(#bg-${book.id})`} />
      <rect x="0" y="0" width="4" height={dims.h} fill={`url(#accent-${book.id})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e5e7eb" opacity="0.3" />
      ))}
      <line
        x1="6"
        y1={dims.h * 0.22}
        x2={dims.w - 6}
        y2={dims.h * 0.22}
        stroke={accent}
        strokeWidth="0.5"
        opacity="0.25"
      />
      <text
        x={dims.w / 2}
        y={dims.h * 0.38}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize={fs}
        fontWeight="bold"
        fontFamily="system-ui"
      >
        {book.title.length > 20 ? book.title.slice(0, 18) + '...' : book.title}
      </text>
      <text
        x={dims.w / 2}
        y={dims.h * 0.5}
        textAnchor="middle"
        fill={accent}
        fontSize={fs - 1}
        fontFamily="system-ui"
        opacity="0.7"
      >
        #{book.order}
      </text>
      <text
        x={dims.w / 2}
        y={dims.h * 0.85}
        textAnchor="middle"
        fill={FALLBACK_COLOR}
        fontSize={fs - 2}
        fontFamily="system-ui"
      >
        {saga.length > 16 ? saga.slice(0, 14) + '...' : saga}
      </text>
    </svg>
  )
}

export default memo(BookCover)
