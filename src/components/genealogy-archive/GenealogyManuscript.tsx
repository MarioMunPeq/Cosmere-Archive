import { useState, useRef, useEffect } from 'react'
import type { FamilyDefinition } from '@/types/family'
import type { Character } from '@/types/character'
import { PortraitGallery } from './PortraitGallery'

interface Props {
  families: FamilyDefinition[]
  focusFamilyId?: string
  charMap: Map<string, Character>
}

export function GenealogyManuscript({ families, focusFamilyId, charMap }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const prevFamilyRef = useRef(focusFamilyId)

  useEffect(() => {
    if (focusFamilyId !== prevFamilyRef.current) {
      prevFamilyRef.current = focusFamilyId
      setSelectedMemberId(null)
    }
  }, [focusFamilyId])

  const family = families.find((f) => f.id === focusFamilyId) ?? families[0]!

  return (
    <PortraitGallery
      family={family}
      charMap={charMap}
      selectedMemberId={selectedMemberId}
      onSelectMember={setSelectedMemberId}
    />
  )
}
