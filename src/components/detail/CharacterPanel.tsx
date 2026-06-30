import { memo, useMemo } from 'react'
import type { CharacterSpan } from '@/data/static/timeline/character-lifespans'
import { getPlanetById } from '@/data/static'
import ColorDot from '@/components/ui/ColorDot'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import DetailPanel from '@/components/ui/DetailPanel'

interface Props {
  character: CharacterSpan
  onClose: () => void
  onSelectPlanet: (id: string) => void
}

function formatYear(year: number | null): string {
  if (year === null) return 'Unknown'
  if (year < 0) return `${Math.abs(year)} FE`
  return `${year}`
}

function CharacterPanel({ character, onClose, onSelectPlanet }: Props) {
  const planet = getPlanetById(character.planet.toLowerCase())
  const avatarChar = useMemo(
    () => ({ name: character.name, image: undefined, planet: character.planet }),
    [character.name, character.planet],
  )

  return (
    <DetailPanel onClose={onClose} ariaLabel="Close character panel">
      <div className="mb-3 flex items-center gap-3">
        <CharacterAvatar character={avatarChar} color={character.color} size={32} />
        <h3 className="text-lg font-bold text-gray-100">{character.name}</h3>
      </div>

      {character.titles.length > 0 && <p className="text-xs text-gray-500">{character.titles.join(', ')}</p>}

      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span>
          Born: <strong className="text-gray-400">{formatYear(character.birthYear)}</strong>
        </span>
        <span>
          Died: <strong className="text-gray-400">{formatYear(character.deathYear)}</strong>
        </span>
      </div>

      {planet && (
        <div className="mt-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Home Planet</h4>
          <button
            onClick={() => onSelectPlanet(planet.id)}
            className="flex items-center gap-2 rounded bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
          >
            <ColorDot color={planet.color} />
            {planet.name}
          </button>
        </div>
      )}

      <div className="mt-3">
        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Group</h4>
        <span className="inline-block rounded bg-gray-800 px-2.5 py-1 text-xs text-gray-400">{character.group}</span>
      </div>
    </DetailPanel>
  )
}

export default memo(CharacterPanel)
