'use client'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createRng, makeTexture, paintFog } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'

interface Props {
  light: boolean
  reducedMotion: boolean
}

interface Sheet {
  x: number
  z: number
  y: number
  size: [number, number]
  angle: number
  opacity: number
  phase: number
}

/**
 * The fog is not one volume but several ground-hugging sheets that drift at
 * different speeds. The eye reads the overlap as depth without the cost of a
 * raymarched medium.
 */
export default memo(function FogVolumes({ light, reducedMotion }: Props) {
  const texture = useMemo(() => makeTexture(paintFog(), { anisotropy: 4 }), [])
  useDisposeOnUnmount(() => texture.dispose())

  const sheets = useMemo<Sheet[]>(() => {
    const rng = createRng(0x41d7aa)
    const count = light ? 5 : 9
    return Array.from({ length: count }, () => {
      const angle = rng() * Math.PI * 2
      const radius = 5 + rng() * 27
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 0.35 + rng() * 1.35,
        size: [19 + rng() * 20, 14 + rng() * 16],
        angle: rng() * Math.PI,
        opacity: 0.42 + rng() * 0.28,
        phase: rng() * 20,
      }
    })
  }, [light])

  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return
    const time = clock.elapsedTime
    const step = Math.min(delta, 0.05)
    for (let index = 0; index < sheets.length; index++) {
      const mesh = refs.current[index]
      const sheet = sheets[index]
      if (!mesh || !sheet) continue
      mesh.position.x = sheet.x + Math.sin(time * 0.022 + sheet.phase) * 1.6
      mesh.position.z = sheet.z + Math.cos(time * 0.017 + sheet.phase * 1.4) * 1.2
      mesh.position.y = sheet.y + Math.sin(time * 0.05 + sheet.phase) * 0.08
      mesh.rotation.z += step * 0.006
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = sheet.opacity * (0.86 + Math.sin(time * 0.11 + sheet.phase) * 0.14)
    }
  })

  return (
    <>
      {sheets.map((sheet, index) => (
        <mesh
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          position={[sheet.x, sheet.y, sheet.z]}
          rotation={[-Math.PI / 2, 0, sheet.angle]}
          scale={[sheet.size[0], sheet.size[1], 1]}
          renderOrder={3}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            color="#dfcfb9"
            transparent
            opacity={sheet.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
})
