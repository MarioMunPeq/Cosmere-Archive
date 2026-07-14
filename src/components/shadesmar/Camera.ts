import { MIN_ZOOM, MAX_ZOOM, CAMERA_INERTIA } from './types'

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export class CameraController {
  x = 0.5
  y = 0.5
  zoom = 0.5

  targetX = 0.5
  targetY = 0.5
  targetZoom = 0.5

  velocityX = 0
  velocityY = 0

  isDragging = false
  dragStartX = 0
  dragStartY = 0
  lastDragX = 0
  lastDragY = 0

  flyActive = false
  flyStartX = 0
  flyStartY = 0
  flyStartZoom = 0
  flyTargetX = 0
  flyTargetY = 0
  flyTargetZoom = 0
  flyDuration = 0
  flyElapsed = 0

  constructor() {
    this.x = 0.5
    this.y = 0.5
    this.zoom = 0.5
    this.targetX = 0.5
    this.targetY = 0.5
    this.targetZoom = 0.5
  }

  update(dt: number, screenW: number, screenH: number): void {
    const scale = Math.min(screenW, screenH)

    if (this.flyActive) {
      this.flyElapsed += dt
      const t = Math.min(1, this.flyElapsed / this.flyDuration)
      const e = easeInOutQuad(t)
      this.x = this.flyStartX + (this.flyTargetX - this.flyStartX) * e
      this.y = this.flyStartY + (this.flyTargetY - this.flyStartY) * e
      this.zoom = this.flyStartZoom + (this.flyTargetZoom - this.flyStartZoom) * e
      this.targetX = this.x
      this.targetY = this.y
      this.targetZoom = this.zoom
      if (t >= 1) {
        this.flyActive = false
        this.x = this.flyTargetX
        this.y = this.flyTargetY
        this.zoom = this.flyTargetZoom
        this.targetX = this.x
        this.targetY = this.y
        this.targetZoom = this.zoom
        this.velocityX = 0
        this.velocityY = 0
      }
      this.clampBounds(scale, screenW, screenH)
      return
    }

    if (!this.isDragging) {
      this.velocityX *= CAMERA_INERTIA
      this.velocityY *= CAMERA_INERTIA
      if (Math.abs(this.velocityX) < 0.00001) this.velocityX = 0
      if (Math.abs(this.velocityY) < 0.00001) this.velocityY = 0
      this.targetX += this.velocityX * dt * 0.5
      this.targetY += this.velocityY * dt * 0.5
    }

    this.x += (this.targetX - this.x) * 0.08
    this.y += (this.targetY - this.y) * 0.08
    this.zoom += (this.targetZoom - this.zoom) * 0.08

    this.clampBounds(scale, screenW, screenH)
  }

  private clampBounds(scale: number, screenW: number, screenH: number): void {
    const halfVisX = screenW / (2 * scale * this.zoom)
    const halfVisY = screenH / (2 * scale * this.zoom)
    const margin = 0.05
    const minX = -margin + halfVisX
    const maxX = 1 + margin - halfVisX
    const minY = -margin + halfVisY
    const maxY = 1 + margin - halfVisY

    if (minX < maxX) {
      this.x = Math.max(minX, Math.min(maxX, this.x))
      this.targetX = Math.max(minX, Math.min(maxX, this.targetX))
    } else {
      this.x = 0.5
      this.targetX = 0.5
    }
    if (minY < maxY) {
      this.y = Math.max(minY, Math.min(maxY, this.y))
      this.targetY = Math.max(minY, Math.min(maxY, this.targetY))
    } else {
      this.y = 0.5
      this.targetY = 0.5
    }
  }

  startDrag(sx: number, sy: number): void {
    this.isDragging = true
    this.dragStartX = sx
    this.dragStartY = sy
    this.lastDragX = sx
    this.lastDragY = sy
    this.velocityX = 0
    this.velocityY = 0
    this.flyActive = false
  }

  drag(sx: number, sy: number, screenW: number, screenH: number): void {
    if (!this.isDragging) return
    const scale = Math.min(screenW, screenH)
    const dx = (sx - this.lastDragX) / (scale * this.zoom)
    const dy = (sy - this.lastDragY) / (scale * this.zoom)
    this.targetX -= dx
    this.targetY -= dy
    this.velocityX = -dx
    this.velocityY = -dy
    this.lastDragX = sx
    this.lastDragY = sy
  }

  endDrag(): void {
    this.isDragging = false
  }

  wheel(delta: number, mouseX: number, mouseY: number, screenW: number, screenH: number): void {
    const scale = Math.min(screenW, screenH)
    const oldZoom = this.targetZoom
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom - delta * 0.001 * oldZoom))
    if (newZoom === oldZoom) return

    const worldX = (mouseX - screenW / 2) / (scale * oldZoom) + this.targetX
    const worldY = (mouseY - screenH / 2) / (scale * oldZoom) + this.targetY
    this.targetX = worldX - (mouseX - screenW / 2) / (scale * newZoom)
    this.targetY = worldY - (mouseY - screenH / 2) / (scale * newZoom)
    this.targetZoom = newZoom
    this.flyActive = false
  }

  flyTo(worldX: number, worldY: number, targetZoom: number, duration: number): void {
    this.flyActive = true
    this.flyStartX = this.x
    this.flyStartY = this.y
    this.flyStartZoom = this.zoom
    this.flyTargetX = worldX
    this.flyTargetY = worldY
    this.flyTargetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom))
    this.flyDuration = duration
    this.flyElapsed = 0
    this.velocityX = 0
    this.velocityY = 0
  }

  worldToScreen(wx: number, wy: number, screenW: number, screenH: number): { x: number; y: number } {
    const scale = Math.min(screenW, screenH)
    return {
      x: (wx - this.x) * scale * this.zoom + screenW / 2,
      y: (wy - this.y) * scale * this.zoom + screenH / 2,
    }
  }

  screenToWorld(sx: number, sy: number, screenW: number, screenH: number): { x: number; y: number } {
    const scale = Math.min(screenW, screenH)
    return {
      x: (sx - screenW / 2) / (scale * this.zoom) + this.x,
      y: (sy - screenH / 2) / (scale * this.zoom) + this.y,
    }
  }

  getCurrentLod(): number {
    return this.zoom
  }

  isFlying(): boolean {
    return this.flyActive
  }
}
