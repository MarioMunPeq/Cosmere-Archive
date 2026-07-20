'use client'
import { memo, useMemo } from 'react'
import * as THREE from 'three'

export default memo(function Platform3D() {
  /* Stone texture — noise + cracks + glyph carvings */
  const stoneMap = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 2048
    const ctx = c.getContext('2d')!
    const d = ctx.createImageData(2048, 2048)
    const pix = d.data

    for (let i = 0; i < pix.length; i += 4) {
      const x = (i / 4) % 2048
      const y = Math.floor(i / 4 / 2048)
      const cx = x / 2048 - 0.5
      const cy = y / 2048 - 0.5
      const dist = Math.sqrt(cx * cx + cy * cy)

      /* Base noise — weathered Roshar stone */
      const noise =
        (Math.sin(x * 0.04 + y * 0.03) * Math.cos(y * 0.05 - x * 0.04) * 0.5 + 0.5) * 0.12 +
        (Math.sin(x * 0.09 + y * 0.11) * 0.3 + 0.3) * 0.06

      let r = 135 + noise * 30
      let g = 122 + noise * 26
      let b = 104 + noise * 22

      /* Edge wear — darker toward perimeter */
      if (dist > 0.35) {
        const e = (dist - 0.35) / 0.15
        r -= e * 50
        g -= e * 44
        b -= e * 38
      }

      /* Random cracks */
      const crack1 = Math.sin(x * 0.12 + y * 0.09) * Math.cos(y * 0.14 - x * 0.08)
      const crack2 = Math.sin(x * 0.07 + y * 0.13 + 1.5) * Math.cos(y * 0.06 - x * 0.11)
      if (crack1 > 0.85) {
        const ck = (crack1 - 0.85) * 8
        r -= ck * 40
        g -= ck * 36
        b -= ck * 30
      }
      if (crack2 > 0.88) {
        const ck = (crack2 - 0.88) * 10
        r -= ck * 30
        g -= ck * 28
        b -= ck * 24
      }
      /* Small pebble marks */
      if (Math.sin(x * 0.3 + y * 0.27) > 0.92) {
        r -= 15
        g -= 13
        b -= 10
      }

      pix[i] = Math.max(0, Math.min(255, r))
      pix[i + 1] = Math.max(0, Math.min(255, g))
      pix[i + 2] = Math.max(0, Math.min(255, b))
      pix[i + 3] = 255
    }
    ctx.putImageData(d, 0, 0)

    /* Radial glyph ring (Vorin-style carvings) */
    ctx.strokeStyle = 'rgba(60,45,30,0.12)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const r1 = 850 + Math.sin(i * 3.7) * 40
      const r2 = r1 + 25 + Math.sin(i * 2.3) * 12
      ctx.beginPath()
      ctx.moveTo(1024 + Math.cos(a) * r1, 1024 + Math.sin(a) * r1)
      ctx.lineTo(1024 + Math.cos(a) * r2, 1024 + Math.sin(a) * r2)
      ctx.stroke()
    }

    /* Inner ring — older faded engravings */
    ctx.strokeStyle = 'rgba(70,50,35,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.2
      const r1 = 240 + Math.sin(i * 5.1) * 30
      const r2 = r1 + 18
      ctx.beginPath()
      ctx.arc(1024, 1024, r1, a - 0.12, a + 0.12)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(1024, 1024, r2, a + 0.3, a + 0.5)
      ctx.stroke()
    }

    /* Broken edge texture — jagged perimeter */
    ctx.strokeStyle = 'rgba(40,30,22,0.08)'
    ctx.lineWidth = 2
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const jag = Math.sin(i * 4.1) * 12 + Math.sin(i * 7.3) * 6
      ctx.beginPath()
      ctx.moveTo(1024 + Math.cos(a) * 920, 1024 + Math.sin(a) * 920)
      ctx.lineTo(1024 + Math.cos(a + 0.01) * (920 + jag), 1024 + Math.sin(a + 0.01) * (920 + jag))
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 4
    return tex
  }, [])

  /* AO map — edge darkening */
  const aoMap = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 1024
    const ctx = c.getContext('2d')!
    const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0)')
    grad.addColorStop(0.75, 'rgba(0,0,0,0.15)')
    grad.addColorStop(0.92, 'rgba(0,0,0,0.4)')
    grad.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(512, 512, 512, 0, Math.PI * 2)
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* Main stone disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[9, 96]} />
        <meshStandardMaterial map={stoneMap} aoMap={aoMap} roughness={0.9} metalness={0} color="#8a7d6e" />
      </mesh>

      {/* Edge thickness ring — broken/worn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]} receiveShadow>
        <ringGeometry args={[8.4, 9.4, 64]} />
        <meshStandardMaterial color="#4a3d2e" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Center ceremonial engraving */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[0.3, 0.9, 48]} />
        <meshStandardMaterial color="#3a3028" roughness={0.5} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner ceremonial ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.042, 0]}>
        <ringGeometry args={[1.8, 2.1, 48]} />
        <meshStandardMaterial
          color="#4a3d2e"
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
          opacity={0.4}
          transparent
        />
      </mesh>

      {/* Scattered tiny pebbles — decorative ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2 + Math.sin(i * 2.7) * 0.08
        const r = 6 + Math.sin(i * 3.1) * 0.6
        const x = Math.cos(a) * r
        const z = Math.sin(a) * r
        return (
          <mesh key={i} position={[x, -0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04 + Math.sin(i * 2.3) * 0.02, 6]} />
            <meshStandardMaterial color="#5a4d3e" roughness={0.95} />
          </mesh>
        )
      })}
    </group>
  )
})
