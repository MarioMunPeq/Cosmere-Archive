import type { Soul } from './types'
import type { SelectionState } from './types'
import type { CameraController } from './Camera'
import { FOG_PARTICLES, LOD_DOT, LOD_BEAD, GLOW_MIN, GLOW_MAX_VISIBLE, CLUSTERS, WORLD_W, WORLD_H } from './types'
import { getSoulTexture } from './TextureCache'

interface FogDot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

/**
 * The fog, and the only randomness left in the render path.
 *
 * §5.5.4 asks for `mulberry32(0x5A4E)` and regeneration on resize, and S.7
 * asks for no `Math.random()` in the render loop. Both, for the same reason: the
 * ocean looked different on every visit, so a screenshot in a commit message
 * could not be reproduced and a rendering regression could not be told apart
 * from the noise.
 *
 * Regenerating on resize is not only about size. A fog particle placed once for
 * a 1440-wide window and then stretched across a 2560 one is denser on the left
 * than the right — the layout does not know the window changed, because a
 * module-level boolean told it not to look.
 */
const FOG_SEED = 0x5a4e

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fogDots: FogDot[] = []
let fogFor: { w: number; h: number } | null = null
const screenPos = new Map<string, { x: number; y: number }>()

function initFog(w: number, h: number): void {
  // Regenerated whenever the viewport changes shape, so the fog is always
  // distributed over the window that is actually being drawn.
  if (fogFor && fogFor.w === w && fogFor.h === h) return
  fogFor = { w, h }
  fogDots.length = 0
  const rand = mulberry32(FOG_SEED)
  for (let i = 0; i < FOG_PARTICLES; i++) {
    fogDots.push({
      x: rand() * w,
      y: rand() * h,
      vx: (rand() - 0.5) * 0.06,
      vy: (rand() - 0.5) * 0.06,
      size: 0.5 + rand() * 1.5,
      opacity: 0.012 + rand() * 0.02,
    })
  }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dim: number,
  time: number,
  camera?: CameraController,
): void {
  ctx.fillStyle = '#030308'
  ctx.fillRect(0, 0, w, h)

  // Nebulae and stars are drawn in world space via the camera transform.

  // Deep space gradient: darker at edges, slightly warmer at center.
  const cx = w / 2
  const cy = h / 2
  const r = Math.max(w, h) * 0.7
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  bgGrad.addColorStop(0, `rgba(8, 12, 24, ${0.6 * (1 - dim)})`)
  bgGrad.addColorStop(0.5, `rgba(5, 8, 18, ${0.4 * (1 - dim)})`)
  bgGrad.addColorStop(1, 'rgba(3, 3, 8, 0)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // Nebulae: each realm is a colored cloud. Drawn in world space via camera.
  for (const cluster of CLUSTERS) {
    let sx: number, sy: number, nr: number
    if (camera) {
      const sp = camera.worldToScreen(cluster.cx, cluster.cy, w, h)
      sx = sp.x
      sy = sp.y
      nr = cluster.radius * camera.zoom * Math.min(w, h) * 2.5
    } else {
      const scale = Math.min(w / WORLD_W, h / WORLD_H) * 0.85
      const offsetX = (w - WORLD_W * scale) / 2
      const offsetY = (h - WORLD_H * scale) / 2
      sx = cluster.cx * scale + offsetX
      sy = cluster.cy * scale + offsetY
      nr = cluster.radius * scale * 2.5
    }
    const color = cluster.color
    const pulse = 0.85 + Math.sin(time * 0.15 + cluster.cx * 3) * 0.15
    const nebula = ctx.createRadialGradient(sx, sy, 0, sx, sy, nr)
    nebula.addColorStop(0, `rgba(${color}, ${0.07 * pulse * (1 - dim)})`)
    nebula.addColorStop(0.4, `rgba(${color}, ${0.035 * pulse * (1 - dim)})`)
    nebula.addColorStop(0.7, `rgba(${color}, ${0.012 * (1 - dim)})`)
    nebula.addColorStop(1, `rgba(${color}, 0)`)
    ctx.fillStyle = nebula
    ctx.fillRect(sx - nr, sy - nr, nr * 2, nr * 2)
  }

  // The Cosmere at center: a subtle warm glow.
  let cosmereX: number, cosmereY: number, cosmereR: number
  if (camera) {
    const sp = camera.worldToScreen(WORLD_W / 2, WORLD_H / 2, w, h)
    cosmereX = sp.x
    cosmereY = sp.y
    cosmereR = camera.zoom * Math.min(w, h) * 0.15
  } else {
    const scale = Math.min(w / WORLD_W, h / WORLD_H) * 0.85
    const offsetX = (w - WORLD_W * scale) / 2
    const offsetY = (h - WORLD_H * scale) / 2
    cosmereX = (WORLD_W / 2) * scale + offsetX
    cosmereY = (WORLD_H / 2) * scale + offsetY
    cosmereR = scale * 0.3
  }
  const cosmereGlow = ctx.createRadialGradient(cosmereX, cosmereY, 0, cosmereX, cosmereY, cosmereR)
  cosmereGlow.addColorStop(0, `rgba(100,150,200, ${0.1 * (1 - dim)})`)
  cosmereGlow.addColorStop(0.5, `rgba(100,150,200, ${0.04 * (1 - dim)})`)
  cosmereGlow.addColorStop(1, 'rgba(100,150,200, 0)')
  ctx.fillStyle = cosmereGlow
  ctx.fillRect(cosmereX - cosmereR, cosmereY - cosmereR, cosmereR * 2, cosmereR * 2)

  // Stars: tiny bright points scattered across the canvas.
  const starSeed = 0x9e3779b9
  let starA = starSeed >>> 0
  function starRand() {
    starA = (starA + 0x6d2b79f5) | 0
    let t = Math.imul(starA ^ (starA >>> 15), 1 | starA)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const starCount = Math.floor((w * h) / 4000)
  for (let i = 0; i < starCount; i++) {
    const sx = starRand() * w
    const sy = starRand() * h
    const brightness = 0.15 + starRand() * 0.5
    const twinkle = 0.6 + Math.sin(time * (0.5 + starRand() * 1.5) + starRand() * Math.PI * 2) * 0.4
    const size = starRand() < 0.85 ? 0.5 : 1.2
    ctx.globalAlpha = brightness * twinkle * (1 - dim)
    ctx.fillStyle = `rgba(200, 215, 240, 1)`
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Slow-drifting fog particles.
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
    ctx.fillStyle = `rgba(100, 120, 160, ${f.opacity * 2 * (1 - dim)})`
    ctx.fill()
  }

  // Vignette: darken the edges.
  const vigGrad = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.max(w, h) * 0.7)
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vigGrad.addColorStop(1, `rgba(0,0,0,${0.5 * (1 - dim) + 0.3})`)
  ctx.fillStyle = vigGrad
  ctx.fillRect(0, 0, w, h)
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

  /*
   * No sort.
   *
   * §5.5.4 asks for the draw order to be decided once, at generation, and it
   * was previously an `Array.sort` on every frame over every visible soul —
   * ninety-five comparisons a frame to produce an order that had not changed
   * since the souls were created. `generateSoulField` now sorts by layer once,
   * and the loop above preserves order, so `visible` is already correct.
   */

  /* One decision for the whole frame rather than per soul. */
  const asDots = camera.zoom < LOD_DOT
  const withRim = camera.zoom >= LOD_BEAD
  const glowAffordable = visible.length < GLOW_MAX_VISIBLE

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

    const selected = s.id === selectedId
    const hovered = s.id === hoveredId

    /*
     * Level one: a single pixel.
     *
     * At this zoom a bead is smaller than anything the reader can tell it from,
     * so the sprite, its scaling and its resampling are all spent on a result
     * identical to `fillRect`. The colour string is cached on the soul: building
     * an `rgba()` string per soul per frame is ninety-five string allocations a
     * frame to express a value that never changes.
     */
    if (asDots && !selected && !hovered) {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.fillStyle = s.dotFill
      ctx.fillRect(px - 0.5, py - 0.5, 1.4, 1.4)
      continue
    }

    const tex = getSoulTexture(s.kind, Math.round(displayR))

    if (selected) {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR * 1.3, py - displayR * 1.3, displayR * 2.6, displayR * 2.6)
    } else if (hovered) {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR * 1.15, py - displayR * 1.15, displayR * 2.3, displayR * 2.3)
    } else {
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(tex, px - displayR, py - displayR, displayR * 2, displayR * 2)
      /* Level three: the fresnel rim. */
      if (withRim) {
        ctx.globalAlpha = Math.min(1, alpha) * 0.5
        ctx.strokeStyle = s.rimStroke
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(px, py, displayR * 0.86, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    /*
     * The 6x glow, once. §5.5.4's own conditions: the bead has to be glowing,
     * and the scene has to be small enough that the overdraw is affordable.
     */
    if ((selected || hovered) && s.glow > GLOW_MIN && glowAffordable) {
      ctx.globalAlpha = (selected ? 0.08 : 0.05) * s.glow
      ctx.drawImage(tex, px - displayR * 3, py - displayR * 3, displayR * 6, displayR * 6)
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
