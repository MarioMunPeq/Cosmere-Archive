'use client'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  hovered?: boolean
  selected?: boolean
  focused?: boolean
  onClick?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

export default memo(function TalnMemorial({
  position,
  hovered = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  /* --- Canvas textures for the memorial ground --- */
  const { groundTex, glowTex } = useMemo(() => {
    const gc = document.createElement('canvas')
    gc.width = 512
    gc.height = 512
    const gctx = gc.getContext('2d')!

    /* Circular depression */
    const cx = 256,
      cy = 300,
      r = 160
    const dep = gctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    dep.addColorStop(0, 'rgba(10,8,6,0.9)')
    dep.addColorStop(0.3, 'rgba(15,11,8,0.8)')
    dep.addColorStop(0.6, 'rgba(25,18,12,0.4)')
    dep.addColorStop(0.85, 'rgba(40,30,22,0.15)')
    dep.addColorStop(1, 'transparent')
    gctx.fillStyle = dep
    gctx.beginPath()
    gctx.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2)
    gctx.fill()

    /* Broken stone ring around depression */
    gctx.strokeStyle = 'rgba(50,38,28,0.2)'
    gctx.lineWidth = 3
    gctx.setLineDash([6, 8, 12, 6, 4, 10])
    gctx.beginPath()
    gctx.ellipse(cx, cy, r + 18, (r + 18) * 0.7, 0, 0, Math.PI * 2)
    gctx.stroke()

    /* Fracture lines radiating outward */
    gctx.strokeStyle = 'rgba(60,45,32,0.3)'
    gctx.lineWidth = 1.5
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.3
      const len = 20 + Math.random() * 50
      gctx.beginPath()
      gctx.moveTo(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.7 * 0.4)
      const mid = a + (Math.random() - 0.5) * 0.4
      gctx.lineTo(cx + Math.cos(mid) * (r * 0.7 + len), cy + Math.sin(mid) * (r * 0.7 * 0.7 + len * 0.7))
      gctx.stroke()
    }

    const ground = new THREE.CanvasTexture(gc)
    ground.anisotropy = 2

    /* Glowing fracture overlay */
    const glc = document.createElement('canvas')
    glc.width = 512
    glc.height = 512
    const glctx = glc.getContext('2d')!
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.2
      const len = 25 + Math.random() * 35
      const sx = cx + Math.cos(a) * r * 0.3
      const sy = cy + Math.sin(a) * r * 0.7 * 0.3
      const ex = cx + Math.cos(a) * (r * 0.5 + len)
      const ey = cy + Math.sin(a) * (r * 0.7 * 0.5 + len * 0.7)
      glctx.strokeStyle = `rgba(100,180,255,${0.08 + Math.random() * 0.06})`
      glctx.lineWidth = 1 + Math.random() * 1.5
      glctx.beginPath()
      glctx.moveTo(sx, sy)
      /* branched fracture */
      glctx.lineTo((sx + ex) / 2 + (Math.random() - 0.5) * 10, (sy + ey) / 2 + (Math.random() - 0.5) * 8)
      glctx.lineTo(ex, ey)
      glctx.stroke()
      /* secondary branch */
      if (Math.random() > 0.5) {
        glctx.strokeStyle = `rgba(100,180,255,${0.03 + Math.random() * 0.04})`
        glctx.beginPath()
        glctx.moveTo((sx + ex) / 2, (sy + ey) / 2)
        glctx.lineTo(ex + (Math.random() - 0.5) * 15, ey + (Math.random() - 0.5) * 12)
        glctx.stroke()
      }
    }

    const glow = new THREE.CanvasTexture(glc)
    glow.anisotropy = 2
    return { groundTex: ground, glowTex: glow }
  }, [])

  /* Dust particles */
  const dustRef = useRef<THREE.Points>(null)
  const dustGeo = useMemo(() => {
    const positions: number[] = []
    const offsets: number[] = []
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 0.2 + Math.random() * 0.6
      positions.push(Math.cos(angle) * dist, Math.random() * 0.3, Math.sin(angle) * dist)
      offsets.push(Math.random() * 100)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 1))
    return g
  }, [])

  const glowMeshRef = useRef<THREE.Mesh>(null)

  /* Animate glow intensity based on hover/selection */
  useFrame((_state, _delta) => {
    const t = performance.now() / 1000

    /* Glow mesh opacity — breathes gently, stronger when hovered */
    if (glowMeshRef.current) {
      const base = hovered ? 0.25 : 0.08
      const breathe = Math.sin(t * 0.5) * 0.5 + 0.5
      const m = glowMeshRef.current.material as THREE.MeshBasicMaterial
      m.opacity = base + breathe * (hovered ? 0.15 : 0.04)
    }

    /* Dust particles — slow upward drift */
    if (dustRef.current) {
      const posAcc = dustRef.current.geometry.attributes.position
      const offAcc = dustRef.current.geometry.attributes.offset
      if (!posAcc || !offAcc) return
      const arr: Float32Array = posAcc.array as Float32Array
      const offArr: Float32Array = offAcc.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        const idx = i * 3 + 1
        const o = offArr[i]!
        arr[idx] = arr[idx]! + Math.sin(t * 0.3 + o) * 0.0003
        if (arr[idx]! > 0.35) arr[idx] = 0
        if (arr[idx]! < 0) arr[idx] = 0.35
      }
      posAcc.needsUpdate = true
    }
  })

  return (
    <group position={position}>
      {/* Ground depression + broken ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial map={groundTex} transparent roughness={0.95} metalness={0} depthWrite={false} />
      </mesh>

      {/* Stormlight glow leaking from cracks */}
      <mesh ref={glowMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Vertical Stormlight beam — very subtle */}
      <mesh position={[0, 0.3, 0]}>
        <planeGeometry args={[0.08, 0.5]} />
        <meshBasicMaterial
          color="#4488cc"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating dust motes */}
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          color="#6699cc"
          size={0.015}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Hover highlight ring */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.65, 0.72, 32]} />
          <meshBasicMaterial
            color="#6699ff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
})
