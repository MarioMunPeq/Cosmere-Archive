/**
 * Skeleton — a loading placeholder that reserves the real layout.
 *
 * The three page skeletons that already existed (CelestialChartsSkeleton,
 * BooksPageSkeleton, CharactersPageSkeleton) were hand-drawn rectangles sized
 * for one breakpoint; on a narrow screen they were visibly the wrong shape,
 * which is the main way a skeleton gives away that it is fake.
 *
 * `Skeleton` here is layout-aware: the size props are fractions, so the same
 * definition holds at 375px and at 1440px.
 */

import type { ReactNode } from 'react'

interface Props {
  /** Fraction of the parent width. */
  width?: string
  /** Explicit height. Defaults to a text line. */
  height?: string
  rounded?: string
  toneMode?: 'dark' | 'paper'
  className?: string
}

export function SkeletonBlock({
  width = '100%',
  height = '1rem',
  rounded = 'var(--radius-sm)',
  toneMode = 'dark',
  className = '',
}: Props) {
  return (
    <div
      aria-hidden
      className={[
        'shrink-0',
        toneMode === 'paper' ? 'bg-[var(--surface-page-inset)]' : 'bg-[var(--surface-raised)]',
        'animate-pulse',
        className,
      ].join(' ')}
      style={{ width, height, borderRadius: rounded }}
    />
  )
}

/** A line of body text. `last` drops the trailing margin. */
export function SkeletonText({
  lines = 3,
  toneMode = 'dark',
  last = false,
}: {
  lines?: number
  toneMode?: 'dark' | 'paper'
  last?: boolean
}) {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          // The last line stops short, which is what makes a stack of lines
          // read as a paragraph rather than as a block.
          width={i === lines - 1 ? '62%' : i === 0 ? '94%' : '100%'}
          height="0.75rem"
          toneMode={toneMode}
          className={last && i === lines - 1 ? '' : ''}
        />
      ))}
    </div>
  )
}

/**
 * A grid of cards. `columns` is the number of columns the real content uses at
 * desktop width; the auto-fill basis is derived from it so the skeleton holds
 * the same shape as the grid it stands in for, at every breakpoint.
 */
export function SkeletonGrid({
  count = 8,
  columns = 4,
  toneMode = 'dark',
}: {
  count?: number
  columns?: number
  toneMode?: 'dark' | 'paper'
}) {
  // 1440px of content, n columns, gutters of 16px.
  const minTrack = Math.max(160, Math.round(1408 / columns - (columns - 1) * 16))
  return (
    <div
      aria-hidden
      className="grid gap-[var(--space-md)]"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minTrack}px, 1fr))` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={[
            'flex flex-col gap-2 rounded-[var(--radius-md)] border p-3',
            toneMode === 'paper'
              ? 'border-[var(--border-subtle-on-page)] bg-[var(--surface-page-raised)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-base)]',
          ].join(' ')}
          style={{ minHeight: 120 }}
        >
          <SkeletonBlock width="38%" height="0.625rem" toneMode={toneMode} />
          <SkeletonBlock width="88%" height="1.125rem" toneMode={toneMode} />
          <SkeletonText lines={3} toneMode={toneMode} />
        </div>
      ))}
    </div>
  )
}

/**
 * The default loading state. Announces itself once — a live region, so the
 * announcement is not repeated on every re-render.
 */
export function SkeletonPage({ label = 'Loading', children }: { label?: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-lg)] p-[var(--space-xl)]">
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      {children ?? (
        <>
          <SkeletonBlock width="min(320px, 60%)" height="2.25rem" />
          <SkeletonGrid />
        </>
      )}
    </div>
  )
}

export default SkeletonBlock
