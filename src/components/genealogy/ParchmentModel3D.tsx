import { useMemo, useCallback, useEffect } from 'react'
import { DoubleSide } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { renderGenealogyTexture, findClickRegion } from '@/utils/render-genealogy-texture'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'

const PAGE_W = 0.35
const PAGE_H = 0.45
const GUTTER = 0.02
const THICK = 0.003
const CANVAS_W = 1024
const CANVAS_H = 1280

interface Props {
  family: FamilyDefinition
  families: FamilyDefinition[]
  characters: Map<string, Character>
  charTitles: Map<string, string[]>
  detailId: string | null
  selectedId: string | null
  onSelectCharacter: (id: string) => void
  onSelectFamily: (id: string) => void
  onCloseDetail: () => void
}

export default function ParchmentModel3D(props: Props) {
  const { leftTexture, rightTexture, regions } = useMemo(
    () =>
      renderGenealogyTexture(
        props.family,
        props.families,
        props.characters,
        props.charTitles,
        props.detailId,
        props.selectedId,
      ),
    [props.family, props.families, props.characters, props.charTitles, props.detailId, props.selectedId],
  )

  // Dispose textures on unmount
  useEffect(
    () => () => {
      leftTexture.dispose()
      rightTexture.dispose()
    },
    [leftTexture, rightTexture],
  )

  const leftX = -(PAGE_W + GUTTER) / 2
  const rightX = (PAGE_W + GUTTER) / 2
  const E = 0.001

  const handleClick = useCallback(
    (page: 'left' | 'right') => (event: ThreeEvent<MouseEvent>) => {
      const uv = event.uv
      if (!uv) return

      const px = uv.x * CANVAS_W
      const py = (1 - uv.y) * CANVAS_H

      const region = findClickRegion(px, py, page, regions)
      if (!region) return
      if (region.type === 'family' || region.type === 'switchFamily') props.onSelectFamily(region.id)
      else if (region.type === 'character') props.onSelectCharacter(region.id)
    },
    [props.onSelectFamily, props.onSelectCharacter, regions],
  )

  return (
    <group position={[0, 0.016, 0]}>
      {/* ── Left page ── */}
      <group position={[leftX, 0, 0]}>
        <mesh>
          <boxGeometry args={[PAGE_W, THICK, PAGE_H]} />
          <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} side={DoubleSide} />
        </mesh>
        <group position={[0, THICK / 2 + E, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick('left')}>
            <planeGeometry args={[PAGE_W, PAGE_H]} />
            <meshStandardMaterial map={leftTexture} color="#f5efe6" roughness={0.8} metalness={0} side={DoubleSide} />
          </mesh>
        </group>
        <mesh position={[0, 0, -PAGE_H / 2]}>
          <planeGeometry args={[PAGE_W, THICK]} />
          <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} />
        </mesh>
      </group>

      {/* ── Right page ── */}
      <group position={[rightX, 0, 0]}>
        <mesh>
          <boxGeometry args={[PAGE_W, THICK, PAGE_H]} />
          <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} side={DoubleSide} />
        </mesh>
        <group position={[0, THICK / 2 + E, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick('right')}>
            <planeGeometry args={[PAGE_W, PAGE_H]} />
            <meshStandardMaterial map={rightTexture} color="#f5efe6" roughness={0.8} metalness={0} side={DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Center fold shadow */}
      <mesh position={[0, -THICK / 2, 0]}>
        <planeGeometry args={[GUTTER, PAGE_H]} />
        <meshStandardMaterial color="#000" transparent opacity={0.04} roughness={1} metalness={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
