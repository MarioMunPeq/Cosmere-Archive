'use client'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function createBladeGeometry(): THREE.BufferGeometry {
  const s = new THREE.Shape()
  s.moveTo(0, 2.6)
  s.lineTo(0.22, 1.6)
  s.lineTo(0.28, 0.6)
  s.quadraticCurveTo(0.28, 0.1, 0.32, -0.3)
  s.lineTo(0.48, -0.3)
  s.lineTo(0.48, -0.48)
  s.lineTo(0.14, -0.48)
  s.lineTo(0.14, -1.6)
  s.lineTo(0.1, -1.8)
  s.lineTo(0.16, -1.95)
  s.lineTo(0, -2.1)
  s.lineTo(-0.16, -1.95)
  s.lineTo(-0.1, -1.8)
  s.lineTo(-0.14, -1.6)
  s.lineTo(-0.14, -0.48)
  s.lineTo(-0.48, -0.48)
  s.lineTo(-0.48, -0.3)
  s.quadraticCurveTo(-0.28, 0.1, -0.28, 0.6)
  s.lineTo(-0.22, 1.6)
  s.lineTo(0, 2.6)

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
  })
  geo.translate(0, 0, -0.03)
  geo.rotateY(Math.PI)
  geo.computeVertexNormals()
  return geo
}

const BLADE_GEO = createBladeGeometry()

interface Props {
  position: [number, number, number]
  rotationY: number
  color: string
  opacity?: number
  hovered?: boolean
  selected?: boolean
  focused?: boolean
  onClick?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

export default memo(function Blade3D({
  position,
  rotationY,
  color,
  opacity = 1,
  hovered = false,
  selected = false,
  focused = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const stormlightRef = useRef<THREE.Points>(null)

  /* Hover/focus dust particles */
  const dustGeo = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.08 + Math.random() * 0.15
      positions.push(Math.cos(a) * r, Math.random() * 0.1, Math.sin(a) * r)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return g
  }, [])

  /* Focus Stormlight particles — tiny floating motes around blade */
  const stormlightGeo = useMemo(() => {
    const positions: number[] = []
    const offsets: number[] = []
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.15 + Math.random() * 0.4
      const height = (Math.random() - 0.5) * 1.8
      positions.push(Math.cos(angle) * radius, height + 1.2, Math.sin(angle) * radius)
      offsets.push(Math.random() * 100)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 1))
    return g
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const t = performance.now() / 1000

    if (focused) {
      /* Gentle sway */
      meshRef.current.rotation.z = Math.sin(t * 0.4) * 0.002

      /* Breathing glow */
      if (glowRef.current) {
        const breathe = 0.85 + Math.sin(t * 0.6) * 0.15
        const m = glowRef.current.material as THREE.MeshBasicMaterial
        m.opacity = 0.15 * breathe
      }

      /* Stormlight particles drift */
      if (stormlightRef.current) {
        const posAcc = stormlightRef.current.geometry.attributes.position
        const offAcc = stormlightRef.current.geometry.attributes.offset
        if (posAcc && offAcc) {
          const arr = posAcc.array as Float32Array
          const offArr = offAcc.array as Float32Array
          for (let i = 0; i < arr.length / 3; i++) {
            const yIdx = i * 3 + 1
            const o = offArr[i]!
            arr[yIdx] = arr[yIdx]! + Math.sin(t * 0.5 + o) * 0.0002
            const xIdx = i * 3
            arr[xIdx] = arr[xIdx]! + Math.cos(t * 0.3 + o * 1.3) * 0.0001
          }
          posAcc.needsUpdate = true
        }
      }
    } else if (hovered) {
      meshRef.current.rotation.z = Math.sin(t * 1.2) * 0.001
    } else {
      meshRef.current.rotation.z *= Math.pow(0.9, delta * 60)
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Glow plane — subtle bloom behind blade */}
      <mesh ref={glowRef} position={[0, 0.8, -0.12]} scale={[1.8, 2.0, 1]}>
        <planeGeometry args={[0.6, 3.0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Stormlight particles — only in focus mode */}
      {focused && (
        <points ref={stormlightRef} geometry={stormlightGeo}>
          <pointsMaterial
            color={color}
            size={0.015}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}

      {/* Main blade */}
      <mesh
        ref={meshRef}
        geometry={BLADE_GEO}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          roughness={hovered || focused ? 0.2 : 0.35}
          metalness={focused ? 0.75 : selected ? 0.55 : hovered ? 0.5 : 0.45}
          transparent={opacity < 1}
          opacity={opacity}
          emissive={focused ? color : selected ? '#554433' : hovered ? '#332211' : '#000000'}
          emissiveIntensity={focused ? 0.45 : selected ? 0.12 : hovered ? 0.05 : 0}
          envMapIntensity={focused ? 1.2 : hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Hover/focus dust particles at base */}
      {(hovered || focused) && (
        <points geometry={dustGeo} position={[0, -0.05, 0]}>
          <pointsMaterial
            color={color}
            size={0.02}
            transparent
            opacity={focused ? 0.6 : 0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  )
})
