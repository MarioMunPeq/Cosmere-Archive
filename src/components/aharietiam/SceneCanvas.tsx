'use client'
import { memo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  children: React.ReactNode
  onPointerMissed?: () => void
}

export default memo(function SceneCanvas({ children, onPointerMissed }: Props) {
  return (
    <Canvas
      camera={{ fov: 48, near: 0.1, far: 100, position: [0, 3.2, 15] }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
      shadows
      onPointerMissed={onPointerMissed}
      style={{ background: '#030205' }}
    >
      {children}
    </Canvas>
  )
})
