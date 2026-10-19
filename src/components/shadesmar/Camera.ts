import {
  MIN_ZOOM,
  MAX_ZOOM,
  CAMERA_INERTIA,
  FOCUS_EXPANSION_AMPLITUDE,
  FOCUS_FLY_DURATION,
  FOCUS_EXIT_DURATION,
  FOCUS_VIEWPORT_FRACTION,
  CLUSTER_BY_ID,
  WORLD_W,
  WORLD_H,
  WORLD_SPAN_Y,
  VIEWPORT_FIT,
  realmBounds,
} from './types'
import type { Soul } from './types'

/**
 * The camera.
 *
 * Three changes in this block, all from §5.5.1:
 *
 * - it starts at the centre of the **2.4 x 1.6** world, not the centre of a
 *   unit square that no longer exists;
 * - `fitToViewport()` replaces the hardcoded `zoom = 0.5`, and is recomputed on
 *   every resize, so the ocean is framed the same on a phone and on a 4K panel;
 * - `bounds()` reports where the realms actually land on screen. That is what
 *   criterion S.1 measures, and it has to read the real camera rather than
 *   recompute the arithmetic, or the criterion is testing its own formula.
 */
export class CameraController {
  x = WORLD_W / 2
  y = WORLD_H / 2
  zoom = 0.5

  private vx = 0
  private vy = 0

  private dragFromX = 0
  private dragFromY = 0
  private dragStartX = 0
  private dragStartY = 0
  private dragStartZoom = 0
  dragging = false

  private flyActive = false
  private flyFromX = 0
  private flyFromY = 0
  private flyFromZoom = 0
  private flyToX = 0
  private flyToY = 0
  private flyToZoom = 0
  private flyDuration = 0
  private flyTime = 0

  private storedX = WORLD_W / 2
  private storedY = WORLD_H / 2
  private storedZoom = 0.5

  /** The zoom that frames the whole realm grid in a viewport of this size. */
  fitToViewport(): number {
    return VIEWPORT_FIT / WORLD_SPAN_Y
  }

  /**
   * Re-frame on a resize.
   *
   * Only applied when the camera is idle. Re-zooming mid-drag would yank the
   * world out from under a pointer that is still holding it, and the same goes
   * for a flight in progress: both are animations with an end point, and a
   * resize should not change where they end up.
   */
  resize(w: number, h: number): void {
    if (this.dragging || this.flyActive) return
    const fit = this.fitToViewport()
    // Preserve where the reader is looking, in world terms, when only the
    // framing changes.
    const anchor = this.storedZoom > 0 ? this.zoom / this.storedZoom : 1
    this.zoom = fit * anchor
    this.storedZoom = fit
    void w
    void h
  }

  /** Called when focus is entered, so leaving it returns to the fitted overview. */
  markFittedOverview(): void {
    this.storedZoom = this.fitToViewport()
  }

  /** Reset to the overview framing. */
  resetToOverview(): void {
    this.x = WORLD_W / 2
    this.y = WORLD_H / 2
    this.zoom = this.fitToViewport()
    // The overview *is* the state focus exits to, so it has to be recorded as
    // stored or leaving a realm restores a framing nobody was ever in.
    this.storedX = this.x
    this.storedY = this.y
    this.storedZoom = this.zoom
    this.vx = 0
    this.vy = 0
  }

  /**
   * Where the realm grid currently sits on screen, in CSS pixels.
   *
   * Returned relative to the canvas, and measured from this camera's live
   * `x`, `y`, `zoom`. Criterion S.1 reads it through `window.__shadesmar`.
   */
  bounds(w: number, h: number): { x: number; y: number; width: number; height: number } {
    const b = realmBounds()
    const tl = this.worldToScreen(b.minX, b.minY, w, h)
    const br = this.worldToScreen(b.maxX, b.maxY, w, h)
    return { x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y }
  }

  /**
   * Fraction of the viewport's shorter side the realm grid occupies.
   *
   * The **smaller** of the two on-screen dimensions, deliberately. The grid is
   * 4 x 3 over a 3:2 world, so on the long axis it always runs a few percent
   * past the edge — that is what horizontal panning is for. What has to be
   * true at every resolution is that its short axis is framed at the same
   * fraction, and that fraction is what S.1 names.
   */
  boundsRatio(w: number, h: number): number {
    const b = this.bounds(w, h)
    const short = Math.min(w, h)
    return short === 0 ? 0 : Math.min(b.width, b.height) / short
  }

