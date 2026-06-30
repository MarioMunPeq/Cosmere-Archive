import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import type { WorldhopperMovement } from '@/data/static/timeline'

export interface JourneySegment {
  from: { x: number; y: number }
  to: { x: number; y: number }
  fromYear: number
  toYear: number
  duration: number
  fromPlanet: string
  toPlanet: string
  description: string
}

export interface InterpolatedPosition {
  x: number
  y: number
  segmentIndex: number
  segmentProgress: number
  currentYear: number
  description: string
  planet: string
  fromPlanet: string
  toPlanet: string
}

export function computeCurveControlPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return {
    x: (from.x + to.x) / 2 + dy * 0.2,
    y: (from.y + to.y) / 2 - dx * 0.2,
  }
}

const MIN_ANIM_MS = 1500
const MAX_ANIM_MS = 6000
const LOG_SCALE = 400

function yearGapToMs(gap: number): number {
  const g = Math.abs(gap)
  if (g <= 1) return MIN_ANIM_MS
  return Math.round(Math.max(MIN_ANIM_MS, Math.min(MAX_ANIM_MS, MIN_ANIM_MS + Math.log(g) * LOG_SCALE)))
}

function findWorldhopper(id: string): WorldhopperMovement | undefined {
  return WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === id)
}

export function buildJourneySegments(
  worldhopperId: string,
  planetMap: Map<string, { x: number; y: number }>,
): JourneySegment[] {
  if (!worldhopperId) return []

  const wh = findWorldhopper(worldhopperId)
  if (!wh || wh.movements.length < 2) return []

  const segs: JourneySegment[] = []
  for (let i = 0; i < wh.movements.length - 1; i++) {
    const m1 = wh.movements[i]!
    const m2 = wh.movements[i + 1]!
    const from = planetMap.get(m1.planet)
    const to = planetMap.get(m2.planet)
    if (!from || !to) return []
    segs.push({
      from: { x: from.x, y: from.y },
      to: { x: to.x, y: to.y },
      fromYear: m1.year,
      toYear: m2.year,
      duration: yearGapToMs(m2.year - m1.year),
      fromPlanet: m1.planet,
      toPlanet: m2.planet,
      description: m2.description,
    })
  }
  return segs
}

export function getTotalDuration(segments: JourneySegment[]): number {
  return segments.reduce((sum, s) => sum + s.duration, 0)
}

export function getStopProgressRange(segments: JourneySegment[], stopIndex: number): { start: number; end: number } {
  if (segments.length === 0) return { start: 0, end: 1 }
  if (stopIndex < 0 || stopIndex >= segments.length) {
    throw new RangeError(`stopIndex ${stopIndex} out of range [0, ${segments.length})`)
  }

  const total = getTotalDuration(segments)
  if (total === 0) return { start: 0, end: 1 }

  let cumulative = 0
  for (let i = 0; i < stopIndex; i++) {
    cumulative += segments[i]!.duration
  }

  const start = cumulative / total
  const end = (cumulative + segments[stopIndex]!.duration) / total
  return { start, end }
}

export function findStopAtProgress(segments: JourneySegment[], progress: number): number {
  if (segments.length === 0) return 0

  const clamped = Math.max(0, Math.min(1, progress))
  const total = getTotalDuration(segments)
  if (total === 0) return 0

  const target = clamped * total
  let cumulative = 0
  for (let i = 0; i < segments.length; i++) {
    cumulative += segments[i]!.duration
    if (cumulative >= target) return i
  }
  return segments.length - 1
}

export function interpolatePosition(
  segments: JourneySegment[],
  progress: number,
  _planetMap: Map<string, { x: number; y: number }>,
): InterpolatedPosition {
  if (segments.length === 0) {
    return {
      x: 0,
      y: 0,
      segmentIndex: 0,
      segmentProgress: 0,
      currentYear: 0,
      description: '',
      planet: '',
      fromPlanet: '',
      toPlanet: '',
    }
  }

  const clamped = Math.max(0, Math.min(1, progress))

  if (clamped === 1) {
    const last = segments[segments.length - 1]!
    return {
      x: last.to.x,
      y: last.to.y,
      segmentIndex: segments.length - 1,
      segmentProgress: 1,
      currentYear: last.toYear,
      description: last.description,
      planet: last.toPlanet,
      fromPlanet: last.fromPlanet,
      toPlanet: last.toPlanet,
    }
  }

  if (clamped === 0) {
    const first = segments[0]!
    return {
      x: first.from.x,
      y: first.from.y,
      segmentIndex: 0,
      segmentProgress: 0,
      currentYear: first.fromYear,
      description: '',
      planet: first.fromPlanet,
      fromPlanet: first.fromPlanet,
      toPlanet: first.toPlanet,
    }
  }

  const segIdx = findStopAtProgress(segments, clamped)
  const seg = segments[segIdx]!

  const { start } = getStopProgressRange(segments, segIdx)
  const localProgress = (clamped - start) / (getStopProgressRange(segments, segIdx).end - start)

  const cp = computeCurveControlPoint(seg.from, seg.to)
  const t = localProgress
  const x = (1 - t) ** 2 * seg.from.x + 2 * (1 - t) * t * cp.x + t ** 2 * seg.to.x
  const y = (1 - t) ** 2 * seg.from.y + 2 * (1 - t) * t * cp.y + t ** 2 * seg.to.y
  const year = seg.fromYear + (seg.toYear - seg.fromYear) * t

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    segmentIndex: segIdx,
    segmentProgress: t,
    currentYear: Math.round(year),
    description: seg.description,
    planet: t < 0.5 ? seg.fromPlanet : seg.toPlanet,
    fromPlanet: seg.fromPlanet,
    toPlanet: seg.toPlanet,
  }
}

export function formatJourneyYear(year: number): string {
  const y = Math.floor(year)
  if (y < 0) {
    return `${-y} BC`
  }
  return `${y} AD`
}
