import { memo, useRef, useEffect } from 'react'
import { createNoise3D } from '@/utils/simplex-noise'

interface FluidProps {
  cx: number
  cy: number
  r: number
}

const BACK_SCALE = 1.4
const STORM_SPEED = 0.03
const WIDTH_RAD = 0.9
const BAND_RAD = 0.35
const DRIFT = 0.025
const EVOLVE = 0.01

const noise = createNoise3D()

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

const HighstormBackCanvas = memo(function HighstormBackCanvas({ cx, cy, r }: FluidProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const w = Math.round(r * 2 * BACK_SCALE)
  const h = Math.round(r * 2 * BACK_SCALE)
  const half = r * BACK_SCALE

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const c = canvas.getContext('2d')!
    let frameId = 0

    function render(time: number) {
      const t = time * 0.001
      const stormCenter = (t * STORM_SPEED) % (2 * Math.PI)
      const id = c.createImageData(w, h)
      const d = id.data

      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const idx = (py * w + px) * 4
          const u = (px - half) / r
          const v = (py - half) / r
          const dist = Math.sqrt(u * u + v * v)

          if (dist < 0.92 || dist > 1.25 || dist < r * 0.005) {
            d[idx + 3] = 0
            continue
          }

          const z = Math.sqrt(Math.max(0, 1 - u * u - v * v))
          const longitude = Math.atan2(z, u)
          let longDist = longitude - stormCenter
          if (longDist > Math.PI) longDist -= 2 * Math.PI
          if (longDist < -Math.PI) longDist += 2 * Math.PI
          const latitude = Math.asin(v)

          const envelope = Math.exp(-0.5 * (longDist / WIDTH_RAD) ** 2) * Math.exp(-0.5 * (latitude / BAND_RAD) ** 2)

          if (envelope < 0.01) {
            d[idx + 3] = 0
            continue
          }

          const nx = longitude * 1.5 + t * DRIFT
          const ny = latitude * 3 + t * DRIFT * 0.6
          const nz = t * EVOLVE + longitude * 0.3
          let nv = 0
          let amp = 1
          let freq = 1
          let maxA = 0
          for (let o = 0; o < 4; o++) {
            nv += amp * noise(nx * freq, ny * freq, nz * freq)
            maxA += amp
            amp *= 0.5
            freq *= 2
          }
          nv /= maxA

          const density = envelope * (0.4 + 0.6 * (0.5 + 0.5 * nv))
          const glow = density * 0.12

          d[idx] = 180
          d[idx + 1] = 195
          d[idx + 2] = 210
          d[idx + 3] = Math.round(clamp(glow, 0, 1) * 255)
        }
      }

      c.putImageData(id, 0, 0)
      frameId = requestAnimationFrame(render)
    }

    frameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frameId)
  }, [w, h, half, r])

  return (
    <foreignObject x={cx - half} y={cy - half} width={half * 2} height={half * 2} style={{ pointerEvents: 'none' }}>
      <canvas ref={ref} width={w} height={h} style={{ width: '100%', height: '100%' }} />
    </foreignObject>
  )
})

