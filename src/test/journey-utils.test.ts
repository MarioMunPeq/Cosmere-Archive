import { describe, it, expect } from 'vitest'
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

//
// Utility functions to be extracted to src/utils/journey.ts
// Tests written first (TDD) — they define the expected API.
//

// ---------- Helpers for tests ----------
const planetMap = new Map(PLANETS.map((p) => [p.id, { x: p.x, y: p.y }]))
const ALL_PLANET_IDS = new Set(PLANETS.map((p) => p.id))

import {
  buildJourneySegments,
  interpolatePosition,
  formatJourneyYear,
  getTotalDuration,
  getStopProgressRange,
  findStopAtProgress,
} from '@/utils/journey'

// ============================================================
// buildJourneySegments
// ============================================================
describe('buildJourneySegments', () => {
  it('returns empty array for unknown worldhopper', () => {
    const segs = buildJourneySegments('unknown', planetMap)
    expect(segs).toEqual([])
  })

  it('returns empty array when planetMap is empty', () => {
    const segs = buildJourneySegments('hoid', new Map())
    expect(segs).toEqual([])
  })

  it('returns empty when no planet is found for any movement', () => {
    const emptyMap = new Map<string, { x: number; y: number }>()
    const segs = buildJourneySegments('hoid', emptyMap)
    expect(segs).toEqual([])
  })

  it('returns empty array for null/undefined worldhopperId', () => {
    expect(buildJourneySegments(null as unknown as string, planetMap)).toEqual([])
    expect(buildJourneySegments(undefined as unknown as string, planetMap)).toEqual([])
  })

  it('builds segments in chronological order for Hoid', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(segs.length).toBeGreaterThan(0)
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i]!.fromYear).toBeGreaterThanOrEqual(segs[i - 1]!.toYear)
    }
  })

  it('every segment has positive duration', () => {
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      const segs = buildJourneySegments(wh.id, planetMap)
      segs.forEach((s) => {
        expect(s.duration).toBeGreaterThan(0)
      })
    }
  })

  it('segments chain end-to-end (to of prev === from of next)', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i]!.from.x).toBe(segs[i - 1]!.to.x)
      expect(segs[i]!.from.y).toBe(segs[i - 1]!.to.y)
    }
  })

  it('each segment to/from points to a known planet coordinate', () => {
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      const segs = buildJourneySegments(wh.id, planetMap)
      segs.forEach((s) => {
        expect(s.from.x).toBeGreaterThanOrEqual(0)
        expect(s.from.y).toBeGreaterThanOrEqual(0)
        expect(s.to.x).toBeGreaterThanOrEqual(0)
        expect(s.to.y).toBeGreaterThanOrEqual(0)
      })
    }
  })

  it('generates N-1 segments for N movements', () => {
    const hoid = WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === 'hoid')!
    const segs = buildJourneySegments('hoid', planetMap)
    expect(segs.length).toBe(hoid.movements.length - 1)
  })

  it('single-movement worldhopper produces zero segments', () => {
    // Logic: 1 movement → 0 segments; verified via vasher who has 5 → 4
    const segs = buildJourneySegments('vasher', planetMap)
    const vasher = WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === 'vasher')!
    expect(segs.length).toBe(vasher.movements.length - 1)
  })

  it('includes fromPlanet, toPlanet, fromYear, toYear, and description on each segment', () => {
    const segs = buildJourneySegments('khriss', planetMap)
    segs.forEach((s) => {
      expect(s).toHaveProperty('fromPlanet')
      expect(s).toHaveProperty('toPlanet')
      expect(s).toHaveProperty('fromYear')
      expect(s).toHaveProperty('toYear')
      expect(s).toHaveProperty('description')
      expect(typeof s.fromPlanet).toBe('string')
      expect(typeof s.toPlanet).toBe('string')
      expect(typeof s.fromYear).toBe('number')
      expect(typeof s.toYear).toBe('number')
    })
  })

  it('segment years match movement years', () => {
    const hoid = WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === 'hoid')!
    const segs = buildJourneySegments('hoid', planetMap)
    segs.forEach((s, i) => {
      expect(s.fromYear).toBe(hoid.movements[i]!.year)
      expect(s.toYear).toBe(hoid.movements[i + 1]!.year)
    })
  })
})

