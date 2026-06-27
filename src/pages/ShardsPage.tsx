import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PLANETS } from '@/data/static'
import { SHARD_COLORS } from '@/data/static/colors'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

interface ShardInfo {
  name: string
  color: string
  description: string
  planets: string[]
  investiture: { name: string; description: string }[]
  magicSystems: string[]
}

export default function ShardsPage() {
  useSEOMeta({
    title: 'Shards — Cosmere Archive',
    description: 'Learn about the sixteen Shards of Adonalsium and their Vessels in the Cosmere',
  })

  const shards = useMemo(() => {
    const map = new Map<string, ShardInfo>()

    for (const planet of PLANETS) {
      if (!planet.shard) continue
      const names = planet.shard
        .replace(/\s*\(.*?\)\s*/g, '')
        .split(/[&,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      for (const sName of names) {
        if (sName === 'Adonalsium' || sName === '') continue
        if (!map.has(sName)) {
          map.set(sName, {
            name: sName,
            color: SHARD_COLORS[sName] ?? '#6b7280',
            description: '',
            planets: [],
            investiture: [],
            magicSystems: [],
          })
        }
        const entry = map.get(sName)!
        entry.planets.push(planet.name)
        if (planet.investiture) {
          for (const inv of planet.investiture) {
            if (inv.shard === sName) {
              entry.investiture.push({ name: inv.name, description: inv.description })
            }
          }
        }
      }
    }

    for (const ms of MAGIC_SYSTEMS) {
      if (map.has(ms.shard)) {
        map.get(ms.shard)!.magicSystems.push(ms.name)
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
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

        <h1 className="text-3xl font-bold text-gray-100">Shards of Adonalsium</h1>
        <p className="mt-1 text-sm text-gray-500">The sixteen pieces of Adonalsium, scattered across the Cosmere</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {shards.map((shard) => (
            <div key={shard.name} className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: shard.color }} />
                <h2 className="text-lg font-semibold text-gray-100" style={{ color: shard.color }}>
                  {shard.name}
                </h2>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Planets</span>
                  <p className="mt-0.5 text-gray-400">{shard.planets.join(', ')}</p>
                </div>

                {shard.investiture.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                      Investiture Systems ({shard.investiture.length})
                    </span>
                    <ul className="mt-1 space-y-1">
                      {shard.investiture.map((inv) => (
                        <li key={inv.name}>
                          <span className="text-gray-300">{inv.name}</span>
                          <p className="text-xs text-gray-500">{inv.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {shard.magicSystems.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Magic Systems</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {shard.magicSystems.map((ms) => (
                        <span key={ms} className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                          {ms}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
