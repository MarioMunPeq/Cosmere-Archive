import type { Soul } from './types'
import type { SelectionState } from './types'
import type { CameraController } from './Camera'
import { FOG_PARTICLES, CLUSTERS, LABEL_FADE_ZOOM } from './types'
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
const screenPos = new Map<string, { x: number; y: number }>()

function initFog(w: number, h: number): void {
  if (fogInit) return
  fogInit = true
  for (let i = 0; i < FOG_PARTICLES; i++) {
    fogDots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.012 + Math.random() * 0.02,
    })
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, dim: number, time: number): void {
  ctx.fillStyle = '#050508'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const r = Math.max(w, h) * 0.5

  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  bgGrad.addColorStop(0, `rgba(8, 16, 30, ${0.12 * (1 - dim)})`)
  bgGrad.addColorStop(0.6, `rgba(6, 12, 25, ${0.06 * (1 - dim)})`)
  bgGrad.addColorStop(1, 'rgba(5, 5, 8, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  const ts = time * 0.12
  for (let i = 0; i < 4; i++) {
    const gx = cx + Math.sin(ts * 0.25 + i * 1.8) * w * 0.35
    const gy = cy + Math.cos(ts * 0.2 + i * 1.3) * h * 0.25
    const gr = w * 0.4 + Math.sin(ts * 0.1 + i) * w * 0.1
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    grad.addColorStop(0, `rgba(15, 25, 50, ${0.05 * (1 - dim)})`)
    grad.addColorStop(1, 'rgba(15, 25, 50, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  initFog(w, h)
  for (const f of fogDots) {
    f.x += f.vx
    f.y += f.vy
    if (f.x < -10) f.x = w + 10
    if (f.x > w + 10) f.x = -10
    if (f.y < -10) f.y = h + 10
    if (f.y > h + 10) f.y = -10
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(80, 100, 140, ${f.opacity * (1 - dim)})`
    ctx.fill()
  }
}

export function drawSouls(
  ctx: CanvasRenderingContext2D,
  souls: Soul[],
  camera: CameraController,
  w: number,
  h: number,
  time: number,
  dt: number,
  selectedId: string | null,
  hoveredId: string | null,
  rippleProgress: number,
): void {
  screenPos.clear()
  const currentLod = camera.zoom * 2
  const margin = 100
  const lerpFactor = 1 - Math.pow(1 - 0.04, dt * 60)
  const glowLerp = 1 - Math.pow(1 - 0.08, dt * 60)
  const scaleLerp = 1 - Math.pow(1 - 0.06, dt * 60)

  const visible: Soul[] = []
  for (const s of souls) {
    if (currentLod < s.lodReveal) continue
    const sp = camera.worldToScreen(s.x, s.y, w, h)
    if (sp.x < -margin || sp.x > w + margin || sp.y < -margin || sp.y > h + margin) continue
    screenPos.set(s.id, sp)
    visible.push(s)
  }

  visible.sort((a, b) => a.layer - b.layer)

  for (const s of visible) {
    const p = screenPos.get(s.id)!
    const px = p.x
    const py = p.y

    s.opacity += (s.targetOpacity - s.opacity) * lerpFactor
    s.glow += (s.targetGlow - s.glow) * glowLerp
    s.scale += (s.targetScale - s.scale) * scaleLerp

    const breathe = 1 + Math.sin(time * 0.6 + s.breathePhase) * 0.025
    const displayR = s.radius * s.scale * breathe
    const alpha = s.opacity * (1 + s.glow * 0.2)
    if (alpha < 0.005) continue

    const tex = getSoulTexture(s.kind, Math.round(displayR))

    if (s.id === selectedId) {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR * 1.3, py - displayR * 1.3, displayR * 2.6, displayR * 2.6)
      if (s.glow > 0.5) {
        ctx.globalAlpha = 0.08 * s.glow
        ctx.drawImage(tex, px - displayR * 3, py - displayR * 3, displayR * 6, displayR * 6)
      }
    } else if (s.id === hoveredId) {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR * 1.15, py - displayR * 1.15, displayR * 2.3, displayR * 2.3)
      ctx.globalAlpha = 0.05
      ctx.drawImage(tex, px - displayR * 3, py - displayR * 3, displayR * 6, displayR * 6)
    } else {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR, py - displayR, displayR * 2, displayR * 2)
    }
  }

  if (rippleProgress > 0 && rippleProgress < 1 && hoveredId) {
    const p = screenPos.get(hoveredId)
    if (p) {
      const r = 15 + rippleProgress * 50
      ctx.globalAlpha = (1 - rippleProgress) * 0.1
      ctx.strokeStyle = `rgba(200, 215, 235, ${1 - rippleProgress})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

export function getScreenPos(id: string): { x: number; y: number } | undefined {
  return screenPos.get(id)
}

export function drawHoverLabel(ctx: CanvasRenderingContext2D, soul: Soul | null, opacity: number): void {
  if (!soul || !soul.name || opacity < 0.01) return
  const p = screenPos.get(soul.id)
  if (!p) return

  ctx.globalAlpha = opacity * 0.85
  ctx.font = '400 11px "Inter", "system-ui", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(200, 210, 225, 1)'
  ctx.fillText(soul.name, p.x, p.y - soul.radius * soul.scale - 8)
}

export function drawClusterLabels(
  ctx: CanvasRenderingContext2D,
  camera: CameraController,
  w: number,
  h: number,
  hoveredCluster: string | null,
): void {
  if (camera.zoom < LABEL_FADE_ZOOM * 0.5) return

  const labelAlpha = Math.min(1, (camera.zoom - LABEL_FADE_ZOOM * 0.5) / (LABEL_FADE_ZOOM * 0.5))

  for (const cluster of CLUSTERS) {
    if (cluster.planetRadius === 0) continue
    const sp = camera.worldToScreen(cluster.cx, cluster.cy, w, h)
    if (sp.x < -50 || sp.x > w + 50 || sp.y < -50 || sp.y > h + 50) continue

    const isHovered = hoveredCluster === cluster.id
    const a = labelAlpha * (isHovered ? 1 : 0.6)
    const glowA = isHovered ? 0.08 : 0
    const glowR = cluster.radius * Math.min(w, h) * camera.zoom * 0.6

    if (glowA > 0.001) {
      const grad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, glowR)
      grad.addColorStop(0, `rgba(${cluster.color}, ${glowA})`)
      grad.addColorStop(1, `rgba(${cluster.color}, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, glowR, 0, Math.PI * 2)
      ctx.fill()
    }

    const labelY = sp.y - cluster.planetRadius * Math.min(w, h) * camera.zoom - 6

    ctx.globalAlpha = a
    ctx.font = '400 13px "EB Garamond", "Georgia", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = `rgba(220, 225, 235, ${a})`
    ctx.shadowColor = `rgba(${cluster.color}, ${a * 0.3})`
    ctx.shadowBlur = isHovered ? 8 : 4
    ctx.fillText(cluster.name, sp.x, labelY)
  }
}

export function drawSelectionInfo(ctx: CanvasRenderingContext2D, state: SelectionState, soul: Soul | null): void {
  if (!soul) return
  const p = screenPos.get(soul.id)
  if (!p) return

  const px = p.x
  const py = p.y

  for (const sp of state.particles) {
    const sx = px + Math.cos(sp.angle) * sp.radius
    const sy = py + Math.sin(sp.angle) * sp.radius
    ctx.beginPath()
    ctx.arc(sx, sy, sp.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${soul.color}, ${sp.opacity * 0.35})`
    ctx.fill()
  }

  if (state.phase === 'revealing' || state.phase === 'displaying') {
    const titleAlpha = Math.max(0, Math.min(1, (state.progress - 0.15) * 3))
    if (titleAlpha > 0) {
      ctx.globalAlpha = titleAlpha

      const topY = py - soul.radius * soul.scale - 16
      ctx.font = '500 17px "EB Garamond", "Georgia", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = `rgba(220, 225, 235, ${titleAlpha})`
      ctx.fillText(soul.name ?? '', px, topY)

      if (soul.description) {
        ctx.font = '400 11px "Inter", "system-ui", sans-serif'
        ctx.fillStyle = `rgba(180, 190, 205, ${titleAlpha * 0.75})`
        const maxWidth = 260
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

        const lineH = 15
        const startY = py + soul.radius * soul.scale + 6
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i]!, px, startY + i * lineH)
        }
      }
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
  const aPos = screenPos.get(selected.id)
  if (!aPos) return

  for (const c of state.connections) {
    const to = souls.find((s) => s.id === c.toId)
    if (!to) continue
    const bPos = screenPos.get(to.id)
    if (!bPos) continue

    ctx.globalAlpha = c.progress * 0.1
    ctx.strokeStyle = `rgba(${c.color}, 1)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(aPos.x, aPos.y)
    ctx.lineTo(bPos.x, bPos.y)
    ctx.stroke()

    if (c.progress > 0.3) {
      const t = (time * 0.1) % 1
      const px = aPos.x + (bPos.x - aPos.x) * t
      const py = aPos.y + (bPos.y - aPos.y) * t
      ctx.beginPath()
      ctx.arc(px, py, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${c.color}, ${c.progress * 0.3})`
      ctx.fill()
    }
  }
}
