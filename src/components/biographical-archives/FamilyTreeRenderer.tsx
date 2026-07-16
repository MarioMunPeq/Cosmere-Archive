import { useMemo } from 'react'
import { FAMILY_TREES } from '@/data/static/family-data'
import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_SPANS } from '@/data/static/timeline'
import { computeGenealogyLayout } from '@/utils/genealogy-layout'
import CharacterPortrait from './CharacterPortrait'
import type { Character } from '@/types/character'

interface Props {
  activeFamilyId: string
  selectedMemberId: string | null
  onSelectMember: (memberId: string, charId?: string) => void
}

export default function FamilyTreeRenderer({ activeFamilyId, selectedMemberId, onSelectMember }: Props) {
  const activeFamily = useMemo(() => FAMILY_TREES.find((f) => f.id === activeFamilyId), [activeFamilyId])

  const charMap = useMemo(() => {
    const map = new Map<string, Character>()
    for (const c of ALL_CHARACTERS) map.set(c.id, c)
    return map
  }, [])

  const titleMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const span of CHARACTER_SPANS) {
      if (span.titles.length > 0) {
        map.set(span.id, span.titles)
      }
    }
    return map
  }, [])

  const layout = useMemo(() => {
    if (!activeFamily) return null
    return computeGenealogyLayout(activeFamily, charMap, titleMap)
  }, [activeFamily, charMap, titleMap])

  if (!activeFamily || !layout) return null

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h3
          className="font-serif text-[clamp(14px,1.4vw,20px)] font-bold tracking-[0.04em]"
          style={{ color: '#2d1a0e' }}
        >
          {activeFamily.name}
        </h3>
        {activeFamily.description && (
          <p className="font-serif text-[10px] italic mt-1" style={{ color: 'rgba(80,60,40,0.4)' }}>
            {activeFamily.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <svg
          width={layout.svgW}
          height={layout.svgH}
          viewBox={`0 0 ${layout.svgW} ${layout.svgH}`}
          className="max-w-none"
          style={{ minWidth: layout.svgW }}
        >
          <rect width={layout.svgW} height={layout.svgH} fill="none" />

          {layout.connections.map((conn, i) => (
            <g key={i}>
              <path d={conn.path} fill="none" stroke="rgba(80,60,40,0.04)" strokeWidth="4" />
              <path
                d={conn.path}
                fill="none"
                stroke="rgba(80,60,40,0.5)"
                strokeWidth={conn.isSpouse ? 1.2 : 1.8}
                strokeDasharray={conn.isSpouse ? '3 3' : 'none'}
              />
              {!conn.isSpouse && <path d={conn.path} fill="none" stroke="rgba(80,60,40,0.15)" strokeWidth="0.5" />}
            </g>
          ))}

          {Array.from(layout.positions.entries()).map(([memberId, pos]) => {
            const member = activeFamily.members.find((m) => m.id === memberId)
            if (!member) return null
            const char = member.characterId ? (charMap.get(member.characterId) ?? null) : null
            const isSelected = selectedMemberId === memberId
            const isDeceased = member.isDeceased ?? char === undefined

            return (
              <g
                key={memberId}
                onClick={() => onSelectMember(memberId, member.characterId)}
                style={{ cursor: 'pointer' }}
              >
                <foreignObject x={pos.x - 36} y={pos.y - 36} width={72} height={72}>
                  <div className="flex items-center justify-center w-full h-full">
                    <CharacterPortrait name={char?.name ?? member.name} isDeceased={isDeceased} size={68} />
                  </div>
                </foreignObject>

                <text
                  x={pos.x}
                  y={pos.y + 44}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fill="rgba(60,40,25,0.6)"
                  style={{ pointerEvents: 'none' }}
                >
                  {char?.name ?? member.name}
                </text>

                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={38}
                    fill="none"
                    stroke="rgba(180,160,90,0.3)"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
