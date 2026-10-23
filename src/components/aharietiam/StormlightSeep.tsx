'use client'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeTexture, paintStormlight } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'

interface Props {
  reducedMotion: boolean
}

/**
 * Stormlight still bleeds from the fracture at the centre of the ring, too
 * faint to light the field, just bright enough to notice when the camera rests.
 */
export default memo(function StormlightSeep({ reducedMotion }: Props) {
  const texture = useMemo(() => makeTexture(paintStormlight(), { anisotropy: 4 }), [])
  useDisposeOnUnmount(() => texture.dispose())
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (!material) return
    material.opacity = reducedMotion ? 0.3 : 0.28 + Math.sin(clock.elapsedTime * 0.28) * 0.06
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]} renderOrder={1}>
        <planeGeometry args={[8.5, 8.5]} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.65, 0]} color="#8ac6d6" intensity={1.1} distance={10} decay={2} />
    </group>
  )
})