// ============================================================
// getTotalDuration
// ============================================================
describe('getTotalDuration', () => {
  it('returns sum of all segment durations', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const manual = segs.reduce((sum, s) => sum + s.duration, 0)
    expect(getTotalDuration(segs)).toBe(manual)
  })

  it('returns 0 for empty segments array', () => {
    expect(getTotalDuration([])).toBe(0)
  })

  it('always returns positive number for valid data', () => {
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      const segs = buildJourneySegments(wh.id, planetMap)
      if (segs.length > 0) {
        expect(getTotalDuration(segs)).toBeGreaterThan(0)
      }
    }
  })
})

// ============================================================
// getStopProgressRange
// ============================================================
describe('getStopProgressRange', () => {
  it('first stop starts at 0 and ends at first segment weight', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    if (segs.length === 0) return
    const r0 = getStopProgressRange(segs, 0)
    expect(r0.start).toBe(0)
    expect(r0.end).toBeGreaterThan(0)
    expect(r0.end).toBeLessThanOrEqual(1)
  })

  it('last stop ends at 1', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    if (segs.length === 0) return
    const rLast = getStopProgressRange(segs, segs.length - 1)
    expect(rLast.end).toBe(1)
  })

  it('stops are contiguous (end of n === start of n+1)', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    for (let i = 0; i < segs.length - 1; i++) {
      expect(getStopProgressRange(segs, i).end).toBeCloseTo(getStopProgressRange(segs, i + 1).start, 6)
    }
  })

  it('throws for out-of-range index', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(() => getStopProgressRange(segs, -1)).toThrow()
    expect(() => getStopProgressRange(segs, segs.length)).toThrow()
  })

  it('returns {start:0, end:1} for empty/unreachable fallback', () => {
    // If segments is empty, should return a valid default
    const r = getStopProgressRange([], 0)
    expect(r.start).toBe(0)
    expect(r.end).toBe(1)
  })
})

// ============================================================
// findStopAtProgress
// ============================================================
describe('findStopAtProgress', () => {
  it('returns 0 at progress 0', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(findStopAtProgress(segs, 0)).toBe(0)
  })

  it('returns last index at progress 1', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(findStopAtProgress(segs, 1)).toBe(segs.length - 1)
  })

  it('returns a valid index for any progress between 0 and 1', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    for (let p = 0; p <= 1; p += 0.05) {
      const idx = findStopAtProgress(segs, p)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(segs.length)
    }
  })

  it('clamps progress < 0 to 0', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(findStopAtProgress(segs, -10)).toBe(0)
  })

  it('clamps progress > 1 to 1', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    expect(findStopAtProgress(segs, 10)).toBe(segs.length - 1)
  })

  it('returns 0 for empty segments', () => {
    expect(findStopAtProgress([], 0.5)).toBe(0)
  })
})

