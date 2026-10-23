'use client'
import { memo, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createRng } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'

interface Props {
  light: boolean
  reducedMotion: boolean
}

const FIELD = 22

export default memo(function Dust({ light, reducedMotion }: Props) {
  const count = light ? 70 : 210

  const { geometry, attribute, positions, baseHeights, phases, speeds } = useMemo(() => {
    const rng = createRng(0x6b3f1d)
    const points = new Float32Array(count * 3)
    const heights = new Float32Array(count)
    const phase = new Float32Array(count)
    const speed = new Float32Array(count)

    for (let index = 0; index < count; index++) {
      const angle = rng() * Math.PI * 2
      const radius = 1.5 + Math.sqrt(rng()) * 17
      points[index * 3] = Math.cos(angle) * radius
      points[index * 3 + 1] = 0.2 + rng() * 4.4
      points[index * 3 + 2] = Math.sin(angle) * radius
      heights[index] = points[index * 3 + 1] ?? 0
      phase[index] = rng() * Math.PI * 2
      speed[index] = 0.22 + rng() * 0.5
    }

    const geo = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(points, 3)
    geo.setAttribute('position', positionAttribute)
    geo.computeBoundingSphere()

    return {
      geometry: geo,
      attribute: positionAttribute,
      positions: points,
      baseHeights: heights,
      phases: phase,
      speeds: speed,
    }
  }, [count])

  useDisposeOnUnmount(() => geometry.dispose())

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return
    const time = clock.elapsedTime
    const step = Math.min(delta, 0.05)

    for (let index = 0; index < count; index++) {
      const cursor = index * 3
      const speed = speeds[index] ?? 0.3
      let x = (positions[cursor] ?? 0) + speed * step
      let z = (positions[cursor + 2] ?? 0) + speed * 0.17 * step

      if (x > FIELD) x -= FIELD * 2
      if (z > FIELD) z -= FIELD * 2

      positions[cursor] = x
      positions[cursor + 1] = (baseHeights[index] ?? 1) + Math.sin(time * 0.35 + (phases[index] ?? 0)) * 0.22
      positions[cursor + 2] = z
    }

    attribute.needsUpdate = true
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#e3c9a6"
        size={light ? 0.034 : 0.026}
        transparent
        opacity={0.38}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  )
})
