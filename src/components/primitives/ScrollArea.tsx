/**
 * ScrollArea — a named scroll container.
 *
 * The archive has four different scroll regions per screen (page, sidebar,
 * shelf, panel) and they all inherit the global scrollbar rules from index.css,
 * which is why the shadows never line up. This gives each region an explicit
 * name and two gradient masks that fade content at the ends.
 *
 * The masks are only painted when the content actually overflows, which is
 * measured after layout and after any content change. Without that check the
 * top and bottom of a short list would be faded for no reason.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Fade the edges when the content scrolls. Default true. */
  fade?: boolean
  /** Visible scrollbar. Default false, to match the shell. */
  scrollbar?: boolean
  axis?: 'y' | 'x' | 'both'
  toneMode?: 'dark' | 'paper'
  className?: string
  innerClassName?: string
  /** Fired on every scroll. Used by the shelf to save position. */
  onScroll?: (top: number, left: number) => void
  /** Rendered inside the scroll area, pinned to the top. */
  sticky?: ReactNode
}

export default function ScrollArea({
  children,
  fade = true,
  scrollbar = false,
  axis = 'y',
  toneMode = 'dark',
  className = '',
  innerClassName = '',
  onScroll,
  sticky,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = useState({ top: false, bottom: false, left: false, right: false })
  const paper = toneMode === 'paper'

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const { scrollTop, scrollLeft, scrollWidth, scrollHeight, clientWidth, clientHeight } = el
    setEdges({
      top: scrollTop > 2,
      bottom: scrollTop + clientHeight < scrollHeight - 2,
      left: scrollLeft > 2,
      right: scrollLeft + clientWidth < scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    measure()
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    // Content size changes when data arrives, which is the case that matters:
    // a list that fits at first paint and overflows a second later.
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)
    return () => ro.disconnect()
  }, [measure])

  const overflow = axis === 'both' ? 'auto' : axis === 'x' ? 'auto hidden' : 'hidden auto'

  return (
    <div className={['relative min-h-0 min-w-0', className].join(' ')}>
      <div
        ref={ref}
        onScroll={(e) => {
          measure()
          onScroll?.(e.currentTarget.scrollTop, e.currentTarget.scrollLeft)
        }}
        className={[
          'h-full w-full overscroll-contain',
          overflow,
          scrollbar ? '' : 'scrollbar-none',
          innerClassName,
        ].join(' ')}
      >
        {sticky}
        {children}
      </div>

      {fade && (
        <>
          {edges.top && (
            <div
              aria-hidden
              className={[
                'pointer-events-none absolute inset-x-0 top-0 h-6',
                paper
                  ? 'bg-gradient-to-b from-[var(--surface-page)] to-transparent'
                  : 'bg-gradient-to-b from-[var(--surface-base)] to-transparent',
              ].join(' ')}
            />
          )}
          {edges.bottom && (
            <div
              aria-hidden
              className={[
                'pointer-events-none absolute inset-x-0 bottom-0 h-6',
                paper
                  ? 'bg-gradient-to-t from-[var(--surface-page)] to-transparent'
                  : 'bg-gradient-to-t from-[var(--surface-base)] to-transparent',
              ].join(' ')}
            />
          )}
          {edges.left && (
            <div
              aria-hidden
              className={[
                'pointer-events-none absolute inset-y-0 left-0 w-6',
                paper
                  ? 'bg-gradient-to-r from-[var(--surface-page)] to-transparent'
                  : 'bg-gradient-to-r from-[var(--surface-base)] to-transparent',
              ].join(' ')}
            />
          )}
          {edges.right && (
            <div
              aria-hidden
              className={[
                'pointer-events-none absolute inset-y-0 right-0 w-6',
                paper
                  ? 'bg-gradient-to-l from-[var(--surface-page)] to-transparent'
                  : 'bg-gradient-to-l from-[var(--surface-base)] to-transparent',
              ].join(' ')}
            />
          )}
        </>
      )}
    </div>
  )
}
