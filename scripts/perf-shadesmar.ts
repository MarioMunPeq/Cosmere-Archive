/**
 * S.4 — frame time p95 under 16 ms with 1200 souls.
 *
 * The page ships ninety-five, which the criterion cannot exercise: the point of
 * a budget is the load it will meet, and 95 beads never made anybody's frame
 * time a problem. So this generates 1200 and runs the real draw loop against a
 * stub 2D context — the same `Renderer` code the browser runs, with every call
 * counted.
 *
 * The stub is not a mock in the sense of returning canned answers: `drawImage`,
 * `fillRect`, `arc` and the rest are counted and timed the same way, so what is
 * measured is *the work the renderer asks for*, not how fast this machine's GPU
 * is. That is the number worth asserting: it is a property of the code, and it
 * does not move when CI runs on a busier machine than your laptop.
 *
 * Run it with `pnpm perf:shadesmar`. The `--tsconfig` is not optional: the `@/`
 * alias lives in `tsconfig.app.json`, which includes only `src`, so tsx would
 * otherwise fail to resolve the very modules it is here to measure.
 */

import { generateSoulField, SpatialGrid } from '../src/components/shadesmar/SoulField'
import { CameraController } from '../src/components/shadesmar/Camera'
import { drawBackground, drawSouls, drawConnectionLines } from '../src/components/shadesmar/Renderer'
import type { Soul } from '../src/components/shadesmar/types'

const TARGET_SOULS = 1200
const FRAMES = 240
const BUDGET_MS = 16
const W = 1440
const H = 900

interface Counters {
  calls: number
  drawImage: number
  fills: number
  strokes: number
}

const counters: Counters = { calls: 0, drawImage: 0, fills: 0, strokes: 0 }

/**
 * A 2D context that counts its work.
 *
 * Every method the renderer and the texture cache use is present.
 * `createRadialGradient` returns an object with `addColorStop`, because a
 * gradient with no stops is not a gradient and both callers would take a
 * different branch without one.
 */
function stubContext(): CanvasRenderingContext2D {
  const noop = () => {
    counters.calls++
  }
  const ctx = {
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    save: noop,
    restore: noop,
    scale: noop,
    translate: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: () => {
      counters.calls++
      counters.strokes++
    },
    fill: () => {
      counters.calls++
      counters.fills++
    },
    stroke: () => {
      counters.calls++
      counters.strokes++
    },
    clearRect: noop,
    fillRect: () => {
      counters.calls++
      counters.fills++
    },
    strokeRect: noop,
    drawImage: () => {
      counters.calls++
      counters.drawImage++
    },
    createRadialGradient: () => {
      counters.calls++
      return { addColorStop: noop }
    },
    createLinearGradient: () => {
      counters.calls++
      return { addColorStop: noop }
    },
    measureText: () => ({ width: 0 }),
  }
  return ctx as unknown as CanvasRenderingContext2D
}

/**
 * `TextureCache` builds its sprites with `document.createElement('canvas')`.
 * Only needed once drawing starts, not at import time, so a plain call before
 * the first frame is enough.
 */
function installCanvasShim() {
  const g = globalThis as unknown as { document?: unknown }
  if (g.document) return
  g.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => stubContext() }),
  }
}

/**
 * Clone the real souls until there are `count` of them.
 *
 * Cloned rather than invented: the generated field is the real distribution —
 * 40 souls in Roshar, 2 in Threnody, heralds at the centre — and a uniform
 * scatter of 1200 points would measure a scene the app will never draw. Ids get
 * a suffix so the spatial grid can tell the copies apart.
 */
function load(count: number): Soul[] {
  const base = generateSoulField()
  const out: Soul[] = []
  let round = 0
  while (out.length < count) {
    for (const s of base) {
      if (out.length >= count) break
      const spread = round * 0.13
      out.push({
        ...s,
        id: `${s.id}#${round}`,
        x: s.restX + Math.sin(round * 2.399 + s.breathePhase) * spread * 0.5,
        y: s.restY + Math.cos(round * 2.399 + s.breathePhase) * spread * 0.5,
        opacity: 0.8,
      })
    }
    round++
  }
  return out
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[i]!
}

