import {
  FOCUS_EXPANSION_AMPLITUDE,
  SMART_HOVER_RADIUS,
  CLUSTER_BY_ID,
  CLUSTERS,
  CLUSTER_HOVER_RADIUS_WORLD,
  CURSOR_RIPPLE_STRENGTH,
  CURSOR_RIPPLE_RADIUS,
  OTHER_DIM_FACTOR,
} from './types'
import type { Soul } from './types'
import type { SpatialGrid } from './SoulField'

export class InteractionModel {
  focusPlanet: string | null = null
  focusTransition = 0

  hoveredId: string | null = null
  hoveredSoul: Soul | null = null
  private prevHoveredDistance = 0
  hoverLabelOpacity = 0

  hoveredCluster: string | null = null

  enterFocus(clusterId: string) {
    this.focusPlanet = clusterId
    this.focusTransition = 0
  }

  exitFocus() {
    this.focusPlanet = null
    this.focusTransition = 0
  }

  isFocused() {
    return this.focusPlanet !== null
  }

  getExpansionFactor() {
    return this.focusPlanet ? this.focusTransition : 0
  }

  applyClusterExpansion(souls: Soul[]) {
    const factor = this.getExpansionFactor()
    if (factor < 0.001) return
    const cluster = this.focusPlanet ? CLUSTER_BY_ID.get(this.focusPlanet) : null
    if (!cluster) return

    const scale = 1 + FOCUS_EXPANSION_AMPLITUDE * factor

    for (const s of souls) {
      if (s.planet !== this.focusPlanet) continue
      s.x = cluster.cx + (s.restX - cluster.cx) * scale
      s.y = cluster.cy + (s.restY - cluster.cy) * scale
    }
  }

  updateHoveredCluster(worldX: number, worldY: number) {
    this.hoveredCluster = null
    for (const cluster of CLUSTERS) {
      if (cluster.planetRadius === 0) continue
      const dx = worldX - cluster.cx
      const dy = worldY - cluster.cy
      if (dx * dx + dy * dy < CLUSTER_HOVER_RADIUS_WORLD * CLUSTER_HOVER_RADIUS_WORLD) {
        this.hoveredCluster = cluster.id
        break
      }
    }
  }

  updateSmartHover(grid: SpatialGrid, worldX: number, worldY: number, _souls: Soul[]) {
    const candidates = grid.query(worldX, worldY, SMART_HOVER_RADIUS)
    let best: Soul | null = null
    let bestScore = -Infinity

    for (const s of candidates) {
      const dx = s.x - worldX
      const dy = s.y - worldY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > SMART_HOVER_RADIUS) continue
      const distScore = (1 - dist / SMART_HOVER_RADIUS) * 100
      const sizeScore = (s.radius / 26) * 15
      const stabilityScore = (1 - Math.abs(dist - this.prevHoveredDistance) / SMART_HOVER_RADIUS) * 20
      const massScore = s.mass * 5
      const score = distScore + sizeScore + stabilityScore + massScore
      if (score > bestScore) {
        bestScore = score
        best = s
      }
    }

    if (best) this.prevHoveredDistance = Math.sqrt((best.x - worldX) ** 2 + (best.y - worldY) ** 2)

    if (this.hoveredId && best && best.id === this.hoveredId) {
      return
    }

    if (best) {
      this.hoveredId = best.id
      this.hoveredSoul = best
    }
  }

  updateHoverSoulDisplay(souls: Soul[]) {
    const hovered = this.hoveredSoul
    for (const s of souls) {
      if (hovered && s.id === hovered.id) {
        s.targetGlow = Math.max(s.targetGlow, 0.8)
        s.targetScale = Math.max(s.targetScale, 1.4)
      } else if (hovered && hovered.planet !== null && s.planet === hovered.planet && s.id !== hovered.id) {
        s.targetGlow = Math.max(s.targetGlow, 0.2)
        s.targetScale = Math.max(s.targetScale, 1.08)
      }
    }
  }

  updateHoverLabelOpacity(dt: number) {
    const target = this.hoveredSoul ? 1 : 0
    this.hoverLabelOpacity += (target - this.hoverLabelOpacity) * Math.min(1, dt * 5)
  }

  applyCursorRipple(souls: Soul[], worldX: number, worldY: number, dt: number) {
    const rippleStr = CURSOR_RIPPLE_STRENGTH * dt * 60
    for (const s of souls) {
      const dx = s.x - worldX
      const dy = s.y - worldY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CURSOR_RIPPLE_RADIUS && dist > 0.001) {
        const falloff = (1 - dist / CURSOR_RIPPLE_RADIUS) * rippleStr
        const perturb = Math.sin(s.breathePhase + performance.now() * 0.002) * 0.3
        const angle = Math.atan2(dy, dx) + perturb
        s.x += Math.cos(angle) * falloff
        s.y += Math.sin(angle) * falloff
      }
    }
  }

  updatePlanetDimming(souls: Soul[]) {
    if (!this.focusPlanet) {
      for (const s of souls) {
        s.targetOpacity = Math.max(s.targetOpacity, 0.7)
      }
      return
    }
    for (const s of souls) {
      if (s.planet === this.focusPlanet) {
        s.targetOpacity = Math.max(s.targetOpacity, 0.9)
      } else {
        s.targetOpacity = Math.min(s.targetOpacity, OTHER_DIM_FACTOR)
      }
    }
  }

  updateFocusTransition(dt: number) {
    if (this.focusPlanet) {
      this.focusTransition = Math.min(1, this.focusTransition + dt * 1.5)
    } else {
      this.focusTransition = Math.max(0, this.focusTransition - dt * 1.5)
    }
  }

  reset() {
    this.focusPlanet = null
    this.focusTransition = 0
    this.hoveredId = null
    this.hoveredSoul = null
    this.hoverLabelOpacity = 0
    this.hoveredCluster = null
  }
}
