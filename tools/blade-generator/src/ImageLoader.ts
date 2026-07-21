import sharp from 'sharp'

export interface ImageData {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Raw RGBA pixel data, tightly packed (R,G,B,A,R,G,B,A,…) */
  pixels: Uint8Array
}

/**
 * Load an image from disk and return raw RGBA pixel data.
 * Supports PNG and WebP via sharp.
 */
export async function loadImage(filePath: string): Promise<ImageData> {
  const metadata = await sharp(filePath).metadata()
  const { width, height } = metadata
  if (!width || !height) {
    throw new Error(`Unable to read dimensions from ${filePath}`)
  }

  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  return {
    width,
    height,
    pixels: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
  }
}
