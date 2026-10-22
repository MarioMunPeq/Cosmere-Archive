import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import CodexObject from '@/components/codex/CodexObject'
import { WALL_W, WALL_H, CONTENT_BOUNDS } from './wall-docs'

interface Props {
  children: ReactNode
  /** A sheet was clicked or activated by keyboard. */
  onActivate?: (id: string, element: HTMLElement) => void
  /** The plaster, not a sheet, was clicked. */
  onBackground?: () => void
  maxScale?: number
}

/**
 * The room the wall is in, and the hand that moves across it.
 *
 * ## Arrival
 *
 * Contain `CONTENT_BOUNDS`: the whole wall of work, all nine titles on screen,
 * centred. The previous canvas opened at 1:1 on the top-left sheet — "reading
 * mode" — which showed one corner of paper at 300px and nothing else, and the
 * screenshot looked like a bug because it was one.
 *
 * ## Zoom floor
 *
 * Cover `WALL_W/H`. Below that the plaster would end inside the viewport and
 * the room would read as a page with a black border. The wall is deliberately
 * larger than the work, so the floor is lower than the arrival fit and there is
 * room to step back without finding an edge.
 *
 * ## Panning is not clicking
 *
 * Selection is handled here, once, from the click event's target. A drag that
 * moves more than `DRAG_SLOP` sets a flag and swallows the click that follows,
 * which is the only reliable way to drag *from* a sheet without also opening
 * it.
 */
const DRAG_SLOP = 6
const MIN_SCALE = 0.12
/** Below this width the wall arrives on the first cluster instead of the room. */
const MOBILE_W = 640
const MOBILE_SCALE = 0.4

function measure(el: HTMLElement | null): { w: number; h: number } {
  if (el) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return { w: r.width, h: r.height }
  }
  return { w: window.innerWidth, h: window.innerHeight }
}

function clampScale(value: number, floor: number, ceil: number): number {
  return Math.max(floor, Math.min(ceil, value))
}

/**
 * Frame the work inside a viewport of this size.
 *
 * `fit` contains the sheets. `floor` covers the plaster. On a phone the fit is
 * a thumbnail, so arrival is a cluster at 0.4 — a title you can read beats a
 * room you cannot. The floor still wins if it is higher.
 */
function frame(w: number, h: number) {
  const fit = Math.min(w / CONTENT_BOUNDS.w, h / CONTENT_BOUNDS.h)
  const floor = Math.max(w / WALL_W, h / WALL_H, MIN_SCALE)
  const mobile = w < MOBILE_W
  const scale = Math.max(fit, floor, mobile ? MOBILE_SCALE : 0)
  const cx = mobile ? CONTENT_BOUNDS.x + CONTENT_BOUNDS.w * 0.3 : CONTENT_BOUNDS.x + CONTENT_BOUNDS.w / 2
  const cy = mobile ? CONTENT_BOUNDS.y + CONTENT_BOUNDS.h * 0.32 : CONTENT_BOUNDS.y + CONTENT_BOUNDS.h / 2
  return { x: w / 2 - cx * scale, y: h / 2 - cy * scale, scale }
}

function clampView(x: number, y: number, s: number, w: number, h: number) {
  const minX = Math.min(0, w - WALL_W * s)
  const minY = Math.min(0, h - WALL_H * s)
  return {
    x: Math.max(minX, Math.min(0, x)),
    y: Math.max(minY, Math.min(0, y)),
  }
}

