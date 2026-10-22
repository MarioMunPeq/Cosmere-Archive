/**
 * The wall, measured.
 *
 * ## Two rectangles, and why
 *
 * `WALL_W` x `WALL_H` is the **plaster**: the room. `CONTENT_BOUNDS` is the
 * **nine sheets and the clippings**: the work. They are not the same rectangle,
 * and conflating them is what made the old wall open on one corner at 1:1 or,
 * when it was "fixed", shrink the whole thing to a thumbnail.
 *
 *   arrive   → contain `CONTENT_BOUNDS`, so all nine titles are on screen.
 *   zoom out → floor at cover `WALL_W/H`, so the room never shows empty space.
 *
 * The plaster runs well past the work on every side, which is what lets the
 * second rule hold even at the first rule's scale.
 *
 * ## The layout is not a grid
 *
 * Three clusters, because the Diagram is three arguments: the catechism and
 * its instructions (I–III), the powers it is aimed at (IV–VI), and the tallies
 * that try to make the argument true (VII–IX). The tallies are the large
 * sheets — a ledger needs columns — and they sit below, where a man stands to
 * write them.
 *
 * Sheet coordinates are top-left corners in wall units. Rotations are clamped
 * to ±6° by the scene, and the gaps are wide enough that a six-degree tilt can
 * never put one title over another.
 */

/** Rotation is clamped to ±6° when rendered; see `DiagramScene`. */
export interface WallDoc {
  id: string
  x: number
  y: number
  rot: number
  z: number
}

export type ClippingKind = 'press' | 'note' | 'map' | 'ledger'

export interface WallClipping {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot: number
  kind: ClippingKind
  text: string
}

export interface WallAnnotation {
  id: string
  x: number
  y: number
  rot: number
  text: string
}

export interface WallThread {
  from: string
  to: string
  /** How far the string hangs below the straight line, in wall units. */
  sag: number
}

/** The room. */
export const WALL_W = 2800
export const WALL_H = 1800

/**
 * Paper sizes, in wall units, at roughly 1:1 with CSS pixels.
 *
 * A-5 is 148 × 210 mm, a 1:1.42 ratio; at 1.42 units per millimetre an A-5
 * leaf is 210 × 298. The three tallies are A-4-ish fold-outs (320 × 440) because
 * a ledger is wider than a page of prose — and because nine identical rectangles
 * is a contact sheet, not a wall.
 */
export const SHEET_SMALL = { w: 210, h: 298 }
export const SHEET_LARGE = { w: 320, h: 440 }

/** Which sheets got more paper, and why. */
export const LARGE_SHEETS = new Set(['volumes', 'wordcount', 'population'])

export const WALL_DOCS: WallDoc[] = [
  // I–III · the catechism, the instruction, and the floorboard under them.
  { id: 'catalogue', x: 300, y: 300, rot: -4.5, z: 6 },
  { id: 'chronology', x: 580, y: 230, rot: 2.4, z: 5 },
  { id: 'worlds', x: 880, y: 330, rot: -1.8, z: 4 },

  // IV–VI · what the catechism is aimed at.
  { id: 'shards', x: 1270, y: 270, rot: 3.6, z: 5 },
  { id: 'heralds', x: 1550, y: 360, rot: -3.2, z: 4 },
  { id: 'connections', x: 1850, y: 250, rot: 1.6, z: 6 },

  // VII–IX · the ledger, where the argument is checked.
  { id: 'volumes', x: 340, y: 900, rot: -3.4, z: 7 },
  { id: 'wordcount', x: 730, y: 960, rot: 2.8, z: 8 },
  { id: 'population', x: 1120, y: 900, rot: -2.2, z: 7 },
]

/** The drawn size of a sheet, by id. */
export function sheetSize(id: string): { w: number; h: number } {
  return LARGE_SHEETS.has(id) ? SHEET_LARGE : SHEET_SMALL
}

export function docFor(id: string): WallDoc | undefined {
  return WALL_DOCS.find((d) => d.id === id)
}

/**
 * Pinned clippings in the gaps.
 *
 * None of them overlaps a sheet: the gaps were cut to fit them, so the wall is
 * busy without covering a single title. The text is Taravangian's, or the
 * Diagram's, in every case.
 */
