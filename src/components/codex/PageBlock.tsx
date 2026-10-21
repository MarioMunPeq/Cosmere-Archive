import type { CSSProperties, ReactNode } from 'react'

/**
 * PageBlock — the physical block of sheets inside the case.
 *
 * The fore-edges on both sides are drawn as twelve real elements rather than a
 * repeating gradient, so the count is guaranteed and the depth can shrink as
 * the reader advances without the lines turning into moiré at small sizes.
 *
 * `progress` (0 → 1) is the fraction of the book already read. The block loses
 * 6px of depth across the whole volume, the way a read book compresses.
 * The spine overlay is decorative: no text lives inside a transformed element.
 */

const LEAVES = Array.from({ length: 12 }, (_, index) => index)

interface Props {
  progress?: number
  label?: string
  children?: ReactNode
}

export default function PageBlock({ progress = 0, label = 'Ars Arcanum', children }: Props) {
  const clamped = Math.min(1, Math.max(0, progress))
  const depth = 20 - 6 * clamped

  return (
    <div
      className="codex-book"
      role="group"
      aria-label={label}
      data-codex-book=""
      style={{ '--codex-depth': `${depth.toFixed(2)}px` } as CSSProperties}
    >
      <div className="codex-block__side codex-block__side--left" aria-hidden="true">
        {LEAVES.map((leaf) => (
          <span key={leaf} className="codex-block__leaf" />
        ))}
      </div>
      <div className="codex-block__side codex-block__side--right" aria-hidden="true">
        {LEAVES.map((leaf) => (
          <span key={leaf} className="codex-block__leaf" />
        ))}
      </div>

      <div className="codex-block__gutter" aria-hidden="true">
        <span className="codex-block__crease" />
        {[18, 38, 58, 78].map((top) => (
          <span key={top} className="codex-block__thread" style={{ top: `${top}%` }} />
        ))}
      </div>

      {children}
    </div>
  )
}
