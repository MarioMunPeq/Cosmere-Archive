import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AllomanticTable from '@/components/magic/AllomanticTable'
import type { MagicSystem } from '@/data/static/magic-systems'
import type { Book } from '@/types/book'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'
import CharacterAvatar from '@/components/ui/CharacterAvatar'

interface Props {
  system: MagicSystem
  planet: Planet | undefined
  characters: Character[]
  books: Book[]
  onSelectCharacter?: (id: string) => void
}

export default function MagicSystemDetail({ system, planet, characters, books, onSelectCharacter }: Props) {
  const navigate = useNavigate()
  const [metalsOpen, setMetalsOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-10 w-10 shrink-0 rounded-xl" style={{ backgroundColor: system.color }} />
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-100">{system.name}</h2>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm" style={{ color: system.color }}>
              {system.shard}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-700" />
            <span
              className="rounded-md border px-2 py-0.5 text-xxs font-medium capitalize"
              style={{
                borderColor: `${system.color}30`,
                backgroundColor: `${system.color}10`,
                color: system.color,
              }}
            >
              {system.category.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-400">{system.description}</p>

      {planet && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/40 px-3.5 py-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: planet.color }} />
          <span className="text-xs font-medium text-gray-300">{planet.name}</span>
        </div>
      )}

      {books.length > 0 && (
        <div>
          <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">
            Appears in ({books.length})
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {books.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/books/${b.id}`)}
                className="rounded-md border border-gray-800/60 bg-gray-900/60 px-2.5 py-1 text-xs text-cyan-400 transition-colors hover:border-cyan-800/50 hover:bg-gray-800/60"
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {characters.length > 0 && (
        <div>
          <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">
            Known users ({characters.length})
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCharacter?.(c.id)}
                className="flex items-center gap-2 rounded-lg border border-gray-800/40 bg-gray-900/50 px-2.5 py-1.5 transition-colors hover:border-gray-700/60 hover:bg-gray-800/60"
              >
                <CharacterAvatar character={c} color="#6b7280" size={22} className="ring-1 ring-gray-700/30" />
                <span className="text-xs text-gray-400">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {system.id === 'allomancy' && (
        <div className="border-t border-gray-800/60 pt-4">
          <button
            onClick={() => setMetalsOpen(!metalsOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-800/60 bg-gray-900/50 px-3.5 py-2.5 text-left transition-colors hover:border-gray-700/60"
          >
            <span className="text-sm font-semibold text-gray-200">The Sixteen Metals</span>
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${metalsOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {metalsOpen && (
            <div className="mt-3">
              <AllomanticTable />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