export const WALL_CLIPPINGS: WallClipping[] = [
  {
    id: 'clip-broadsheet',
    x: 2140,
    y: 240,
    w: 250,
    h: 130,
    rot: 3.4,
    kind: 'press',
    text: 'The Everstorm comes. We were warned, and did not listen.',
  },
  {
    id: 'clip-map',
    x: 2150,
    y: 470,
    w: 300,
    h: 220,
    rot: -5,
    kind: 'map',
    text: 'Alethkar · Jah Keved · the Shin',
  },
  {
    id: 'clip-receipt',
    x: 570,
    y: 690,
    w: 150,
    h: 100,
    rot: -5.2,
    kind: 'note',
    text: 'one candle. one chair. the door barred.',
  },
  {
    id: 'clip-drawer',
    x: 1500,
    y: 760,
    w: 210,
    h: 130,
    rot: 3.1,
    kind: 'note',
    text: 'The Unmade are a deviation, a flair, a conundrum.',
  },
  {
    id: 'clip-shin',
    x: 1760,
    y: 840,
    w: 190,
    h: 110,
    rot: -4.2,
    kind: 'note',
    text: 'They are with the Shin. Can we craft a weapon?',
  },
  {
    id: 'clip-ledger',
    x: 2300,
    y: 980,
    w: 140,
    h: 180,
    rot: -2.6,
    kind: 'ledger',
    text: 'the numbers do not lie. they only fail to help.',
  },
  {
    id: 'clip-words',
    x: 1580,
    y: 1180,
    w: 240,
    h: 150,
    rot: 4.6,
    kind: 'press',
    text: 'Four million, four hundred thousand words. The count does not change. My understanding of it does.',
  },
]

/** Chalk, written straight on the plaster. No paper. */
export const WALL_ANNOTATIONS: WallAnnotation[] = [
  { id: 'wall-first', x: 1110, y: 478, rot: -4.2, text: 'first came the catechism' },
  { id: 'wall-hand', x: 2060, y: 712, rot: 3.1, text: 'the same hand, twice' },
  { id: 'wall-deviation', x: 1490, y: 640, rot: -2.4, text: 'a deviation — or a pattern' },
  { id: 'wall-begin', x: 300, y: 730, rot: -2.1, text: 'begin here' },
  { id: 'wall-count', x: 1452, y: 1100, rot: 2.6, text: 'count again' },
  { id: 'wall-nothing', x: 2310, y: 1230, rot: -4.8, text: 'not everything has a number' },
]

/**
 * String. Every thread is dark ink — `--codex-thread` — drawn under the sheets
 * and given a warm catchlight so it does not disappear into the plaster. The
 * two long lines are the argument crossing the room: the instruction (II)
 * reaches the powers (IV), and the powers (VI) reach the tally (IX).
 */
export const WALL_THREADS: WallThread[] = [
  { from: 'catalogue', to: 'chronology', sag: 34 },
  { from: 'chronology', to: 'worlds', sag: 42 },
  { from: 'shards', to: 'heralds', sag: 30 },
  { from: 'heralds', to: 'connections', sag: 38 },
  { from: 'volumes', to: 'wordcount', sag: 26 },
  { from: 'wordcount', to: 'population', sag: 30 },
  { from: 'chronology', to: 'shards', sag: 58 },
  { from: 'connections', to: 'population', sag: 74 },
]

/** Where a sheet's tack sits, so the string can be tied to it. */
export function pinAnchor(doc: WallDoc): { x: number; y: number } {
  const { w } = sheetSize(doc.id)
  return { x: doc.x + w / 2, y: doc.y + 4 }
}

/** The hanging string between two tacks. */
export function threadPath(from: WallDoc, to: WallDoc, sag: number): string {
  const a = pinAnchor(from)
  const b = pinAnchor(to)
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2 + sag
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
}

/** Rotation overhang: a sheet corner swings out by ~h/2 · sin 6° ≈ 32 at most. */
const ROT_PAD = 48

/** Margin around the work, so the frame is not tight against the plaster. */
const FRAME_PAD = 64

/**
 * The bounding box of the sheets and clippings — not of the wall.
 *
 * This is the rectangle `DiagramCanvas` contains on arrival. The plaster is
 * larger, which is what keeps the viewport covered at every scale above the
 * floor.
 */
export const CONTENT_BOUNDS = (() => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const d of WALL_DOCS) {
    const { w, h } = sheetSize(d.id)
    minX = Math.min(minX, d.x - ROT_PAD)
    minY = Math.min(minY, d.y - ROT_PAD)
    maxX = Math.max(maxX, d.x + w + ROT_PAD)
    maxY = Math.max(maxY, d.y + h + ROT_PAD)
  }
  for (const c of WALL_CLIPPINGS) {
    minX = Math.min(minX, c.x - ROT_PAD)
    minY = Math.min(minY, c.y - ROT_PAD)
    maxX = Math.max(maxX, c.x + c.w + ROT_PAD)
    maxY = Math.max(maxY, c.y + c.h + ROT_PAD)
  }
  // Chalk belongs to the work too; it is only text, but it is text you read.
  for (const a of WALL_ANNOTATIONS) {
    minX = Math.min(minX, a.x - 8)
    minY = Math.min(minY, a.y - 8)
    maxX = Math.max(maxX, a.x + 190)
    maxY = Math.max(maxY, a.y + 30)
  }
  return {
    x: minX - FRAME_PAD,
    y: minY - FRAME_PAD,
    w: maxX - minX + FRAME_PAD * 2,
    h: maxY - minY + FRAME_PAD * 2,
  }
})()
