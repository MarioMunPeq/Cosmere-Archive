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
  rot: number
  z: number
}

/**
 * Where the nine hang.
 *
 * Positions are the old ones — a wall somebody has already worked on is not
 * rearranged — but the **sizes are new**: A-5 and three fold-outs, where the
 * old table had nine rectangles between 400 and 560 units wide with no
 * relationship to any paper size.
 *
 * `x`/`y` are the sheet's top-left corner; the size comes from `SHEET_SMALL` or
 * `SHEET_LARGE` by id, so a sheet cannot be given a size that contradicts it
 * being A-5.
 */
export const WALL_DOCS: WallDoc[] = [
  { id: 'catalogue', x: 430, y: 700, rot: -5, z: 3 },
  { id: 'chronology', x: 1080, y: 500, rot: 3, z: 4 },
  { id: 'worlds', x: 1830, y: 980, rot: -2, z: 2 },
  { id: 'shards', x: 2760, y: 620, rot: 4, z: 5 },
  { id: 'heralds', x: 3480, y: 1080, rot: -4, z: 1 },
  { id: 'connections', x: 2320, y: 1780, rot: 2, z: 6 },
  { id: 'volumes', x: 560, y: 2080, rot: -6, z: 2 },
  { id: 'wordcount', x: 1620, y: 2420, rot: 5, z: 3 },
  { id: 'population', x: 3080, y: 2280, rot: -3, z: 4 },
]

/** The drawn size of a sheet, by id. */
export function sheetSize(id: string): { w: number; h: number } {
  return LARGE_SHEETS.has(id) ? SHEET_LARGE : SHEET_SMALL
}

/** The canvas the sheets are drawn on. Larger than the wall, so there is room to pan. */
export const WALL_W = 5000
export const WALL_H = 5000

/**
 * Paper sizes, in wall units.
 *
 * A-5 is 148 × 210 mm — a 1:1.42 ratio. At 2.1 units per millimetre-ish, the
 * working scale here is 1 unit ≈ 0.7 mm, so a readable A-5 page is about
 * **210 × 298**.
 *
 * The sheets are deliberately **not** all the same size. A wall where every page
 * is identical is a contact sheet, and a contact sheet is what the old wall was.
 * Three sheets are `large`: a fold-out chart, a plan, and the one page he has
 * gone back to so often the corners are soft. That is what a wall looks like
 * after years of work, and it is the cheapest possible way to stop nine
 * rectangles from reading as a UI grid.
 */
export const SHEET_SMALL = { w: 210, h: 298 }
export const SHEET_LARGE = { w: 420, h: 580 }

/** Which sheets are the big ones, and why. */
export const LARGE_SHEETS = new Set(['connections', 'chronology', 'worlds'])

/** Margin around the wall, in wall units, so nothing sits against the edge. */
const WALL_MARGIN = 260

/** The bounding box of the sheets themselves, plus margin. */
export const CONTENT_BOUNDS = (() => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const d of WALL_DOCS) {
    const { w, h } = sheetSize(d.id)
    minX = Math.min(minX, d.x)
    minY = Math.min(minY, d.y)
    maxX = Math.max(maxX, d.x + w)
    maxY = Math.max(maxY, d.y + h)
  }
  return {
    x: minX - WALL_MARGIN,
    y: minY - WALL_MARGIN,
    w: maxX - minX + WALL_MARGIN * 2,
    h: maxY - minY + WALL_MARGIN * 2,
  }
})()
