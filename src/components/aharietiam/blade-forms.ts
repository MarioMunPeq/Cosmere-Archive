/**
 * The ten Honorblades, described as silhouettes rather than ten recolours.
 *
 * Every value here is pure data: the same outline feeds the Three.js
 * ExtrudeGeometry in the living scene and the ink drawing in the static
 * fallback, so a blade can never look like a different weapon depending on
 * whether WebGL was available.
 */

export interface BladePoint {
  x: number
  y: number
}

export type GuardKind = 'wing' | 'bar' | 'fork' | 'crescent' | 'cross' | 'ring' | 'thorn' | 'stone' | 'wedge' | 'seraph'

export type GripWrap = 'leather' | 'wire' | 'cord' | 'cloth' | 'wood'

export type PommelKind = 'orb' | 'disc' | 'ring' | 'octa' | 'gem' | 'cone' | 'cube' | 'tear' | 'knot' | 'sun'

export interface BladeForm {
  id: string
  /** Blade length from buried point to the guard, in metres. */
  length: number
  /** Greatest half-width of the blade. */
  halfWidth: number
  /** Eleven samples from point (0) to shoulder (1), each 0..1 of halfWidth. */
  profile: readonly number[]
  /** A chisel point keeps a little width at the ground. */
  tipHalfWidth: number
  /** Shifts one edge away from the centre; 0 is symmetrical. */
  asymmetry: number
  /** A slow serpentine edge, used sparingly. */
  waveAmplitude: number
  waveCycles: number
  /** Bulge of the centreline, for a curved single-edged blade. */
  curve: number
  depth: number
  guard: GuardKind
  guardWidth: number
  guardDepth: number
  grip: GripWrap
  gripBands: number
  gripLength: number
  gripRadius: number
  pommel: PommelKind
  pommelSize: number
  /** Where the etched glyph panel sits, 0 point – 1 shoulder. */
  glyphT: number
  tiltX: number
  tiltZ: number
  /** Degrees away from facing the centre of the ring. */
  faceTurn: number
  /** How deep the point is buried. */
  sink: number
  moundScale: number
}

type BladeFormInput = Omit<BladeForm, 'id' | 'tipHalfWidth' | 'asymmetry' | 'waveAmplitude' | 'waveCycles' | 'curve'> &
  Partial<Pick<BladeForm, 'tipHalfWidth' | 'asymmetry' | 'waveAmplitude' | 'waveCycles' | 'curve'>>

function form(id: string, input: BladeFormInput): BladeForm {
  return {
    id,
    tipHalfWidth: 0,
    asymmetry: 0,
    waveAmplitude: 0,
    waveCycles: 0,
    curve: 0,
    ...input,
  }
}

/**
 * Ten deliberately different weapons. The profile arrays are hand-authored,
 * not sampled from one master shape: Jezrien's blade is a leaf, Nale's is a
 * needle, Chanarach's edge ripples, Kalak's is a cleaver, Taln's is a slab.
 */
