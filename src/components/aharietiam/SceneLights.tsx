'use client'
import { memo } from 'react'

interface Props {
  light: boolean
}

/**
 * Late amber sun from one side, cold blue sky from the other. The blades need
 * both: warm metal on the lit edge, and a blue edge to prove they are polished.
 */
export default memo(function SceneLights({ light }: Props) {
  const shadowMap = light ? 1024 : 2048

  return (
    <>
      <directionalLight
        position={[-16, 15, 12]}
        intensity={2.5}
        color="#ffd2a2"
        castShadow={!light}
        shadow-mapSize-width={shadowMap}
        shadow-mapSize-height={shadowMap}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0004}
        shadow-normalBias={0.022}
      />

      <directionalLight position={[14, 10, -16]} intensity={1.6} color="#93b9de" />

      <directionalLight position={[2, 3, 17]} intensity={0.5} color="#bccbd8" />

      <hemisphereLight args={['#9fb4cc', '#3a2a1e', 0.58]} />

      <ambientLight intensity={0.32} color="#5c6a7e" />
    </>
  )
})
