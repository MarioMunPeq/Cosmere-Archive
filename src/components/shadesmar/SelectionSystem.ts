import type { Soul } from './types'
import type { SelectionState } from './types'

export class SelectionSystem {
  state: SelectionState = {
    soulId: null,
    phase: 'idle',
    progress: 0,
    particles: [],
    connections: [],
    bgDim: 0,
    otherDim: 0,
  }

  private soulMap: Map<string, Soul> | null = null
  private soulMapSource: Soul[] | null = null

  select(soul: Soul, allSouls: Soul[]): void {
    this.state.soulId = soul.id
    this.state.phase = 'growing'
    this.state.progress = 0
    this.state.particles = []
    this.state.connections = []

    /*
     * A seeded generator, not `Math.random`.
     *
     * The sixteen sparks are the same sixteen every time the same soul is
     * selected: a selection that reshuffled its particles on each visit made the
     * screenshot in the commit message unreproducible, and it is the same
     * reason criterion S.7 exists. Seeded from the soul's own id, so two
     * different souls do not get the same burst.
     */
    let seed = 0
    for (let i = 0; i < soul.id.length; i++) {
      seed = (seed << 5) - seed + soul.id.charCodeAt(i)
      seed |= 0
    }
    const rand = () => {
      seed = (seed * 0x9e3779b9) | 0
      return ((seed >>> 8) & 0xffff) / 0xffff
    }

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (rand() - 0.5) * 0.3
      this.state.particles.push({
        angle,
        radius: soul.radius * 2,
        speed: 0.3 + rand() * 0.3,
        size: 1.5 + rand() * 2.5,
        opacity: 0,
      })
    }

    const connected = allSouls.filter((s) => s.id !== soul.id && s.connections.includes(soul.id)).slice(0, 4)

    const colors = ['0,200,255', '255,215,0', '160,80,255', '0,220,120']
    for (let i = 0; i < connected.length; i++) {
      const c = connected[i]
      if (!c) break
      this.state.connections.push({
        toId: c.id,
        color: colors[i % colors.length]!,
        progress: 0,
      })
    }
  }

  /**
   * Close the inspector.
   *
   * From any phase, not just `displaying`. The selection takes 1.1s to reach
   * it — 0.6s to grow, 0.5s to reveal — and the reader's Close button is live
   * from the first frame they can see the panel. Only a click on the canvas
   * waited for `displaying`, because there the click was being read as a second
   * press rather than as a dismissal.
   */
  deselect(): void {
    if (this.state.phase === 'idle' || this.state.phase === 'hiding') return
    this.state.phase = 'hiding'
    this.state.progress = 0
  }

  private getSoulMap(souls: Soul[]): Map<string, Soul> {
    if (this.soulMap && this.soulMapSource === souls) return this.soulMap
    this.soulMap = new Map(souls.map((s) => [s.id, s]))
    this.soulMapSource = souls
    return this.soulMap
  }

  tick(dt: number, souls: Soul[]): void {
    const s = this.state
    if (s.phase === 'idle') return

    s.progress += dt

    const map = this.getSoulMap(souls)
    const selectedSoul = s.soulId ? (map.get(s.soulId) ?? null) : null

    switch (s.phase) {
      case 'growing': {
        const t = Math.min(1, s.progress / 0.6)
        const ease = 1 - (1 - t) * (1 - t)
        s.bgDim = ease * 0.45
        s.otherDim = ease * 0.5

        const selX = selectedSoul?.x ?? 0
        const selY = selectedSoul?.y ?? 0

        for (const soul of souls) {
          if (soul.id === s.soulId && selectedSoul) {
            selectedSoul.targetScale = 1 + ease * 1.5
            selectedSoul.targetGlow = 1 + ease * 1.2
          } else {
            const dx = soul.x - selX
            const dy = soul.y - selY
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 0.05 && dist > 0.001) {
              const push = (ease * 0.003) / Math.max(0.001, dist * 5)
              soul.vx += (dx / dist) * push * dt * 60
              soul.vy += (dy / dist) * push * dt * 60
            }
            soul.targetOpacity = 0.7 * (1 - s.otherDim)
          }
        }

        for (const p of s.particles) {
          p.opacity = t * 0.4
          p.radius = 20 + t * 12
        }

        if (t >= 1) {
          s.phase = 'revealing'
          s.progress = 0
        }
        break
      }
      case 'revealing': {
        const t = Math.min(1, s.progress / 0.5)
        for (const c of s.connections) c.progress = t
        for (const p of s.particles) p.opacity = 0.4 * Math.min(1, t * 2.5)
        if (t >= 1) {
          s.phase = 'displaying'
          s.progress = 1
        }
        break
      }
      case 'hiding': {
        const t = Math.min(1, s.progress / 0.5)
        const ease = 1 - t
        s.bgDim = 0.45 * ease
        s.otherDim = 0.5 * ease

        for (const soul of souls) {
          if (soul.id === s.soulId) {
            soul.targetScale = 2.5 * ease + 1 * (1 - ease)
            soul.targetGlow = 2.2 * ease
          } else {
            soul.targetOpacity = 0.7
          }
        }

        for (const p of s.particles) p.opacity = 0.4 * ease
        if (t >= 1) {
          s.phase = 'idle'
          s.soulId = null
          s.bgDim = 0
          s.otherDim = 0
        }
        break
      }
    }

    for (const p of s.particles) {
      p.angle += p.speed * dt
    }
  }

  getSelectedSoul(souls: Soul[]): Soul | null {
    return this.getSoulMap(souls).get(this.state.soulId!) ?? null
  }

  isDisplaying(): boolean {
    return this.state.phase === 'displaying'
  }

  isAnimating(): boolean {
    return this.state.phase !== 'idle' && this.state.phase !== 'displaying'
  }
}