export const BLADE_FORMS: Record<string, BladeForm> = {
  jezrien: form('jezrien', {
    length: 2.95,
    halfWidth: 0.15,
    profile: [0, 0.14, 0.28, 0.43, 0.57, 0.7, 0.82, 0.92, 0.98, 0.92, 0.86],
    depth: 0.075,
    guard: 'wing',
    guardWidth: 0.82,
    guardDepth: 0.22,
    grip: 'wire',
    gripBands: 7,
    gripLength: 0.46,
    gripRadius: 0.082,
    pommel: 'orb',
    pommelSize: 0.095,
    glyphT: 0.66,
    tiltX: -0.018,
    tiltZ: 0.035,
    faceTurn: -12,
    sink: 0.06,
    moundScale: 1,
  }),
  nale: form('nale', {
    length: 2.68,
    halfWidth: 0.125,
    profile: [0, 0.1, 0.21, 0.31, 0.4, 0.49, 0.58, 0.67, 0.76, 0.84, 0.9],
    depth: 0.062,
    guard: 'bar',
    guardWidth: 0.68,
    guardDepth: 0.16,
    grip: 'leather',
    gripBands: 3,
    gripLength: 0.4,
    gripRadius: 0.078,
    pommel: 'disc',
    pommelSize: 0.1,
    glyphT: 0.6,
    tiltX: 0.022,
    tiltZ: -0.028,
    faceTurn: 9,
    sink: 0.04,
    moundScale: 0.88,
  }),
  chanarach: form('chanarach', {
    length: 2.52,
    halfWidth: 0.17,
    profile: [0, 0.18, 0.31, 0.25, 0.42, 0.57, 0.47, 0.62, 0.75, 0.69, 0.82],
    waveAmplitude: 0.018,
    waveCycles: 2.5,
    depth: 0.07,
    guard: 'fork',
    guardWidth: 0.74,
    guardDepth: 0.18,
    grip: 'cord',
    gripBands: 6,
    gripLength: 0.42,
    gripRadius: 0.085,
    pommel: 'gem',
    pommelSize: 0.09,
    glyphT: 0.63,
    tiltX: 0,
    tiltZ: 0.055,
    faceTurn: -6,
    sink: 0.07,
    moundScale: 1.05,
  }),
  vedel: form('vedel', {
    length: 2.8,
    halfWidth: 0.155,
    profile: [0, 0.13, 0.27, 0.39, 0.49, 0.57, 0.64, 0.7, 0.75, 0.79, 0.82],
    curve: 0.1,
    asymmetry: 0.18,
    depth: 0.066,
    guard: 'crescent',
    guardWidth: 0.7,
    guardDepth: 0.17,
    grip: 'cloth',
    gripBands: 4,
    gripLength: 0.44,
    gripRadius: 0.081,
    pommel: 'tear',
    pommelSize: 0.095,
    glyphT: 0.67,
    tiltX: -0.02,
    tiltZ: -0.045,
    faceTurn: 7,
    sink: 0.05,
    moundScale: 0.95,
  }),
  pailiah: form('pailiah', {
    length: 2.72,
    halfWidth: 0.195,
    profile: [0, 0.26, 0.44, 0.58, 0.7, 0.8, 0.88, 0.94, 0.98, 0.99, 1],
    depth: 0.09,
    guard: 'cross',
    guardWidth: 0.9,
    guardDepth: 0.24,
    grip: 'wood',
    gripBands: 2,
    gripLength: 0.45,
    gripRadius: 0.09,
    pommel: 'cube',
    pommelSize: 0.09,
    glyphT: 0.58,
    tiltX: 0.015,
    tiltZ: 0.02,
    faceTurn: -14,
    sink: 0.06,
    moundScale: 1.1,
  }),
  shalash: form('shalash', {
    length: 3.18,
    halfWidth: 0.13,
    profile: [0, 0.12, 0.24, 0.35, 0.45, 0.54, 0.62, 0.69, 0.75, 0.79, 0.82],
    curve: 0.04,
    depth: 0.055,
    guard: 'ring',
    guardWidth: 0.78,
    guardDepth: 0.14,
    grip: 'wire',
    gripBands: 8,
    gripLength: 0.5,
    gripRadius: 0.075,
    pommel: 'ring',
    pommelSize: 0.115,
    glyphT: 0.7,
    tiltX: 0.01,
    tiltZ: -0.02,
    faceTurn: 5,
    sink: 0.045,
    moundScale: 0.85,
  }),
  battar: form('battar', {
    length: 2.84,
    halfWidth: 0.155,
    profile: [0, 0.17, 0.31, 0.4, 0.36, 0.48, 0.6, 0.55, 0.67, 0.73, 0.79],
    waveAmplitude: 0.006,
    waveCycles: 3.5,
    depth: 0.072,
    guard: 'thorn',
    guardWidth: 0.72,
    guardDepth: 0.19,
    grip: 'leather',
    gripBands: 5,
    gripLength: 0.43,
    gripRadius: 0.083,
    pommel: 'octa',
    pommelSize: 0.092,
    glyphT: 0.64,
    tiltX: -0.012,
    tiltZ: 0.04,
    faceTurn: -4,
    sink: 0.06,
    moundScale: 1,
  }),
  kalak: form('kalak', {
    length: 2.58,
    halfWidth: 0.21,
    profile: [0, 0.38, 0.6, 0.77, 0.9, 1, 0.98, 0.95, 0.92, 0.9, 0.88],
    tipHalfWidth: 0.06,
    asymmetry: 0.08,
    depth: 0.1,
    guard: 'stone',
    guardWidth: 0.94,
    guardDepth: 0.26,
    grip: 'cloth',
    gripBands: 3,
    gripLength: 0.41,
    gripRadius: 0.095,
    pommel: 'sun',
    pommelSize: 0.105,
    glyphT: 0.56,
    tiltX: 0.02,
    tiltZ: -0.06,
    faceTurn: 13,
    sink: 0.08,
    moundScale: 1.2,
  }),
  talenel: form('talenel', {
    length: 3.08,
    halfWidth: 0.235,
    profile: [0, 0.28, 0.48, 0.64, 0.77, 0.87, 0.94, 0.98, 1, 1, 0.99],
    tipHalfWidth: 0.015,
    depth: 0.115,
    guard: 'wedge',
    guardWidth: 1,
    guardDepth: 0.3,
    grip: 'leather',
    gripBands: 4,
    gripLength: 0.48,
    gripRadius: 0.1,
    pommel: 'cone',
    pommelSize: 0.11,
    glyphT: 0.62,
    tiltX: -0.025,
    tiltZ: 0.012,
    faceTurn: 0,
    sink: 0.09,
    moundScale: 1.35,
  }),
  ishar: form('ishar', {
    length: 2.98,
    halfWidth: 0.17,
    profile: [0, 0.14, 0.28, 0.4, 0.5, 0.58, 0.65, 0.71, 0.77, 0.82, 0.86],
    waveAmplitude: 0.006,
    waveCycles: 4,
    depth: 0.078,
    guard: 'seraph',
    guardWidth: 0.86,
    guardDepth: 0.2,
    grip: 'wire',
    gripBands: 6,
    gripLength: 0.46,
    gripRadius: 0.08,
    pommel: 'knot',
    pommelSize: 0.1,
    glyphT: 0.68,
    tiltX: 0.018,
    tiltZ: -0.055,
    faceTurn: 4,
    sink: 0.05,
    moundScale: 1,
  }),
}

