import type { RefObject } from 'react'
import PageSurface from './PageSurface'
import type { CodexSpreadView } from './Codex'

/**
 * CodexFlip — one leaf in the air.
 *
 * Only the turning leaf carries a rotateY transform; the underlay spread and
 * the settled spread are flat. At rest the leaf is unmounted, so no reading
 * text is ever left inside a transformed box.
 *
 * Forward (recto → verso):
 *   underlay  from.left  |  to.right
 *   leaf      from.right (front) / to.left (back)
 *
 * Backward (verso → recto):
 *   underlay  to.left    |  from.right
 *   leaf      from.left (front) / to.right (back)
 */

interface PageProps {
  spread: CodexSpreadView
  side: 'left' | 'right'
  noScroll?: boolean
}

function Page({ spread, side, noScroll = false }: PageProps) {
  const header = side === 'left' ? spread.leftHeader : spread.rightHeader
  const folio = side === 'left' ? spread.leftFolio : spread.rightFolio

  return (
    <PageSurface side={side} header={header} folio={folio} noScroll={noScroll}>
      {side === 'left' ? spread.left : spread.right}
    </PageSurface>
  )
}

interface Props {
  from: CodexSpreadView
  to: CodexSpreadView
  direction: 'next' | 'prev'
  leafRef: RefObject<HTMLDivElement | null>
}

export default function CodexFlip({ from, to, direction, leafRef }: Props) {
  const forward = direction === 'next'
  const underlayLeft = forward ? from : to
  const underlayRight = forward ? to : from
  const front = forward ? { spread: from, side: 'right' as const } : { spread: from, side: 'left' as const }
  const back = forward ? { spread: to, side: 'left' as const } : { spread: to, side: 'right' as const }

  return (
    <div className="codex-flip" data-direction={direction}>
      <div className="codex-spread codex-flip__underlay">
        <Page spread={underlayLeft} side="left" />
        <Page spread={underlayRight} side="right" />
      </div>

      <div
        ref={leafRef}
        className={`codex-flip__leaf codex-flip__leaf--${direction}`}
        style={{ transform: 'rotateY(0deg)' }}
        aria-hidden="true"
        inert
      >
        <div className="codex-flip__face codex-flip__face--front">
          <Page spread={front.spread} side={front.side} noScroll />
          <span className="codex-flip__shade codex-flip__shade--front" />
        </div>
        <div className="codex-flip__face codex-flip__face--back">
          <Page spread={back.spread} side={back.side} noScroll />
          <span className="codex-flip__shade codex-flip__shade--back" />
        </div>
      </div>
    </div>
  )
}
