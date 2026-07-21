/** All configurable parameters for the blade generation pipeline. */

export interface BladeConfig {
  /** Input directory containing sword images */
  inputDir: string
  /** Output directory for generated GLB files */
  outputDir: string

  /** Extrusion depth for the geometry (how thick the blade mesh is) */
  extrusionDepth: number
  /** Enable bevel on extruded edges */
  bevelEnabled: boolean
  /** Bevel thickness */
  bevelThickness: number
  /** Bevel size (how far the bevel extends) */
  bevelSize: number
  /** Number of bevel segments */
  bevelSegments: number

  /** Alpha threshold (0–255); pixels above this are considered part of the sword */
  alphaThreshold: number
  /** Douglas–Peucker simplification tolerance in pixels */
  simplifyTolerance: number
  /** Global scale factor applied to the final geometry */
  globalScale: number

  /** Supported image extensions (lowercase, without dot) */
  supportedFormats: string[]
}

export const DEFAULT_CONFIG: BladeConfig = {
  inputDir: 'public/images/aharietam',
  outputDir: 'public/models/aharietam',

  extrusionDepth: 0.06,
  bevelEnabled: true,
  bevelThickness: 0.015,
  bevelSize: 0.012,
  bevelSegments: 3,

  alphaThreshold: 128,
  simplifyTolerance: 1.5,
  globalScale: 1.0,

  supportedFormats: ['png', 'webp'],
}
