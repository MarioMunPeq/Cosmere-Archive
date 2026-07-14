import { ENTITY_VISUALS } from './types'
import type { EntityKind } from './types'

const cache = new Map<string, HTMLCanvasElement>()

function key(kind: EntityKind, radius: number): string {
  return `${kind}_${radius}`
}

function renderGlowTexture(kind: EntityKind, radius: number): HTMLCanvasElement {
  const ev = ENTITY_VISUALS[kind]
  const { color, glow, core } = ev
  const dpr = 2
  const margin = radius * 3
  const size = (radius + margin) * 2 * dpr
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2

  const halo = ctx.createRadialGradient(cx, cy, radius * 0.5 * dpr, cx, cy, radius * 3 * dpr)
  halo.addColorStop(0, `rgba(${glow}, 0.04)`)
  halo.addColorStop(0.5, `rgba(${glow}, 0.015)`)
  halo.addColorStop(1, `rgba(${glow}, 0)`)
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 3 * dpr, 0, Math.PI * 2)
  ctx.fill()

  const outer = ctx.createRadialGradient(cx, cy, radius * 0.6 * dpr, cx, cy, radius * 2 * dpr)
  outer.addColorStop(0, `rgba(${color}, 0.15)`)
  outer.addColorStop(0.4, `rgba(${color}, 0.08)`)
  outer.addColorStop(0.7, `rgba(${glow}, 0.03)`)
  outer.addColorStop(1, `rgba(${glow}, 0)`)
  ctx.fillStyle = outer
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 2 * dpr, 0, Math.PI * 2)
  ctx.fill()

  const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5 * dpr)
  inner.addColorStop(0, `rgba(${core}, 0.9)`)
  inner.addColorStop(0.15, `rgba(${color}, 0.6)`)
  inner.addColorStop(0.4, `rgba(${color}, 0.2)`)
  inner.addColorStop(0.7, `rgba(${glow}, 0.05)`)
  inner.addColorStop(1, `rgba(${glow}, 0)`)
  ctx.fillStyle = inner
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.5 * dpr, 0, Math.PI * 2)
  ctx.fill()

  const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.4 * dpr)
  coreG.addColorStop(0, `rgba(255,255,255,0.5)`)
  coreG.addColorStop(0.5, `rgba(${core}, 0.3)`)
  coreG.addColorStop(1, `rgba(${core}, 0)`)
  ctx.fillStyle = coreG
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.4 * dpr, 0, Math.PI * 2)
  ctx.fill()

  return canvas
}

export function getSoulTexture(kind: EntityKind, radius: number): HTMLCanvasElement {
  const k = key(kind, radius)
  let tex = cache.get(k)
  if (tex) return tex
  tex = renderGlowTexture(kind, radius)
  cache.set(k, tex)
  return tex
}

export function clearTextureCache(): void {
  cache.clear()
}

const PREWARM_RADII = [3, 5, 7, 9, 11, 14, 16, 18, 22, 26, 30, 35, 40]
const PREWARM_KINDS = Object.keys(ENTITY_VISUALS) as EntityKind[]

export function prewarmTextures(): void {
  for (const k of PREWARM_KINDS) {
    for (const r of PREWARM_RADII) {
      getSoulTexture(k, r)
    }
  }
}
