import type { Soul } from './types'
import type { SelectionState } from './types'
import type { CameraController } from './Camera'
import { FOG_PARTICLES, LOD_DOT, GLOW_MAX_VISIBLE, CLUSTERS, WORLD_W, WORLD_H } from './types'
import { getSoulTexture } from './TextureCache'

interface FogDot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

interface SeaBead {
  x: number
  y: number
  depth: number
  radius: number
  opacity: number
  phase: number
  tone: number
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
const seaBeads: SeaBead[] = []
let seaFor: { w: number; h: number } | null = null
const beadTextures = new Map<string, HTMLCanvasElement>()

function initSea(w: number, h: number, horizon: number): void {
  if (seaFor && seaFor.w === w && seaFor.h === h) return
  seaFor = { w, h }
  seaBeads.length = 0
  const rand = mulberry32(0xbead5ea)
  const count = Math.min(620, Math.max(130, Math.floor((w * h) / 2700)))
  for (let i = 0; i < count; i++) {
    const depth = Math.sqrt(rand())
    seaBeads.push({
      x: rand() * w,
      y: horizon + depth * h * 0.37,
      depth,
      radius: 0.9 + depth * depth * Math.min(w, h) * 0.025,
      opacity: 0.26 + rand() * 0.32,
      phase: rand() * Math.PI * 2,
      tone: rand(),
    })
  }
  seaBeads.sort((a, b) => a.depth - b.depth)
}

function getBeadTexture(radius: number, tint: string): HTMLCanvasElement {
  const bucket = Math.max(2, Math.min(22, Math.round(radius)))
  const key = `${bucket}:${tint}`
  const cached = beadTextures.get(key)
  if (cached) return cached

  const size = 72
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = 27
  const sphere = g.createRadialGradient(cx - 10, cy - 12, 1, cx, cy, r)
  sphere.addColorStop(0, 'rgba(244,250,231,.95)')
  sphere.addColorStop(0.09, `rgba(219,239,224,.88)`)
  sphere.addColorStop(0.27, `rgba(${tint},.78)`)
  sphere.addColorStop(0.63, 'rgba(101,139,146,.72)')
  sphere.addColorStop(0.9, 'rgba(35,57,66,.68)')
  sphere.addColorStop(1, 'rgba(13,24,31,.78)')
  g.fillStyle = sphere
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.fill()

  const fresnel = g.createRadialGradient(cx, cy, r * 0.72, cx, cy, r)
  fresnel.addColorStop(0, 'rgba(190,226,215,0)')
  fresnel.addColorStop(0.72, 'rgba(183,220,209,.03)')
  fresnel.addColorStop(1, 'rgba(211,235,222,.32)')
  g.fillStyle = fresnel
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.fill()

  // A broad reflected sky window and a pin of direct light make the beads
  // read as polished glass rather than flat colored circles.
  g.save()
  g.translate(cx - 8, cy - 12)
  g.rotate(-0.46)
  const windowGlow = g.createLinearGradient(-7, -5, 7, 8)
  windowGlow.addColorStop(0, 'rgba(255,255,238,.36)')
  windowGlow.addColorStop(1, 'rgba(222,245,231,0)')
  g.fillStyle = windowGlow
  g.beginPath()
  g.ellipse(0, 0, 6, 2.6, 0, 0, Math.PI * 2)
  g.fill()
  g.restore()
  g.fillStyle = 'rgba(255,255,246,.62)'
  g.beginPath()
  g.arc(cx - 10, cy - 14, 1.25, 0, Math.PI * 2)
  g.fill()

  beadTextures.set(key, c)
  return c
}

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
  realmId?: string | null,
  pointer?: { x: number; y: number },
): void {
  // Shadesmar should read as a place with a horizon and a surface, not as
  // outer space. The sea and shore are screen-space: camera movement only
  // moves the souls above this landscape.
  ctx.fillStyle = '#080b10'
  ctx.fillRect(0, 0, w, h)
  const cx = w / 2
  const cy = h / 2
  const horizon = h * 0.52
  const parallaxX = pointer && pointer.x > -1000 ? (pointer.x / w - 0.5) * 18 : 0
  const parallaxY = pointer && pointer.y > -1000 ? (pointer.y / h - 0.5) * 10 : 0
  const cameraDriftX = camera ? (WORLD_W / 2 - camera.x) * camera.zoom * Math.min(w, h) * 0.045 : 0
  const cameraDriftY = camera ? (WORLD_H / 2 - camera.y) * camera.zoom * Math.min(w, h) * 0.035 : 0
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#07090e')
  sky.addColorStop(0.4, '#111820')
  sky.addColorStop(0.53, '#34464a')
  sky.addColorStop(1, '#080b10')
  const bgGrad = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, Math.max(w, h) * 0.74)
  bgGrad.addColorStop(0, `rgba(119, 163, 166, ${0.19 * (1 - dim)})`)
  bgGrad.addColorStop(0.4, `rgba(75, 107, 118, ${0.1 * (1 - dim)})`)
  bgGrad.addColorStop(1, 'rgba(8, 11, 16, 0)')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // Each perpendicularity leaves its own trace on the cognitive sky. The hue
  // is taken from the realm atlas so the scene and its navigation stay in sync.
  const realm = CLUSTERS.find((cluster) => cluster.id === realmId)
  if (realm) {
    const tint = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, Math.max(w, h) * 0.58)
    tint.addColorStop(0, `rgba(${realm.color}, ${0.12 * (1 - dim)})`)
    tint.addColorStop(0.48, `rgba(${realm.color}, ${0.045 * (1 - dim)})`)
    tint.addColorStop(1, `rgba(${realm.color}, 0)`)
    ctx.fillStyle = tint
    ctx.fillRect(0, 0, w, h)
  }

  // A low, distant sun gives the sea its cold, almost metallic glint.
  const sunX = w * 0.69 - parallaxX * 0.24 - cameraDriftX
  const sunY = horizon - h * 0.105 - parallaxY * 0.24 - cameraDriftY
  const sunRadius = Math.max(6, Math.min(w, h) * 0.018)
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 1, sunX, sunY, Math.min(w, h) * 0.31)
  sunGlow.addColorStop(0, `rgba(224, 238, 221, ${0.88 * (1 - dim)})`)
  sunGlow.addColorStop(0.08, `rgba(191, 218, 213, ${0.32 * (1 - dim)})`)
  sunGlow.addColorStop(1, 'rgba(156, 199, 202, 0)')
  ctx.fillStyle = sunGlow
  ctx.fillRect(sunX - h * 0.31, sunY - h * 0.31, h * 0.62, h * 0.62)
  ctx.fillStyle = `rgba(230, 243, 232, ${0.9 * (1 - dim)})`
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2)
  ctx.fill()

  // Distance bands and broken reflections make the bead-sea legible as water.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, horizon)
  ctx.lineTo(w, horizon)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.clip()
  const sea = ctx.createLinearGradient(0, horizon, 0, h)
  sea.addColorStop(0, '#26373c')
  sea.addColorStop(0.1, '#18262d')
  sea.addColorStop(0.46, '#111920')
  sea.addColorStop(1, '#080b10')
  ctx.fillStyle = sea
  ctx.fillRect(0, horizon, w, h - horizon)

  // The far sun breaks into a soft, widening path across the glass surface.
  // This low contrast wash sits below the individual spheres, tying their
  // highlights together without turning the ocean into a neon stripe.
  const reflection = ctx.createLinearGradient(sunX - w * 0.06, 0, sunX + w * 0.06, 0)
  reflection.addColorStop(0, 'rgba(213, 231, 216, 0)')
  reflection.addColorStop(0.5, `rgba(192, 219, 207, ${0.12 * (1 - dim)})`)
  reflection.addColorStop(1, 'rgba(213, 231, 216, 0)')
  ctx.globalAlpha = 0.9
  ctx.fillStyle = reflection
  ctx.fillRect(sunX - w * 0.06, horizon, w * 0.12, h - horizon)

  // A distant broken silhouette at the horizon, kept as a contour so the
  // bead-water reads as one continuous sea rather than a boxed-in pool.
  ctx.strokeStyle = `rgba(195, 219, 208, ${0.24 * (1 - dim)})`
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, horizon + h * 0.025)
  ctx.lineTo(w * 0.08, horizon - h * 0.012)
  ctx.lineTo(w * 0.16, horizon + h * 0.016)
  ctx.lineTo(w * 0.24, horizon - h * 0.032)
  ctx.lineTo(w * 0.31, horizon - h * 0.008)
  ctx.lineTo(w * 0.4, horizon - h * 0.022)
  ctx.lineTo(w * 0.48, horizon + h * 0.014)
  ctx.lineTo(w * 0.58, horizon - h * 0.02)
  ctx.lineTo(w * 0.67, horizon + h * 0.008)
  ctx.lineTo(w * 0.79, horizon - h * 0.03)
  ctx.lineTo(w * 0.89, horizon - h * 0.004)
  ctx.lineTo(w, horizon - h * 0.025)
  ctx.stroke()

  initSea(w, h, horizon)
  const seaTint = realm?.color ?? '149, 190, 184'
  for (const bead of seaBeads) {
    const { depth, phase } = bead
    const swell = Math.sin(time * 0.00022 + phase) * (0.35 + depth * 1.45)
    const x =
      bead.x - parallaxX * depth * 1.2 - cameraDriftX * depth * 0.68 + Math.sin(time * 0.00012 + phase) * depth * 2
    const y = bead.y + swell - parallaxY * depth * 0.62 - cameraDriftY * depth * 0.28
    const radius = bead.radius * (0.96 + Math.sin(time * 0.00018 + phase) * 0.035)
    const texture = getBeadTexture(radius, seaTint)
    const shimmer = 0.62 + Math.max(0, Math.sin(time * 0.00065 + phase * 1.7)) * 0.38
    ctx.globalAlpha = bead.opacity * shimmer * (1 - dim) * (0.56 + depth * 0.44)
    ctx.drawImage(texture, x - radius, y - radius, radius * 2, radius * 2)
  }
  ctx.globalAlpha = 1

  // Broken vertical glints connect the sun to the near water. Their spacing
  // follows a loose sine instead of a grid, so the reflected path feels alive.
  for (let i = 0; i < 28; i++) {
    const depth = i / 27
    const y = horizon + 5 + depth * depth * (h - horizon) * 0.73
    const center = sunX + Math.sin(i * 2.17 + time * 0.00016) * (w * (0.018 + depth * 0.035))
    const streakWidth = w * (0.006 + depth * 0.027) * (0.24 + (i % 5) * 0.17)
    const alpha = (0.035 + depth * 0.09) * (1 - dim)
    ctx.strokeStyle = `rgba(210, 230, 216, ${alpha})`
    ctx.lineWidth = 0.6 + depth * 1.25
    ctx.beginPath()
    ctx.moveTo(center - streakWidth / 2, y)
    ctx.quadraticCurveTo(center, y + Math.sin(time * 0.0003 + i) * (0.8 + depth * 2), center + streakWidth / 2, y)
    ctx.stroke()
  }
  // A few oblique wavelets catch light between the beads; they are sparse and
  // irregular so the surface remains tactile rather than becoming a pattern.
  for (let i = 0; i < 13; i++) {
    const depth = 0.18 + ((i * 0.371) % 0.78)
    const x = ((i * 0.6180339887 + 0.14) % 1) * w - parallaxX * depth
    const y = horizon + 12 + depth * depth * (h - horizon) * 0.68 + Math.sin(time * 0.00024 + i * 1.8) * depth * 2
    const length = w * (0.012 + depth * 0.022)
    ctx.strokeStyle = `rgba(176, 207, 202, ${(0.045 + depth * 0.045) * (1 - dim)})`
    ctx.lineWidth = 0.55 + depth * 0.55
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + length * 0.48, y - 1.2 * depth, x + length, y + 0.8 * depth)
    ctx.stroke()
  }
  ctx.restore()

  // Jagged obsidian shore in the foreground, with a thin cold edge-light.
  ctx.beginPath()
  ctx.moveTo(0, h * 0.88)
  ctx.lineTo(w * 0.12, h * 0.84)
  ctx.lineTo(w * 0.2, h * 0.87)
  ctx.lineTo(w * 0.31, h * 0.82)
  ctx.lineTo(w * 0.4, h * 0.86)
  ctx.lineTo(w * 0.54, h * 0.83)
  ctx.lineTo(w * 0.65, h * 0.87)
  ctx.lineTo(w * 0.77, h * 0.81)
  ctx.lineTo(w * 0.9, h * 0.85)
  ctx.lineTo(w, h * 0.82)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  const shore = ctx.createLinearGradient(0, h * 0.81, 0, h)
  shore.addColorStop(0, '#35434a')
  shore.addColorStop(0.07, '#1d272d')
  shore.addColorStop(0.25, '#11171c')
  shore.addColorStop(1, '#080a0d')
  ctx.fillStyle = shore
  ctx.fill()
  ctx.strokeStyle = `rgba(188, 218, 211, ${0.32 * (1 - dim)})`
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, h * 0.88)
  ctx.lineTo(w * 0.12, h * 0.84)
  ctx.lineTo(w * 0.2, h * 0.87)
  ctx.lineTo(w * 0.31, h * 0.82)
  ctx.lineTo(w * 0.4, h * 0.86)
  ctx.lineTo(w * 0.54, h * 0.83)
  ctx.lineTo(w * 0.65, h * 0.87)
  ctx.lineTo(w * 0.77, h * 0.81)
  ctx.lineTo(w * 0.9, h * 0.85)
  ctx.lineTo(w, h * 0.82)
  ctx.stroke()

  // Near-field obsidian shelves frame the crossing like black glass cliffs.
  // Their facets are intentionally asymmetrical and stay clear of the centre,
  // where the souls and the bead sea remain readable.
  const drawCliff = (right: boolean) => {
    ctx.save()
    if (right) {
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
    }
    ctx.beginPath()
    ctx.moveTo(0, h * 0.61)
    ctx.lineTo(w * 0.045, h * 0.65)
    ctx.lineTo(w * 0.07, h * 0.64)
    ctx.lineTo(w * 0.105, h * 0.71)
    ctx.lineTo(w * 0.13, h * 0.735)
    ctx.lineTo(w * 0.17, h * 0.82)
    ctx.lineTo(w * 0.2, h * 0.855)
    ctx.lineTo(w * 0.18, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    const facet = ctx.createLinearGradient(0, h * 0.65, w * 0.19, h * 0.96)
    facet.addColorStop(0, '#28343a')
    facet.addColorStop(0.32, '#171e24')
    facet.addColorStop(1, '#080b0f')
    ctx.fillStyle = facet
    ctx.fill()
    ctx.strokeStyle = `rgba(171, 203, 196, ${0.3 * (1 - dim)})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h * 0.61)
    ctx.lineTo(w * 0.045, h * 0.65)
    ctx.lineTo(w * 0.07, h * 0.64)
    ctx.lineTo(w * 0.105, h * 0.71)
    ctx.lineTo(w * 0.13, h * 0.735)
    ctx.lineTo(w * 0.17, h * 0.82)
    ctx.stroke()
    ctx.strokeStyle = `rgba(165, 192, 188, ${0.11 * (1 - dim)})`
    ctx.beginPath()
    ctx.moveTo(w * 0.045, h * 0.65)
    ctx.lineTo(w * 0.12, h * 0.84)
    ctx.lineTo(w * 0.18, h)
    ctx.moveTo(w * 0.105, h * 0.71)
    ctx.lineTo(w * 0.055, h * 0.82)
    ctx.stroke()
    ctx.restore()
  }
  drawCliff(false)
  drawCliff(true)

  // Sparse stars remain above the horizon; the foreground is a real surface.
  const starCount = Math.floor((w * Math.min(h, 900)) / 9500)
  for (let i = 0; i < starCount; i++) {
    const seed = i * 127.1 + 311.7
    const x = ((((Math.sin(seed) * 43758.5453) % 1) + 1) % 1) * w
    const y = ((((Math.sin(seed * 1.37) * 24634.6345) % 1) + 1) % 1) * horizon * 0.9
    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.001 + seed))
    ctx.globalAlpha = twinkle * (1 - dim) * 0.55
    ctx.fillStyle = '#d7e4de'
    ctx.fillRect(x, y, i % 13 === 0 ? 1.5 : 0.8, i % 13 === 0 ? 1.5 : 0.8)
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
    ctx.fillStyle = `rgba(168, 196, 194, ${f.opacity * 2 * (1 - dim)})`
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

    const beadScale = selected ? 1.1 : hovered ? 1.05 : 1
    const beadR = displayR * 0.76 * beadScale

    // Every soul is a bead in this subastral. Give it an actual glass body;
    // focus changes its light and scale, never its silhouette into a flame.
    if ((selected || hovered) && glowAffordable) {
      const halo = ctx.createRadialGradient(px, py, beadR * 0.68, px, py, beadR * (selected ? 3.4 : 2.8))
      halo.addColorStop(0, `rgba(${s.glowColor},${selected ? 0.13 : 0.08})`)
      halo.addColorStop(0.42, `rgba(${s.glowColor},${selected ? 0.045 : 0.025})`)
      halo.addColorStop(1, `rgba(${s.glowColor},0)`)
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(px, py, beadR * (selected ? 3.4 : 2.8), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = Math.min(1, alpha)
    ctx.drawImage(tex, px - beadR, py - beadR, beadR * 2, beadR * 2)

    if (!asDots && (selected || hovered)) {
      ctx.globalAlpha = Math.min(1, alpha) * (selected ? 0.42 : 0.3)
      ctx.strokeStyle = selected ? 'rgba(226,233,215,.8)' : s.rimStroke
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.arc(px, py, beadR * 1.06, -Math.PI * 0.72, Math.PI * 0.48)
      ctx.stroke()
    }

    /*
     * The 6x glow, once. §5.5.4's own conditions: the bead has to be glowing,
     * and the scene has to be small enough that the overdraw is affordable.
     */
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
