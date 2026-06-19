import { memo } from 'react'
import type { CharacterSpan } from '@/data/static/timeline/character-lifespans'
import { PLANETS } from '@/data/static'

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
  const planet = PLANETS.find((p) => p.id === character.planet.toLowerCase())

  return (
    <div className="absolute bottom-4 left-4 right-4 top-auto w-auto animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-80 sm:p-5">
      <button
        onClick={onClose}
        aria-label="Close character panel"
        className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="mb-3 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: character.color }} />
        <h3 className="text-lg font-bold text-gray-100">{character.name}</h3>
      </div>

      {character.titles.length > 0 && (
        <p className="text-xs text-gray-500">{character.titles.join(', ')}</p>
      )}

      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span>Born: <strong className="text-gray-400">{formatYear(character.birthYear)}</strong></span>
        <span>Died: <strong className="text-gray-400">{formatYear(character.deathYear)}</strong></span>
      </div>

      {planet && (
        <div className="mt-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Home Planet</h4>
          <button
            onClick={() => onSelectPlanet(planet.id)}
            className="flex items-center gap-2 rounded bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: planet.color }} />
            {planet.name}
          </button>
        </div>
      )}

      <div className="mt-3">
        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Group</h4>
        <span className="inline-block rounded bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
          {character.group}
        </span>
      </div>
    </div>
  )
}

export default memo(CharacterPanel)
