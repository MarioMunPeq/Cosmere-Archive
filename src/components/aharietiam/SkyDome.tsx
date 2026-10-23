'use client'
import { memo, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeTexture, paintSky, paintSkyEnvironment } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'

/**
 * A painted dusk sky, and the same painting reused as the environment map.
 * That one decision does most of the work of making the blades look like
 * polished metal: every edge has a horizon in it.
 */
export default memo(function SkyDome() {
  const scene = useThree((state) => state.scene)

  const { skyTexture, environment } = useMemo(() => {
    const canvas = paintSky()
    const sky = makeTexture(canvas, { anisotropy: 8 })
    const env = makeTexture(paintSkyEnvironment(canvas), { anisotropy: 8 })
    env.mapping = THREE.EquirectangularReflectionMapping
    env.wrapS = THREE.RepeatWrapping
    env.wrapT = THREE.ClampToEdgeWrapping
    return { skyTexture: sky, environment: env }
  }, [])

  useEffect(() => {
    scene.environment = environment
    scene.environmentIntensity = 1
    return () => {
      scene.environment = null
    }
  }, [scene, environment])

  useDisposeOnUnmount(() => {
    skyTexture.dispose()
    environment.dispose()
  })

  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[150, 48, 32]} />
      <meshBasicMaterial map={skyTexture} side={THREE.BackSide} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  )
})
