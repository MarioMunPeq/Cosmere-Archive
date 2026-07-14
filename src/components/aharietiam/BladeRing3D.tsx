'use client'
import { memo, useMemo, useState, useCallback } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import BladeSprite3D from './BladeSprite3D'
import type { HonorbladeData } from '@/types/aharietiam'

const TOTAL = 10
const BLADE_RADIUS = 2.3
const BLADE_Y = 0.02

type BladeItem = HonorbladeData & { angle: number }

function buildItems(): BladeItem[] {
  return [...HONORBLADES]
    .sort((a, b) => a.positionIndex - b.positionIndex)
    .map((h, i) => ({ ...h, angle: (i / TOTAL) * Math.PI * 2 - Math.PI / 2 }))
}

interface Props {
  onSelectBlade?: (id: string | null) => void
  selectedBlade?: string | null
}

export default memo(function BladeRing3D({ onSelectBlade, selectedBlade }: Props) {
  const blades = useMemo(() => buildItems(), [])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id)
  }, [])

  const handleSelect = useCallback(
    (id: string | null) => {
      onSelectBlade?.(id)
    },
    [onSelectBlade],
  )

  return (
    <>
      {blades.map((b) => {
        const bx = BLADE_RADIUS * Math.sin(b.angle)
        const bz = BLADE_RADIUS * Math.cos(b.angle)

        const dx = -bx
        const dz = -bz
        const angleToCenter = Math.atan2(dz, dx)
        const screenRotation = angleToCenter - Math.PI / 2

        const bladeState = hoveredId === b.id ? 'active' : hoveredId !== null ? 'dimmed' : null

        return (
          <BladeSprite3D
            key={b.id}
            id={b.id}
            image={`images/aharietam/${b.id}.webp`}
            position={[bx, BLADE_Y, bz]}
            screenRotation={screenRotation}
            hovered={bladeState}
            selected={selectedBlade === b.id}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        )
      })}
    </>
  )
})
