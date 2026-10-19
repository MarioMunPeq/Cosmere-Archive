/**
 * §5.5.2 — gestures.
 *
 * The tracker is the one part of the input path that is pure arithmetic, so it
 * is tested as arithmetic. What Playwright cannot check is covered here; what it
 * can — that the canvas is wired to it — is in `e2e/shadesmar.spec.ts`.
 */

import { describe, expect, it } from 'vitest'
import { createPointerTracker, DOUBLE_TAP_MS } from '@/components/shadesmar/Pointers'
import { CameraController } from '@/components/shadesmar/Camera'

const W = 1000
const H = 800

describe('one finger', () => {
  it('is a pan, and reports the travel', () => {
    const t = createPointerTracker()
    t.down_(1, 500, 400, 0)
    expect(t.panning).toBe(true)
    const g = t.move_(1, 520, 430)
    expect(g).toEqual({ kind: 'pan', dx: 20, dy: 30, x: 520, y: 430 })
  })

  it('a press and release with no travel is a tap, not a pan', () => {
    const t = createPointerTracker()
    t.down_(1, 500, 400, 0)
    expect(t.up_(1)).toEqual({ kind: 'tap', x: 500, y: 400 })
  })

  it('travels the camera the right way round', () => {
    // Dragging right moves the ocean right, which moves the camera left. The
    // sign here is the whole difference between dragging the view and dragging
    // the thing being viewed, and it is invisible until someone tries it.
    const cam = new CameraController()
    cam.resetToOverview()
    const before = cam.x
    cam.startDrag(500, 400)
    cam.moveDrag(600, 400, W, H)
    expect(cam.x).toBeLessThan(before)
  })
})

describe('two fingers', () => {
  it('is a pinch, and the factor is the spread ratio', () => {
    const t = createPointerTracker()
    t.down_(1, 400, 400, 0)
    t.down_(2, 600, 400, 10)
    expect(t.pinching).toBe(true)

    const g = t.move_(2, 700, 400)
    expect(g.kind).toBe('pinch')
    if (g.kind !== 'pinch') return
    // 200 -> 300 is 1.5x
    expect(g.factor).toBeCloseTo(1.5, 6)
    expect(g.cx).toBeCloseTo(550, 6)
  })

  it('does not zoom on a one-pixel wobble', () => {
    const t = createPointerTracker()
    t.down_(1, 400, 400, 0)
    t.down_(2, 600, 400, 10)
    const g = t.move_(2, 601, 400)
    if (g.kind !== 'pinch') throw new Error('expected a pinch')
    // 200 -> 201. The canvas ignores anything under PINCH_ZOOM_MIN_STEP, but the
    // ratio has to stay close to 1 for that filter to be meaningful.
    expect(g.factor).toBeCloseTo(1.005, 6)
  })

  it('moves the camera as well as the zoom', () => {
    // A pinch that zooms but does not travel is unusable on a phone: the world
    // grows around a point you are still holding, and your fingers are not over
    // the thing you were aiming at any more.
    const cam = new CameraController()
    cam.resetToOverview()
    const x0 = cam.x
    const y0 = cam.y
    cam.panBy(40, 25, W, H)
    expect(cam.x).toBeLessThan(x0)
    expect(cam.y).toBeLessThan(y0)
  })

  it('the midpoint travels with the fingers when they spread symmetrically', () => {
    const t = createPointerTracker()
    t.down_(1, 400, 400, 0)
    t.down_(2, 600, 400, 10)
    t.move_(1, 350, 400)
    const g = t.move_(2, 650, 400)
    if (g.kind !== 'pinch') throw new Error('expected a pinch')
    expect(g.cx).toBeCloseTo(500, 6)
  })
})

describe('taps', () => {
  it('two taps in time at the same spot are a double tap', () => {
    const t = createPointerTracker()
    t.down_(1, 300, 300, 0)
    expect(t.up_(1).kind).toBe('tap')
    t.down_(1, 302, 301, DOUBLE_TAP_MS - 40)
    expect(t.up_(1).kind).toBe('doubleTap')
  })

  it('two slow taps are two taps', () => {
    const t = createPointerTracker()
    t.down_(1, 300, 300, 0)
    t.up_(1)
    t.down_(1, 300, 300, DOUBLE_TAP_MS + 200)
    expect(t.up_(1).kind).toBe('tap')
  })

  it('two taps far apart are two taps', () => {
    const t = createPointerTracker()
    t.down_(1, 300, 300, 0)
    t.up_(1)
    t.down_(1, 700, 300, 50)
    expect(t.up_(1).kind).toBe('tap')
  })

  it('releasing one finger of a pinch fires no tap', () => {
    // The classic bug: lift one finger to adjust, and the canvas treats it as
    // a click on whatever happens to be under it.
    const t = createPointerTracker()
    t.down_(1, 400, 400, 0)
    t.down_(2, 600, 400, 10)
    t.move_(2, 700, 400)
    expect(t.up_(2).kind).toBe('none')
  })

  it('a drag fires no tap', () => {
    const t = createPointerTracker()
    t.down_(1, 300, 300, 0)
    t.move_(1, 340, 300)
    expect(t.up_(1).kind).toBe('none')
  })

  it('cancelling a pointer fires no tap', () => {
    const t = createPointerTracker()
    t.down_(1, 300, 300, 0)
    t.cancel(1)
    expect(t.down.size).toBe(0)
  })
})
