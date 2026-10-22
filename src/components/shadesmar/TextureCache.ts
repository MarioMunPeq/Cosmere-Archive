import { ENTITY_VISUALS } from './types'
import type { EntityKind } from './types'

const cache = new Map<string, HTMLCanvasElement>()

function seaGlass(color: string, saturation = 0.34): string {
  const source = color.split(',').map(Number)
  const sea = [113, 157, 157]
  return source.map((channel, i) => Math.round((sea[i] ?? 113) * (1 - saturation) + channel * saturation)).join(',')
}

function renderBeadTexture(kind: EntityKind, radius: number): HTMLCanvasElement {
  const visual = ENTITY_VISUALS[kind]
  const color = seaGlass(visual.color, 0.4)
  const glow = seaGlass(visual.glow, 0.35)
  const core = seaGlass(visual.core, 0.24)
  const dpr = 2
  const r = Math.max(2, radius) * dpr
  const size = Math.ceil(r * 2 + 8 * dpr)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2

  // A contained glass sphere, lit from above and left. The dark lower rim and
  // fine fresnel edge give the soul volume even when it is only a few pixels
  // wide; the bright heart remains readable against the Cognitive Sea.
  const sphere = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.4, r * 0.04, cx, cy, r)
  sphere.addColorStop(0, `rgba(${core},.86)`)
  sphere.addColorStop(0.12, `rgba(${glow},.82)`)
  sphere.addColorStop(0.34, `rgba(${color},.72)`)
  sphere.addColorStop(0.72, `rgba(${color},.48)`)
  sphere.addColorStop(0.94, 'rgba(22,42,46,.72)')
  sphere.addColorStop(1, 'rgba(6,14,20,.88)')
  ctx.fillStyle = sphere
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  const rim = ctx.createRadialGradient(cx, cy, r * 0.76, cx, cy, r)
  rim.addColorStop(0, 'rgba(220,248,242,0)')
  rim.addColorStop(0.82, 'rgba(183,232,236,.02)')
  rim.addColorStop(1, `rgba(${glow},.48)`)
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Two restrained reflections make the surface read as glass, not a flat
  // diagram node or a flame.
  ctx.save()
  ctx.translate(cx - r * 0.34, cy - r * 0.42)
  ctx.rotate(-0.48)
  const highlight = ctx.createLinearGradient(-r * 0.3, 0, r * 0.3, r * 0.5)
  highlight.addColorStop(0, 'rgba(255,255,245,.76)')
  highlight.addColorStop(1, 'rgba(231,255,248,0)')
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.29, r * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = 'rgba(255,255,246,.92)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.39, cy - r * 0.48, Math.max(0.75, r * 0.07), 0, Math.PI * 2)
  ctx.fill()

  return canvas
}

export function getSoulTexture(kind: EntityKind, radius: number): HTMLCanvasElement {
  const roundedRadius = Math.max(2, Math.round(radius))
  const key = `${kind}_${roundedRadius}`
  let texture = cache.get(key)
  if (texture) return texture
  texture = renderBeadTexture(kind, roundedRadius)
  cache.set(key, texture)
  return texture
}

export function clearTextureCache(): void {
  cache.clear()
}

const PREWARM_RADII = [3, 5, 7, 9, 11, 14, 16, 18, 22, 26, 30, 35, 40]
const PREWARM_KINDS: EntityKind[] = ['character', 'important_character', 'herald']

export function prewarmTextures(): void {
  for (const kind of PREWARM_KINDS) {
    for (const radius of PREWARM_RADII) {
      getSoulTexture(kind, radius)
    }
  }
}
