'use client'
import { memo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CameraSetup() {
  const called = useRef(false)

  useFrame(({ camera }) => {
    if (called.current) return
    called.current = true
    const cam = camera as THREE.PerspectiveCamera
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  })

  return null
}

interface Props {
  children: React.ReactNode
}

export default memo(function SceneCanvas({ children }: Props) {
  return (
    <Canvas
      camera={{ fov: 35, near: 0.1, far: 100, position: [0, 12, 6] }}
      gl={{ toneMapping: THREE.NoToneMapping, alpha: true }}
      style={{ background: 'transparent' }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0)
        scene.background = null
      }}
    >
      <CameraSetup />
      {children}
    </Canvas>
  )
})
