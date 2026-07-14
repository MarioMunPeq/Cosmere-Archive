import type { Soul } from './types'
import type { SelectionState } from './types'
import { ZOOM_FACTOR, FOG_PARTICLES } from './types'
import { getSoulTexture } from './TextureCache'

interface FogDot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

const fogDots: FogDot[] = []
let fogInit = false
const screenPositions = new Map<string, { x: number; y: number }>()

function initFog(): void {
  if (fogInit) return
  fogInit = true
  for (let i = 0; i < FOG_PARTICLES; i++) {
    fogDots.push({
      x: Math.random() * 3000 - 1500,
      y: Math.random() * 3000 - 1500,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.015 + Math.random() * 0.025,
    })
  }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  viewX: number,
  viewY: number,
  dim: number,
  time: number,
): void {
  ctx.fillStyle = '#050508'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6)
  bgGrad.addColorStop(0, `rgba(8, 16, 30, ${0.15 * (1 - dim)})`)
  bgGrad.addColorStop(0.5, `rgba(6, 12, 25, ${0.08 * (1 - dim)})`)
  bgGrad.addColorStop(1, 'rgba(5, 5, 8, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  const timeSlow = time * 0.15
  for (let i = 0; i < 4; i++) {
    const gx = cx + Math.sin(timeSlow * 0.3 + i * 1.8) * w * 0.4
    const gy = cy + Math.cos(timeSlow * 0.2 + i * 1.3) * h * 0.3
    const gr = w * 0.5 + Math.sin(timeSlow * 0.1 + i) * w * 0.1
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    grad.addColorStop(0, `rgba(15, 25, 50, ${0.06 * (1 - dim)})`)
    grad.addColorStop(1, 'rgba(15, 25, 50, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  initFog()
  const z = ZOOM_FACTOR
  for (const f of fogDots) {
    const fx = ((((f.x - viewX * 0.03 + time * f.vx * 0.3) % 3000) + 3000) % 3000) - 1500
    const fy = ((((f.y - viewY * 0.03 + time * f.vy * 0.3) % 3000) + 3000) % 3000) - 1500
    const sx = (fx - viewX) * z + cx
    const sy = (fy - viewY) * z + cy
    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue
    ctx.beginPath()
    ctx.arc(sx, sy, f.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(80, 100, 140, ${f.opacity * (1 - dim)})`
    ctx.fill()
  }
}

export function drawSouls(
  ctx: CanvasRenderingContext2D,
  souls: Soul[],
  w: number,
  h: number,
  viewX: number,
  viewY: number,
  time: number,
  selectedId: string | null,
  hoveredId: string | null,
  rippleProgress: number,
): void {
  const cx = w / 2
  const cy = h / 2
  const z = ZOOM_FACTOR
  const margin = 200

  screenPositions.clear()

  const visible: Soul[] = []
  for (const s of souls) {
    const sx = (s.x - viewX + s.curiousDx) * z + cx
    const sy = (s.y - viewY + s.curiousDy) * z + cy
    if (sx < -margin || sx > w + margin || sy < -margin || sy > h + margin) continue
    screenPositions.set(s.id, { x: sx, y: sy })
    visible.push(s)
  }

  visible.sort((a, b) => a.layer - b.layer)

  for (const s of visible) {
    const pos = screenPositions.get(s.id)!
    const px = pos.x
    const py = pos.y

    s.opacity += (s.targetOpacity - s.opacity) * 0.04
    s.glow += (s.targetGlow - s.glow) * 0.08
    s.scale += (s.targetScale - s.scale) * 0.06

    const breathe = 1 + Math.sin(time * 0.6 + s.breathePhase) * 0.03
    const scale = s.scale * breathe * (s.mass >= 3 ? 0.7 : 1)
    const drawR = s.radius * scale * z
    const alpha = s.opacity * (1 + s.glow * 0.2)
    if (alpha < 0.005) continue

    const tex = getSoulTexture(s.kind, s.radius)

    ctx.save()
    ctx.globalAlpha = Math.min(1, alpha)

    if (s.id === selectedId) {
      ctx.drawImage(tex, px - drawR * 1.2, py - drawR * 1.2, drawR * 2.4, drawR * 2.4)
      if (s.glow > 0.5) {
        ctx.globalAlpha = 0.1 * s.glow
        ctx.drawImage(tex, px - drawR * 2.5, py - drawR * 2.5, drawR * 5, drawR * 5)
      }
    } else if (s.id === hoveredId) {
      ctx.drawImage(tex, px - drawR * 1.15, py - drawR * 1.15, drawR * 2.3, drawR * 2.3)
      ctx.globalAlpha = 0.06
      ctx.drawImage(tex, px - drawR * 2.5, py - drawR * 2.5, drawR * 5, drawR * 5)
    } else {
      ctx.drawImage(tex, px - drawR, py - drawR, drawR * 2, drawR * 2)
    }

    ctx.restore()
  }

  if (rippleProgress > 0 && rippleProgress < 1 && hoveredId) {
    const pos = screenPositions.get(hoveredId)
    if (pos) {
      const hx = pos.x
      const hy = pos.y
      const rp = rippleProgress
      const rippleR = 20 + rp * 60
      ctx.save()
      ctx.globalAlpha = (1 - rp) * 0.12
      ctx.strokeStyle = `rgba(200, 215, 235, ${1 - rp})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(hx, hy, rippleR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }
}

export function getScreenPos(id: string): { x: number; y: number } | undefined {
  return screenPositions.get(id)
}

export function getScreenPosOrZero(id: string): { x: number; y: number } {
  return screenPositions.get(id) ?? { x: 0, y: 0 }
}

export function drawHoverLabel(ctx: CanvasRenderingContext2D, soul: Soul | null, opacity: number): void {
  if (!soul || !soul.name || opacity < 0.01) return

  const pos = screenPositions.get(soul.id)
  if (!pos) return

  const px = pos.x
  const py = pos.y
  const z = ZOOM_FACTOR
  const labelY = py - soul.radius * z * soul.scale - 12

  ctx.save()
  ctx.globalAlpha = opacity * 0.85
  ctx.font = '400 11px "Inter", "system-ui", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(200, 210, 225, 1)'
  ctx.fillText(soul.name, px, labelY)
  ctx.restore()
}

export function drawSelectionInfo(ctx: CanvasRenderingContext2D, state: SelectionState, soul: Soul | null): void {
  if (!soul) return

  const pos = screenPositions.get(soul.id)
  if (!pos) return
  const px = pos.x
  const py = pos.y
  const z = ZOOM_FACTOR

  for (const p of state.particles) {
    const sx = px + Math.cos(p.angle) * p.radius * z
    const sy = py + Math.sin(p.angle) * p.radius * z
    ctx.beginPath()
    ctx.arc(sx, sy, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${soul.color}, ${p.opacity * 0.4})`
    ctx.fill()
  }

  if (state.phase === 'revealing' || state.phase === 'displaying') {
    const titleAlpha = Math.max(0, Math.min(1, (state.progress - 0.15) * 3))
    if (titleAlpha > 0) {
      ctx.save()
      ctx.globalAlpha = titleAlpha

      const topY = py - soul.radius * z * soul.scale - 20
      ctx.font = '500 18px "EB Garamond", "Georgia", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = `rgba(220, 225, 235, ${titleAlpha})`
      ctx.fillText(soul.name ?? 'Unknown Soul', px, topY)

      if (soul.description) {
        ctx.font = '400 12px "Inter", "system-ui", sans-serif'
        ctx.fillStyle = `rgba(180, 190, 205, ${titleAlpha * 0.75})`
        const maxWidth = 280
        const words = soul.description.split(' ')
        const lines: string[] = []
        let current = ''
        for (const wd of words) {
          const test = current ? current + ' ' + wd : wd
          if (ctx.measureText(test).width > maxWidth) {
            lines.push(current)
            current = wd
          } else {
            current = test
          }
        }
        if (current) lines.push(current)

        const lineH = 16
        const startY = py + soul.radius * z * soul.scale + 8
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i]!, px, startY + i * lineH)
        }
      }

      ctx.restore()
    }
  }
}

export function drawConnectionLines(
  ctx: CanvasRenderingContext2D,
  state: SelectionState,
  souls: Soul[],
  time: number,
): void {
  if (state.phase !== 'displaying' && state.phase !== 'revealing') return

  const selected = souls.find((s) => s.id === state.soulId)
  if (!selected) return
  const aPos = screenPositions.get(selected.id)
  if (!aPos) return
  const ax = aPos.x
  const ay = aPos.y

  for (const c of state.connections) {
    const to = souls.find((s) => s.id === c.toId)
    if (!to) continue
    const bPos = screenPositions.get(to.id)
    if (!bPos) continue
    const bx = bPos.x
    const by = bPos.y

    ctx.save()
    ctx.globalAlpha = c.progress * 0.1
    ctx.strokeStyle = `rgba(${c.color}, 1)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()

    if (c.progress > 0.3) {
      const t = (time * 0.1) % 1
      const px = ax + (bx - ax) * t
      const py = ay + (by - ay) * t
      ctx.beginPath()
      ctx.arc(px, py, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${c.color}, ${c.progress * 0.3})`
      ctx.fill()
    }

    ctx.restore()
  }
}
