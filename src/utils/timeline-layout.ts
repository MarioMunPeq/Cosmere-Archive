import { TIMELINE_EVENTS } from '@/data/static/timeline'
import type { TimelineEvent } from '@/data/static/timeline'

/**
 * Minimum horizontal distance between two events on the main line.
 *
 * The year axis is not linear: every distinct year is pulled apart far enough
 * that its point (and its year label) has room to breathe. 70px is the floor
 * the chronology UI is designed around — without it, years one apart such as
 * 10000 BC and 9999 BC land on top of each other and their labels collide.
 */
const MIN_EVENT_SPACING = 70
const CLUSTER_GAP_PX = 90
const START_PAD = 120
const END_PAD = 160
const JUMP_THRESHOLD = 400

function computeLayout(events: TimelineEvent[]) {
  const sorted = [...events].sort((a, b) => a.year - b.year)
  const uniqueYears: number[] = []
  const xPositions: number[] = []
  const jumpAfter: number[] = []

  let x = START_PAD
  for (let i = 0; i < sorted.length; i++) {
    const year = sorted[i]!.year
    if (i > 0 && year === sorted[i - 1]!.year) continue
    uniqueYears.push(year)
    if (xPositions.length > 0) {
      const prevYear = uniqueYears[uniqueYears.length - 2]!
      const gap = year - prevYear
      if (Math.abs(gap) > JUMP_THRESHOLD) {
        x += CLUSTER_GAP_PX
        jumpAfter.push(xPositions[xPositions.length - 1]!)
      } else {
        x += Math.max(Math.abs(gap) * 2, MIN_EVENT_SPACING)
      }
    }
    xPositions.push(x)
  }

  const TOTAL_WIDTH = x + END_PAD

  function yearToX(year: number): number {
    if (uniqueYears.length === 0) return 0
    if (year <= uniqueYears[0]!) return xPositions[0]!
    if (year >= uniqueYears[uniqueYears.length - 1]!) return xPositions[xPositions.length - 1]!
    let lo = 0,
      hi = uniqueYears.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (uniqueYears[mid]! <= year) lo = mid
      else hi = mid
    }
    const t = (year - uniqueYears[lo]!) / (uniqueYears[hi]! - uniqueYears[lo]!)
    return xPositions[lo]! + t * (xPositions[hi]! - xPositions[lo]!)
  }

  return { yearToX, TOTAL_WIDTH, jumps: jumpAfter }
}

const layout = computeLayout(TIMELINE_EVENTS)

export const yearToX = layout.yearToX
export const TOTAL_WIDTH = layout.TOTAL_WIDTH
export const TIMELINE_JUMPS = layout.jumps
