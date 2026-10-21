import type { ReactNode } from 'react'

/**
 * PageSurface — one leaf of paper.
 *
 * Layers, bottom to top:
 *   0. `__paper`        colour, grain, foxing, deckle. Decorative only.
 *   1. `__gutter-shade` the curve into the spine.
 *   2. running header / folio.
 *   3. `__body`         the scrolling text column.
 *
 * Only layer 0 carries a transform (a mirror, so the same deckle SVG serves
 * both sides). No text is ever a descendant of a transformed box.
 */

interface Props {
  side: 'left' | 'right'
  header?: string
  folio?: string
  noScroll?: boolean
  children: ReactNode
}

export default function PageSurface({ side, header, folio, noScroll = false, children }: Props) {
  const empty = children === null || children === undefined
  const sideName = side === 'left' ? 'Left' : 'Right'

  return (
    <div className={`codex-page codex-page--${side}`}>
      <div className="codex-page__paper" aria-hidden="true" />
      <div className="codex-page__gutter-shade" aria-hidden="true" />

      {!empty && header && (
        <div className="codex-page__header">
          {side === 'right' && <span className="codex-page__rule" aria-hidden="true" />}
          <span className="codex-page__running">{header}</span>
          {side === 'left' && <span className="codex-page__rule" aria-hidden="true" />}
        </div>
      )}

      {!empty && (
        <div
          className={`codex-page__body manuscript-scrollbar ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}
          role={noScroll ? undefined : 'region'}
          aria-label={noScroll ? undefined : `${sideName} page${header ? `: ${header}` : ''}`}
          tabIndex={noScroll ? undefined : 0}
        >
          {children}
        </div>
      )}

      {!empty && folio && <div className="codex-page__folio">— {folio} —</div>}
    </div>
  )
}
