import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  r: number
  opacity: number
  phase: number
}

export default function ArchiveDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const particles: Particle[] = Array.from({ length: 60 }, () => {
      const x = Math.random() * w
      const y = Math.random() * h
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.04,
        vy: -0.008 - Math.random() * 0.02,
        r: 0.4 + Math.random() * 2.0,
        opacity: 0.02 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      }
    })

    let time = 0
    let animId: number

    function draw() {
      time += 0.004
      ctx!.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx + Math.sin(time + p.phase) * 0.008
        p.y += p.vy + Math.cos(time * 0.6 + p.phase) * 0.004

        if (p.x < -20) {
          p.x = w + 20
          p.y = Math.random() * h
        }
        if (p.x > w + 20) {
          p.x = -20
          p.y = Math.random() * h
        }
        if (p.y < -20) {
          p.y = h + 20
        }
        if (p.y > h + 20) {
          p.y = -20
        }

        const flicker = 0.6 + 0.4 * Math.sin(time * 2 + p.phase * 1.3)
        const currentOpacity = p.opacity * flicker

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(220, 200, 175, ${currentOpacity})`
        ctx!.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    function onResize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 2.5s ease-out',
      }}
    />
  )
}
