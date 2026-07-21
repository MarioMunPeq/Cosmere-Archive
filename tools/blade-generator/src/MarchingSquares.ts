import type { ImageData } from './ImageLoader'
import type { BladeConfig } from './Config'

export interface ContourPoint {
  x: number
  y: number
}

/**
 * Marching Squares contour extraction.
 *
 * Steps:
 *  1. Build a binary mask from the alpha channel.
 *  2. For each cell (2×2 pixel neighbourhood) compute a case index (0–15).
 *  3. Look up which cell edges are crossed and emit interpolated vertices.
 *  4. Link all segments into closed polylines.
 *  5. Return the longest polyline (the outer contour).
 */

/* Square case → edge segments (each segment is [edge1, edge2] with edge index 0–3):
 *   0 = top edge,  1 = right edge,  2 = bottom edge,  3 = left edge
 * Segments are oriented clockwise around the solid cell. */
const EDGE_TABLE: [number, number][][] = [
  [], // 0000
  [[3, 0]], // 0001
  [[0, 1]], // 0010
  [[3, 1]], // 0011
  [[1, 2]], // 0100
  [
    [3, 0],
    [1, 2],
  ], // 0101 (saddle)
  [[0, 2]], // 0110
  [[3, 2]], // 0111
  [[2, 3]], // 1000
  [[2, 0]], // 1001
  [
    [0, 1],
    [2, 3],
  ], // 1010 (saddle)
  [[2, 1]], // 1011
  [[1, 3]], // 1100
  [[1, 0]], // 1101
  [[0, 3]], // 1110
  [], // 1111
]

/** Vertex position for each corner of a cell: [tl, tr, br, bl] */
const CORNER_X = [0, 1, 1, 0]
const CORNER_Y = [0, 0, 1, 1]

/** Edge → endpoint corner indices */
const EDGE_CORNERS: [number, number][] = [
  [0, 1], // top
  [1, 2], // right
  [2, 3], // bottom
  [3, 0], // left
]

/**
 * Return the midpoint on a cell edge.
 * With interpolation based on alpha values for sub-pixel precision.
 */
function edgeMidpoint(img: ImageData, cx: number, cy: number, edge: number, config: BladeConfig): [number, number] {
  const [c1, c2] = EDGE_CORNERS[edge]!
  const x1 = cx + CORNER_X[c1]!
  const y1 = cy + CORNER_Y[c1]!
  const x2 = cx + CORNER_X[c2]!
  const y2 = cy + CORNER_Y[c2]!

  const a1 = alphaAt(img, x1, y1)
  const a2 = alphaAt(img, x2, y2)
  const t = (config.alphaThreshold - a1) / (a2 - a1)
  const clampedT = Math.max(0, Math.min(1, t))

  return [x1 + (x2 - x1) * clampedT, y1 + (y2 - y1) * clampedT]
}

function alphaAt(img: ImageData, x: number, y: number): number {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return 0
  return img.pixels[(y * img.width + x) * 4 + 3]!
}

/** Link a set of unordered segments into ordered closed polylines. */
function linkSegments(segments: [number, number][]): ContourPoint[][] {
  if (segments.length === 0) return []

  /* Build adjacency: endpoint → list of (other endpoint, segment index) */
  const adj = new Map<string, number[]>()
  const segMap: Map<number, [number, number]> = new Map()
  const key = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`

  segments.forEach((seg, i) => {
    segMap.set(i, seg)
    const k1 = key(seg[0]!, seg[1]!)
    const k2 = key(seg[0]!, seg[1]!)
    // Actually each segment endpoint is a pair of coordinates, but we've stored raw numbers
    // Let me re-think...

    // Actually each segment is [p1_idx, p2_idx] where p1 and p2 are indices into a vertex array
    // Let me restructure to use a vertex array
  })

  return []
}

/**
 * Extract the outer contour of the sword from the image.
 * Returns a simplified array of {x,y} points forming the closed outer boundary.
 */
export function extractContour(img: ImageData, mask: boolean[][], config: BladeConfig): ContourPoint[] {
  const { width, height } = img
  const vertices: [number, number][] = []
  const segments: [number, number][] = []

  /* Pass 1: find all edge crossings */
  for (let cy = 0; cy < height - 1; cy++) {
    for (let cx = 0; cx < width - 1; cx++) {
      const tl = mask[cy]![cx]!
      const tr = mask[cy]![cx + 1]!
      const br = mask[cy + 1]![cx + 1]!
      const bl = mask[cy + 1]![cx]!

      const caseIdx = (tl ? 1 : 0) | (tr ? 2 : 0) | (br ? 4 : 0) | (bl ? 8 : 0)

      const edges = EDGE_TABLE[caseIdx]!
      if (edges.length === 0) continue

      /* Emit edge crossing vertices */
      const row: number[] = []
      for (const [e1, e2] of edges) {
        const m1 = edgeMidpoint(img, cx, cy, e1, config)
        const m2 = edgeMidpoint(img, cx, cy, e2, config)

        /* Round to 2 decimal places so we can deduplicate */
        const rx1 = Math.round(m1[0] * 100) / 100
        const ry1 = Math.round(m1[1] * 100) / 100
        const rx2 = Math.round(m2[0] * 100) / 100
        const ry2 = Math.round(m2[1] * 100) / 100

        let i1 = vertices.findIndex((v) => v[0] === rx1 && v[1] === ry1)
        if (i1 === -1) {
          i1 = vertices.length
          vertices.push([rx1, ry1])
        }
        let i2 = vertices.findIndex((v) => v[0] === rx2 && v[1] === ry2)
        if (i2 === -1) {
          i2 = vertices.length
          vertices.push([rx2, ry2])
        }

        row.push(i1, i2)
      }

      /* Add segments: pair consecutive indices in the row */
      for (let i = 0; i < row.length; i += 2) {
        segments.push([row[i]!, row[i + 1]!])
      }
    }
  }

  /* Pass 2: link segments into polylines using a simple chain approach */
  if (segments.length === 0) return []

  /* Build adjacency: vertex index → list of connected vertex indices */
  const graph = new Map<number, number[]>()
  for (const [a, b] of segments) {
    if (!graph.has(a)) graph.set(a, [])
    if (!graph.has(b)) graph.set(b, [])
    graph.get(a)!.push(b)
    graph.get(b)!.push(a)
  }

  /* Walk the graph to extract polylines */
  const visited = new Set<string>()
  const polylines: ContourPoint[][] = []

  for (const [startVertex, _neighbors] of graph) {
    if (visited.has(startVertex.toString())) continue

    const polyline: ContourPoint[] = []
    let current = startVertex
    let prev = -1

    while (true) {
      if (visited.has(current.toString())) {
        /* Close the loop */
        if (polyline.length > 2) {
          polyline.push(polyline[0]!)
        }
        break
      }

      visited.add(current.toString())
      const [vx, vy] = vertices[current]!
      polyline.push({ x: vx, y: vy })

      const neighbors = graph.get(current)!
      const next = neighbors.find((n) => n !== prev)
      if (next === undefined) break

      prev = current
      current = next
    }

    if (polyline.length > 2) {
      polylines.push(polyline)
    }
  }

  /* Return the longest polyline (the outer contour) */
  polylines.sort((a, b) => b.length - a.length)
  return polylines[0] ?? []
}
