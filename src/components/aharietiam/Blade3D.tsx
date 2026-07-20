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

  /* Hover dust particles — thin geometry ring at blade base */
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

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const t = performance.now() / 1000

    if (focused) {
      /* Gentle sway + breathing glow */
      meshRef.current.rotation.z = Math.sin(t * 0.4) * 0.002
      const breathe = 0.85 + Math.sin(t * 0.6) * 0.15
      if (glowRef.current) {
        const m = glowRef.current.material as THREE.MeshBasicMaterial
        m.opacity = 0.08 * breathe
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
      <mesh ref={glowRef} position={[0, 0.8, -0.08]} scale={[1.6, 1.8, 1]}>
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
          metalness={focused ? 0.65 : selected ? 0.55 : hovered ? 0.5 : 0.45}
          transparent={opacity < 1}
          opacity={opacity}
          emissive={focused ? color : selected ? '#554433' : hovered ? '#332211' : '#000000'}
          emissiveIntensity={focused ? 0.3 : selected ? 0.12 : hovered ? 0.05 : 0}
          envMapIntensity={focused ? 0.8 : hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Hover dust particles */}
      {(hovered || focused) && (
        <points geometry={dustGeo} position={[0, -0.05, 0]}>
          <pointsMaterial
            color={color}
            size={0.02}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  )
})
