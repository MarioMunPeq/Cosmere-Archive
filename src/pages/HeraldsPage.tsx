import { useState } from 'react'
import { HERALDS } from '@/data/static/heralds'
import type { Herald } from '@/types/herald'
import SplitPane from '@/components/common/SplitPane'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const CX = 300
const CY = 300
const R = 200

const HERALD_POSITIONS = HERALDS.map((h, i) => {
  const angle = (i / HERALDS.length) * Math.PI * 2 - Math.PI / 2
  return { id: h.id, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
})

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
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">The Heralds of the Almighty</h1>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
          The ten Heralds who formed the Oathpact with Honor. Click a Herald to see details.
        </p>
      </div>

      <SplitPane
        left={
          <div className="flex h-full items-center justify-center p-1">
            <svg viewBox="0 0 600 600" className="h-full w-full" role="img" aria-label="Heralds circle">
              <defs>
                {HERALDS.map((h) => (
                  <radialGradient key={`glow-${h.id}`} id={`glow-${h.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={h.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={h.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#374151" strokeWidth="1.5" strokeOpacity="0.3" />

              {HERALDS.map((h, i) => {
                const pos = HERALD_POSITIONS[i]!
                return (
                  <line
                    key={`line-${h.id}`}
                    x1={CX}
                    y1={CY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke={h.color}
                    strokeWidth="1.5"
                    strokeOpacity={hovered === h.id ? '0.5' : '0.2'}
                  />
                )
              })}
              {HERALDS.map((h, i) => {
                const a = HERALD_POSITIONS[i]!
                const b = HERALD_POSITIONS[(i + 1) % HERALDS.length]!
                return (
                  <line
                    key={`arc-${h.id}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={h.color}
                    strokeWidth="1"
                    strokeOpacity={hovered === h.id ? '0.4' : '0.15'}
                  />
                )
              })}

              {HERALDS.map((h, i) => {
                const pos = HERALD_POSITIONS[i]!
                const isSelected = selected?.id === h.id
                const isHovered = hovered === h.id
                const nodeR = isHovered || isSelected ? 50 : 40

                return (
                  <g
                    key={h.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${h.name} — ${h.title}`}
                    onClick={() => setSelected(h)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelected(h)
                    }}
                    onMouseEnter={() => setHovered(h.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {isHovered && <circle cx={pos.x} cy={pos.y} r={70} fill={`url(#glow-${h.id})`} />}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeR}
                      fill={isSelected ? '#1e293b' : '#1f2937'}
                      stroke={isSelected || isHovered ? h.color : h.color}
                      strokeWidth={isSelected ? 3 : 2}
                      opacity={isHovered ? 1 : 0.9}
                      className="transition-all duration-200"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 6}
                      textAnchor="middle"
                      fill="#e5e7eb"
                      fontSize="13"
                      fontWeight="bold"
                      dominantBaseline="auto"
                      pointerEvents="none"
                    >
                      {h.name.includes('(') ? h.name.split(' (')[0] : h.name.split(' ')[0]}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 17}
                      textAnchor="middle"
                      fill={h.color}
                      fontSize="10"
                      dominantBaseline="auto"
                      pointerEvents="none"
                    >
                      {h.order}
                    </text>
                    {isSelected && (
                      <text
                        x={pos.x}
                        y={pos.y + 32}
                        textAnchor="middle"
                        fill="#a78bfa"
                        fontSize="9"
                        dominantBaseline="auto"
                        pointerEvents="none"
                      >
                        SELECTED
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        }
        right={
          <div className="flex flex-col p-4 sm:p-5">
            {selected ? (
              <div className="animate-fade-in-up">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: selected.color }} />
                  <h2 className="text-lg font-bold text-gray-100">{selected.name}</h2>
                </div>
                <p className="text-sm text-purple-400">{selected.title}</p>

                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Order</h4>
                    <p className="mt-0.5 text-sm text-gray-200">{selected.order}</p>
                  </div>
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Surges</h4>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selected.surges.map((s) => (
                        <span key={s} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-cyan-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Spren Type</h4>
                    <p className="mt-0.5 text-sm text-gray-300">{selected.sprenType}</p>
                  </div>
                  {selected.description && (
                    <div>
                      <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Description</h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">{selected.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Select a Herald from the circle</p>
                  <p className="mt-1 text-xs text-gray-600">Hover over a node to highlight, click for details</p>
                </div>
              </div>
            )}
          </div>
        }
      />
    </PageLayout>
  )
}
