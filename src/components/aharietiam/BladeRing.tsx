'use client'
import { memo, useMemo } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import Blade3D from './Blade3D'
import TalnMemorial from './TalnMemorial'

/** Single source of truth for the ceremonial circle. */
const RING_RADIUS = 6.5
const BLADE_COUNT = 10
const BLADE_Y = 2.02 /* pommel embed depth — tip is at y=0, base extends upward */

interface Props {
  hoveredId: string | null
  selectedId: string | null
  focusedId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}

function circlePosition(index: number): [number, number, number] {
  const angle = (index / BLADE_COUNT) * Math.PI * 2 - Math.PI / 2
  return [RING_RADIUS * Math.cos(angle), BLADE_Y, RING_RADIUS * Math.sin(angle)]
}

/** Compute blade's Y-rotation so the flat face points toward circle center. */
function bladeRotationY(x: number, z: number): number {
  return Math.atan2(-x, z)
}

export default memo(function BladeRing({ hoveredId, selectedId, focusedId, onHover, onSelect }: Props) {
  const blades = useMemo(
    () =>
      [...HONORBLADES]
        .sort((a, b) => a.positionIndex - b.positionIndex)
        .map((h, i) => {
          const pos = circlePosition(i)
          return { ...h, pos, rotY: bladeRotationY(pos[0], pos[2]) }
        }),
    [],
  )

  const isFocusMode = focusedId !== null

  return (
    <>
      {blades.map((b) => {
        if (b.id === 'talenel') return null

        const isHovered = hoveredId === b.id
        const isSelected = selectedId === b.id
        const isFocused = focusedId === b.id
        const isDimmed = isFocusMode && !isFocused

        return (
          <Blade3D
            key={b.id}
            position={b.pos}
            rotationY={b.rotY}
            color={b.color}
            opacity={isDimmed ? 0.25 : 1}
            hovered={isHovered}
            selected={isSelected}
            focused={isFocused}
            onClick={() => onSelect(b.id)}
            onPointerEnter={() => onHover(b.id)}
            onPointerLeave={() => onHover(null)}
          />
        )
      })}

      {/* Taln's memorial — sits at the same procedural position as the 9th blade (index 8) */}
      <TalnMemorial
        position={circlePosition(8)}
        hovered={hoveredId === 'talenel'}
        selected={selectedId === 'talenel'}
        focused={focusedId === 'talenel'}
        onClick={() => onSelect('talenel')}
        onPointerEnter={() => onHover('talenel')}
        onPointerLeave={() => onHover(null)}
      />
    </>
  )
})
