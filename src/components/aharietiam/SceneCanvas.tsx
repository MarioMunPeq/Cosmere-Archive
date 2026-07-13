'use client'
import { memo, useRef, useLayoutEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function CameraSetup() {
  const { camera, gl, scene } = useThree()
  const called = useRef(false)

  useLayoutEffect(() => {
    if (called.current) return
    called.current = true
    const cam = camera as THREE.PerspectiveCamera
    cam.position.set(0, 3.5, 7)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    gl.setClearColor(0x000000, 0)
    scene.background = null
    console.log('[Camera] pos:', cam.position.toArray(), 'FOV:', cam.fov)
  }, [camera, gl, scene])

  return null
}

function DebugHelpers() {
  return (
    <>
      <axesHelper args={[5]} />
      <gridHelper args={[20, 20, '#444466', '#222244']} />
    </>
  )
}

interface Props {
  children: React.ReactNode
}

export default memo(function SceneCanvas({ children }: Props) {
  return (
    <Canvas
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 3.5, 7] }}
      gl={{ toneMapping: THREE.NoToneMapping, alpha: true }}
      style={{ background: 'transparent' }}> {}
      <CameraSetup />
      <DebugHelpers />
      {children}
    </Canvas>
  )
})
