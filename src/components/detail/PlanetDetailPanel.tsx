import { useMemo } from 'react'
import type { Planet } from '@/types'
import { ALL_CHARACTERS, getPlanetById, SAGAS } from '@/data/static'
import type { Saga } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

interface Props {
  planet: Planet
  onSelectPlanet: (id: string) => void
  onClose: () => void
}

export default function PlanetDetailPanel({ planet, onSelectPlanet, onClose }: Props) {
  const planetChars = useMemo(() => ALL_CHARACTERS.filter((c) => c.planet.toLowerCase() === planet.id), [planet.id])
  const planetWorldhoppers = useMemo(
    () => WORLDHOPPER_MOVEMENTS.filter((w) => w.planets.includes(planet.id)),
    [planet.id],
  )
  const connectedPlanetNames = useMemo(
    () =>
      (planet.connectedPlanets ?? [])
        .map((id) => ({ id, name: getPlanetById(id)?.name ?? id }))
        .filter((p) => p.name !== planet.name),
    [planet],
  )

  const sagaNames = (planet.sagas ?? []).map((sid) => {
    const saga = (SAGAS as Saga[]).find((s) => s.id === sid)
    return saga?.name ?? sid
  })

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${planet.color}20, ${planet.color}08 50%, transparent 80%)`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute -inset-4"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${planet.color}, transparent 70%)`,
            }}
          />
        </div>
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 relative z-10">
          <span className="text-xs font-medium text-gray-500">
            <span style={{ color: planet.color }}>&#9679;</span> Planet
          </span>
          <button
            onClick={onClose}
            className="text-gray-600 transition-colors hover:text-gray-300"
            aria-label="Close detail"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5 relative z-10">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 rounded-full animate-float"
              style={{
                backgroundColor: planet.color,
                boxShadow: `0 0 20px ${planet.color}60`,
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-100">{planet.name}</h2>
              {planet.shard && <span className="text-xs text-gray-500">{planet.shard}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {planet.description && <p className="text-sm leading-relaxed text-gray-400">{planet.description}</p>}

        {planet.pronunciation && <p className="text-xs text-gray-600 italic">/{planet.pronunciation}/</p>}

        {sagaNames.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Sagas</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {sagaNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-gray-800/60 px-2.5 py-1 text-xs text-gray-400 border border-gray-700/30"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {planet.investiture && planet.investiture.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Investiture Systems ({planet.investiture.length})
            </span>
            <div className="mt-2 space-y-3">
              {planet.investiture.map((inv) => (
                <div
                  key={inv.name}
                  className="rounded-lg border border-gray-800/40 bg-gray-900/40 p-3 hover:bg-gray-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{inv.name}</span>
                    {inv.shard && (
                      <span className="rounded bg-gray-800/50 px-1.5 py-0.5 text-xxs text-gray-500 border border-gray-700/30">
                        {inv.shard}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{inv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {connectedPlanetNames.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Connected Planets</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {connectedPlanetNames.map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => onSelectPlanet(cp.id)}
                  className="rounded-full border border-gray-800/40 bg-gray-900/50 px-2.5 py-1 text-xs text-gray-400 transition-all hover:border-cyan-700/50 hover:text-cyan-300 hover:bg-cyan-900/20"
                >
                  {cp.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {planetChars.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Characters ({planetChars.length})
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {planetChars.slice(0, 12).map((c) => (
                <span
                  key={c.id}
                  className="rounded-md bg-gray-800/40 px-2 py-1 text-xs text-gray-400 border border-gray-700/30"
                >
                  {c.name}
                </span>
              ))}
              {planetChars.length > 12 && (
                <span className="text-xxs text-gray-600 self-center">+{planetChars.length - 12} more</span>
              )}
            </div>
          </div>
        )}

        {planetWorldhoppers.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Worldhoppers ({planetWorldhoppers.length})
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {planetWorldhoppers.map((w) => (
                <span
                  key={w.id}
                  className="rounded-md border bg-gray-900/30 px-2 py-1 text-xs text-gray-400"
                  style={{ borderColor: `${w.color}40` }}
                >
                  {w.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