function sampleProfile(profile: readonly number[], t: number): number {
  if (profile.length < 2) return profile[0] ?? 0
  const clamped = Math.min(Math.max(t, 0), 1)
  const position = clamped * (profile.length - 1)
  const index = Math.min(Math.floor(position), profile.length - 2)
  const fraction = position - index
  const from = profile[index] ?? 0
  const to = profile[index + 1] ?? from
  return from + (to - from) * fraction
}

export function bladeCentreAt(formData: BladeForm, t: number): number {
  return formData.curve * Math.sin(Math.PI * Math.min(Math.max(t, 0), 1))
}

/** Half the blade's width at a normalised height, in metres. */
export function bladeHalfWidthAt(formData: BladeForm, t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  const body = formData.halfWidth * sampleProfile(formData.profile, clamped)
  const tip = formData.tipHalfWidth * Math.max(0, 1 - clamped * 5)
  return Math.max(body, tip)
}

/**
 * The outline, point first, running up the right edge and back down the left.
 * The point is at y=0 and the guard shoulder at y=length.
 */
export function bladeOutline(formData: BladeForm): BladePoint[] {
  const steps = 18
  const right: BladePoint[] = []
  const left: BladePoint[] = []

  for (let index = 0; index <= steps; index++) {
    const t = index / steps
    const half = bladeHalfWidthAt(formData, t)
    const centre = bladeCentreAt(formData, t)
    const tipFade = Math.min(1, t * 9)
    const wave = formData.waveAmplitude * Math.sin(t * Math.PI * 2 * formData.waveCycles) * tipFade

    right.push({
      x: centre + half * (1 + formData.asymmetry) + wave,
      y: t * formData.length,
    })
    left.push({
      x: centre - half * (1 - formData.asymmetry) - wave,
      y: t * formData.length,
    })
  }

  return dedupe([...right, ...left.slice(0, -1).reverse()])
}

