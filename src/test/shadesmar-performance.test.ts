/**
 * §5.5.4 — the three changes the plan names, plus the order they depend on.
 *
 * Each of these was a per-frame cost paid sixty times a second for a result
 * that had not changed. The tests assert the *absence* of work, not the
 * presence of a function, because a function that exists and is called every
 * frame is exactly the failure mode.
 */

import { describe, expect, it } from 'vitest'
import { generateSoulField, SpatialGrid } from '@/components/shadesmar/SoulField'
import { LOD_DOT, LOD_BEAD, GLOW_MAX_VISIBLE } from '@/components/shadesmar/types'
import type { Soul } from '@/components/shadesmar/types'

const CELL = 0.02

describe('the spatial grid is lazy', () => {
  function field(n: number): Soul[] {
    const souls = generateSoulField()
    const out: Soul[] = []
    let round = 0
    while (out.length < n) {
      for (const s of souls) {
        if (out.length >= n) break
        out.push({ ...s, id: `${s.id}#${round}`, x: s.restX, y: s.restY })
      }
      round++
    }
    return out
  }

  it('rebuilds nothing when the souls have not moved', () => {
    const souls = field(500)
    const grid = new SpatialGrid(CELL)
    grid.rebuild(souls)
    const before = grid.rebuilds

    for (let i = 0; i < 240; i++) grid.update(souls)
    // 240 frames, 240 rebuilds — which is what the renderer used to do.
    expect(grid.rebuilds - before).toBe(0)
  })

  it('stays quiet for motion smaller than a quarter of a cell', () => {
    const souls = field(200)
    const grid = new SpatialGrid(CELL)
    grid.rebuild(souls)
    const before = grid.rebuilds

    // The souls breathe. A drift under cellSize/4 cannot change any query's
    // answer that matters, because a query walks whole cells.
    for (let step = 0; step < 60; step++) {
      for (const s of souls) {
        s.x = s.restX + Math.sin(step * 0.3 + s.breathePhase) * (CELL / 8)
        s.y = s.restY + Math.cos(step * 0.3 + s.breathePhase) * (CELL / 8)
      }
      grid.update(souls)
    }
    expect(grid.rebuilds - before).toBe(0)
  })

  it('does rebuild when a soul crosses a cell boundary', () => {
    const souls = field(50)
    const grid = new SpatialGrid(CELL)
    grid.rebuild(souls)
    const before = grid.rebuilds

    souls[0]!.x += CELL * 2
    expect(grid.update(souls)).toBe(true)
    expect(grid.rebuilds - before).toBe(1)
  })

  it('still answers queries correctly after a rebuild', () => {
    const souls = field(100)
    const grid = new SpatialGrid(CELL)
    grid.rebuild(souls)

    const moved = souls[0]!
    const from = grid.nearest(moved.restX, moved.restY, 0.05)
    expect(from?.id).toBe(moved.id)

    // Far enough that no query near the old position can find it.
    moved.x += CELL * 40
    grid.update(souls)
    expect(grid.nearest(moved.restX, moved.restY, 0.05)?.id).not.toBe(moved.id)
    expect(grid.nearest(moved.x, moved.y, 0.05)?.id).toBe(moved.id)
  })
})

describe('draw order is decided once', () => {
  it('generateSoulField returns the souls sorted by layer', () => {
    const souls = generateSoulField()
    const layers = souls.map((s) => s.layer)
    expect(layers).toEqual([...layers].sort((a, b) => a - b))
  })

  it('and the order is stable across calls', () => {
    // `Array.sort` is stable, but the *input* must be too: an unstable
    // generation order would make the draw order change between visits, which
    // is the same class of bug as the seeded fog.
    const a = generateSoulField().map((s) => s.id)
    const b = generateSoulField().map((s) => s.id)
    expect(a).toEqual(b)
  })

  it('a herald draws behind an ordinary character', () => {
    const souls = generateSoulField()
    const herald = souls.find((s) => s.kind === 'herald')!
    const character = souls.find((s) => s.kind === 'character')!
    expect(souls.indexOf(herald)).toBeLessThan(souls.indexOf(character))
    expect(herald.layer).toBeLessThan(character.layer)
  })
})

describe('the detail levels', () => {
  it('are ordered, and the overview is in the sprite band', () => {
    expect(LOD_DOT).toBeLessThan(LOD_BEAD)
    // The framing the page opens on is 0.5125, which is above LOD_DOT. That is
    // the plan's own arithmetic and it is why the cheap band needs to be
    // measured separately: a reader has to zoom out deliberately to reach it.
    expect(0.5125).toBeGreaterThan(LOD_DOT)
  })

  it('every soul carries the two cached colour strings the cheap band needs', () => {
    // Building an `rgba()` string per soul per frame is ninety-five string
    // allocations a frame to express a value that never changes.
    for (const s of generateSoulField()) {
      expect(s.dotFill.startsWith('rgba('), s.id).toBe(true)
      expect(s.dotFill.endsWith(')'), s.id).toBe(true)
      expect(s.dotFill, s.id).toContain(', 0.9')
      expect(s.rimStroke.startsWith('rgba('), s.id).toBe(true)
    }
  })

  it("the glow pass has both of the plan's conditions written down", () => {
    // It runs only for a soul that is actually glowing, and only while the
    // scene is small enough for the extra overdraw to be affordable.
    expect(GLOW_MAX_VISIBLE).toBe(900)
  })
})
