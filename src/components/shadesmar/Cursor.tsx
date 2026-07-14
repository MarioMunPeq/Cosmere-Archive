'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useNearbyBeads } from './hooks/useNearbyBeads'

const CURSOR_GLOW_RADIUS = 0.4
const RIPPLE_RADIUS = 1.2
const RIPPLE_STRENGTH = 0.5

export default function Cursor() {
  const lightRef = useRef<THREE.PointLight>(null!)
  const cursorPos = useRef(new THREE.Vector3())
  const { findNearest, glowBead, rippleFrom } = useNearbyBeads()
  const lastNearest = useRef(-1)

  useEffect(() => {
    document.body.style.cursor = 'none'
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  useFrame((state) => {
    const mouse = state.pointer
    const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5)
    vec.unproject(state.camera)
    const dir = vec.sub(state.camera.position).normalize()
    const dist = -state.camera.position.y / dir.y
    cursorPos.current.copy(state.camera.position).add(dir.multiplyScalar(dist))

    if (lightRef.current) {
      lightRef.current.position.copy(cursorPos.current)
    }

    const nearest = findNearest(cursorPos.current, CURSOR_GLOW_RADIUS)
    if (nearest !== lastNearest.current) {
      if (lastNearest.current >= 0) {
        glowBead(lastNearest.current, 0)
      }
    }
    if (nearest >= 0) {
      glowBead(nearest, 1.0)
      rippleFrom(nearest, RIPPLE_RADIUS, RIPPLE_STRENGTH)
    }
    lastNearest.current = nearest
  })

  return <pointLight ref={lightRef} color="#aaccff" intensity={0.15} distance={2} decay={2} />
}
