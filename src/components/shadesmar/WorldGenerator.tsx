'use client'
import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import {
  MAX_BEADS,
  INITIAL_BEADS,
  beadActive,
  beadPosition,
  beadPhase,
  beadSpeed,
  beadGlowTarget,
} from './ocean-globals'

const SPAWN_RADIUS_MIN = 0.4
const SPAWN_RADIUS_MAX = 5
const RECYCLE_DIST = 7
const Y_SPREAD = 0.15

function pRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function spawnBead(index: number, cx: number, cy: number, cz: number) {
  const angle = pRand(index * 7 + 1) * Math.PI * 2
  const radius = SPAWN_RADIUS_MIN + pRand(index * 13 + 3) * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN)
  beadPosition[index * 3] = cx + Math.cos(angle) * radius
  beadPosition[index * 3 + 1] = cy + (pRand(index * 5 + 9) - 0.5) * Y_SPREAD
  beadPosition[index * 3 + 2] = cz + Math.sin(angle) * radius
  beadPhase[index] = pRand(index * 11 + 7) * Math.PI * 2
  beadSpeed[index] = 0.15 + pRand(index * 17 + 5) * 0.15
  beadGlowTarget[index] = 0
  beadActive[index] = 1
}

export function useWorldGenerator() {
  const activeCount = useRef(INITIAL_BEADS)
  const lastCamPos = useRef(new THREE.Vector3())
  const totalDist = useRef(0)
  const initialized = useRef(false)

  const init = useCallback(() => {
    if (initialized.current) return
    initialized.current = true
    for (let i = 0; i < INITIAL_BEADS; i++) {
      spawnBead(i, 0, 0, 0)
    }
    for (let i = INITIAL_BEADS; i < MAX_BEADS; i++) {
      beadActive[i] = 0
    }
  }, [])

  const update = useCallback((camX: number, camY: number, camZ: number) => {
    const dx = camX - lastCamPos.current.x
    const dz = camZ - lastCamPos.current.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    totalDist.current += dist

    const newlyActivated = Math.min(Math.floor(totalDist.current * 0.3), MAX_BEADS - activeCount.current)
    for (let i = 0; i < newlyActivated; i++) {
      const idx = activeCount.current + i
      if (idx < MAX_BEADS) {
        spawnBead(idx, camX, camY, camZ)
      }
    }
    activeCount.current += newlyActivated

    for (let i = 0; i < activeCount.current; i++) {
      if (!beadActive[i]) continue
      const bx = beadPosition[i * 3]!
      const bz = beadPosition[i * 3 + 2]!
      const sx = bx - camX
      const sz = bz - camZ
      if (sx * sx + sz * sz > RECYCLE_DIST * RECYCLE_DIST) {
        spawnBead(i, camX, camY, camZ)
      }
    }

    lastCamPos.current.set(camX, camY, camZ)
  }, [])

  return { init, update }
}
