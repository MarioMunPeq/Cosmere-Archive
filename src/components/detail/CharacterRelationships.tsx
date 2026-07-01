import { memo, useMemo } from 'react'
import type { Character } from '@/types'
import type { CharacterRelationship, RelationshipType } from '@/types/relationships'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/types/relationships'
import { getPlanetById } from '@/data/static'
import { FALLBACK_COLOR } from '@/data/static'

interface Props {
  character: Character
  allCharacters: Character[]
  relationships: CharacterRelationship[]
  onSelectCharacter: (id: string) => void
}

const CX = 450
const CY = 270
const R = 190

function getCharacterColor(char: Character): string {
  const planet = getPlanetById(char.planet.toLowerCase())
  return planet?.color ?? FALLBACK_COLOR
}

function CharacterRelationships({ character, allCharacters, relationships, onSelectCharacter }: Props) {
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

  const nodes = useMemo(
    () =>
      related.map((item, i) => {
        const angle = ((2 * Math.PI) / related.length) * i - Math.PI / 2
        return { ...item, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle), angle }
      }),
    [related],
  )

  if (related.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 py-24 text-sm text-gray-500">
        No known relationships for this character.
      </div>
    )
  }

  return (
    <svg viewBox="0 0 900 540" className="w-full" role="img" aria-label={`Relationship network for ${character.name}`}>
      <defs>
        <filter id="center-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="540" fill="url(#bg-grad)" rx="12" />

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
              strokeDasharray="5 4"
              opacity="0.45"
              className="transition-all duration-500"
            />
            <rect
              x={mx - 32}
              y={my - 9}
              width={64}
              height={18}
              rx="5"
              fill="#0f172a"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.95"
            />
            <text x={mx} y={my + 4} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">
              {node.label ?? RELATIONSHIP_LABELS[node.type]}
            </text>
          </g>
        )
      })}

      <circle
        cx={CX}
        cy={CY}
        r="40"
        fill="#1e293b"
        stroke={getCharacterColor(character)}
        strokeWidth="3"
        filter="url(#center-glow)"
        className="transition-all duration-500"
      />
      <text
        x={CX}
        y={CY + 1}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize="11"
        fontWeight="700"
        dominantBaseline="central"
      >
        {character.name.length > 10 ? character.name.slice(0, 9) + '…' : character.name}
      </text>

      {nodes.map((node) => (
        <g
          key={node.character.id}
          className="cursor-pointer transition-all duration-300 hover:opacity-80"
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
            r="30"
            fill="#1e293b"
            stroke={getCharacterColor(node.character)}
            strokeWidth="2"
            filter="url(#node-glow)"
            className="transition-all duration-300"
          />
          <text
            x={node.x}
            y={node.y + 1}
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize="10"
            fontWeight="600"
            dominantBaseline="central"
          >
            {node.character.name.length > 12 ? node.character.name.slice(0, 11) + '…' : node.character.name}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default memo(CharacterRelationships)
