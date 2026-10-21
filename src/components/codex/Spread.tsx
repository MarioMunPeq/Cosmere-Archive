import type { ReactNode } from 'react'
import PageSurface from './PageSurface'

/**
 * Spread — two flat pages, no transform between the reader and the type.
 *
 * Depth is faked entirely around the text: paper layers, gutter shade and the
 * page block live underneath or beside it. The page surfaces themselves stay
 * on the z=0 plane, which is what keeps subpixel antialiasing intact.
 */

interface Props {
  left: ReactNode
  right: ReactNode
  leftFolio?: string
  rightFolio?: string
  leftHeader?: string
  rightHeader?: string
  rightNoScroll?: boolean
}

export default function Spread({
  left,
  right,
  leftFolio,
  rightFolio,
  leftHeader,
  rightHeader,
  rightNoScroll = false,
}: Props) {
  return (
    <div className="codex-spread">
      <PageSurface side="left" header={leftHeader} folio={leftFolio}>
        {left}
      </PageSurface>
      <PageSurface side="right" header={rightHeader} folio={rightFolio} noScroll={rightNoScroll}>
        {right}
      </PageSurface>
    </div>
  )
}
