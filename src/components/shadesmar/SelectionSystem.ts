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

  select(soul: Soul, allSouls: Soul[]): void {
    this.state.soulId = soul.id
    this.state.phase = 'growing'
    this.state.progress = 0
    this.state.particles = []
    this.state.connections = []

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      this.state.particles.push({
        angle,
        radius: soul.radius * 2,
        speed: 0.3 + Math.random() * 0.3,
        size: 1.5 + Math.random() * 2.5,
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

  deselect(): void {
    if (this.state.phase === 'displaying') {
      this.state.phase = 'hiding'
      this.state.progress = 0
    }
  }

  tick(dt: number, souls: Soul[]): void {
    const s = this.state
    if (s.phase === 'idle') return

    s.progress += dt

    switch (s.phase) {
      case 'growing': {
        const t = Math.min(1, s.progress / 0.6)
        const ease = 1 - (1 - t) * (1 - t)
        s.bgDim = ease * 0.45
        s.otherDim = ease * 0.5

        for (const soul of souls) {
          if (soul.id === s.soulId) {
            soul.targetScale = 1 + ease * 1.5
            soul.targetGlow = 1 + ease * 1.2
          } else {
            const dx = soul.x - (souls.find((x) => x.id === s.soulId)?.x ?? 0)
            const dy = soul.y - (souls.find((x) => x.id === s.soulId)?.y ?? 0)
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 100 && dist > 0.1) {
              const push = (ease * 20) / Math.max(1, dist)
              soul.curiousDx += (dx / dist) * push
              soul.curiousDy += (dy / dist) * push
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
    return souls.find((s) => s.id === this.state.soulId) ?? null
  }

  isDisplaying(): boolean {
    return this.state.phase === 'displaying'
  }

  isAnimating(): boolean {
    return this.state.phase !== 'idle' && this.state.phase !== 'displaying'
  }
}
