import { useState } from 'react'
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

const PLANET_BY_ID = new Map(PLANETS.map((p) => [p.id, p]))

const WH_DESCRIPTIONS: Record<string, string> = {
  hoid: "A mysterious wanderer who appears throughout the Cosmere. Present at the Shattering of Adonalsium, he refused a Shard and now walks the worlds as a storyteller, informant, and seeker of something lost.",
  vasher: "Kalad the Usurper. A Returned from Nalthis, master of Awakening, and wielder of Nightblood. Now lives hidden on Roshar training the next generation of warriors.",
  khriss: "A scholar from Taldain who travels the Cosmere documenting investiture systems. Her essays appear in Arcanum Unbounded. Founder of the Khrissalla research network.",
  nazh: "Cartographer and spy. Born on Threnody, now works for Khriss collecting maps and intelligence across the Cosmere. His maps appear in many published works.",
  kelsier: "The Survivor of Hathsin. A Mistborn who led the rebellion against the Lord Ruler. After death, he operates from the Cognitive Realm, founding the Ghostbloods.",
}

export default function WorldhopperGallery() {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-gray-800 px-4 py-3">
        <p className="text-xs text-gray-500">
          Characters who travel between worlds in the Cosmere.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {WORLDHOPPER_MOVEMENTS.map((wh) => {
            const isOpen = expanded === wh.id
            const planets = Array.from(new Set(wh.movements.map((m) => m.planet)))
            return (
              <div
                key={wh.id}
                className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-colors hover:border-gray-700"
              >
                <button
                  onClick={() => toggle(wh.id)}
                  id={`wh-btn-${wh.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`wh-detail-${wh.id}`}
                  className="flex w-full items-start gap-4 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: wh.color + '20' }}>
                    <span className="text-sm font-bold" style={{ color: wh.color }}>{wh.name.charAt(0)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-200">{wh.name}</h3>
                      <span className="text-xs text-gray-600">{wh.movements.length} journeys</span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {WH_DESCRIPTIONS[wh.id] ?? ''}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {planets.map((pId) => {
                        const p = PLANET_BY_ID.get(pId)
                        return p ? (
                          <span key={pId} className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>

                  <span className={`mt-1 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`wh-detail-${wh.id}`}
                    role="region"
                    aria-labelledby={`wh-btn-${wh.id}`}
                    className="border-t border-gray-800 px-4 pb-4"
                  >
                    <div className="relative ml-5 mt-3 pl-6">
                      <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gray-800" />
                      {wh.movements.map((m, i) => {
                        const p = PLANET_BY_ID.get(m.planet)
                        return (
                          <div key={i} className="relative pb-4 last:pb-0">
                            <div className="absolute -left-[22px] top-1 flex h-3 w-3 items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p?.color ?? '#6b7280' }} />
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="shrink-0 text-[10px] font-mono text-gray-600">
                                {m.year > 0 ? `${m.year} AR` : `${Math.abs(m.year)} BR`}
                              </span>
                              <span className="text-[10px] font-medium" style={{ color: p?.color ?? '#6b7280' }}>
                                {p?.name ?? m.planet}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                              {m.description}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
