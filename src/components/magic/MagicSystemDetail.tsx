import { useNavigate } from 'react-router-dom'
import AllomanticTable from '@/components/magic/AllomanticTable'
import type { MagicSystem } from '@/data/static/magic-systems'
import type { Book } from '@/types/book'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'

interface Props {
  system: MagicSystem
  planet: Planet | undefined
  characters: Character[]
  books: Book[]
}

export default function MagicSystemDetail({ system, planet, characters, books }: Props) {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: system.color }} />
        <div>
          <h2 className="text-lg font-bold text-gray-100">{system.name}</h2>
          <p className="text-xs text-purple-400">{system.shard}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-400">{system.description}</p>

      {planet && (
        <div>
          <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Planet</h4>
          <p className="mt-0.5 text-sm text-gray-300">{planet.name}</p>
        </div>
      )}

      {books.length > 0 && (
        <div>
          <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Appears in ({books.length})</h4>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {books.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/books/${b.id}`)}
                className="rounded bg-gray-800 px-2 py-0.5 text-xs text-cyan-400 transition-colors hover:bg-gray-700 hover:text-cyan-300"
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {characters.length > 0 && (
        <div>
          <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">
            Known users ({characters.length})
          </h4>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {characters.map((c) => (
              <span key={c.id} className="rounded bg-gray-800/50 px-2 py-0.5 text-xs text-gray-400">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Category</h4>
        <span className="mt-1 inline-block rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
          {system.category}
        </span>
      </div>

      {system.id === 'allomancy' && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          <AllomanticTable />
        </div>
      )}
    </div>
  )
}
