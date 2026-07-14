'use client'
import { memo, useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
  type: 'dust' | 'ash' | 'mote' | 'sparkle'
  hue: number
}

const COUNT = 280
const LAYERS = 3

function create(w: number, h: number, layer: number): Particle {
  const r = Math.random()
  const type: Particle['type'] = r < 0.4 ? 'dust' : r < 0.7 ? 'ash' : r < 0.9 ? 'mote' : 'sparkle'
  const depthFactor = 1 + layer * 0.4
  const speedScale = 1 - layer * 0.25
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: layer / LAYERS,
    vx: (Math.random() - 0.5) * 0.06 * depthFactor,
    vy: (-0.004 - Math.random() * 0.035) * speedScale,
    size: type === 'sparkle' ? 0.5 + Math.random() * 1 : (0.3 + Math.random() * 0.5) * (1 + layer * 0.4),
    opacity: 0.02 + Math.random() * 0.05 * (1 - layer * 0.12),
    life: 0,
    maxLife: type === 'sparkle' ? 60 + Math.random() * 140 : 250 + Math.random() * 500,
    type,
    hue: type === 'sparkle' ? 180 + Math.random() * 60 : 0,
  }
}

export default memo(function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let hidden = false

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)
    const onVisibilityChange = () => {
      hidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    const particles: Particle[] = []
    for (let l = 0; l < LAYERS; l++) {
      for (let i = 0; i < COUNT / LAYERS; i++) {
        particles.push(create(w, h, l))
      }
    }

    const tick = () => {
      if (!hidden) {
        ctx.clearRect(0, 0, w, h)
        const mx = mouseRef.current.x
        const my = mouseRef.current.y

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!
          p.life++

          if (p.life >= p.maxLife) {
            const layer = Math.floor(i / (COUNT / LAYERS)) % LAYERS
            particles[i] = create(w, h, layer)
            continue
          }

          /* mouse repulsion */
          if (mx >= 0 && my >= 0) {
            const dx = mx - p.x
            const dy = my - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 180 && dist > 0) {
              const f = (1 - dist / 180) * 0.008 * (1 - p.z * 0.5)
              p.vx -= (dx / dist) * f
              p.vy -= (dy / dist) * f
            }
          }

          p.vx *= 0.996
          p.vy *= 0.996
          p.x += p.vx
          p.y += p.vy

          /* wind drift — rightward, stronger in back layers */
          p.x += 0.008 * (1 + p.z * 1.5)

          if (p.x < -30) p.x = w + 30
          else if (p.x > w + 30) p.x = -30
          if (p.y < -30) p.y = h + 30
          else if (p.y > h + 30) p.y = -30

          const lifeRatio = p.life / p.maxLife
          const alpha = p.opacity * Math.min(lifeRatio * 4, 1) * Math.max(1 - lifeRatio, 0)

          /* sparkle glow halo */
          if (p.type === 'sparkle') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5)
            grad.addColorStop(0, `hsla(${p.hue}, 60%, 85%, ${alpha * 1.2})`)
            grad.addColorStop(1, `hsla(${p.hue}, 60%, 85%, 0)`)
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
          }

          /* mote glow */
          if (p.type === 'mote') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
            grad.addColorStop(0, `rgba(180, 210, 240, ${alpha * 0.8})`)
            grad.addColorStop(1, `rgba(180, 210, 240, 0)`)
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
          }

          /* core dot */
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          if (p.type === 'mote') {
            ctx.fillStyle = `rgba(180, 210, 255, ${alpha * 0.25})`
          } else if (p.type === 'sparkle') {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`
          } else if (p.type === 'ash') {
            ctx.fillStyle = `rgba(140, 130, 120, ${alpha * 0.12})`
          } else {
            ctx.fillStyle = `rgba(190, 180, 165, ${alpha * 0.08})`
          }
          ctx.fill()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 30 }} />
})
