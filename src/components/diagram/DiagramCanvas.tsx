import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react'
import { WALL_W, WALL_H, CONTENT_BOUNDS } from './wall-docs'

interface FocusAnchor {
  x: number
  y: number
  w: number
  h: number
}

interface Props {
  children: ReactNode
  focusAnchor: FocusAnchor | null
  onFocusChange: (a: FocusAnchor | null) => void
  minScale?: number
  maxScale?: number
}

/**
 * Measure the element that actually holds the wall.
 *
 * `window.innerWidth` was used, and that is the whole bug: the mural sits in a
 * column beside a 360px reading panel, so it was being framed for the whole
 * window while occupying 75% of it. The wall was fitted to a viewport it did
 * not have, landed off-centre, and `clampView` then pushed it flush to the left
 * edge — which is the black half of the screen in the screenshot.
 */
function measure(el: HTMLElement | null): { w: number; h: number } {
  if (el) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return { w: r.width, h: r.height }
  }
  return { w: window.innerWidth, h: window.innerHeight }
}

/**
 * Frame the whole wall inside a viewport of this size.
 *
 * `Math.min` over `CONTENT_BOUNDS` — a *contain* fit, so every sheet is on
 * screen at once. The previous cover fit (`Math.max` over the 5000x5000 canvas)
 * cropped four of the nine sheets off the edge on arrival.
 *
 * Centred on the **sheets' own bounds**, not on the canvas centre. The mount
 * effect used to recentre on `DOC_CX`/`DOC_CY`, which is the middle of the
 * drawing surface and roughly 300 units away from where the notes actually
 * hang, so the fit and the centring disagreed with each other and the wall sat
 * off to one side.
 */
function frame(w: number, h: number) {
  const scale = Math.min(w / CONTENT_BOUNDS.w, h / CONTENT_BOUNDS.h)
  return {
    scale,
    x: (w - CONTENT_BOUNDS.w * scale) / 2 - CONTENT_BOUNDS.x * scale,
    y: (h - CONTENT_BOUNDS.h * scale) / 2 - CONTENT_BOUNDS.y * scale,
  }
}

