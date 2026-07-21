/**
 * Blade Generator — main entry point.
 *
 * Scans the input directory for honorblade images, extracts the outer
 * contour from each alpha channel, generates 3D geometry via extrusion,
 * and exports optimized GLB files.
 *
 * Usage:
 *   npm run generate:blades
 */

import { readdir } from 'node:fs/promises'
import { resolve, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEFAULT_CONFIG } from './Config.js'
import { loadImage } from './ImageLoader.js'
import { extractBinaryMask } from './AlphaExtractor.js'
import { extractContour } from './MarchingSquares.js'
import { simplifyPolyline } from './DouglasPeucker.js'
import { buildShape } from './ShapeBuilder.js'
import { buildGeometry } from './GeometryBuilder.js'
import { exportGLB } from './GLBExporter.js'
import { startSession, logSuccess, logDetail, logError, logSeparator, endSession } from './Logger.js'
import type { BladeConfig } from './Config.js'

async function main(): Promise<void> {
  const config: BladeConfig = DEFAULT_CONFIG

  /* Resolve paths relative to the project root (two levels up from src/) */
  const projectRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..')
  const inputDir = resolve(projectRoot, config.inputDir)
  const outputDir = resolve(projectRoot, config.outputDir)

  startSession()

  /* Scan input directory */
  let files: string[]
  try {
    files = await readdir(inputDir)
  } catch {
    console.error(`Error: Cannot read input directory "${inputDir}"`)
    process.exit(1)
  }

  const imageFiles = files.filter((f) => {
    const ext = extname(f).toLowerCase().replace('.', '')
    return config.supportedFormats.includes(ext)
  })

  if (imageFiles.length === 0) {
    console.log('No supported images found.')
    console.log(`Looked in: ${inputDir}`)
    process.exit(0)
  }

  let successCount = 0

  for (const file of imageFiles) {
    const filePath = resolve(inputDir, file)
    const baseName = basename(file, extname(file))
    const outputPath = resolve(outputDir, `${baseName}.glb`)

    logSeparator()

    try {
      /* 1. Load image */
      const img = await loadImage(filePath)

      /* 2. Extract binary mask from alpha channel */
      const mask = extractBinaryMask(img, config.alphaThreshold)

      /* 3. Extract outer contour via Marching Squares */
      let contour = extractContour(img, mask, config)
      if (contour.length < 3) {
        throw new Error(`Contour has only ${contour.length} points — image may be fully transparent`)
      }
      logDetail('Contour', `${contour.length} vertices`)

      /* 4. Simplify with Douglas–Peucker */
      contour = simplifyPolyline(contour, config.simplifyTolerance)
      logDetail('Simplified', `${contour.length} vertices`)

      /* 5. Convert to THREE.Shape */
      const { shape, height, width } = buildShape(contour, config)
      logDetail('Bounds', `${width.toFixed(2)} × ${height.toFixed(2)}`)

      /* 6. Generate ExtrudeGeometry */
      const geometry = buildGeometry(shape, config)

      const triCount = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      logDetail('Triangles', Math.round(triCount))

      /* 7. Export as GLB */
      await exportGLB(geometry, outputPath)

      logSuccess(file)
      successCount++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logError(file, message)
    }
  }

  endSession(successCount)
}

main()
