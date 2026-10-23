'use client'
import { memo, useMemo } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'
import { BLADE_FORMS } from './blade-forms'
import { makeTexture, paintEdgeLight, paintMound } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'
import Blade from './Blade'

export const RING_RADIUS = 6.3
export const BLADE_COUNT = 10

interface Props {
  /** Drops shadows and loose stones on phones. */
  light: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Where a blade stands. Kept in one place so the camera can walk to the same
 * point the field used when it planted the blade.
 */
export function bladePlacement(index: number): [number, number, number] {
  const angle = (index / BLADE_COUNT) * Math.PI * 2 - Math.PI / 2
  return [RING_RADIUS * Math.cos(angle), 0, RING_RADIUS * Math.sin(angle)]
}

/** The flat of the blade faces the centre of the ring, with a hand-set error. */
function circleFacing(x: number, z: number, faceTurn: number): number {
  return Math.atan2(-x, -z) + (faceTurn * Math.PI) / 180
}

export default memo(function BladeField({ light, selectedId, onSelect }: Props) {
  const moundTexture = useMemo(() => makeTexture(paintMound(), { anisotropy: 4 }), [])
  const edgeTexture = useMemo(() => makeTexture(paintEdgeLight(), { anisotropy: 4 }), [])
  useDisposeOnUnmount(() => {
    moundTexture.dispose()
    edgeTexture.dispose()
  })

  const blades = useMemo(
    () =>
      [...HONORBLADES]
        .sort((a, b) => a.positionIndex - b.positionIndex)
        .map((blade, index) => {
          const position = bladePlacement(index)
          const form = BLADE_FORMS[blade.id]
          if (!form) return null
          return {
            blade,
            form,
            position,
            rotationY: circleFacing(position[0], position[2], form.faceTurn),
          }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [],
  )

  const focused = selectedId !== null

  return (
    <>
      {blades.map(({ blade, form, position, rotationY }) => (
        <Blade
          key={blade.id}
          blade={blade}
          form={form}
          position={position}
          rotationY={rotationY}
          moundTexture={moundTexture}
          edgeTexture={edgeTexture}
          pebbleCount={light ? 3 : 6}
          selected={blade.id === selectedId}
          focused={focused}
          onSelect={() => onSelect(blade.id)}
        />
      ))}
    </>
  )
})
