import * as THREE from 'three'
import type { ContourPoint } from './MarchingSquares'
import type { BladeConfig } from './Config'

export interface BuildResult {
  shape: THREE.Shape
  /** World-space height of the sword (before global scale) */
  height: number
  /** World-space width of the sword (before global scale) */
  width: number
  /** Vertex count of the simplified contour */
  vertexCount: number
}

/**
 * Convert a simplified contour into a THREE.Shape.
 *
 * Steps:
 *  1. Flip Y coordinate (image Y-down → world Y-up).
 *  2. Scale to match reference height (~5.2 units, the current blade size).
 *  3. Translate so the lowest point (insertion) is at y=0 (the pivot).
 *  4. Reverse winding if needed (Three.js expects counter-clockwise).
 */

/* Reference target: the current procedural blade is ~4.7 units tall
 * We scale so each blade fits this height range while preserving aspect. */
const REFERENCE_HEIGHT = 5.2

export function buildShape(contour: ContourPoint[], config: BladeConfig): BuildResult {
  if (contour.length < 3) {
    throw new Error('Contour must have at least 3 points')
  }

  /* Step 1: flip Y and find bounds */
  let minX = Infinity,
    maxX = -Infinity
  let minY = Infinity,
    maxY = -Infinity

  const flipped: { x: number; y: number }[] = contour.map((p) => {
    const y = -p.y // flip Y
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    return { x: p.x, y }
  })

  const srcHeight = maxY - minY
  const srcWidth = maxX - minX
  if (srcHeight < 1 || srcWidth < 1) {
    throw new Error('Contour bounds too small')
  }

  /* Step 2: scale to reference height */
  const scale = (REFERENCE_HEIGHT / srcHeight) * config.globalScale

  /* Step 3: translate so the lowest point (insertion) is at y=0 */
  const pivotOffsetY = minY * scale

  const points: THREE.Vector2[] = flipped.map((p) => {
    const sx = (p.x - minX - srcWidth / 2) * scale
    const sy = p.y * scale - pivotOffsetY
    return new THREE.Vector2(sx, sy)
  })

  /* Step 4: build shape — ensure CCW winding */
  const shape = new THREE.Shape()
  shape.moveTo(points[0]!.x, points[0]!.y)

  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i]!.x, points[i]!.y)
  }

  shape.closePath()

  return {
    shape,
    height: srcHeight * scale,
    width: srcWidth * scale,
    vertexCount: points.length,
  }
}
