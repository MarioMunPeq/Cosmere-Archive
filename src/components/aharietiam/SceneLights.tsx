'use client'
import { memo } from 'react'

export default memo(function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.15}
        color="#8899bb"
      />
      <directionalLight
        position={[0, 6, -6]}
        intensity={0.2}
        color="#665544"
      />
      <hemisphereLight
        args={['#332211', '#050308', 0.3]}
      />
    </>
  )
})
