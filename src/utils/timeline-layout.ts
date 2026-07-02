import { TIMELINE_EVENTS } from '@/data/static/timeline'
import type { TimelineEvent } from '@/data/static/timeline'

const COMPRESS_THRESHOLD = 50
const DENSE_PX_PER_YEAR = 6
const MIN_EVENT_SPACING = 24
const CLUSTER_GAP_PX = 64
const START_PAD = 80
const END_PAD = 80

export const MAIN_LINE_Y = 100
export const FORK_START_Y = 164
export const FORK_SPACING = 64

function computeLayout(events: TimelineEvent[]) {
  const sorted = [...events].sort((a, b) => a.year - b.year)
  const uniqueYears: number[] = []
  const xPositions: number[] = []

  let x = START_PAD
  for (let i = 0; i < sorted.length; i++) {
    const year = sorted[i]!.year
    if (i > 0 && year === sorted[i - 1]!.year) continue
    uniqueYears.push(year)
    if (xPositions.length > 0) {
      const gap = year - uniqueYears[uniqueYears.length - 2]!
      if (gap > COMPRESS_THRESHOLD) {
        x += CLUSTER_GAP_PX
      } else {
        x += Math.max(gap * DENSE_PX_PER_YEAR, MIN_EVENT_SPACING)
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

  return { yearToX, TOTAL_WIDTH }
}

const layout = computeLayout(TIMELINE_EVENTS)

export const yearToX = layout.yearToX
export const TOTAL_WIDTH = layout.TOTAL_WIDTH
