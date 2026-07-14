'use client'
import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { MAX_BEADS, beadActive, beadPosition, beadGlowTarget } from '../ocean-globals'

export function useNearbyBeads() {
  const lastActiveIdx = useRef(-1)

  const findNearest = useCallback((origin: THREE.Vector3, maxDist: number): number => {
    let nearestIdx = -1
    let nearestDist = maxDist
    for (let i = 0; i < MAX_BEADS; i++) {
      if (!beadActive[i]) continue
      const dx = beadPosition[i * 3]! - origin.x
      const dy = beadPosition[i * 3 + 1]! - origin.y
      const dz = beadPosition[i * 3 + 2]! - origin.z
      const d2 = dx * dx + dy * dy + dz * dz
      if (d2 < nearestDist * nearestDist) {
        nearestDist = Math.sqrt(d2)
        nearestIdx = i
      }
    }
    return nearestIdx
  }, [])

  const glowBead = useCallback((index: number, intensity: number) => {
    if (index >= 0 && index < MAX_BEADS) {
      beadGlowTarget[index] = intensity
      lastActiveIdx.current = index
    }
  }, [])

  const rippleFrom = useCallback((centerIdx: number, radius: number, intensity: number) => {
    const cx = beadPosition[centerIdx * 3]!
    const cy = beadPosition[centerIdx * 3 + 1]!
    const cz = beadPosition[centerIdx * 3 + 2]!
    const r2 = radius * radius
    for (let i = 0; i < MAX_BEADS; i++) {
      if (!beadActive[i] || i === centerIdx) continue
      const dx = beadPosition[i * 3]! - cx
      const dy = beadPosition[i * 3 + 1]! - cy
      const dz = beadPosition[i * 3 + 2]! - cz
      const d2 = dx * dx + dy * dy + dz * dz
      if (d2 < r2) {
        beadGlowTarget[i] = Math.max(beadGlowTarget[i]!, intensity * (1 - Math.sqrt(d2) / radius))
      }
    }
  }, [])

  return { findNearest, glowBead, rippleFrom }
}