  worldToScreen(wx: number, wy: number, w: number, h: number) {
    const sx = (wx - this.x) * this.zoom * Math.min(w, h) + w / 2
    const sy = (wy - this.y) * this.zoom * Math.min(w, h) + h / 2
    return { x: sx, y: sy }
  }

  screenToWorld(sx: number, sy: number, w: number, h: number) {
    const scale = this.zoom * Math.min(w, h)
    const wx = (sx - w / 2) / scale + this.x
    const wy = (sy - h / 2) / scale + this.y
    return { x: wx, y: wy }
  }

  startDrag(sx: number, sy: number) {
    this.dragging = true
    this.dragFromX = this.x
    this.dragFromY = this.y
    this.dragStartX = sx
    this.dragStartY = sy
    this.dragStartZoom = this.zoom
    this.vx = 0
    this.vy = 0
    this.flyActive = false
  }

  moveDrag(sx: number, sy: number, w: number, h: number) {
    if (!this.dragging) return
    const scale = this.dragStartZoom * Math.min(w, h)
    const dx = (this.dragStartX - sx) / scale
    const dy = (this.dragStartY - sy) / scale
    this.x = this.dragFromX + dx
    this.y = this.dragFromY + dy
    this.vx = dx
    this.vy = dy
  }

  endDrag() {
    this.dragging = false
  }

  zoomAt(sx: number, sy: number, factor: number, w: number, h: number) {
    const oldZoom = this.zoom
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * factor))
    const actual = this.zoom / oldZoom
    const world = this.screenToWorld(sx, sy, w, h)
    this.x = world.x + (this.x - world.x) * (1 / actual)
    this.y = world.y + (this.y - world.y) * (1 / actual)
  }

  tick(dt: number, _w: number, _h: number) {
    if (this.flyActive) {
      this.flyTime += dt
      const t = Math.min(1, this.flyTime / this.flyDuration)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      this.x = this.flyFromX + (this.flyToX - this.flyFromX) * ease
      this.y = this.flyFromY + (this.flyToY - this.flyFromY) * ease
      this.zoom = this.flyFromZoom + (this.flyToZoom - this.flyFromZoom) * ease
      if (t >= 1) this.flyActive = false
    }

    if (!this.dragging && !this.flyActive) {
      this.x += this.vx
      this.y += this.vy
      this.vx *= CAMERA_INERTIA
      this.vy *= CAMERA_INERTIA
    }
  }

  private flyTo(x: number, y: number, zoom: number, duration: number) {
    this.flyFromX = this.x
    this.flyFromY = this.y
    this.flyFromZoom = this.zoom
    this.flyToX = x
    this.flyToY = y
    this.flyToZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
    this.flyDuration = duration
    this.flyTime = 0
    this.flyActive = true
    this.vx = 0
    this.vy = 0
  }

  storeState() {
    this.storedX = this.x
    this.storedY = this.y
    this.storedZoom = this.zoom
  }

  restoreState() {
    this.flyTo(this.storedX, this.storedY, this.storedZoom, FOCUS_EXIT_DURATION)
  }

  flyToFit(souls: Soul[], clusterId: string, _screenW: number, _screenH: number) {
    const cluster = CLUSTER_BY_ID.get(clusterId)
    if (!cluster) return

    let maxDist = 0
    let count = 0
    for (const s of souls) {
      if (s.planet !== clusterId) continue
      const dx = s.restX - cluster.cx
      const dy = s.restY - cluster.cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxDist) maxDist = dist
      count++
    }
    if (count === 0 || maxDist < 0.001) return

    const expandedRadius = maxDist * (1 + FOCUS_EXPANSION_AMPLITUDE)
    const extent = expandedRadius * 2
    // Focused framing is a fraction of the viewport's short side rather than an
    // absolute zoom, so a realm opens at the same apparent size on a phone and
    // on a 4K panel. `extent` is in world units and `worldToScreen` multiplies
    // by `zoom * min(w, h)`, so the two cancel and the fraction is exact.
    const targetZoom = FOCUS_VIEWPORT_FRACTION / extent

    this.storeState()
    this.flyTo(cluster.cx, cluster.cy, targetZoom, FOCUS_FLY_DURATION)
  }

  isFlying() {
    return this.flyActive
  }
}