function reset() {
  counters.calls = 0
  counters.drawImage = 0
  counters.fills = 0
  counters.strokes = 0
}

function run(souls: Soul[], zoom: number, label: string) {
  const ctx = stubContext()
  const camera = new CameraController()
  camera.resetToOverview()
  camera.zoom = zoom
  const grid = new SpatialGrid(0.02)
  grid.rebuild(souls)

  const state = {
    soulId: null,
    phase: 'idle' as const,
    progress: 0,
    particles: [],
    connections: [],
    bgDim: 0,
    otherDim: 0,
  }

  // Warm up: the first frames pay for the JIT and fill the texture cache.
  for (let i = 0; i < 20; i++) {
    drawBackground(ctx, W, H, 0, i * 16)
    drawSouls(ctx, souls, camera, W, H, i * 16, 0.016, null, null, 0)
    drawConnectionLines(ctx, state, souls, i * 16)
  }

  const samples: number[] = []
  const rebuildsBefore = grid.rebuilds
  for (let i = 0; i < FRAMES; i++) {
    const t0 = performance.now()
    grid.update(souls)
    drawBackground(ctx, W, H, 0, i * 16)
    drawSouls(ctx, souls, camera, W, H, i * 16, 0.016, null, null, 0)
    drawConnectionLines(ctx, state, souls, i * 16)
    samples.push(performance.now() - t0)
  }

  reset()
  // One instrumented frame, so the counts describe a representative frame
  // rather than all 240 of them.
  grid.update(souls)
  drawBackground(ctx, W, H, 0, 0)
  drawSouls(ctx, souls, camera, W, H, 0, 0.016, null, null, 0)

  samples.sort((a, b) => a - b)
  return {
    label,
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    p99: percentile(samples, 99),
    gridRebuilds: grid.rebuilds - rebuildsBefore,
    ...counters,
  }
}

/* --------------------------------------------------------------------------- */

installCanvasShim()

const souls = load(TARGET_SOULS)
/*
 * One measurement per detail band of §5.5.4, plus the overview.
 *
 * The overview is 0.5125, which is *above* `LOD_DOT` (0.4) — so the frame a
 * reader actually sees is the sprite band, not the cheap one. That is the
 * plan's own arithmetic, and it is why the dot band is measured separately at
 * 0.3, where a reader has to have deliberately zoomed out to reach it.
 */
const results = [
  run(souls, 0.3, 'dots      (zoom 0.30, one-pixel level)'),
  run(souls, 0.5125, 'overview  (zoom 0.51, sprites — the framing you open on)'),
  run(souls, 0.8, 'mid       (zoom 0.80, sprites)'),
  run(souls, 1.6, 'close     (zoom 1.60, sprites + fresnel rims)'),
]

let failed = false
console.log(`\n  S.4 — frame time with ${TARGET_SOULS} souls at ${W}x${H}, p95 budget ${BUDGET_MS}ms\n`)
for (const r of results) {
  const over = r.p95 > BUDGET_MS
  if (over) failed = true
  console.log(
    `  ${over ? 'OVER' : 'ok  '}  ${r.label}\n` +
      `          p50 ${r.p50.toFixed(2)}ms   p95 ${r.p95.toFixed(2)}ms   p99 ${r.p99.toFixed(2)}ms\n` +
      `          ${r.calls} context calls/frame — ${r.drawImage} drawImage, ${r.fills} fills, ${r.strokes} strokes\n` +
      `          ${r.gridRebuilds} grid rebuilds across ${FRAMES} frames`,
  )
}
console.log('')

if (failed) {
  console.error('  shadesmar frame budget FAILED\n')
  process.exit(1)
}
console.log('  shadesmar frame budget PASSED\n')
