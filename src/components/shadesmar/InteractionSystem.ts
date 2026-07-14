import type { Soul } from './types'
import type { SpatialGrid } from './SoulField'
import { CURIOUS_RADIUS, CURIOUS_MAX_SHIFT, CURIOUS_FORCE, HOVER_RADIUS } from './types'

export interface HoverInfo {
  soul: Soul
  name: string
  screenX: number
  screenY: number
  opacity: number
}

export class InteractionSystem {
  mx = 0
  my = 0
  worldX = 0
  worldY = 0
  hoveredId: string | null = null
  justClicked: Soul | null = null
  rippleRadius = 0
  rippleActive = false

  hoveredSoul: Soul | null = null
  hoverLabelOpacity = 0

  updateMouse(sx: number, sy: number, worldX: number, worldY: number): void {
    this.mx = sx
    this.my = sy
    this.worldX = worldX
    this.worldY = worldY
  }

  getWorldPos(): { x: number; y: number } {
    return { x: this.worldX, y: this.worldY }
  }

  updateCuriosity(souls: Soul[], dt: number): void {
    const wx = this.worldX
    const wy = this.worldY

    for (const s of souls) {
      const mass = s.mass
      const dx = wx - s.x
      const dy = wy - s.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const curiousRadius = CURIOUS_RADIUS * (0.5 + mass * 0.15)

      if (dist < curiousRadius && dist > 0.1) {
        const strength = ((1 - dist / curiousRadius) * CURIOUS_FORCE) / Math.max(1, mass * 0.4)
        const shift = strength * dt

        s.curiousDx += (dx / dist) * shift
        s.curiousDy += (dy / dist) * shift

        const maxShift = CURIOUS_MAX_SHIFT / Math.max(1, mass * 0.3)
        const mag = Math.sqrt(s.curiousDx * s.curiousDx + s.curiousDy * s.curiousDy)
        if (mag > maxShift) {
          s.curiousDx = (s.curiousDx / mag) * maxShift
          s.curiousDy = (s.curiousDy / mag) * maxShift
        }

        s.curious = true
      } else {
        s.curiousDx *= 0.95
        s.curiousDy *= 0.95
        if (Math.abs(s.curiousDx) < 0.01 && Math.abs(s.curiousDy) < 0.01) {
          s.curiousDx = 0
          s.curiousDy = 0
          s.curious = false
        }
      }
    }
  }

  updateHover(grid: SpatialGrid): void {
    const nearest = grid.nearest(this.worldX, this.worldY, HOVER_RADIUS)
    this.hoveredId = nearest?.id ?? null
    this.hoveredSoul = nearest ?? null

    if (this.hoveredId && !this.rippleActive) {
      this.rippleActive = true
      this.rippleRadius = 0
    }
    if (!this.hoveredId) {
      this.rippleActive = false
      this.rippleRadius = 0
    }

    if (this.rippleActive) {
      this.rippleRadius += 0.08
      if (this.rippleRadius > 1) {
        this.rippleActive = false
        this.rippleRadius = 0
      }
    }

    const nearby = grid.query(this.worldX, this.worldY, HOVER_RADIUS * 4)
    for (const s of nearby) {
      if (s.id === this.hoveredId) {
        s.targetGlow = 1
        s.targetScale = 1 + 0.4 / Math.max(1, s.mass * 0.3)
      } else {
        const dx = s.x - this.worldX
        const dy = s.y - this.worldY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < HOVER_RADIUS * 2) {
          s.targetGlow = 0.35
          s.targetScale = 1.04
        } else if (dist < HOVER_RADIUS * 4) {
          s.targetGlow = 0.12
          s.targetScale = 1.01
        } else {
          s.targetGlow = 0
          s.targetScale = 1
        }
      }
    }

    this.hoverLabelOpacity += (this.hoveredId ? 1 : -1) * 0.04
    this.hoverLabelOpacity = Math.max(0, Math.min(1, this.hoverLabelOpacity))
  }

  tryClick(_souls: Soul[], grid: SpatialGrid): Soul | null {
    const clicked = grid.nearest(this.worldX, this.worldY, HOVER_RADIUS)
    this.justClicked = clicked
    return clicked
  }
}
