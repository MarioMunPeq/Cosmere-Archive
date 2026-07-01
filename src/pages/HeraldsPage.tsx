import { useState } from 'react'
import { HERALDS } from '@/data/static/heralds'
import type { Herald } from '@/types/herald'
import SplitPane from '@/components/common/SplitPane'
import PageLayout from '@/components/ui/PageLayout'
import HonorbladeSVG from '@/components/detail/herald/HonorbladeSVG'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const CX = 300
const CY = 300
const R = 190

const TALN_ID = 'talenel'

function getDisplayName(h: Herald): string {
  return h.name.includes('(') ? h.name.split(' (')[0]! : h.name.split(' ')[0]!
}

function truncateName(h: Herald): string {
  const base = getDisplayName(h)
  if (h.name === 'Chanarach') return 'Chanarach'
  if (base === 'Talenel') return 'Taln'
  return base
}

export default function HeraldsPage() {
  useSEOMeta({
    title: 'Heralds — Cosmere Archive',
    description: 'Learn about the ten Heralds of the Almighty from the Stormlight Archive',
  })

  const [selected, setSelected] = useState<Herald | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <PageLayout variant="none">
      <div className="shrink-0 border-b border-gray-800 px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">The Oathpact</h1>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
          Ten Heralds. One Promise. Nine abandoned it. Only Taln never broke.
        </p>
      </div>

      <SplitPane
        left={
          <div className="flex h-full items-center justify-center p-2">
            <svg viewBox="0 0 600 600" className="h-full w-full" role="img" aria-label="Honorblades of the Heralds">
              <defs>
                <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx={CX} cy={CY} r={60} fill="url(#center-glow)" />

              <circle
                cx={CX}
                cy={CY}
                r={R + 2}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />

              {HERALDS.map((h, i) => {
                const rad = (i / HERALDS.length) * Math.PI * 2 - Math.PI / 2
                const x = CX + (R - 8) * Math.cos(rad)
                const y = CY + (R - 8) * Math.sin(rad)
                return (
                  <line
                    key={`line-${h.id}`}
                    x1={CX}
                    y1={CY}
                    x2={x}
                    y2={y}
                    stroke={h.color}
                    strokeWidth="1"
                    strokeOpacity={hovered === h.id ? '0.3' : '0.1'}
                    className="transition-all duration-300"
                  />
                )
              })}

              {HERALDS.map((h, i) => (
                <HonorbladeSVG
                  key={h.id}
                  variant={h.id}
                  color={h.color}
                  displayName={truncateName(h)}
                  order={h.order}
                  index={i}
                  total={HERALDS.length}
                  isFallen={h.id !== TALN_ID}
                  isHovered={hovered === h.id}
                  isSelected={selected?.id === h.id}
                  cx={CX}
                  cy={CY}
                  radius={R}
                  onMouseEnter={() => setHovered(h.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(h)}
                />
              ))}
            </svg>
          </div>
        }
        right={
          <div className="flex h-full flex-col p-3 sm:p-4">
            {selected ? (
              <div className="relative flex flex-1 flex-col overflow-y-auto rounded-xl border border-gray-800/60 bg-gray-900/70 shadow-xl backdrop-blur-sm animate-fade-in-up">
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-sm"
                  style={{ backgroundColor: selected.color }}
                />

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className="pl-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight" style={{ color: selected.color }}>
                        {selected.name}
                      </h2>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{selected.title}</p>
                  </div>

                  <div className="mt-4 space-y-4 pl-3">
                    <div>
                      <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-500">Order</h4>
                      <div className="mt-1.5 rounded-lg border border-gray-800/60 bg-gray-950/50 px-3.5 py-2">
                        <p className="text-sm font-medium text-gray-200">{selected.order}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-500">Surges</h4>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {selected.surges.map((s) => (
                          <span
                            key={s}
                            className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                            style={{
                              borderColor: `${selected.color}40`,
                              backgroundColor: `${selected.color}15`,
                              color: selected.color,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-500">Spren Type</h4>
                      <div className="mt-1.5 rounded-lg border border-gray-800/60 bg-gray-950/50 px-3.5 py-2">
                        <p className="text-sm text-gray-300">{selected.sprenType}</p>
                      </div>
                    </div>

                    {selected.description && (
                      <div>
                        <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-500">Description</h4>
                        <div className="mt-1.5 rounded-lg border border-gray-800/60 bg-gray-950/50 px-3.5 py-2.5">
                          <p className="text-sm leading-relaxed text-gray-400">{selected.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selected.id === TALN_ID && (
                    <div className="mx-3 mt-4 rounded-lg border border-amber-500/25 bg-amber-950/15 px-3.5 py-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 text-amber-400/60 text-xs">✦</span>
                        <p className="text-xs leading-relaxed text-amber-400/85">
                          The only Herald who never abandoned the Oathpact.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-gray-800/50 pt-3 pl-3">
                    <p className="text-center text-xxs text-gray-700">
                      {selected.order} · {selected.surges.join(' + ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-gray-700/40 bg-gray-800/20">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      aria-hidden="true"
                    >
                      <path d="M10 2 L13 8 L20 8 L14 12 L16 18 L10 14 L4 18 L6 12 L0 8 L7 8 L10 2 Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Select a Herald&apos;s Honorblade</p>
                  <p className="mt-1 text-xs text-gray-600">Hover to inspect each Honorblade</p>
                  <div className="mx-auto mt-5 h-px w-10 bg-gray-800" />
                  <p className="mt-4 text-xs text-gray-700">9 swords fallen — 1 remains standing</p>
                </div>
              </div>
            )}
          </div>
        }
      />
    </PageLayout>
  )
}
