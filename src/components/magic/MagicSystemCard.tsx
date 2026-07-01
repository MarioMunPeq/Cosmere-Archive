import type { MagicSystem } from '@/data/static/magic-systems'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'
import CharacterAvatar from '@/components/ui/CharacterAvatar'

interface Props {
  system: MagicSystem
  planet: Planet | undefined
  characters: Character[]
  booksCount: number
}

export default function MagicSystemCard({ system, planet, characters, booksCount }: Props) {
  const previewChars = characters.slice(0, 5)
  const extraCount = characters.length - previewChars.length

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/70 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
      style={{
        background: `linear-gradient(145deg, ${system.color}08, ${system.color}03 40%, rgba(3,7,18,0.85) 80%)`,
      }}
    >
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: system.color }} />

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-100 truncate">{system.name}</h3>
            <p className="mt-0.5 text-xs" style={{ color: system.color }}>
              {system.shard}
            </p>
          </div>
          <span
            className="shrink-0 rounded-md border px-2 py-0.5 text-xxs font-medium capitalize"
            style={{
              borderColor: `${system.color}30`,
              backgroundColor: `${system.color}10`,
              color: system.color,
            }}
          >
            {system.category.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {planet && (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: planet.color }} />
              <span className="text-xs text-gray-500">{planet.name}</span>
            </>
          )}
        </div>

        <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">{system.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xxs text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5z" />
                <path d="M8 2v4" />
                <path d="M12 2v4" />
                <path d="M16 2v4" />
              </svg>
              {booksCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {characters.length}
            </span>
          </div>

          {previewChars.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-1.5">
                {previewChars.map((c) => (
                  <CharacterAvatar
                    key={c.id}
                    character={c}
                    color="#6b7280"
                    size={20}
                    className="ring-1 ring-gray-900 transition-transform duration-200 hover:scale-110 hover:z-10"
                  />
                ))}
              </div>
              {extraCount > 0 && <span className="ml-1.5 text-xxs text-gray-600">+{extraCount}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
