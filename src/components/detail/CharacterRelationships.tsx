import { useMemo } from 'react'
import type { Character } from '@/types'
import type { CharacterRelationship, RelationshipType } from '@/types/relationships'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/types/relationships'
import { PLANETS } from '@/data/static'

interface Props {
  character: Character
  allCharacters: Character[]
  relationships: CharacterRelationship[]
  onSelectCharacter: (id: string) => void
}

const CX = 400
const CY = 240
const R = 150

function getCharacterColor(char: Character): string {
  const planet = PLANETS.find((p) => p.id === char.planet.toLowerCase())
  return planet?.color ?? '#6b7280'
}

export default function CharacterRelationships({ character, allCharacters, relationships, onSelectCharacter }: Props) {
  const related = useMemo(() => {
    const direct = relationships.filter((r) => r.characters[0] === character.id || r.characters[1] === character.id)
    return direct
      .map((r) => {
        const otherId = r.characters[0] === character.id ? r.characters[1] : r.characters[0]
        const other = allCharacters.find((c) => c.id === otherId)
        if (!other) return null
        return { character: other, type: r.type, label: r.label }
      })
      .filter(Boolean) as { character: Character; type: RelationshipType; label?: string }[]
  }, [character, allCharacters, relationships])

  if (related.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 py-16 text-sm text-gray-500">
        No known relationships for this character.
      </div>
    )
  }

  const nodes = related.map((item, i) => {
    const angle = ((2 * Math.PI) / related.length) * i - Math.PI / 2
    return { ...item, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle), angle }
  })

  return (
    <svg viewBox="0 0 800 480" className="w-full" role="img" aria-label={`Relationship network for ${character.name}`}>
      <defs>
        {nodes.map((node) => (
          <filter key={node.character.id} id={`glow-${node.character.id}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {nodes.map((node) => {
        const color = RELATIONSHIP_COLORS[node.type]
        const dx = node.x - CX
        const dy = node.y - CY
        const mx = CX + dx * 0.5
        const my = CY + dy * 0.5

        return (
          <g key={node.character.id}>
            <line
              x1={CX}
              y1={CY}
              x2={node.x}
              y2={node.y}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.5"
            />
            <rect
              x={mx - 30}
              y={my - 8}
              width={60}
              height={16}
              rx="4"
              fill="#111827"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.9"
            />
            <text x={mx} y={my + 3.5} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">
              {node.label ?? RELATIONSHIP_LABELS[node.type]}
            </text>
          </g>
        )
      })}

      <circle
        cx={CX}
        cy={CY}
        r="36"
        fill="#1f2937"
        stroke={getCharacterColor(character)}
        strokeWidth="2.5"
        filter={`url(#glow-${character.id})`}
      />
      <text
        x={CX}
        y={CY + 1}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize="10"
        fontWeight="700"
        dominantBaseline="central"
      >
        {character.name.length > 12 ? character.name.slice(0, 11) + '…' : character.name}
      </text>

      {nodes.map((node) => (
        <g
          key={node.character.id}
          className="cursor-pointer"
          onClick={() => onSelectCharacter(node.character.id)}
          role="button"
          aria-label={`View ${node.character.name} relationships`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelectCharacter(node.character.id)
          }}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r="28"
            fill="#1f2937"
            stroke={getCharacterColor(node.character)}
            strokeWidth="2"
            filter={`url(#glow-${node.character.id})`}
          />
          <text
            x={node.x}
            y={node.y + 1}
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize="9"
            fontWeight="600"
            dominantBaseline="central"
          >
            {node.character.name.length > 14 ? node.character.name.slice(0, 13) + '…' : node.character.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