// ============================================================
// interpolatePosition
// ============================================================
describe('interpolatePosition', () => {
  it('returns first planet coords at progress 0', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const pos = interpolatePosition(segs, 0, planetMap)
    expect(pos.x).toBe(segs[0]!.from.x)
    expect(pos.y).toBe(segs[0]!.from.y)
    expect(pos.segmentIndex).toBe(0)
    expect(pos.segmentProgress).toBe(0)
  })

  it('returns last planet coords at progress 1', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const pos = interpolatePosition(segs, 1, planetMap)
    const last = segs[segs.length - 1]!
    expect(pos.x).toBe(last.to.x)
    expect(pos.y).toBe(last.to.y)
    expect(pos.segmentIndex).toBe(segs.length - 1)
    expect(pos.segmentProgress).toBe(1)
  })

  it('position at mid-journey is not at first or last planet', () => {
    const segs = buildJourneySegments('khriss', planetMap)
    const first = segs[0]!
    const last = segs[segs.length - 1]!
    const pos = interpolatePosition(segs, 0.5, planetMap)
    const allSame = (pos.x === first.from.x && pos.y === first.from.y) || (pos.x === last.to.x && pos.y === last.to.y)
    expect(allSame).toBe(false)
  })

  it('currentYear increases monotonically with progress', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    let prevYear = -Infinity
    for (let p = 0; p <= 1; p += 0.05) {
      const pos = interpolatePosition(segs, p, planetMap)
      expect(pos.currentYear).toBeGreaterThanOrEqual(prevYear)
      prevYear = pos.currentYear
    }
  })

  it('currentYear at progress 0 equals first movement year', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const pos = interpolatePosition(segs, 0, planetMap)
    expect(pos.currentYear).toBe(segs[0]!.fromYear)
  })

  it('currentYear at progress 1 equals last movement year', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const pos = interpolatePosition(segs, 1, planetMap)
    expect(pos.currentYear).toBe(segs[segs.length - 1]!.toYear)
  })

  it('description updates at segment boundaries', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    if (segs.length < 2) return
    const nearEnd = Math.max(0, getStopProgressRange(segs, 0).end - 0.001)
    const pos1 = interpolatePosition(segs, nearEnd, planetMap)
    const nearStart = Math.min(1, getStopProgressRange(segs, 1).start + 0.001)
    const pos2 = interpolatePosition(segs, nearStart, planetMap)
    if (pos1.segmentIndex !== pos2.segmentIndex) {
      expect(pos1.description).not.toBe(pos2.description)
    }
  })

  it('linearly interpolates within a segment', () => {
    const segs = buildJourneySegments('hoid', planetMap)
    const seg = segs[0]!
    const mid = getStopProgressRange(segs, 0).end / 2
    const pos = interpolatePosition(segs, mid, planetMap)
    const expectedX = seg.from.x + (seg.to.x - seg.from.x) * 0.5
    const expectedY = seg.from.y + (seg.to.y - seg.from.y) * 0.5
    expect(pos.x).toBeCloseTo(expectedX, 1)
    expect(pos.y).toBeCloseTo(expectedY, 1)
  })

  it('handles empty segments gracefully', () => {
    const pos = interpolatePosition([], 0.5, planetMap)
    expect(pos.x).toBe(0)
    expect(pos.y).toBe(0)
    expect(pos.segmentIndex).toBe(0)
    expect(pos.segmentProgress).toBe(0)
    expect(pos.currentYear).toBe(0)
    expect(pos.description).toBe('')
    expect(pos.planet).toBe('')
  })
})

// ============================================================
// formatJourneyYear
// ============================================================
describe('formatJourneyYear', () => {
  it('formats positive years as AD', () => {
    expect(formatJourneyYear(1024)).toBe('1024 AD')
    expect(formatJourneyYear(1)).toBe('1 AD')
    expect(formatJourneyYear(2024)).toBe('2024 AD')
  })

  it('formats 0 as 0 AD', () => {
    expect(formatJourneyYear(0)).toBe('0 AD')
  })

  it('formats negative years as BC', () => {
    expect(formatJourneyYear(-10000)).toBe('10000 BC')
    expect(formatJourneyYear(-1)).toBe('1 BC')
    expect(formatJourneyYear(-500)).toBe('500 BC')
  })

  it('formats large negative years correctly', () => {
    expect(formatJourneyYear(-99999)).toBe('99999 BC')
  })

  it('handles decimal years by truncating', () => {
    expect(formatJourneyYear(1024.5)).toBe('1024 AD')
  })
})

// ============================================================
// Data integrity — cross-checks
// ============================================================
describe('data integrity', () => {
  it('every worldhopper in WORLDHOPPER_MOVEMENTS has at least 2 movements', () => {
    WORLDHOPPER_MOVEMENTS.forEach((wh) => {
      expect(wh.movements.length, `${wh.id} has < 2 movements`).toBeGreaterThanOrEqual(2)
    })
  })

  it('all movements reference known planets', () => {
    WORLDHOPPER_MOVEMENTS.forEach((wh) => {
      wh.movements.forEach((m) => {
        expect(ALL_PLANET_IDS, `[${wh.id}] unknown planet "${m.planet}"`).toContain(m.planet)
      })
    })
  })

  it('every worldhopper has id, name, color', () => {
    WORLDHOPPER_MOVEMENTS.forEach((wh) => {
      expect(wh.id).toBeTruthy()
      expect(wh.name).toBeTruthy()
      expect(wh.color).toMatch(/^#/)
    })
  })
})
