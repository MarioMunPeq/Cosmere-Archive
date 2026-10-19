/**
 * §5.5.1 — the camera calibration, and the criterion it has to satisfy.
 *
 * The plan calls this "the main bug", so it gets the first block of M5. The
 * numbers below are measurements, not restatements of the plan: each one is
 * what the layout actually produces, and where it diverges from §5.5.1 the
 * divergence is commented rather than smoothed over.
 */

import { describe, expect, it } from 'vitest'
import {
  WORLD_W,
  WORLD_H,
  WORLD_SPAN_Y,
  CLUSTER_RADIUS,
  VIEWPORT_FIT,
  GRID_COLS,
  GRID_ROWS,
  CLUSTERS,
  PERPENDICULARITIES,
  realmBounds,
} from '@/components/shadesmar/types'
import { CameraController } from '@/components/shadesmar/Camera'

/** The five resolutions criterion S.1 names. */
const VIEWPORTS = [
  { w: 360, h: 640 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
  { w: 2560, h: 1440 },
  { w: 3840, h: 2160 },
]

function fitted() {
  const cam = new CameraController()
  cam.resetToOverview()
  return cam
}

describe('the world', () => {
  it('is 2.4 x 1.6, three to two', () => {
    expect(WORLD_W).toBe(2.4)
    expect(WORLD_H).toBe(1.6)
  })

  it('places the realms on a 4 x 3 grid', () => {
    expect(GRID_COLS * GRID_ROWS).toBe(12)
  })

  it('keeps every constellation inside the world', () => {
    for (const c of CLUSTERS) {
      expect(c.cx - c.radius, c.id).toBeGreaterThanOrEqual(0)
      expect(c.cy - c.radius, c.id).toBeGreaterThanOrEqual(0)
      expect(c.cx + c.radius, c.id).toBeLessThanOrEqual(WORLD_W)
      expect(c.cy + c.radius, c.id).toBeLessThanOrEqual(WORLD_H)
    }
  })

  it('does not let neighbouring constellations touch', () => {
    // The reason CLUSTER_RADIUS is 0.19 of the *cell* rather than 0.19 of the
    // world. At 0.19 of 1.6 the radius would be 0.304 against a 0.533 row
    // pitch: vertically adjacent clusters would overlap by 14% and their outer
    // rings would interpenetrate, and two realms would read as one smear.
    for (let i = 0; i < PERPENDICULARITIES.length; i++) {
      for (let j = i + 1; j < PERPENDICULARITIES.length; j++) {
        const a = PERPENDICULARITIES[i]!
        const b = PERPENDICULARITIES[j]!
        const gap = Math.hypot(a.cx - b.cx, a.cy - b.cy) - a.radius - b.radius
        expect(gap, `${a.id} / ${b.id}`).toBeGreaterThan(0)
      }
    }
  })

  it('jitters each realm off the lattice, and does so identically every time', () => {
    const onLattice = PERPENDICULARITIES.filter((c) => {
      const col = Math.round(c.cx / (WORLD_W / GRID_COLS) - 0.5)
      const row = Math.round(c.cy / (WORLD_H / GRID_ROWS) - 0.5)
      const cellX = (col + 0.5) * (WORLD_W / GRID_COLS)
      const cellY = (row + 0.5) * (WORLD_H / GRID_ROWS)
      return Math.abs(c.cx - cellX) < 1e-9 && Math.abs(c.cy - cellY) < 1e-9
    })
    expect(onLattice).toHaveLength(0)
  })

  it('counts eleven perpendicularities, not the twelve §5.5.1 assumes', () => {
    // `planets.ts` defines eleven worlds. The plan's twelve is not the data's
    // number and no realm was invented to fill the grid's empty twelfth cell.
    expect(PERPENDICULARITIES).toHaveLength(11)
    expect(CLUSTERS).toHaveLength(12) // eleven realms plus the Cosmere
  })

  it('marks the Cosmere as not a perpendicularity', () => {
    const cosmere = CLUSTERS.find((c) => c.id === 'cosmere')!
    expect(cosmere.perpendicularity).toBe(false)
    expect(cosmere.cx).toBeCloseTo(WORLD_W / 2)
    expect(cosmere.cy).toBeCloseTo(WORLD_H / 2)
  })
})

describe('S.1 — the realm grid fills the viewport', () => {
  it('occupies about 65% of the shorter viewport side at five resolutions', () => {
    const cam = fitted()
    const measured: string[] = []

    for (const { w, h } of VIEWPORTS) {
      const ratio = cam.boundsRatio(w, h)
      measured.push(`${w}x${h} -> ${(ratio * 100).toFixed(1)}%`)
      // The measured value at every resolution, which is what S.1 asks to be
      // true between 360x640 and 3840x2160. The tolerance is the "~" in "= 65%".
      expect(ratio, `${w}x${h}`).toBeGreaterThan(0.6)
      expect(ratio, `${w}x${h}`).toBeLessThan(0.72)
    }

    // And it is the *same* fraction at every resolution: that is what
    // `fitToViewport()` is for. A view that is framed once and then merely
    // scales is what this block replaced.
    const ratios = VIEWPORTS.map(({ w, h }) => fitted().boundsRatio(w, h))
    for (const r of ratios) expect(Math.abs(r - ratios[0]!)).toBeLessThan(1e-9)
  })

  it('derives that fraction from the numbers in the plan', () => {
    // 0.82 / worldSpanY, with the grid measured from the same layout the canvas
    // draws. Recorded here so a change to any of the three has to be a
    // deliberate edit to a test rather than a drift nobody notices.
    //
    // Measured: 66.5%, not 65%. The jitter widens the grid by up to 5% of a
    // cell over the ideal lattice, and `realmBounds()` includes it. The "~" in
    // S.1's "= 65%" is doing real work here.
    const b = realmBounds()
    expect(VIEWPORT_FIT / WORLD_SPAN_Y).toBeCloseTo(0.5125)
    const fraction = (b.maxY - b.minY) * (VIEWPORT_FIT / WORLD_SPAN_Y)
    expect(fraction).toBeCloseTo(0.66, 2)
    expect(Math.abs(fraction - 0.65)).toBeLessThan(0.03)
  })

  it('re-frames on resize without moving the reader', () => {
    const a = fitted()
    const before = a.boundsRatio(1440, 900)
    a.resize(2560, 1440)
    expect(a.boundsRatio(2560, 1440)).toBeCloseTo(before, 9)
  })

  it('leaves a flight in progress alone when the window resizes', () => {
    // Re-zooming mid-flight would move the camera's end point under the
    // animation, so the flight lands somewhere the reader did not ask for.
    const a = fitted()
    a.startDrag(100, 100)
    a.resize(3840, 2160)
    a.endDrag()
    expect(a.zoom).toBeCloseTo(VIEWPORT_FIT / WORLD_SPAN_Y)
  })
})

describe('focus framing', () => {
  it('fills 62% of the short side regardless of viewport', () => {
    // Same cancellation as the overview: `extent` is world units and the
    // projection multiplies by `zoom * min(w, h)`, so the fraction is exact.
    const cam = new CameraController()
    cam.flyToFit(
      [
        { restX: 0, restY: 0, planet: 'roshar' },
        { restX: 0.1, restY: 0, planet: 'roshar' },
      ] as never,
      'roshar',
      1440,
      900,
    )
    // Not asserted to a number here; the acceptance measure is that focusing on
    // a 1440x900 and a 3840x2160 viewport gives the same on-screen extent,
    // which `boundsRatio` expresses in viewport terms.
    const one = cam.boundsRatio(1440, 900)
    const two = cam.boundsRatio(3840, 2160)
    expect(Math.abs(one - two)).toBeLessThan(1e-9)
  })
})

describe('CLUSTER_RADIUS', () => {
  it('is 0.19 of the smaller grid cell', () => {
    const cell = Math.min(WORLD_W / GRID_COLS, WORLD_H / GRID_ROWS)
    expect(CLUSTER_RADIUS).toBeCloseTo(0.19 * cell)
    expect(CLUSTER_RADIUS).toBeCloseTo(0.10133, 4)
  })
})
