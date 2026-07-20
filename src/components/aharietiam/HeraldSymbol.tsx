'use client'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * Faint projection of the herald's symbol behind the blade.
 * Rendered as a transparent plane with a procedurally generated symbol texture.
 * Opacity ~6%, extremely subtle, slow animated breathing.
 */

/* Generate a unique Vorin-inspired glyph per herald */
function createSymbolCanvas(id: string, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  const cx = 256,
    cy = 256

  /* Outer ring */
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.arc(cx, cy, 180, 0, Math.PI * 2)
  ctx.stroke()

  /* Inner ring */
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.arc(cx, cy, 130, 0, Math.PI * 2)
  ctx.stroke()

  /* Center glyph — numeric hash determines unique lines */
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.12

  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pseudoRand = (n: number) => (((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1

  /* Radiating spokes */
  const spokeCount = 6 + Math.floor(pseudoRand(0) * 6)
  for (let i = 0; i < spokeCount; i++) {
    const a = (i / spokeCount) * Math.PI * 2 + pseudoRand(i) * 0.3
    const inner = 40 + pseudoRand(i + 10) * 50
    const outer = 100 + pseudoRand(i + 20) * 70
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
    const midA = a + (pseudoRand(i + 30) - 0.5) * 0.4
    const midR = (inner + outer) / 2 + (pseudoRand(i + 40) - 0.5) * 15
    ctx.lineTo(cx + Math.cos(midA) * midR, cy + Math.sin(midA) * midR)
    ctx.lineTo(cx + Math.cos(a + 0.02) * outer, cy + Math.sin(a + 0.02) * outer)
    ctx.stroke()
  }

  /* Concentric arcs */
  for (let i = 0; i < 3; i++) {
    const r = 60 + i * 30
    const startA = pseudoRand(i + 50) * Math.PI * 2
    const endA = startA + 0.3 + pseudoRand(i + 60) * 0.4
    ctx.beginPath()
    ctx.arc(cx, cy, r, startA, endA)
    ctx.stroke()
  }

  /* Small dots at cardinal points */
  ctx.fillStyle = color
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 150 + pseudoRand(i + 70) * 20
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  return c
}

interface Props {
  id: string
  color: string
  bladePosition: [number, number, number]
  focused: boolean
}

export default memo(function HeraldSymbol({ id, color, bladePosition, focused }: Props) {
  const texture = useMemo(() => {
    const canvas = createSymbolCanvas(id, color)
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 2
    tex.needsUpdate = true
    return tex
  }, [id, color])

  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, _delta) => {
    if (!meshRef.current) return
    const m = meshRef.current.material as THREE.MeshBasicMaterial
    /* Slow breathing opacity — never visible, always a whisper */
    const breathe = Math.sin((performance.now() / 1000) * 0.15) * 0.02 + 0.06
    m.opacity = focused ? breathe : 0
  })

  if (!focused) return null

  return (
    <mesh
      ref={meshRef}
      position={[bladePosition[0], bladePosition[1] + 0.6, bladePosition[2]]}
      rotation={[0, 0, 0]}
      scale={[3.5, 3.5, 3.5]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.06}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        color={color}
      />
    </mesh>
  )
})
