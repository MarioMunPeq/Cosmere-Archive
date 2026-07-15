import {
  MIN_ZOOM,
  MAX_ZOOM,
  CAMERA_INERTIA,
  FOCUS_EXPANSION_AMPLITUDE,
  FOCUS_FLY_DURATION,
  FOCUS_EXIT_DURATION,
  CLUSTER_BY_ID,
} from './types'
import type { Soul } from './types'

export class CameraController {
  x = 0.5
  y = 0.5
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

  private storedX = 0.5
  private storedY = 0.5
  private storedZoom = 0.5

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
    const targetZoom = 0.8 / extent

    this.storeState()
    this.flyTo(cluster.cx, cluster.cy, targetZoom, FOCUS_FLY_DURATION)
  }

  isFlying() {
    return this.flyActive
  }
}