export function DiagramCanvas({ children, onActivate, onBackground, maxScale = 4 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const viewport = useRef({ w: 0, h: 0 })
  const tr = useRef({ x: 0, y: 0, scale: 1 })
  const minScaleRef = useRef(MIN_SCALE)
  const touched = useRef(false)
  const raf = useRef<number | undefined>(undefined)

  const panning = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  const startTr = useRef({ x: 0, y: 0 })
  const moved = useRef(0)
  const lastMove = useRef(0)
  const justDragged = useRef(false)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{
    dist: number
    sx: number
    sy: number
    tx: number
    ty: number
    scale: number
  } | null>(null)

  const apply = useCallback(() => {
    const t = tr.current
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`
    }
  }, [])

  const getClamped = useCallback((x?: number, y?: number, s?: number) => {
    const t = tr.current
    const { w, h } = viewport.current
    return clampView(x ?? t.x, y ?? t.y, s ?? t.scale, w, h)
  }, [])

  /** Measure, frame, adopt — unless the reader has already taken the wall over. */
  const refit = useCallback(() => {
    const size = measure(containerRef.current)
    viewport.current = size
    minScaleRef.current = Math.max(size.w / WALL_W, size.h / WALL_H, MIN_SCALE)
    if (touched.current) {
      const clamped = getClamped()
      tr.current = { x: clamped.x, y: clamped.y, scale: tr.current.scale }
      apply()
      return
    }
    const f = frame(size.w, size.h)
    tr.current = { ...f }
    apply()
  }, [apply, getClamped])

  useEffect(() => {
    refit()
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => refit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [refit])

  useEffect(() => {
    const onResize = () => refit()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [refit])

  useEffect(() => {
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    }
  }, [])

  const stopInertia = useCallback(() => {
    if (raf.current !== undefined) {
      cancelAnimationFrame(raf.current)
      raf.current = undefined
    }
  }, [])

  const reset = useCallback(() => {
    stopInertia()
    touched.current = false
    const size = measure(containerRef.current)
    viewport.current = size
    const f = frame(size.w, size.h)
    tr.current = { ...f }
    apply()
  }, [apply, stopInertia])

  const zoomAt = useCallback(
    (mx: number, my: number, factor: number) => {
      const t = tr.current
      const s = clampScale(t.scale * factor, minScaleRef.current, maxScale)
      const newX = mx - (mx - t.x) * (s / t.scale)
      const newY = my - (my - t.y) * (s / t.scale)
      const clamped = getClamped(newX, newY, s)
      tr.current = { x: clamped.x, y: clamped.y, scale: s }
      touched.current = true
      apply()
    },
    [apply, getClamped, maxScale],
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      stopInertia()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const factor = e.deltaY > 0 ? 0.9 : 1 / 0.9
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor)
    },
    [stopInertia, zoomAt],
  )

  const beginPinch = useCallback(() => {
    const pts = [...pointers.current.values()]
    if (pts.length < 2) return
    const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }]
    pinch.current = {
      dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      sx: (a.x + b.x) / 2,
      sy: (a.y + b.y) / 2,
      tx: tr.current.x,
      ty: tr.current.y,
      scale: tr.current.scale,
    }
    panning.current = false
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      stopInertia()
      const rect = containerRef.current?.getBoundingClientRect()
      const p = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
      pointers.current.set(e.pointerId, p)
      justDragged.current = false

      if (pointers.current.size === 1) {
        panning.current = true
        moved.current = 0
        start.current = { x: e.clientX, y: e.clientY }
        startTr.current = { x: tr.current.x, y: tr.current.y }
        lastMove.current = Date.now()
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
      } else if (pointers.current.size === 2) {
        beginPinch()
      }
    },
    [beginPinch, stopInertia],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      const rect = containerRef.current?.getBoundingClientRect()
      const p = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
      pointers.current.set(e.pointerId, p)

      // Two fingers: pinch around the midpoint, and let the midpoint travel.
      if (pointers.current.size >= 2 && pinch.current) {
        e.preventDefault()
        const pts = [...pointers.current.values()].slice(0, 2)
        const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }]
        const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const pin = pinch.current
        const s = clampScale(pin.scale * (dist / pin.dist), minScaleRef.current, maxScale)
        const worldX = (pin.sx - pin.tx) / pin.scale
        const worldY = (pin.sy - pin.ty) / pin.scale
        const clamped = getClamped(mx - worldX * s, my - worldY * s, s)
        tr.current = { x: clamped.x, y: clamped.y, scale: s }
        touched.current = true
        apply()
        return
      }

      if (!panning.current) return
      e.preventDefault()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      moved.current = Math.max(moved.current, Math.hypot(dx, dy))
      const clamped = getClamped(startTr.current.x + dx, startTr.current.y + dy, tr.current.scale)
      tr.current = { x: clamped.x, y: clamped.y, scale: tr.current.scale }
      if (moved.current > DRAG_SLOP) touched.current = true
      lastMove.current = Date.now()
      apply()
    },
    [apply, getClamped, maxScale],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.delete(e.pointerId)

      if (pointers.current.size === 1) {
        const rest = [...pointers.current.values()][0] as { x: number; y: number }
        const rect = containerRef.current?.getBoundingClientRect()
        start.current = { x: rest.x + (rect?.left ?? 0), y: rest.y + (rect?.top ?? 0) }
        startTr.current = { x: tr.current.x, y: tr.current.y }
        pinch.current = null
        panning.current = true
        return
      }
      if (pointers.current.size > 1) return

      pinch.current = null
      panning.current = false
      if (containerRef.current) containerRef.current.style.cursor = 'grab'

      if (moved.current > DRAG_SLOP) {
        justDragged.current = true
        return
      }

      // A flick: let the wall coast, then stop. No physics when the reader has
      // asked for reduced motion — the global policy zeroes transitions, and a
      // rAF loop is not a CSS transition, so it is checked here too.
      if (e.pointerType !== 'mouse') return
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
      const elapsed = Date.now() - lastMove.current
      if (elapsed > 100) return
      const vx = (tr.current.x - startTr.current.x) * 0.25
      const vy = (tr.current.y - startTr.current.y) * 0.25
      if (Math.abs(vx) < 8 && Math.abs(vy) < 8) return

      const fromX = tr.current.x
      const fromY = tr.current.y
      const t0 = performance.now()
      const duration = 320
      const step = () => {
        const r = Math.min((performance.now() - t0) / duration, 1)
        const ease = 1 - Math.pow(1 - r, 3)
        const clamped = getClamped(fromX + vx * ease, fromY + vy * ease, tr.current.scale)
        tr.current.x = clamped.x
        tr.current.y = clamped.y
        apply()
        if (r < 1) raf.current = requestAnimationFrame(step)
        else raf.current = undefined
      }
      raf.current = requestAnimationFrame(step)
    },
    [apply, getClamped],
  )

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (justDragged.current) {
        justDragged.current = false
        return
      }
      const target = e.target as HTMLElement
      if (target.closest('[data-diagram-ui]')) return
      const sheet = target.closest<HTMLElement>('[data-diagram-sheet]')
      if (sheet) {
        const id = sheet.getAttribute('data-diagram-sheet')
        if (id) onActivate?.(id, sheet)
        return
      }
      onBackground?.()
    },
    [onActivate, onBackground],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Only when the wall itself holds focus; a focused sheet owns its keys.
      if (e.target !== containerRef.current) return
      const { w, h } = viewport.current
      const step = 96
      let handled = true
      if (e.key === 'ArrowLeft') {
        const c = getClamped(tr.current.x + step, tr.current.y)
        tr.current.x = c.x
      } else if (e.key === 'ArrowRight') {
        const c = getClamped(tr.current.x - step, tr.current.y)
        tr.current.x = c.x
      } else if (e.key === 'ArrowUp') {
        const c = getClamped(tr.current.x, tr.current.y + step)
        tr.current.y = c.y
      } else if (e.key === 'ArrowDown') {
        const c = getClamped(tr.current.x, tr.current.y - step)
        tr.current.y = c.y
      } else if (e.key === '+' || e.key === '=') {
        zoomAt(w / 2, h / 2, 1.2)
        return
      } else if (e.key === '-' || e.key === '_') {
        zoomAt(w / 2, h / 2, 1 / 1.2)
        return
      } else if (e.key === '0') {
        reset()
        return
      } else {
        handled = false
      }
      if (handled) {
        e.preventDefault()
        touched.current = true
        apply()
      }
    },
    [apply, getClamped, reset, zoomAt],
  )

  return (
    <div
      ref={containerRef}
      className="diagram-wall absolute inset-0 overflow-hidden focus-visible:outline-none"
      style={{ cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
      role="group"
      aria-label="The wall of the Diagram"
      aria-describedby="diagram-wall-help"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 flex">
        <CodexObject>
          <div
            ref={contentRef}
            style={{
              transformOrigin: '0 0',
              position: 'absolute',
              left: 0,
              top: 0,
              width: WALL_W,
              height: WALL_H,
            }}
          >
            {children}
          </div>

          {/* The room's edge. Above the work, below the notes. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              background:
                'radial-gradient(128% 108% at 44% 46%, rgb(10 6 3 / 0) 42%, rgb(10 6 3 / 0.34) 76%, rgb(10 6 3 / 0.7) 100%)',
            }}
          />
        </CodexObject>
      </div>

      <p id="diagram-wall-help" className="sr-only">
        A wall of nine pinned sheets. Use the arrow keys to move across the wall, plus and minus to look closer, and
        zero to return to the whole wall. Press Tab to reach the sheets.
      </p>

      {/* The note under the navigation, not across it. */}
      <button
        type="button"
        data-diagram-ui
        onClick={reset}
        className="absolute right-4 top-3 z-20 w-[136px] cursor-pointer text-left transition-transform duration-[var(--dur-fast)] hover:-translate-y-0.5 focus-visible:[outline:2px_solid_var(--codex-brass-highlight)] focus-visible:[outline-offset:4px]"
        style={{
          padding: '9px 11px',
          background:
            'linear-gradient(152deg, var(--surface-page) 0%, var(--codex-page-block) 52%, var(--surface-page-inset) 100%)',
          boxShadow: '3px 5px 10px rgb(4 2 1 / 0.5), 1px 2px 3px rgb(4 2 1 / 0.32)',
          transform: 'rotate(-1.6deg)',
          clipPath: 'polygon(0% 2%, 100% 0%, 99% 100%, 1% 98%)',
          color: 'var(--text-on-page-primary)',
        }}
      >
        <span
          className="block"
          style={{ fontFamily: 'var(--font-hand)', fontSize: 15, lineHeight: 1.1, color: '#8c2b1f' }}
        >
          the whole wall
        </span>
        <span
          className="mt-0.5 block italic"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            lineHeight: 1.25,
            color: 'var(--text-on-page-secondary)',
          }}
        >
          step back from the papers
        </span>
        <span
          aria-hidden
          className="absolute left-1/2 top-[-5px] block h-2.5 w-2.5 -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 34% 30%, var(--codex-brass-highlight) 0%, var(--codex-brass) 52%, var(--codex-thread) 100%)',
            boxShadow: '0 2px 3px rgb(4 2 1 / 0.6)',
          }}
        />
      </button>

      <p
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-4 z-20 max-w-[240px] -rotate-[1.4deg]"
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: 17,
          lineHeight: 1.15,
          color: 'rgb(226 210 184 / 0.62)',
          textShadow: '0 1px 0 rgb(4 2 1 / 0.55)',
        }}
      >
        drag to move · scroll to look closer
      </p>
    </div>
  )
}
