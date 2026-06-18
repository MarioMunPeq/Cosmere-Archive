import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { PLANETS } from '@/data/static'

interface Props {
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  onSelectPlanet: (id: string | null) => void
}

const planetName = (id: string) => PLANETS.find((p) => p.id === id)?.name ?? id

export default function WorldhoppersTab({ activeWorldhoppers, onToggleWorldhopper, onSelectPlanet }: Props) {
  return (
    <div className="space-y-6">
      {/* Worldhopper grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDHOPPER_MOVEMENTS.map((wh) => {
          const active = activeWorldhoppers.includes(wh.id)
          const planets = [...new Set(wh.movements.map((m) => m.planet))]
          return (
            <button
              key={wh.id}
              onClick={() => onToggleWorldhopper(wh.id)}
              className={`rounded-xl border text-left transition-all ${
                active
                  ? 'border-gray-500 bg-gray-800/80 shadow-lg'
                  : 'border-gray-800 bg-gray-950/50 hover:border-gray-600 hover:bg-gray-800/40'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: wh.color }}
                  />
                  <h3 className="text-base font-bold" style={{ color: wh.color }}>
                    {wh.name}
                    {active && <span className="ml-2 text-sm text-amber-400">✓</span>}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {wh.movements[0]?.description ?? ''}
                </p>

                {/* Journey dots */}
                <div className="mt-3 flex items-center gap-1">
                  {wh.movements.map((m, mi) => (
                    <div key={mi} className="group flex items-center gap-0" title={`${m.year}: ${m.planet}`}>
                      <span
                        className="inline-flex h-2 w-2 items-center justify-center rounded-full"
                        style={{ backgroundColor: wh.color }}
                      />
                      {mi < wh.movements.length - 1 && (
                        <span className="mx-0.5 h-px w-4" style={{ backgroundColor: wh.color + '40' }} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {planets.map((pid) => (
                    <span key={pid} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-500">
                      {planetName(pid)}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Journey detail */}
      {activeWorldhoppers.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
            Viajes detallados
          </h3>
          <div className="space-y-6">
            {activeWorldhoppers.map((whId) => {
              const wh = WORLDHOPPER_MOVEMENTS.find((w) => w.id === whId)
              if (!wh) return null
              return (
                <div key={wh.id}>
                  <h4 className="mb-3 text-base font-bold" style={{ color: wh.color }}>
                    {wh.name}
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
{wh.movements.map((m, mi) => (
                      <div key={mi} className="w-56 shrink-0">
                        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400">
                              {m.year < 0 ? `${Math.abs(m.year)} AC` : `${m.year} DC`}
                            </span>
                            <span className="text-xs text-gray-600">→</span>
                            <button
                              onClick={() => onSelectPlanet(m.planet)}
                              className="text-sm font-medium text-gray-200 hover:text-amber-400"
                            >
                              {planetName(m.planet)}
                            </button>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
