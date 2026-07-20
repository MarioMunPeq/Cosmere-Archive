'use client'
import { memo, useEffect, useRef } from 'react'

/*
 * Background atmosphere — stars, nebula, drifting ash, very subtle motion.
 * Never steals attention from the ceremonial scene.
 */
export default memo(function Atmosphere() {
  return (
    <>
      {/* Sky with deep void + nebula */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 70% 30%, rgba(30,20,50,0.08) 0%, transparent 100%),
              radial-gradient(ellipse 40% 50% at 20% 60%, rgba(20,15,40,0.05) 0%, transparent 100%),
              radial-gradient(ellipse 50% 30% at 50% 20%, rgba(15,10,30,0.06) 0%, transparent 100%),
              linear-gradient(180deg, #050308 0%, #07050a 25%, #0a0710 50%, #07050a 75%, #030205 100%)
            `,
          }}
        />

        {/* Star field — tiny dots */}
        <CanvasStarField />

        {/* Mountain silhouettes — blurred background layers */}
        <div
          className="absolute"
          style={{
            left: '-10%',
            bottom: 0,
            width: '120%',
            height: '45%',
            background: `
              radial-gradient(ellipse 30% 100% at 15% 100%, rgba(20,14,10,0.35) 0%, transparent 100%),
              radial-gradient(ellipse 25% 80% at 40% 100%, rgba(25,18,13,0.25) 0%, transparent 100%),
              radial-gradient(ellipse 35% 90% at 70% 100%, rgba(18,12,8,0.3) 0%, transparent 100%),
              radial-gradient(ellipse 20% 70% at 88% 100%, rgba(22,16,11,0.2) 0%, transparent 100%)
            `,
            filter: 'blur(35px)',
          }}
        />
        <div
          className="absolute"
          style={{
            left: '-5%',
            bottom: 0,
            width: '110%',
            height: '30%',
            background: `
              radial-gradient(ellipse 20% 80% at 25% 100%, rgba(14,9,6,0.45) 0%, transparent 100%),
              radial-gradient(ellipse 15% 70% at 55% 100%, rgba(16,10,7,0.3) 0%, transparent 100%),
              radial-gradient(ellipse 18% 75% at 80% 100%, rgba(12,8,5,0.35) 0%, transparent 100%)
            `,
            filter: 'blur(18px)',
          }}
        />

        {/* Ground-level dust haze */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(0deg, rgba(160,140,120,0.02) 0%, transparent 35%),
              linear-gradient(180deg, transparent 70%, rgba(160,140,120,0.012) 85%, transparent 100%)
            `,
            filter: 'blur(12px)',
          }}
        />
      </div>

      {/* Drifting ash layer */}
      <AshDrift />

      {/* Light rays — very subtle volumetric feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background: `
            linear-gradient(155deg, transparent 20%, rgba(180,170,150,0.008) 32%, transparent 40%, rgba(180,170,150,0.005) 50%, transparent 60%),
            linear-gradient(175deg, transparent 45%, rgba(180,170,150,0.004) 55%, transparent 65%)
          `,
        }}
      />

      {/* Ground fog */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 35,
          background: 'radial-gradient(ellipse 70% 15% at 50% 90%, rgba(180,165,145,0.03) 0%, transparent 100%)',
          filter: 'blur(15px)',
        }}
      />
    </>
  )
})

/* Tiny star field — deterministic positions via seeded math */
function CanvasStarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      draw()
    }
    window.addEventListener('resize', resize)
    canvas.width = w
    canvas.height = h

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const starCount = Math.floor((w * h) / 1800)
      for (let i = 0; i < starCount; i++) {
        const x = (Math.sin(i * 127.1 + i * 311.7) * 0.5 + 0.5) * w
        const y = (Math.cos(i * 269.5 + i * 183.3) * 0.5 + 0.5) * h * 0.7
        const size = 0.3 + (Math.sin(i * 421.3) * 0.5 + 0.5) * 0.6
        const alpha = 0.1 + (Math.cos(i * 573.1) * 0.5 + 0.5) * 0.15
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 195, 220, ${alpha})`
        ctx.fill()
      }
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

/* Slow drifting ash — canvas 2D */
function AshDrift() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }[] = []
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: -0.02 - Math.random() * 0.04,
        vy: -0.01 - Math.random() * 0.02,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.01 + Math.random() * 0.02,
        life: Math.random() * 1000,
      })
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20 || p.y < -20) {
          p.x = w + 20
          p.y = Math.random() * h
          p.life = 0
        }
        const lifeAlpha = Math.min(p.life / 200, 1) * Math.max(0, 1 - p.life / 1500)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 110, 100, ${p.alpha * lifeAlpha})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
}
