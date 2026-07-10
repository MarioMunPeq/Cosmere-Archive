import { Suspense, useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { FAMILY_TREES } from '@/data/static/family-data'
import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import GenealogyScene from './GenealogyScene'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'

export default function GenealogyCanvas() {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const activeFamily: FamilyDefinition | null = selectedFamily
    ? (FAMILY_TREES.find((f) => f.id === selectedFamily) ?? null)
    : null

  const charMap = useMemo(() => {
    const m = new Map<string, Character>()
    for (const c of ALL_CHARACTERS) m.set(c.id, c)
    return m
  }, [])

  const titleMap = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const span of CHARACTER_SPANS) {
      if (span.titles.length > 0) m.set(span.id, span.titles)
    }
    return m
  }, [])

  const handleSelectFamily = useCallback((id: string) => {
    setSelectedFamily(id)
    setDetailId(null)
  }, [])

  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 1.7, 4], fov: 35, near: 0.1, far: 10 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <GenealogyScene
            selectedFamily={activeFamily}
            families={FAMILY_TREES}
            characters={charMap}
            charTitles={titleMap}
            detailId={detailId}
            onSelectCharacter={setDetailId}
            onSelectFamily={handleSelectFamily}
            onCloseDetail={() => setDetailId(null)}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
