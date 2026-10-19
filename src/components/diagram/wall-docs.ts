/**
 * The nine sheets and where they hang.
 *
 * Extracted from `DiagramScene.tsx` so `DiagramCanvas` can measure the wall
 * without importing the scene that imports it.
 *
 * ## Why these live in their own file
 *
 * `getFitScale` in `DiagramCanvas` was fitting the 5000x5000 *canvas*, and with
 * `Math.max` — a cover fit, which deliberately zooms past the edges. The sheets
 * hang at 400-3900 x 800-4400, so the outermost ones were off-screen on arrival
 * and one of them could not be clicked at all.
 *
 * A wall you open on should show the wall. The fit is computed from the sheets'
 * own bounds, not from the size of the sheet of paper they are drawn on.
 */

/** Rotation is clamped to ±6° when rendered; see `DiagramScene`. */
export interface WallDoc {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot: number
  z: number
}

export const WALL_DOCS: WallDoc[] = [
  { id: 'catalogue', x: 400, y: 900, w: 440, h: 280, rot: -8, z: 3 },
  { id: 'volumes', x: 3400, y: 800, w: 480, h: 330, rot: 6, z: 4 },
  { id: 'wordcount', x: 1200, y: 2200, w: 400, h: 280, rot: 11, z: 2 },
  { id: 'population', x: 3600, y: 2200, w: 440, h: 320, rot: -14, z: 5 },
  { id: 'worlds', x: 600, y: 3400, w: 480, h: 360, rot: 5, z: 3 },
  { id: 'shards', x: 3000, y: 3500, w: 420, h: 300, rot: -18, z: 4 },
  { id: 'connections', x: 1800, y: 1300, w: 560, h: 400, rot: -4, z: 1 },
  { id: 'chronology', x: 1800, y: 3900, w: 500, h: 320, rot: 22, z: 6 },
  { id: 'heralds', x: 3600, y: 4100, w: 440, h: 290, rot: -7, z: 2 },
]

/** The canvas the sheets are drawn on. Larger than the wall, so there is room to pan. */
export const WALL_W = 5000
export const WALL_H = 5000

/** Margin around the wall, in wall units, so nothing sits against the edge. */
const WALL_MARGIN = 260

/** The bounding box of the sheets themselves, plus margin. */
export const CONTENT_BOUNDS = (() => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const d of WALL_DOCS) {
    minX = Math.min(minX, d.x)
    minY = Math.min(minY, d.y)
    maxX = Math.max(maxX, d.x + d.w)
    maxY = Math.max(maxY, d.y + d.h)
  }
  return {
    x: minX - WALL_MARGIN,
    y: minY - WALL_MARGIN,
    w: maxX - minX + WALL_MARGIN * 2,
    h: maxY - minY + WALL_MARGIN * 2,
  }
})()
