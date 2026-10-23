'use client'
import { memo, useMemo } from 'react'
import { createRng } from './scene-textures'
import { terrainHeightAt } from './terrain-height'

interface Props {
  light: boolean
}

interface Hill {
  position: [number, number, number]
  scale: [number, number, number]
  rotationY: number
}

/**
 * The far side of the rockbed. These are not mountains: Roshar's horizon here
 * is a low, eroded roll of stone, most of which the fog takes before the eye
 * can resolve its edges.
 */
export default memo(function Ridges({ light }: Props) {
  const hills = useMemo<Hill[]>(() => {
    const rng = createRng(0x2f6b91)
    const count = light ? 9 : 17
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + rng() * 0.22
      const radius = 40 + rng() * 38
      const width = 9 + rng() * 14
      const height = 1.8 + rng() * 3.4
      const depth = 7 + rng() * 12
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      return {
        position: [x, terrainHeightAt(x, z) - height * 0.42, z],
        scale: [width, height, depth],
        rotationY: rng() * Math.PI,
      }
    })
  }, [light])

  return (
    <>
      {hills.map((hill, index) => (
        <mesh key={index} position={hill.position} rotation={[0, hill.rotationY, 0]} scale={hill.scale} receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#46423d" roughness={1} metalness={0} flatShading envMapIntensity={0.2} />
        </mesh>
      ))}
    </>
  )
})
