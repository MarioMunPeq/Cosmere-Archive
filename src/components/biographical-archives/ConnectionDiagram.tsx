import { useMemo } from 'react'
import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { RELATIONSHIP_LABELS } from '@/types/relationships'
import PortraitMedallion from './PortraitMedallion'
import type { Character } from '@/types/character'

interface Props {
  selectedId: string
  onNavigateCharacter: (id: string) => void
}

function getConnectionLabel(type: string): string {
  return RELATIONSHIP_LABELS[type as keyof typeof RELATIONSHIP_LABELS] ?? type
}

const SVG_W = 700
const SVG_H = 500
const CENTER_X = SVG_W / 2
const CENTER_Y = SVG_H / 2
const RADIUS = 170

export default function ConnectionDiagram({ selectedId, onNavigateCharacter }: Props) {
  const connected = useMemo(() => {
    const map = new Map<
      string,
      { character: Character; relations: { character: Character; type: string; label?: string }[] }
    >()
    for (const rel of CHARACTER_RELATIONSHIPS) {
      const [idA, idB] = rel.characters
      const charA = ALL_CHARACTERS.find((c) => c.id === idA)
      const charB = ALL_CHARACTERS.find((c) => c.id === idB)
      if (!charA || !charB) continue
      let entryA = map.get(idA)
      if (!entryA) {
        entryA = { character: charA, relations: [] }
        map.set(idA, entryA)
      }
      entryA.relations.push({ character: charB, type: rel.type, label: rel.label })
      let entryB = map.get(idB)
      if (!entryB) {
        entryB = { character: charB, relations: [] }
        map.set(idB, entryB)
      }
      entryB.relations.push({ character: charA, type: rel.type, label: rel.label })
    }
    return map
  }, [])

  const selectedChar = ALL_CHARACTERS.find((c) => c.id === selectedId) ?? null

  const relatedCharacters = connected.get(selectedId)?.relations ?? []

  const positions = useMemo(() => {
    const entries = connected.get(selectedId)?.relations
    if (!entries || entries.length === 0) return []
    return entries.map((_, i) => {
      const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2
      return { x: CENTER_X + RADIUS * Math.cos(angle), y: CENTER_Y + RADIUS * Math.sin(angle) }
    })
  }, [connected, selectedId])

  if (!selectedChar) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <PortraitMedallion name={selectedChar.name} size={48} />
        <div>
          <h3
            className="font-serif text-[clamp(14px,1.4vw,20px)] font-bold tracking-[0.04em]"
            style={{ color: '#2d1a0e' }}
          >
            {selectedChar.name}
          </h3>
          <p className="font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.3)' }}>
            {relatedCharacters.length} documented {relatedCharacters.length === 1 ? 'connection' : 'connections'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center">
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="max-w-full max-h-full">
          <rect width={SVG_W} height={SVG_H} fill="none" />

          {relatedCharacters.map((rel, i) => {
            const pos = positions[i]
            if (!pos) return null
            const mx = (CENTER_X + pos.x) / 2
            const my = (CENTER_Y + pos.y) / 2 - 8
            const label = rel.label ?? getConnectionLabel(rel.type)
            return (
              <g key={i}>
                <line x1={CENTER_X} y1={CENTER_Y} x2={pos.x} y2={pos.y} stroke="rgba(80,60,40,0.04)" strokeWidth="4" />
                <line x1={CENTER_X} y1={CENTER_Y} x2={pos.x} y2={pos.y} stroke="rgba(80,60,40,0.3)" strokeWidth="1.2" />
                <line
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(80,60,40,0.08)"
                  strokeWidth="0.4"
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontStyle="italic"
                  fill="rgba(80,60,40,0.3)"
                >
                  {label}
                </text>
                <foreignObject x={pos.x - 30} y={pos.y - 30} width={60} height={60}>
                  <div
                    className="flex items-center justify-center w-full h-full cursor-pointer"
                    onClick={() => onNavigateCharacter(rel.character.id)}
                  >
                    <PortraitMedallion name={rel.character.name} size={54} />
                  </div>
                </foreignObject>
                <text
                  x={pos.x}
                  y={pos.y + 38}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fill="rgba(60,40,25,0.5)"
                  style={{ pointerEvents: 'none' }}
                >
                  {rel.character.name}
                </text>
              </g>
            )
          })}

          <foreignObject x={CENTER_X - 28} y={CENTER_Y - 28} width={56} height={56}>
            <div className="flex items-center justify-center w-full h-full">
              <PortraitMedallion name={selectedChar.name} size={52} />
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  )
}
