import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { writeFile } from 'node:fs/promises'

/**
 * Export a BufferGeometry as a binary GLB file.
 *
 * The geometry is wrapped in a Mesh with a basic material (materials
 * will be replaced at runtime — we only need geometry data).
 */

export async function exportGLB(geometry: THREE.BufferGeometry, outputPath: string): Promise<void> {
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  const scene = new THREE.Scene()
  scene.add(mesh)

  const exporter = new GLTFExporter()

  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result)
        } else {
          reject(new Error('Expected ArrayBuffer output from GLTFExporter'))
        }
      },
      (error) => {
        reject(error)
      },
      {
        binary: true,
        includeCustomExtensions: false,
        onlyVisible: true,
        truncateDrawRange: true,
      },
    )
  })

  await writeFile(outputPath, Buffer.from(glb))
}