/** Extrusion rejects coincident points, so a symmetrical point is kept once. */
function dedupe(points: BladePoint[]): BladePoint[] {
  const kept: BladePoint[] = []
  for (const point of points) {
    const previous = kept[kept.length - 1]
    if (previous && Math.abs(previous.x - point.x) < 1e-6 && Math.abs(previous.y - point.y) < 1e-6) continue
    kept.push(point)
  }
  const first = kept[0]
  const last = kept[kept.length - 1]
  if (first && last && kept.length > 2 && Math.abs(first.x - last.x) < 1e-6 && Math.abs(first.y - last.y) < 1e-6) {
    kept.pop()
  }
  return kept
}

/** The tapered fuller groove, as a flat shape in the blade's own plane. */
export function fullerOutline(formData: BladeForm): BladePoint[] {
  const from = 0.17
  const to = 0.63
  const steps = 10
  const right: BladePoint[] = []
  const left: BladePoint[] = []

  for (let index = 0; index <= steps; index++) {
    const t = from + (to - from) * (index / steps)
    const centre = bladeCentreAt(formData, t)
    const half = Math.max(0.008, bladeHalfWidthAt(formData, t) * 0.13)
    right.push({ x: centre + half, y: t * formData.length })
    left.push({ x: centre - half, y: t * formData.length })
  }

  return [...right, ...left.slice(0, -1).reverse()]
}

/** A raised central ridge, bright enough to catch the horizon. */
export function ridgeOutline(formData: BladeForm): BladePoint[] {
  const from = 0.08
  const to = 0.79
  const steps = 10
  const right: BladePoint[] = []
  const left: BladePoint[] = []

  for (let index = 0; index <= steps; index++) {
    const t = from + (to - from) * (index / steps)
    const centre = bladeCentreAt(formData, t)
    const half = Math.max(0.006, bladeHalfWidthAt(formData, t) * 0.075)
    right.push({ x: centre + half, y: t * formData.length })
    left.push({ x: centre - half, y: t * formData.length })
  }

  return [...right, ...left.slice(0, -1).reverse()]
}

/**
 * Crossguards are polygons too. They share no outline, so even at a distance
 * the ten weapons read as ten decisions rather than one mesh with ten tints.
 */
