import * as THREE from 'three'
import type { BladeConfig } from './Config'

/**
 * Generate ExtrudeGeometry from a THREE.Shape.
 *
 * Applies extrusion depth, bevel, centers the geometry,
 * and computes vertex normals.
 */

export function buildGeometry(shape: THREE.Shape, config: BladeConfig): THREE.BufferGeometry {
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: config.extrusionDepth,
    bevelEnabled: config.bevelEnabled,
    bevelThickness: config.bevelThickness,
    bevelSize: config.bevelSize,
    bevelSegments: config.bevelSegments,
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

  /* Center the geometry along the Z axis (depth) */
  geometry.translate(0, 0, -config.extrusionDepth / 2)

  /* Rotate to match current sword orientation (the current procedural
   * blade does rotateY(Math.PI) to flip the mesh) */
  geometry.rotateY(Math.PI)

  geometry.computeVertexNormals()

  return geometry
}
