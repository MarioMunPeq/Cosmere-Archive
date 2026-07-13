'use client'
import { memo, useState, useMemo, useCallback } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import Honorblade from './Honorblade'
import type { HonorbladeData } from '@/types/aharietiam'

const TOTAL = 10
const BLADE_RADIUS = 23
const BW = 'clamp(20px, 2vh, 30px)'

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

export default memo(function HonorbladeRing({ onSelectBlade, selectedBlade }: Props) {
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
        const cx = 50, cy = 50
        const bx = cx + BLADE_RADIUS * Math.cos(b.angle)
        const by = cy + BLADE_RADIUS * Math.sin(b.angle)

        const dx = cx - bx
        const dy = cy - by
        const angleToCenter = Math.atan2(dy, dx)
        const TIP_DOWN = Math.PI / 2
        const rotation = angleToCenter - TIP_DOWN
        const rotationDeg = (rotation * 180) / Math.PI

        const bladeState =
          hoveredId === b.id ? 'active' : hoveredId !== null ? 'dimmed' : null

        return (
          <Honorblade
            key={b.id}
            id={b.id}
            name={b.name}
            title={b.title}
            order={b.order}
            surges={b.surges}
            description={b.description}
            books={b.books}
            connections={b.connections}
            color={b.color}
            image={`images/aharietam/${b.id}.webp`}
            left={`calc(${bx}% - ${BW} / 2)`}
            top={`calc(${by}% - clamp(300px, 38vh, 420px))`}
            rotation={rotationDeg}
            seed={b.positionIndex}
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
