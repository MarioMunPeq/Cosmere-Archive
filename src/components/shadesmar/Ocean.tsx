'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  MAX_BEADS,
  BEAD_RADIUS,
  beadActive,
  beadPosition,
  beadPhase,
  beadSpeed,
  beadGlow,
  beadGlowTarget,
} from './ocean-globals'
import { useWorldGenerator } from './WorldGenerator'

const BREATHE_AMP = 0.02
const GLOW_LERP = 3
const dummy = new THREE.Object3D()

export default function Ocean() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const { init, update } = useWorldGenerator()

  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(BEAD_RADIUS, 12, 8)
    return g
  }, [])

  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a0a12),
      roughness: 0.35,
      metalness: 0,
      transparent: true,
      opacity: 0.85,
      envMapIntensity: 0.6,
      clearcoat: 0.08,
      clearcoatRoughness: 0.3,
    })
    return m
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const camPos = state.camera.position
    update(camPos.x, camPos.y, camPos.z)

    for (let i = 0; i < MAX_BEADS; i++) {
      if (!beadActive[i]) {
        dummy.visible = false
        meshRef.current.setMatrixAt(i, dummy.matrix)
        continue
      }

      beadGlow[i] = beadGlow[i]! + (beadGlowTarget[i]! - beadGlow[i]!) * Math.min(1, GLOW_LERP * delta)
      beadGlowTarget[i] = beadGlowTarget[i]! * 0.98

      const breath = Math.sin(t * beadSpeed[i]! + beadPhase[i]!) * BREATHE_AMP
      const glowFactor = beadGlow[i]! * 2.0

      dummy.position.set(beadPosition[i * 3]!, beadPosition[i * 3 + 1]! + breath, beadPosition[i * 3 + 2]!)
      dummy.scale.setScalar(1 + glowFactor * 0.3)
      dummy.visible = true
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geom, mat, MAX_BEADS]} />
}
