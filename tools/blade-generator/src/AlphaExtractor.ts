import type { ImageData } from './ImageLoader'

/**
 * Extract a binary mask from the alpha channel.
 * Returns a 2D array where `true` = solid (part of the sword).
 */
export function extractBinaryMask(img: ImageData, threshold: number): boolean[][] {
  const { width, height, pixels } = img
  const mask: boolean[][] = []

  for (let y = 0; y < height; y++) {
    const row: boolean[] = []
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4 + 3 // alpha channel
      row.push(pixels[idx]! >= threshold)
    }
    mask.push(row)
  }

  return mask
}
