import { memo, useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  phase: number
}

function pRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const ArchiveParticles = memo(function ArchiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const particles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      x: pRand(i * 7 + 1) * 100,
      y: pRand(i * 11 + 3) * 100,
      size: 0.8 + pRand(i * 13 + 5) * 1.5,
      speedX: (pRand(i * 17 + 7) - 0.5) * 0.015,
      speedY: -0.008 - pRand(i * 19 + 9) * 0.012,
      opacity: 0.15 + pRand(i * 23 + 11) * 0.25,
      phase: pRand(i * 29 + 13) * Math.PI * 2,
    }))

    function resize() {
      if (!canvas) return
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      ctx?.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw(time: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      const t = time * 0.001

      for (const p of particles) {
        const px = ((p.x + Math.sin(t * 0.3 + p.phase) * 2 + 100) % 100) * w * 0.01
        const py = ((p.y + p.speedY * time * 0.01 + Math.cos(t * 0.2 + p.phase) * 1.5 + 100) % 100) * h * 0.01

        p.x += p.speedX
        p.y += p.speedY

        if (p.y < -2) {
          p.y = 102
          p.x = pRand(t + p.phase) * 100
        }
        if (p.x < -2) p.x = 102
        if (p.x > 102) p.x = -2

        const flicker = 0.7 + Math.sin(t * 1.5 + p.phase) * 0.3
        const alpha = p.opacity * flicker

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184,150,74,${alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    animId = requestAnimationFrame(draw)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
})

export default ArchiveParticles
