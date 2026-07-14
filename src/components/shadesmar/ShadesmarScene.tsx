'use client'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import Ocean from './Ocean'
import CameraController from './CameraController'
import Cursor from './Cursor'
import Atmosphere from './Atmosphere'

export default function ShadesmarScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.16, 0.5], fov: 75, near: 0.01, far: 50 }}
      gl={{ antialias: true, alpha: false, toneMapping: 0 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000001))
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 2 }}
    >
      <ambientLight intensity={0.02} color="#111122" />
      <directionalLight position={[1, 0.3, 0.5]} intensity={0.04} color="#223355" />
      <directionalLight position={[-1, -0.2, 0.3]} intensity={0.02} color="#111133" />
      <Ocean />
      <Cursor />
      <CameraController />
      <Atmosphere />
    </Canvas>
  )
}
