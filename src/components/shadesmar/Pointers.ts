/**
 * Pointer bookkeeping — §5.5.2's touch half.
 *
 * The canvas already had a mouse: drag to pan, wheel to zoom, click to select.
 * None of that works with a finger, and the plan is explicit about what has to:
 *
 * | gesture        | desktop        | touch            |
 * |----------------|----------------|------------------|
 * | pan            | left drag      | one finger       |
 * | zoom           | wheel          | two-finger pinch |
 * | focus a realm  | click its name | double tap       |
 * | leave focus    | Esc / empty    | a Back button    |
 *
 * Pointer Events rather than Touch Events: one code path for both, and every
 * desktop browser ships them. The only thing this has to get right is that a
 * pinch is not a drag — with two fingers down, moving them apart zooms and the
 * midpoint travelling pans, and the two compose.
 *
 * It is plain state and arithmetic so it can be tested without a browser. The
 * tracker's whole surface is `down` / `move` / `up` / `cancel` / `clear` and the
 * gesture each returns; applying a gesture to a camera is the caller's job.
 */

import { DRAG_THRESHOLD_PX } from './types'

export interface Point {
  x: number
  y: number
}

/** A gesture, in camera terms. */
export type Gesture =
  | { kind: 'none' }
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'doubleTap'; x: number; y: number }
  /** Pixels the pointer travelled since the last event. */
  | { kind: 'pan'; dx: number; dy: number; x: number; y: number }
  /**
   * Two or more fingers. `factor` is the ratio of the spread now to the spread
   * when the second finger landed; `cx`/`cy` is where the fingers are between.
   */
  | { kind: 'pinch'; factor: number; cx: number; cy: number }

export const DOUBLE_TAP_MS = 320
/** Two taps are one gesture only if they land within this many pixels. */
const DOUBLE_TAP_SLOP_PX = 28

export interface PointerTracker {
  /** Pointers currently down, by id. */
  readonly down: ReadonlyMap<number, Point>
  /** True while exactly one pointer is down: a pan. */
  readonly panning: boolean
  /** True while two or more are down: a pinch. */
  readonly pinching: boolean
  down_(id: number, x: number, y: number, time: number): void
  move_(id: number, x: number, y: number): Gesture
  up_(id: number): Gesture
  cancel(id: number): void
  clear(): void
}

export function createPointerTracker(): PointerTracker {
  /** Last known position per pointer id. The map *is* the down-set. */
  const points = new Map<number, Point>()
  /** Spread and midpoint as of the previous move, for the pinch ratio. */
  let baseSpread = 0
  let moved = false
  let lastTap: { time: number; x: number; y: number } | null = null
  let pendingDoubleTap: Point | null = null

  function centroid(): Point {
    let x = 0
    let y = 0
    for (const p of points.values()) {
      x += p.x
      y += p.y
    }
    const n = points.size || 1
    return { x: x / n, y: y / n }
  }

  function spread(): number {
    const [a, b] = [...points.values()]
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }

  return {
    get down() {
      return points
    },
    get panning() {
      return points.size === 1
    },
    get pinching() {
      return points.size >= 2
    },

    down_(id, x, y, time) {
      points.set(id, { x, y })
      moved = false
      // The pinch baseline is captured here, when the second finger lands: by
      // the time it has travelled, the starting spread is gone.
      if (points.size >= 2) baseSpread = spread()

      const near =
        lastTap !== null &&
        time - lastTap.time < DOUBLE_TAP_MS &&
        Math.hypot(x - lastTap.x, y - lastTap.y) < DOUBLE_TAP_SLOP_PX
      if (near) {
        pendingDoubleTap = { x, y }
        lastTap = null
      } else {
        lastTap = { time, x, y }
      }
    },

    move_(id, x, y) {
      const prev = points.get(id)
      if (!prev) return { kind: 'none' }
      const dx = x - prev.x
      const dy = y - prev.y
      points.set(id, { x, y })

      if (points.size >= 2) {
        const previous = baseSpread
        const now = spread()
        const factor = previous > 1 ? now / previous : 1
        // The baseline follows the fingers, so one continuous pinch is a
        // sequence of small ratios instead of one runaway zoom.
        baseSpread = now
        if (Math.abs(now - previous) > DRAG_THRESHOLD_PX) moved = true
        const c = centroid()
        return { kind: 'pinch', factor, cx: c.x, cy: c.y }
      }

      if (Math.hypot(dx, dy) > 0) moved = true
      return { kind: 'pan', dx, dy, x, y }
    },

    up_(id) {
      const at = points.get(id)
      const wasPinch = points.size >= 2
      points.delete(id)
      if (points.size < 2) baseSpread = 0
      if (wasPinch) {
        // Releasing one finger of a pinch must not fire a tap.
        moved = true
        return { kind: 'none' }
      }

      if (pendingDoubleTap) {
        const d = pendingDoubleTap
        pendingDoubleTap = null
        lastTap = null
        return { kind: 'doubleTap', x: d.x, y: d.y }
      }
      if (!at || moved) return { kind: 'none' }
      moved = false
      return { kind: 'tap', x: at.x, y: at.y }
    },

    cancel(id) {
      points.delete(id)
      if (points.size < 2) baseSpread = 0
      moved = false
    },

    clear() {
      points.clear()
      baseSpread = 0
      moved = false
      lastTap = null
      pendingDoubleTap = null
    },
  }
}