const HighstormFrontCanvas = memo(function HighstormFrontCanvas({ cx, cy, r }: FluidProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const w = Math.round(r * 2)
  const h = Math.round(r * 2)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const c = canvas.getContext('2d')!
    let frameId = 0
    let boltTimer = 0
    let nextBolt = 5 + Math.random() * 10
    let bolting = false

    const stormlight: {
      angle: number
      lat: number
      speed: number
      phase: number
      size: number
    }[] = []
    for (let i = 0; i < 8; i++) {
      stormlight.push({
        angle: Math.random() * 2 * Math.PI,
        lat: (Math.random() - 0.5) * BAND_RAD * 0.6,
        speed: STORM_SPEED * (0.8 + Math.random() * 0.4),
        phase: Math.random() * 100,
        size: 1.2 + Math.random() * 0.8,
      })
    }

    function render(time: number) {
      const t = time * 0.001
      const stormCenter = (t * STORM_SPEED) % (2 * Math.PI)
      const id = c.createImageData(w, h)
      const d = id.data

      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const idx = (py * w + px) * 4
          const u = (px - r) / r
          const v = (py - r) / r
          const dist2 = u * u + v * v

          if (dist2 > 1.0) {
            d[idx + 3] = 0
            continue
          }

          const z = Math.sqrt(1 - dist2)
          const longitude = Math.atan2(z, u)
          let longDist = longitude - stormCenter
          if (longDist > Math.PI) longDist -= 2 * Math.PI
          if (longDist < -Math.PI) longDist += 2 * Math.PI
          const latitude = Math.asin(v)

          const envelope = Math.exp(-0.5 * (longDist / WIDTH_RAD) ** 2) * Math.exp(-0.5 * (latitude / BAND_RAD) ** 2)

          if (envelope < 0.005) {
            d[idx + 3] = 0
            continue
          }

          const nx = longitude * 1.5 + t * DRIFT
          const ny = latitude * 3 + t * DRIFT * 0.6
          const nz = t * EVOLVE + longitude * 0.3
          let nv = 0
          let amp = 1
          let freq = 1
          let maxA = 0
          for (let o = 0; o < 4; o++) {
            nv += amp * noise(nx * freq, ny * freq, nz * freq)
            maxA += amp
            amp *= 0.5
            freq *= 2
          }
          nv /= maxA

          const noiseFactor = 0.5 + 0.5 * nv
          const density = envelope * noiseFactor

          if (density < 0.01) {
            d[idx + 3] = 0
            continue
          }

          const dr = clamp(density, 0, 1)
          const rCol = Math.round(lerp(200, 255, dr))
          const gCol = Math.round(lerp(205, 255, dr))
          const bCol = Math.round(lerp(215, 255, dr))
          const alpha = clamp(dr * 0.7, 0, 0.6)

          d[idx] = rCol
          d[idx + 1] = gCol
          d[idx + 2] = bCol
          d[idx + 3] = Math.round(alpha * 255)
        }
      }

      c.putImageData(id, 0, 0)

      boltTimer += 1 / 60
      if (!bolting && boltTimer > nextBolt) {
        bolting = true
        nextBolt = 5 + Math.random() * 10
        boltTimer = 0
      }
      if (bolting) {
        c.strokeStyle = 'rgba(255,255,255,0.8)'
        c.lineWidth = 0.8
        c.beginPath()
        const bx = r + r * 0.25 * (Math.random() - 0.5)
        const by = r + r * 0.25 * (Math.random() - 0.5)
        c.moveTo(bx, by)
        let lx = bx
        let ly = by
        const segs = 2 + Math.floor(Math.random() * 3)
        for (let i = 0; i < segs; i++) {
          lx += (Math.random() - 0.5) * r * 0.1
          ly += (Math.random() - 0.5) * r * 0.1
          c.lineTo(lx, ly)
        }
        c.stroke()
        bolting = false
      }

      for (const sl of stormlight) {
        const sa = sl.angle + t * sl.speed
        const su = Math.cos(sa)
        const sv = sl.lat
        const sz = Math.sin(sa)
        const sx = r + (su * Math.cos(stormCenter) - sz * Math.sin(stormCenter)) * r * 0.7
        const sy = r + sv * r * 0.7

        if (sx < 0 || sx > w || sy < 0 || sy > h) continue
        const brightness = 0.5 + 0.5 * Math.sin(t * 0.5 + sl.phase)
        c.beginPath()
        c.arc(sx, sy, sl.size, 0, Math.PI * 2)
        c.fillStyle = `rgba(103, 232, 249, ${brightness * 0.6})`
        c.fill()
        c.beginPath()
        c.arc(sx, sy, sl.size * 0.4, 0, Math.PI * 2)
        c.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`
        c.fill()
      }

      frameId = requestAnimationFrame(render)
    }

    frameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frameId)
  }, [w, h, r])

  return (
    <foreignObject x={cx - r} y={cy - r} width={r * 2} height={r * 2} style={{ pointerEvents: 'none' }}>
      <canvas ref={ref} width={w} height={h} style={{ width: '100%', height: '100%' }} />
    </foreignObject>
  )
})

export { HighstormBackCanvas, HighstormFrontCanvas }