function clampView(x: number, y: number, s: number, w: number, h: number) {
  const minX = Math.min(0, w - WALL_W * s)
  const maxX = 0
  const minY = Math.min(0, h - WALL_H * s)
  const maxY = 0
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function DiagramCanvas({ children, focusAnchor, onFocusChange, minScale = 0.18, maxScale = 5.0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const viewport = useRef({ w: 0, h: 0 })
  const tr = useRef({ x: 0, y: 0, scale: 1 })
  const isPanning = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  const startTr = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const lastMove = useRef(0)
  const raf = useRef<number>(undefined)
  const [showOverview, setShowOverview] = useState(false)
  const isAnimating = useRef(false)
  const prevFocusRef = useRef<FocusAnchor | null>(null)
  /** True once the reader has moved or zoomed, so a resize stops refitting. */
  const touched = useRef(false)

  const initialView = useRef({ x: 0, y: 0, scale: 1 })

  function apply() {
    const t = tr.current
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`
    }
  }

  const getClamped = useCallback((tx?: number, ty?: number, ts?: number) => {
    const { x, y, scale } = tr.current
    const { w, h } = viewport.current
    return clampView(tx ?? x, ty ?? y, ts ?? scale, w, h)
  }, [])

  /** Measure, frame, and adopt — unless the reader has taken over. */
  const refit = useCallback(() => {
    const size = measure(containerRef.current)
    viewport.current = size
    if (touched.current) {
      // Keep what they were looking at; only re-clamp to the new bounds.
      const clamped = getClamped()
      tr.current = { x: clamped.x, y: clamped.y, scale: tr.current.scale }
      apply()
      return
    }
    const f = frame(size.w, size.h)
    tr.current = { x: f.x, y: f.y, scale: f.scale }
    initialView.current = { ...tr.current }
    apply()
  }, [getClamped])

  useEffect(() => {
    refit()
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    // A ResizeObserver, not `window.resize`: the mural's box changes when the
    // reading panel appears and when the viewport changes, and only the first of
    // those fires a window resize.
    const ro = new ResizeObserver(() => refit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [refit])

  useEffect(() => {
    function onResize() {
      refit()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [refit])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && focusAnchor) {
        onFocusChange(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusAnchor, onFocusChange])

  useEffect(() => {
    if (prevFocusRef.current === focusAnchor) return
    prevFocusRef.current = focusAnchor

    if (raf.current) {
      cancelAnimationFrame(raf.current)
      raf.current = undefined
    }

    const from = { ...tr.current }
    let to: { x: number; y: number; scale: number }

    if (focusAnchor) {
      const { w, h } = viewport.current
      const targetW = focusAnchor.w * 1.15
      const targetH = focusAnchor.h * 1.15
      const targetScale = Math.min(Math.min(w / targetW, h / targetH) * 0.88, maxScale)
      const targetCx = focusAnchor.x + focusAnchor.w / 2
      const targetCy = focusAnchor.y + focusAnchor.h / 2
      const clamped = getClamped(w / 2 - targetCx * targetScale, h / 2 - targetCy * targetScale, targetScale)
      to = { x: clamped.x, y: clamped.y, scale: targetScale }
    } else {
      to = { ...initialView.current }
    }

    isAnimating.current = true
    const dur = 420
    const t0 = performance.now()
    let cancelled = false

    function step() {
      if (cancelled) return
      const elapsed = performance.now() - t0
      const raw = Math.min(elapsed / dur, 1)
      const t = easeOutCubic(raw)
      tr.current.x = lerp(from.x, to.x, t)
      tr.current.y = lerp(from.y, to.y, t)
      tr.current.scale = lerp(from.scale, to.scale, t)
      const clamped = getClamped(tr.current.x, tr.current.y, tr.current.scale)
      tr.current.x = clamped.x
      tr.current.y = clamped.y
      apply()
      if (raw < 1) {
        raf.current = requestAnimationFrame(step)
      } else {
        tr.current.x = to.x
        tr.current.y = to.y
        tr.current.scale = to.scale
        apply()
        isAnimating.current = false
        setShowOverview(to.scale < 0.25 && !focusAnchor)
      }
    }
    raf.current = requestAnimationFrame(step)
    return () => {
      cancelled = true
    }
  }, [focusAnchor, maxScale, getClamped, onFocusChange])

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isPanning.current = true
    start.current = { x: e.clientX, y: e.clientY }
    startTr.current = { ...tr.current }
    vel.current = { x: 0, y: 0 }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    if (raf.current) {
      cancelAnimationFrame(raf.current)
      raf.current = undefined
    }
  }, [])

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return
      e.preventDefault()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      const t = tr.current
      t.x = startTr.current.x + dx
      t.y = startTr.current.y + dy
      const clamped = getClamped(t.x, t.y, t.scale)
      t.x = clamped.x
      t.y = clamped.y
      vel.current.x = t.x - startTr.current.x
      vel.current.y = t.y - startTr.current.y
      lastMove.current = Date.now()
      apply()
    },
    [getClamped],
  )

  const onUp = useCallback(() => {
    isPanning.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'

    const elapsed = Date.now() - lastMove.current
    if (elapsed > 100) {
      vel.current.x = 0
      vel.current.y = 0
    }

    const vx = vel.current.x * 0.3
    const vy = vel.current.y * 0.3
    if (Math.abs(vx) < 3 && Math.abs(vy) < 3) {
      setShowOverview(tr.current.scale < 0.25)
      return
    }

    const sx = tr.current.x
    const sy = tr.current.y
    const duration = 350
    const st = performance.now()

    function inert() {
      const r = Math.min((performance.now() - st) / duration, 1)
      const e = 1 - Math.pow(1 - r, 3)
      const clamped = getClamped(sx + vx * e, sy + vy * e, tr.current.scale)
      tr.current.x = clamped.x
      tr.current.y = clamped.y
      apply()
      if (r < 1) {
        raf.current = requestAnimationFrame(inert)
      } else {
        setShowOverview(tr.current.scale < 0.25)
      }
    }
    raf.current = requestAnimationFrame(inert)
  }, [getClamped])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (raf.current) {
        cancelAnimationFrame(raf.current)
        raf.current = undefined
      }
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.9 : 1 / 0.9
      const s = Math.max(minScale, Math.min(maxScale, tr.current.scale * factor))
      const newX = mx - (mx - tr.current.x) * (s / tr.current.scale)
      const newY = my - (my - tr.current.y) * (s / tr.current.scale)
      const clamped = getClamped(newX, newY, s)
      tr.current.x = clamped.x
      tr.current.y = clamped.y
      tr.current.scale = s
      setShowOverview(s < 0.25)
      apply()
    },
    [minScale, maxScale, getClamped],
  )

  const resetView = useCallback(() => {
    onFocusChange(null)
    const iv = initialView.current
    const clamped = getClamped(iv.x, iv.y, iv.scale)
    tr.current = { x: clamped.x, y: clamped.y, scale: iv.scale }
    setShowOverview(false)
    apply()
  }, [onFocusChange, getClamped])

  const onContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (isAnimating.current) return
      if (e.target === containerRef.current || (e.target as HTMLElement)?.dataset?.diagramBg) {
        onFocusChange(null)
      }
    },
    [onFocusChange],
  )

  return (
    <div
      ref={containerRef}
      /*
       * `absolute inset-0`, not `fixed inset-0`.
       *
       * Fixed took the mural out of the page's layout entirely and pinned it to
       * the window, so it kept measuring 1440x900 while the reading panel took
       * 360px of that — the wall was framed for a viewport it did not have and
       * the leftover rendered as black. Absolute keeps it inside `main`, which
       * is what every measurement downstream expects.
       */
      className="absolute inset-0 overflow-hidden"
      style={{
        background: '#140e0a',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onWheel={onWheel}
      onDragStart={(e) => e.preventDefault()}
      onClick={onContainerClick}
    >
      <div
        ref={contentRef}
        data-diagram-bg
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

      {focusAnchor && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFocusChange(null)
          }}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 text-[11px] font-mono tracking-[0.15em] uppercase text-[#b8a898] border border-[#5a4a3a]/30 rounded hover:bg-[#5a4a3a]/20 transition-all"
        >
          ✕ Close
        </button>
      )}

      {showOverview && !focusAnchor && (
        <button
          onClick={resetView}
          className="fixed top-4 left-4 z-50 px-4 py-2 text-[11px] font-mono tracking-[0.15em] uppercase text-[#b8a898] border border-[#5a4a3a]/30 rounded hover:bg-[#5a4a3a]/20 transition-all"
        >
          ← Overview
        </button>
      )}
    </div>
  )
}
