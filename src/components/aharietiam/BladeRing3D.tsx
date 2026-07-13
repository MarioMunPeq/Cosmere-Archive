'use client'
import { memo, useMemo, useState, useCallback } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import BladeSprite3D from './BladeSprite3D'
import type { HonorbladeData } from '@/types/aharietiam'

const TOTAL = 10
const BLADE_RADIUS = 0.9
const BLADE_Y = 0.2

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
      console.log(`[BladeRing] Select ${id}`)
      onSelectBlade?.(id)
    },
    [onSelectBlade],
  )

  console.log(
    '[BladeRing] Blades:',
    blades.map((b) => ({
      id: b.id,
      angle: b.angle,
      bx: BLADE_RADIUS * Math.sin(b.angle),
      bz: BLADE_RADIUS * Math.cos(b.angle),
    })),
  )

  return (
    <>
      {/* Debug: big red plane at center */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshBasicMaterial color="red" side={2} />
      </mesh>

      {/* Debug: big green plane at camera direction */}
      <mesh position={[0, 0.5, 4]}>
        <planeGeometry args={[3, 6]} />
        <meshBasicMaterial color="green" side={2} />
      </mesh>

      {blades.map((b) => {
        const bx = BLADE_RADIUS * Math.sin(b.angle)
        const bz = BLADE_RADIUS * Math.cos(b.angle)

        const bladeState =
          hoveredId === b.id ? 'active' : hoveredId !== null ? 'dimmed' : null

        return (
          <BladeSprite3D
            key={b.id}
            id={b.id}
            image={`images/aharietam/${b.id}.webp`}
            position={[bx, BLADE_Y, bz]}
            screenRotation={0}
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
