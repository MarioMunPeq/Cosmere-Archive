import type { ContourPoint } from './MarchingSquares'

/**
 * Ramer–Douglas–Peucker polyline simplification.
 *
 * Recursively removes points that deviate less than `epsilon` from the
 * line segment connecting the endpoints. Preserves shape while reducing
 * vertex count.
 */

function perpendicularDistance(pt: ContourPoint, a: ContourPoint, b: ContourPoint): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const denom = Math.sqrt(dx * dx + dy * dy)
  if (denom < 1e-10) return Math.sqrt((pt.x - a.x) ** 2 + (pt.y - a.y) ** 2)

  return Math.abs(dy * pt.x - dx * pt.y + b.x * a.y - b.y * a.x) / denom
}

export function simplifyPolyline(points: ContourPoint[], epsilon: number): ContourPoint[] {
  if (points.length <= 2) return points

  /* Find the point with the maximum distance */
  let dMax = 0
  let idx = 0
  const first = points[0]!
  const last = points[points.length - 1]!

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i]!, first, last)
    if (d > dMax) {
      idx = i
      dMax = d
    }
  }

  if (dMax > epsilon) {
    const left = simplifyPolyline(points.slice(0, idx + 1), epsilon)
    const right = simplifyPolyline(points.slice(idx), epsilon)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}
