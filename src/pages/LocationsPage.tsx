import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PLANETS, SAGA_BY_ID } from '@/data/static'
import { BOOKS } from '@/data/static/books'
import PageLayout from '@/components/ui/PageLayout'
import ColorDot from '@/components/ui/ColorDot'
import { useSEOMeta } from '@/hooks/useSEOMeta'

export default function LocationsPage() {
  useSEOMeta({
    title: 'Locations — Cosmere Archive',
    description: 'Discover the planets and locations of the Cosmere universe, from Roshar to Scadrial',
  })

  const planetsWithMeta = useMemo(() => {
    return PLANETS.map((p) => {
      const sagaNames = (p.sagas ?? [])
        .map((sid) => SAGA_BY_ID.get(sid))
        .filter(Boolean)
        .map((s) => s!.name)
      const bookCount = (p.books ?? []).filter((bid) => BOOKS.some((b) => b.id === bid)).length
      return { ...p, sagaNames, bookCount }
    })
  }, [])

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>

        <h1 className="text-3xl font-bold text-gray-100">Locations</h1>
        <p className="mt-1 text-sm text-gray-500">Notable planets and celestial bodies across the Cosmere</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {planetsWithMeta.map((planet) => (
            <div key={planet.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-3">
                <ColorDot color={planet.color} size="lg" />
                <h2 className="text-lg font-semibold text-gray-100">{planet.name}</h2>
                {planet.shard && (
                  <span className="rounded bg-gray-800/60 px-2 py-0.5 text-xs text-gray-500">{planet.shard}</span>
                )}
              </div>

              {planet.description && <p className="mt-3 text-sm leading-relaxed text-gray-500">{planet.description}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                {planet.sagaNames.length > 0 && (
                  <span>
                    Sagas: <span className="text-gray-400">{planet.sagaNames.join(', ')}</span>
                  </span>
                )}
                {planet.bookCount > 0 && (
                  <span>
                    Books: <span className="text-gray-400">{planet.bookCount}</span>
                  </span>
                )}
                {planet.investiture && planet.investiture.length > 0 && (
                  <span>
                    Magic:{' '}
                    <span className="text-gray-400">
                      {planet.investiture.length} system{planet.investiture.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                )}
              </div>

              {planet.magicSystem && (
                <p className="mt-2 text-xs leading-relaxed text-gray-500 italic line-clamp-2">{planet.magicSystem}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
