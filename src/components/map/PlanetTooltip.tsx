import { ALL_CHARACTERS, getPlanetById } from '@/data/static'
import type { Planet } from '@/types/planet'

interface Props {
  planet: Planet
  left: number
  top: number
}

export default function PlanetTooltip({ planet, left, top }: Props) {
  const characters = ALL_CHARACTERS.filter((c) => c.planet === planet.id)

  return (
    <div
      className="pointer-events-none absolute z-30 hidden w-60 animate-fade-in-up rounded-lg border border-gray-700/50 bg-gray-900/90 px-3 py-2.5 shadow-lg backdrop-blur-md sm:block"
      style={{ left, top }}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: planet.color }} />
        <span className="text-sm font-bold text-gray-100">{planet.name}</span>
      </div>
      {planet.shard && <p className="mt-0.5 text-xs text-gray-400">{planet.shard}</p>}
      <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">{planet.description}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xxs text-gray-600">
        {characters.length > 0 && <span>{characters.length} characters</span>}
        {planet.investiture && planet.investiture.length > 0 && (
          <span>
            {planet.investiture.length} magic system{planet.investiture.length > 1 ? 's' : ''}
          </span>
        )}
        {planet.books && (
          <span>
            {planet.books.length} book{planet.books.length > 1 ? 's' : ''}
          </span>
        )}
        {planet.connectedPlanets && planet.connectedPlanets.length > 0 && (
          <span>→ {planet.connectedPlanets.map((cId) => getPlanetById(cId)?.name ?? cId).join(', ')}</span>
        )}
      </div>
    </div>
  )
}
