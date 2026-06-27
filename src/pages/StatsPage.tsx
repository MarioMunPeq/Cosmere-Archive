import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { TIMELINE_EVENTS, WORLDHOPPERS } from '@/data/static/timeline'
import { SHARD_COLORS } from '@/data/static/colors'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

interface StatCard {
  label: string
  value: number
  color: string
}

const SHARD_COUNT = Object.keys(SHARD_COLORS).length

export default function StatsPage() {
  useSEOMeta({
    title: 'Stats — Cosmere Archive',
    description: 'Statistics and data visualizations about the Cosmere universe',
  })

  const bookCountBySaga = useMemo(() => {
    const map = new Map<string, number>()
    for (const saga of SAGAS) map.set(saga.id, 0)
    for (const book of BOOKS) map.set(book.saga, (map.get(book.saga) ?? 0) + 1)
    return Array.from(map.entries())
      .filter(([, count]) => count > 0)
      .sort(([aId], [bId]) => {
        const a = SAGAS.find((s) => s.id === aId)
        const b = SAGAS.find((s) => s.id === bId)
        return (a?.order ?? 0) - (b?.order ?? 0)
      })
  }, [])

  const charCountByPlanet = useMemo(() => {
    const map = new Map<string, number>()
    for (const char of ALL_CHARACTERS) map.set(char.planet, (map.get(char.planet) ?? 0) + 1)
    const planetNames = new Map(PLANETS.map((p) => [p.id, p.name]))
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({ name: planetNames.get(id) ?? id, count }))
  }, [])

  const timer = useMemo(() => {
    const years = TIMELINE_EVENTS.map((e) => e.year).filter((y) => y !== undefined) as number[]
    return Math.max(...years) - Math.min(...years)
  }, [])

  const statCards: StatCard[] = [
    { label: 'Books', value: BOOKS.length, color: '#a78bfa' },
    { label: 'Characters', value: ALL_CHARACTERS.length, color: '#06b6d4' },
    { label: 'Planets', value: PLANETS.length, color: '#22c55e' },
    { label: 'Shards', value: SHARD_COUNT, color: '#f59e0b' },
    { label: 'Sagas', value: SAGAS.length, color: '#ef4444' },
    { label: 'Magic Systems', value: MAGIC_SYSTEMS.length, color: '#d946ef' },
    { label: 'Timeline Events', value: TIMELINE_EVENTS.length, color: '#14b8a6' },
    { label: 'Worldhoppers', value: WORLDHOPPERS.length, color: '#f97316' },
  ]

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

        <h1 className="text-3xl font-bold text-gray-100">Cosmere Stats</h1>
        <p className="mt-1 text-sm text-gray-500">Data overview of the Cosmere Archive</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="mt-1 text-xs text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-sm font-semibold text-gray-200">Books by Saga</h2>
            <div className="mt-3 space-y-2">
              {bookCountBySaga.map(([sagaId, count]) => {
                const saga = SAGAS.find((s) => s.id === sagaId)
                const maxCount = Math.max(...bookCountBySaga.map(([, c]) => c))
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                return (
                  <div key={sagaId}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{saga?.name ?? sagaId}</span>
                      <span className="text-gray-600">{count}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 rounded-full bg-gray-800">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: saga?.color ? `var(--color-${saga.color})` : '#a78bfa',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-sm font-semibold text-gray-200">Characters by Planet</h2>
            <div className="mt-3 space-y-2">
              {charCountByPlanet.map(({ name, count }) => {
                const maxCount = Math.max(...charCountByPlanet.map((c) => c.count))
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                const planet = PLANETS.find((p) => p.name === name)
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {planet && (
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: planet.color }}
                          />
                        )}
                        <span className="text-gray-400">{name}</span>
                      </div>
                      <span className="text-gray-600">{count}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 rounded-full bg-gray-800">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: planet?.color ?? '#6b7280' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xxs text-gray-700">
          Timeline spans {timer} years across {TIMELINE_EVENTS.length} recorded events
        </p>
      </div>
    </PageLayout>
  )
}
