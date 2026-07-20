'use client'
import { memo } from 'react'

export default memo(function SceneLights() {
  return (
    <>
      {/* Cold blue moonlight — primary directional */}
      <directionalLight
        position={[10, 18, -8]}
        intensity={2.0}
        color="#8899cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.002}
      />

      {/* Warm stone bounce — secondary fill from below */}
      <directionalLight position={[-3, -2, 4]} intensity={0.5} color="#c8a882" />

      {/* Cool fill from the side */}
      <directionalLight position={[-6, 4, 10]} intensity={0.25} color="#99aacc" />

      {/* Rim light — back edge of blades */}
      <directionalLight position={[0, 5, -12]} intensity={0.3} color="#aabbdd" />

      {/* Ambient — very soft */}
      <ambientLight intensity={0.08} color="#443322" />

      {/* Hemisphere — sky/ground separation */}
      <hemisphereLight args={['#8899bb', '#1a1510', 0.15]} />

      {/* Volumetric fog glow — center point */}
      <pointLight position={[0, 0.5, 0]} intensity={0.04} color="#6688aa" distance={12} decay={1.5} />
    </>
  )
})