export function guardOutline(kind: GuardKind, width: number): BladePoint[] {
  const w = width
  switch (kind) {
    case 'wing':
      return [
        { x: -w / 2, y: 0.14 },
        { x: -w / 2 + 0.09, y: 0.06 },
        { x: -0.22, y: 0.1 },
        { x: -0.1, y: 0.04 },
        { x: 0, y: 0.07 },
        { x: 0.1, y: 0.04 },
        { x: 0.22, y: 0.1 },
        { x: w / 2 - 0.09, y: 0.06 },
        { x: w / 2, y: 0.14 },
        { x: w / 2 - 0.07, y: -0.03 },
        { x: 0.18, y: -0.06 },
        { x: 0, y: -0.1 },
        { x: -0.18, y: -0.06 },
        { x: -w / 2 + 0.07, y: -0.03 },
      ]
    case 'bar':
      return [
        { x: -w / 2, y: 0.055 },
        { x: -w / 2 + 0.05, y: 0.095 },
        { x: w / 2 - 0.05, y: 0.095 },
        { x: w / 2, y: 0.055 },
        { x: w / 2, y: -0.055 },
        { x: w / 2 - 0.05, y: -0.095 },
        { x: -w / 2 + 0.05, y: -0.095 },
        { x: -w / 2, y: -0.055 },
      ]
    case 'fork':
      return [
        { x: -w / 2, y: 0.1 },
        { x: -w * 0.18, y: 0.04 },
        { x: 0, y: 0.08 },
        { x: w * 0.18, y: 0.04 },
        { x: w / 2, y: 0.1 },
        { x: w / 2 - 0.05, y: -0.1 },
        { x: w * 0.22, y: -0.1 },
        { x: 0, y: -0.02 },
        { x: -w * 0.22, y: -0.1 },
        { x: -w / 2 + 0.05, y: -0.1 },
      ]
    case 'crescent':
      return [
        { x: -w / 2, y: 0.12 },
        { x: -w * 0.28, y: 0.06 },
        { x: 0, y: 0.03 },
        { x: w * 0.28, y: 0.06 },
        { x: w / 2, y: 0.12 },
        { x: w * 0.32, y: -0.08 },
        { x: 0, y: -0.14 },
        { x: -w * 0.32, y: -0.08 },
      ]
    case 'cross':
      return [
        { x: -w * 0.22, y: 0.1 },
        { x: w * 0.22, y: 0.1 },
        { x: w * 0.22, y: 0.03 },
        { x: w / 2, y: 0.03 },
        { x: w / 2, y: -0.05 },
        { x: w * 0.22, y: -0.05 },
        { x: w * 0.22, y: -0.12 },
        { x: -w * 0.22, y: -0.12 },
        { x: -w * 0.22, y: -0.05 },
        { x: -w / 2, y: -0.05 },
        { x: -w / 2, y: 0.03 },
        { x: -w * 0.22, y: 0.03 },
      ]
    case 'ring':
      return [
        { x: -w * 0.26, y: 0.08 },
        { x: 0, y: 0.11 },
        { x: w * 0.26, y: 0.08 },
        { x: w * 0.26, y: -0.06 },
        { x: 0, y: -0.09 },
        { x: -w * 0.26, y: -0.06 },
      ]
    case 'thorn':
      return [
        { x: -w * 0.24, y: 0.1 },
        { x: w * 0.12, y: 0.08 },
        { x: w * 0.3, y: 0.16 },
        { x: w * 0.36, y: 0.1 },
        { x: w * 0.18, y: 0.02 },
        { x: w * 0.3, y: -0.04 },
        { x: w * 0.2, y: -0.1 },
        { x: -w * 0.2, y: -0.06 },
        { x: -w * 0.3, y: -0.01 },
      ]
    case 'stone':
      return [
        { x: -w / 2, y: 0.11 },
        { x: -w * 0.36, y: 0.13 },
        { x: w * 0.36, y: 0.13 },
        { x: w / 2, y: 0.11 },
        { x: w / 2, y: -0.12 },
        { x: -w / 2, y: -0.12 },
      ]
    case 'wedge':
      return [
        { x: -w / 2, y: 0.1 },
        { x: w / 2, y: 0.1 },
        { x: w * 0.34, y: -0.12 },
        { x: 0, y: -0.16 },
        { x: -w * 0.34, y: -0.12 },
      ]
    case 'seraph':
      return [
        { x: -w / 2, y: 0.16 },
        { x: -w * 0.42, y: 0.06 },
        { x: -w * 0.34, y: 0.1 },
        { x: -w * 0.24, y: 0 },
        { x: -w * 0.14, y: 0.06 },
        { x: 0, y: 0.02 },
        { x: w * 0.14, y: 0.06 },
        { x: w * 0.24, y: 0 },
        { x: w * 0.34, y: 0.1 },
        { x: w * 0.42, y: 0.06 },
        { x: w / 2, y: 0.16 },
        { x: w * 0.36, y: -0.08 },
        { x: 0, y: -0.12 },
        { x: -w * 0.36, y: -0.08 },
      ]
  }
}

/** SVG path for the ink fallback. Coordinates are raw blade space; the caller flips Y. */
export function outlineToPath(points: readonly BladePoint[]): string {
  if (points.length === 0) return ''
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(3)} ${point.y.toFixed(3)}`)
    .join(' ')
    .concat(' Z')
}
