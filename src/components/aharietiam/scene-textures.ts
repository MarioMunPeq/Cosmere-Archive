/**
 * Everything the field is made of is painted here, at runtime, from numbers.
 * No image request leaves the machine and every run is identical.
 */
import * as THREE from 'three'

export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function canvasOf(width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('A 2D canvas context is required to paint the field.')
  return { canvas, context }
}

function softEllipse(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  inner: string,
  outer: string,
): void {
  context.save()
  context.translate(x, y)
  context.scale(radiusX, radiusY)
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(1, outer)
  context.fillStyle = gradient
  context.beginPath()
  context.arc(0, 0, 1, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

/**
 * A dusk equirectangular sky. The brightest band sits at the horizon, with a
 * low amber sun and one distant storm wall lit cold on its rim.
 */
export function paintSky(): HTMLCanvasElement {
  const width = 1024
  const height = 512
  const { canvas, context } = canvasOf(width, height)

  const sky = context.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#182131')
  sky.addColorStop(0.28, '#2e3b4f')
  sky.addColorStop(0.43, '#575963')
  sky.addColorStop(0.475, '#7f6250')
  sky.addColorStop(0.5, '#b47f58')
  sky.addColorStop(0.525, '#7f5943')
  sky.addColorStop(0.62, '#4b3527')
  sky.addColorStop(0.8, '#2d2018')
  sky.addColorStop(1, '#211711')
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)

  /* The sun — low, wide, and already half-swallowed by the rockbed. */
  const sunX = width * 0.79
  const sunY = height * 0.505
  softEllipse(context, sunX, sunY, width * 0.22, height * 0.12, 'rgba(255, 200, 136, 0.55)', 'rgba(255, 190, 120, 0)')
  softEllipse(context, sunX, sunY, width * 0.06, height * 0.035, 'rgba(255, 224, 176, 0.7)', 'rgba(255, 207, 150, 0)')

  /* Long high wisps, cold and nearly still. */
  const rng = createRng(0x5c1e11)
  for (let index = 0; index < 18; index++) {
    const x = rng() * width
    const y = height * (0.16 + rng() * 0.2)
    const radiusX = width * (0.06 + rng() * 0.15)
    const radiusY = height * (0.006 + rng() * 0.018)
    softEllipse(
      context,
      x,
      y,
      radiusX,
      radiusY,
      `rgba(150, 163, 182, ${0.06 + rng() * 0.06})`,
      'rgba(150, 163, 182, 0)',
    )
  }

  /* A low shelf of cloud, close enough to the horizon to sit inside the band
     of sky the camera keeps in shot. Lit warm on top, cold underneath. */
  for (let index = 0; index < 26; index++) {
    const x = rng() * width
    const y = height * (0.44 + rng() * 0.052)
    const radiusX = width * (0.035 + rng() * 0.11)
    const radiusY = height * (0.006 + rng() * 0.014)
    softEllipse(context, x, y, radiusX, radiusY, `rgba(58, 60, 68, ${0.18 + rng() * 0.2})`, 'rgba(58, 60, 68, 0)')
    softEllipse(
      context,
      x,
      y - radiusY * 0.55,
      radiusX * 0.92,
      radiusY * 0.5,
      `rgba(236, 170, 118, ${0.12 + rng() * 0.1})`,
      'rgba(236, 170, 118, 0)',
    )
    softEllipse(
      context,
      x,
      y + radiusY * 0.5,
      radiusX * 0.9,
      radiusY * 0.55,
      `rgba(126, 146, 164, ${0.07 + rng() * 0.08})`,
      'rgba(126, 146, 164, 0)',
    )
  }

  /* A few far cumulus shapes, backlit warmer on top than underneath. */
  const clouds = [
    { x: 0.57, y: 0.44, rx: 0.11, ry: 0.055 },
    { x: 0.66, y: 0.425, rx: 0.08, ry: 0.045 },
    { x: 0.38, y: 0.455, rx: 0.09, ry: 0.04 },
    { x: 0.47, y: 0.44, rx: 0.055, ry: 0.028 },
  ]
  for (const cloud of clouds) {
    softEllipse(
      context,
      cloud.x * width,
      cloud.y * height,
      cloud.rx * width,
      cloud.ry * height,
      'rgba(55, 55, 63, 0.32)',
      'rgba(55, 55, 63, 0)',
    )
    softEllipse(
      context,
      cloud.x * width,
      (cloud.y - cloud.ry * 0.65) * height,
      cloud.rx * width * 0.9,
      cloud.ry * height * 0.55,
      'rgba(216, 151, 108, 0.16)',
      'rgba(216, 151, 108, 0)',
    )
    softEllipse(
      context,
      cloud.x * width,
      (cloud.y + cloud.ry * 0.8) * height,
      cloud.rx * width * 0.95,
      cloud.ry * height * 0.3,
      'rgba(96, 115, 134, 0.14)',
      'rgba(96, 115, 134, 0)',
    )
  }

  /* The highstorm on the horizon — a bruised tower with a cold lit edge. */
  const stormX = width * 0.925
  for (let index = 0; index < 18; index++) {
    const y = height * (0.29 + index * 0.011)
    const radiusX = width * (0.055 + (index / 18) * 0.085)
    const radiusY = height * (0.018 + (index % 3) * 0.008)
    softEllipse(
      context,
      stormX + Math.sin(index * 1.7) * width * 0.018,
      y,
      radiusX,
      radiusY,
      `rgba(45, 51, 60, ${0.12 + index * 0.006})`,
      'rgba(45, 51, 60, 0)',
    )
  }
  softEllipse(
    context,
    stormX,
    height * 0.44,
    width * 0.085,
    height * 0.05,
    'rgba(107, 143, 160, 0.18)',
    'rgba(107, 143, 160, 0)',
  )
  softEllipse(
    context,
    stormX - width * 0.03,
    height * 0.47,
    width * 0.06,
    height * 0.024,
    'rgba(228, 180, 132, 0.16)',
    'rgba(228, 180, 132, 0)',
  )

  /* A thin haze where sky and stone meet. */
  const haze = context.createLinearGradient(0, height * 0.46, 0, height * 0.55)
  haze.addColorStop(0, 'rgba(218, 166, 120, 0)')
  haze.addColorStop(0.55, 'rgba(218, 166, 120, 0.14)')
  haze.addColorStop(1, 'rgba(190, 135, 98, 0)')
  context.fillStyle = haze
  context.fillRect(0, height * 0.45, width, height * 0.12)

  /* 8-bit dithering keeps the long gradient from banding. */
  const pixels = context.getImageData(0, 0, width, height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const grain = (rng() - 0.5) * 4
    pixels.data[index] = Math.max(0, Math.min(255, pixels.data[index]! + grain))
    pixels.data[index + 1] = Math.max(0, Math.min(255, pixels.data[index + 1]! + grain))
    pixels.data[index + 2] = Math.max(0, Math.min(255, pixels.data[index + 2]! + grain))
  }
  context.putImageData(pixels, 0, 0)

  return canvas
}

/** Cracked Roshar rockbed, with a matching height map for the bump channel. */
export function paintRockbed(): { colour: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 768
  const { canvas, context } = canvasOf(size, size)
  const rng = createRng(0x91a17e)

  const image = context.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const broad = Math.sin(x * 0.013 + y * 0.009) * 0.5 + 0.5
      const middle = Math.sin(x * 0.041 - y * 0.033 + 1.4) * 0.5 + 0.5
      const fine = Math.sin(x * 0.13 + y * 0.11 + 3.1) * 0.5 + 0.5
      const shade = 0.66 + broad * 0.2 + middle * 0.09 + fine * 0.05
      const grain = (rng() - 0.5) * 13
      const warm = Math.sin(x * 0.006 + y * 0.004) * 5
      const index = (y * size + x) * 4
      image.data[index] = Math.max(0, Math.min(255, 80 * shade + warm * 0.7 + grain))
      image.data[index + 1] = Math.max(0, Math.min(255, 76 * shade + warm * 0.5 + grain))
      image.data[index + 2] = Math.max(0, Math.min(255, 69 * shade + warm * 0.35 + grain * 0.9))
      image.data[index + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)

  /* Flat shale plates. */
  for (let index = 0; index < 70; index++) {
    const x = rng() * size
    const y = rng() * size
    const radius = 3 + rng() * 16
    const points = 4 + Math.floor(rng() * 3)
    context.beginPath()
    for (let point = 0; point < points; point++) {
      const angle = (point / points) * Math.PI * 2 + rng() * 0.4
      const px = x + Math.cos(angle) * radius * (0.6 + rng() * 0.5)
      const py = y + Math.sin(angle) * radius * (0.45 + rng() * 0.4)
      if (point === 0) context.moveTo(px, py)
      else context.lineTo(px, py)
    }
    context.closePath()
    context.fillStyle = `rgba(96, 80, 62, ${0.16 + rng() * 0.18})`
    context.fill()
    context.strokeStyle = `rgba(42, 34, 26, ${0.18 + rng() * 0.16})`
    context.lineWidth = 0.8 + rng()
    context.stroke()
  }

  /* Fissures; each is one wandering line with two or three branches. */
  for (let crack = 0; crack < 34; crack++) {
    let x = rng() * size
    let y = rng() * size
    let angle = rng() * Math.PI * 2
    const length = 60 + rng() * 260
    const width = 0.7 + rng() * 1.9
    context.beginPath()
    context.moveTo(x, y)
    for (let step = 0; step < length / 9; step++) {
      angle += (rng() - 0.5) * 0.42
      x += Math.cos(angle) * (6 + rng() * 7)
      y += Math.sin(angle) * (6 + rng() * 7)
      context.lineTo(x, y)
    }
    context.strokeStyle = `rgba(30, 24, 18, ${0.18 + rng() * 0.16})`
    context.lineWidth = width + 1.4
    context.lineCap = 'round'
    context.stroke()
    context.strokeStyle = `rgba(20, 16, 12, ${0.28 + rng() * 0.2})`
    context.lineWidth = width
    context.stroke()
  }

  /* Sparse olive lichen in the deeper cracks. Roshar is barren, not sterile. */
  for (let index = 0; index < 460; index++) {
    const x = rng() * size
    const y = rng() * size
    const radius = 0.4 + rng() * 1.7
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fillStyle = `rgba(72, 76, 48, ${0.05 + rng() * 0.08})`
    context.fill()
  }

  /* Small loose stones with a lit crown and a shadow beneath. */
  for (let index = 0; index < 240; index++) {
    const x = rng() * size
    const y = rng() * size
    const radius = 0.8 + rng() * 3.2
    context.beginPath()
    context.ellipse(x, y, radius, radius * (0.5 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2)
    context.fillStyle = `rgba(118, 99, 76, ${0.12 + rng() * 0.16})`
    context.fill()
    context.beginPath()
    context.ellipse(x - radius * 0.2, y - radius * 0.18, radius * 0.5, radius * 0.32, 0, 0, Math.PI * 2)
    context.fillStyle = `rgba(160, 137, 107, ${0.08 + rng() * 0.1})`
    context.fill()
  }

  /* The height map is a quieter version of the same rock. */
  const bumpSize = 512
  const { canvas: bumpCanvas, context: bumpContext } = canvasOf(bumpSize, bumpSize)
  const bumpRng = createRng(0x91a17f)
  const bumpImage = bumpContext.createImageData(bumpSize, bumpSize)
  for (let y = 0; y < bumpSize; y++) {
    for (let x = 0; x < bumpSize; x++) {
      const broad = Math.sin(x * 0.019 + y * 0.014) * 0.5 + 0.5
      const middle = Math.sin(x * 0.061 - y * 0.049 + 0.8) * 0.5 + 0.5
      const fine = Math.sin(x * 0.19 + y * 0.17) * 0.5 + 0.5
      const height = 112 + broad * 44 + middle * 28 + fine * 18 + (bumpRng() - 0.5) * 16
      const index = (y * bumpSize + x) * 4
      bumpImage.data[index] = height
      bumpImage.data[index + 1] = height
      bumpImage.data[index + 2] = height
      bumpImage.data[index + 3] = 255
    }
  }
  bumpContext.putImageData(bumpImage, 0, 0)
  for (let crack = 0; crack < 20; crack++) {
    let x = bumpRng() * bumpSize
    let y = bumpRng() * bumpSize
    let angle = bumpRng() * Math.PI * 2
    bumpContext.beginPath()
    bumpContext.moveTo(x, y)
    for (let step = 0; step < 30; step++) {
      angle += (bumpRng() - 0.5) * 0.4
      x += Math.cos(angle) * (6 + bumpRng() * 8)
      y += Math.sin(angle) * (6 + bumpRng() * 8)
      bumpContext.lineTo(x, y)
    }
    bumpContext.strokeStyle = 'rgba(34, 34, 34, 0.7)'
    bumpContext.lineWidth = 1 + bumpRng() * 2
    bumpContext.lineCap = 'round'
    bumpContext.stroke()
  }

  return { colour: canvas, bump: bumpCanvas }
}

/**
 * A brushed-steel roughness map. Vertical grain breaks a flat blade face into
 * many slightly different reflections, which is what separates steel from
 * painted board when the camera comes close.
 */
export function paintBladeSteel(seed: number): HTMLCanvasElement {
  const width = 256
  const height = 512
  const { canvas, context } = canvasOf(width, height)
  const rng = createRng(seed)

  context.fillStyle = '#bdbdbd'
  context.fillRect(0, 0, width, height)

  for (let index = 0; index < 420; index++) {
    const x = rng() * width
    const y = rng() * height
    const length = 30 + rng() * height * 0.55
    const light = rng() > 0.48
    context.strokeStyle = light
      ? `rgba(255, 255, 255, ${0.02 + rng() * 0.07})`
      : `rgba(26, 26, 30, ${0.02 + rng() * 0.06})`
    context.lineWidth = 0.4 + rng() * 1.3
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + (rng() - 0.5) * 2.4, y + length)
    context.stroke()
  }

  for (let index = 0; index < 26; index++) {
    const x = rng() * width
    const y = rng() * height
    softEllipse(
      context,
      x,
      y,
      8 + rng() * 24,
      40 + rng() * 170,
      rng() > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(20, 20, 24, 0.05)',
      'rgba(128, 128, 128, 0)',
    )
  }

  return canvas
}

/**
 * The reflection copy of the sky. It is the same painting, graded cooler and a
 * little darker so polished steel reads silver instead of peach.
 */
export function paintSkyEnvironment(sky: HTMLCanvasElement): HTMLCanvasElement {
  const { canvas, context } = canvasOf(sky.width, sky.height)
  context.drawImage(sky, 0, 0)
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = '#d2dae6'
  context.fillRect(0, 0, sky.width, sky.height)
  context.globalCompositeOperation = 'source-over'
  return canvas
}

/** A soft, dirty cloud used for the low fog sheets. */
export function paintFog(): HTMLCanvasElement {
  const size = 256
  const { canvas, context } = canvasOf(size, size)
  const rng = createRng(0x3f10a7)
  softEllipse(
    context,
    size * 0.5,
    size * 0.52,
    size * 0.48,
    size * 0.38,
    'rgba(214, 193, 166, 0.2)',
    'rgba(214, 193, 166, 0)',
  )
  for (let index = 0; index < 22; index++) {
    softEllipse(
      context,
      size * (0.18 + rng() * 0.64),
      size * (0.3 + rng() * 0.44),
      size * (0.08 + rng() * 0.2),
      size * (0.04 + rng() * 0.1),
      `rgba(206, 186, 160, ${0.04 + rng() * 0.05})`,
      'rgba(206, 186, 160, 0)',
    )
  }
  return canvas
}

/** Disturbed earth at the foot of each blade. */
export function paintMound(): HTMLCanvasElement {
  const size = 256
  const { canvas, context } = canvasOf(size, size)
  const rng = createRng(0x7c31b9)
  softEllipse(context, size / 2, size / 2, size * 0.46, size * 0.4, 'rgba(42, 30, 21, 0.72)', 'rgba(42, 30, 21, 0)')
  softEllipse(context, size / 2, size * 0.54, size * 0.28, size * 0.22, 'rgba(28, 20, 15, 0.5)', 'rgba(28, 20, 15, 0)')

  for (let crack = 0; crack < 14; crack++) {
    let angle = rng() * Math.PI * 2
    const radius = size * 0.12
    let x = size / 2 + Math.cos(angle) * radius
    let y = size / 2 + Math.sin(angle) * radius * 0.7
    context.beginPath()
    context.moveTo(x, y)
    for (let step = 0; step < 7; step++) {
      angle += (rng() - 0.5) * 0.35
      x += Math.cos(angle) * (5 + rng() * 8)
      y += Math.sin(angle) * (4 + rng() * 6)
      context.lineTo(x, y)
    }
    context.strokeStyle = `rgba(18, 13, 9, ${0.2 + rng() * 0.16})`
    context.lineWidth = 0.8 + rng() * 1.2
    context.lineCap = 'round'
    context.stroke()
  }

  for (let index = 0; index < 38; index++) {
    const angle = rng() * Math.PI * 2
    const radius = size * (0.08 + rng() * 0.32)
    const x = size / 2 + Math.cos(angle) * radius
    const y = size / 2 + Math.sin(angle) * radius * 0.72
    context.beginPath()
    context.ellipse(x, y, 1 + rng() * 3, 1 + rng() * 2, rng() * Math.PI, 0, Math.PI * 2)
    context.fillStyle = `rgba(95, 76, 56, ${0.25 + rng() * 0.25})`
    context.fill()
  }
  return canvas
}

/**
 * A soft strip of light for the leading edge of the selected blade. It is
 * brightest at the middle and dissolves at both ends, so it reads as a sheen
 * caught by the metal rather than a beam or a neon outline.
 */
export function paintEdgeLight(): HTMLCanvasElement {
  const width = 64
  const height = 256
  const { canvas, context } = canvasOf(width, height)

  const vertical = context.createLinearGradient(0, 0, 0, height)
  vertical.addColorStop(0, 'rgba(255, 255, 255, 0)')
  vertical.addColorStop(0.12, 'rgba(255, 255, 255, 0.55)')
  vertical.addColorStop(0.42, 'rgba(255, 255, 255, 0.95)')
  vertical.addColorStop(0.62, 'rgba(255, 255, 255, 0.8)')
  vertical.addColorStop(0.9, 'rgba(255, 255, 255, 0.3)')
  vertical.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = vertical
  context.fillRect(0, 0, width, height)

  /* Feather the strip across its width. */
  context.globalCompositeOperation = 'destination-in'
  const horizontal = context.createLinearGradient(0, 0, width, 0)
  horizontal.addColorStop(0, 'rgba(255, 255, 255, 0)')
  horizontal.addColorStop(0.42, 'rgba(255, 255, 255, 0.7)')
  horizontal.addColorStop(0.5, 'rgba(255, 255, 255, 1)')
  horizontal.addColorStop(0.58, 'rgba(255, 255, 255, 0.7)')
  horizontal.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = horizontal
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'

  return canvas
}

/** Faint cyan light in the cracked centre of the ring. */
export function paintStormlight(): HTMLCanvasElement {
  const size = 512
  const { canvas, context } = canvasOf(size, size)
  const rng = createRng(0x1d4e55)
  softEllipse(context, size / 2, size / 2, size * 0.46, size * 0.4, 'rgba(92, 174, 196, 0.2)', 'rgba(92, 174, 196, 0)')
  softEllipse(
    context,
    size / 2,
    size / 2,
    size * 0.18,
    size * 0.16,
    'rgba(176, 229, 239, 0.22)',
    'rgba(176, 229, 239, 0)',
  )

  for (let crack = 0; crack < 16; crack++) {
    let angle = rng() * Math.PI * 2
    let x = size / 2
    let y = size / 2
    context.beginPath()
    context.moveTo(x, y)
    for (let step = 0; step < 9; step++) {
      angle += (rng() - 0.5) * 0.38
      x += Math.cos(angle) * (8 + rng() * 18)
      y += Math.sin(angle) * (7 + rng() * 15)
      context.lineTo(x, y)
    }
    context.strokeStyle = `rgba(142, 211, 226, ${0.07 + rng() * 0.07})`
    context.lineWidth = 0.7 + rng() * 1.1
    context.lineCap = 'round'
    context.stroke()
  }

  for (let index = 0; index < 32; index++) {
    const angle = rng() * Math.PI * 2
    const radius = size * rng() * 0.32
    context.beginPath()
    context.arc(
      size / 2 + Math.cos(angle) * radius,
      size / 2 + Math.sin(angle) * radius,
      0.6 + rng() * 1.1,
      0,
      Math.PI * 2,
    )
    context.fillStyle = `rgba(176, 229, 239, ${0.08 + rng() * 0.1})`
    context.fill()
  }
  return canvas
}

/**
 * An etched column of glyphs for one blade. The texture is white ink; the
 * material tints it with the Herald's restrained accent.
 */
export function paintGlyphPanel(seed: number): HTMLCanvasElement {
  const width = 192
  const height = 384
  const { canvas, context } = canvasOf(width, height)
  const rng = createRng(seed)

  context.strokeStyle = 'rgba(238, 228, 211, 0.68)'
  context.fillStyle = 'rgba(238, 228, 211, 0.58)'
  context.lineCap = 'round'
  context.lineJoin = 'round'

  /* A faint panel rule, worn at the corners. */
  context.strokeStyle = 'rgba(238, 228, 211, 0.2)'
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(24, 34)
  context.lineTo(width - 24, 34)
  context.lineTo(width - 24, height - 34)
  context.lineTo(24, height - 34)
  context.closePath()
  context.stroke()

  const centreX = width / 2
  context.strokeStyle = 'rgba(238, 228, 211, 0.7)'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(centreX, 52)
  context.lineTo(centreX, height - 54)
  context.stroke()

  /* Angular branches, like a scholar's shorthand pressed into steel. */
  for (let index = 0; index < 9; index++) {
    const y = 70 + index * 27
    const direction = index % 2 === 0 ? 1 : -1
    const reach = 20 + rng() * 28
    context.lineWidth = 2.4 + rng() * 1.4
    context.beginPath()
    context.moveTo(centreX, y)
    context.lineTo(centreX + direction * reach * 0.55, y - 10 - rng() * 9)
    context.lineTo(centreX + direction * reach, y - 2 + rng() * 8)
    context.stroke()

    if (rng() > 0.55) {
      context.beginPath()
      context.moveTo(centreX + direction * reach * 0.55, y - 10 - rng() * 4)
      context.lineTo(centreX + direction * (reach + 8), y - 18 - rng() * 10)
      context.stroke()
    }

    if (rng() > 0.68) {
      context.beginPath()
      context.arc(centreX - direction * (12 + rng() * 17), y + 7, 2.2 + rng() * 2.2, 0, Math.PI * 2)
      context.fill()
    }
  }

  /* A terminal mark, unique per Herald. */
  const marks = 3 + Math.floor(rng() * 4)
  context.lineWidth = 2.6
  for (let index = 0; index < marks; index++) {
    const angle = (index / marks) * Math.PI * 2 + rng() * 0.3
    context.beginPath()
    context.moveTo(centreX + Math.cos(angle) * 12, height - 80 + Math.sin(angle) * 12)
    context.lineTo(centreX + Math.cos(angle) * (26 + rng() * 10), height - 80 + Math.sin(angle) * (26 + rng() * 10))
    context.stroke()
  }

  return canvas
}

export type GripWrapKind = 'leather' | 'wire' | 'cord' | 'cloth' | 'wood'

const GRIP_BASE: Record<GripWrapKind, { base: string; shade: string; light: string }> = {
  leather: { base: '#4b3427', shade: '#2d1e16', light: '#6e4e3b' },
  wire: { base: '#4d5057', shade: '#2f3238', light: '#aeb3bb' },
  cord: { base: '#756046', shade: '#4a3b2a', light: '#9b8160' },
  cloth: { base: '#4c4b52', shade: '#303039', light: '#72717c' },
  wood: { base: '#5a3d26', shade: '#362316', light: '#7f5a38' },
}

/**
 * The grip wrap, painted as a sleeve rather than modelled as twenty rings.
 * One texture per blade is far cheaper than a lattice of torus meshes, and the
 * bands still catch the dusk light because they are shaded, not flat.
 */
export function paintGrip(kind: GripWrapKind, bands: number, seed: number): HTMLCanvasElement {
  const width = 128
  const height = 256
  const { canvas, context } = canvasOf(width, height)
  const rng = createRng(seed)
  const palette = GRIP_BASE[kind]

  context.fillStyle = palette.base
  context.fillRect(0, 0, width, height)

  /* A vertical weave or grain, so the sleeve never reads as a plastic tube. */
  for (let index = 0; index < 180; index++) {
    const x = rng() * width
    const y = rng() * height
    const length = 4 + rng() * 30
    context.strokeStyle = rng() > 0.5 ? palette.shade : palette.light
    context.globalAlpha = 0.08 + rng() * 0.14
    context.lineWidth = 0.5 + rng() * 1.4
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + (rng() - 0.5) * 2, y + length)
    context.stroke()
  }
  context.globalAlpha = 1

  /* Raised binding, one turn per band. The count is per Herald. */
  const count = Math.max(1, Math.round(bands))
  for (let index = 0; index < count; index++) {
    const y = ((index + 0.5) / count) * height
    const thickness = kind === 'cord' ? 8 : kind === 'wire' ? 2.5 : 5
    context.strokeStyle = palette.light
    context.globalAlpha = 0.55
    context.lineWidth = thickness
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()

    context.strokeStyle = palette.shade
    context.globalAlpha = 0.6
    context.lineWidth = Math.max(1, thickness * 0.35)
    context.beginPath()
    context.moveTo(0, y + thickness * 0.6)
    context.lineTo(width, y + thickness * 0.6)
    context.stroke()
  }
  context.globalAlpha = 1

  /* Wire gets a diagonal bind; cord gets a tight spiral. */
  if (kind === 'wire' || kind === 'cord') {
    const turns = kind === 'wire' ? 14 : 20
    context.strokeStyle = palette.light
    context.globalAlpha = kind === 'wire' ? 0.5 : 0.28
    context.lineWidth = kind === 'wire' ? 1.1 : 2.2
    for (let index = 0; index < turns; index++) {
      const y = (index / turns) * height
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y + (kind === 'cord' ? 8 : 5))
      context.stroke()
    }
    context.globalAlpha = 1
  }

  /* Leather and wood darken where the hand has worn them. */
  if (kind === 'leather' || kind === 'wood') {
    softEllipse(
      context,
      width * 0.5,
      height * 0.55,
      width * 0.42,
      height * 0.42,
      'rgba(20, 13, 9, 0.18)',
      'rgba(20, 13, 9, 0)',
    )
  }

  return canvas
}

export function makeTexture(
  canvas: HTMLCanvasElement,
  options: { srgb?: boolean; repeat?: number; anisotropy?: number } = {},
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = options.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace
  texture.anisotropy = options.anisotropy ?? 4
  if (options.repeat) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(options.repeat, options.repeat)
  }
  /* The GPU image is released by dispose(); the source canvas is not. */
  texture.addEventListener('dispose', () => {
    const image = texture.image as HTMLCanvasElement | null
    if (image) {
      image.width = 1
      image.height = 1
    }
    texture.image = null as unknown as HTMLCanvasElement
    texture.source.data = null as unknown as HTMLCanvasElement
  })
  return texture
}
