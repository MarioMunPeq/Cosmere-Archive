import type { Soul } from './types'
import type { SpatialGrid } from './SoulField'
import {
  SPRING_K,
  DAMPING_PER_FRAME,
  NOISE_AMP,
  MAX_VELOCITY,
  CURSOR_RIPPLE_STRENGTH,
  CURSOR_RIPPLE_RADIUS,
} from './types'

export class PhysicsSystem {
  tick(
    dt: number,
    souls: Soul[],
    cursorX: number,
    cursorY: number,
    _grid: SpatialGrid,
    time: number,
    frozenClusters: ReadonlySet<string>,
  ): void {
    const d60 = dt * 60

    for (const s of souls) {
      if (s.planet && frozenClusters.has(s.planet)) continue

      const invMass = 1 / Math.max(0.1, s.mass)

      s.vx *= Math.pow(DAMPING_PER_FRAME, d60)
      s.vy *= Math.pow(DAMPING_PER_FRAME, d60)

      s.vx += -SPRING_K * (s.x - s.restX) * dt
      s.vy += -SPRING_K * (s.y - s.restY) * dt

      const dx = s.x - cursorX
      const dy = s.y - cursorY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CURSOR_RIPPLE_RADIUS && dist > 0.001 && cursorX >= 0) {
        const falloff = (1 - dist / CURSOR_RIPPLE_RADIUS) * CURSOR_RIPPLE_STRENGTH * invMass * d60
        s.vx += (dx / dist) * falloff
        s.vy += (dy / dist) * falloff
      }

      s.vx += Math.sin(time * 0.3 + s.breathePhase) * NOISE_AMP * invMass * dt
      s.vy += Math.cos(time * 0.25 + s.breathePhase * 1.3 + 1) * NOISE_AMP * invMass * dt

      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed > MAX_VELOCITY) {
        const cscale = MAX_VELOCITY / speed
        s.vx *= cscale
        s.vy *= cscale
      }

      s.x += s.vx * d60
      s.y += s.vy * d60

      s.x = Math.max(0.005, Math.min(0.995, s.x))
      s.y = Math.max(0.005, Math.min(0.995, s.y))
    }
  }
}
