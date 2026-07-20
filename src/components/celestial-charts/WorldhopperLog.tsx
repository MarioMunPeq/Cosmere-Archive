import { useState, useMemo } from 'react'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import type { WorldhopperMovement } from '@/data/static/timeline/worldhopper-journeys'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] as const

interface Props {
  selectedWorldhopper: string | null
  onSelectWorldhopper: (id: string | null) => void
  onInkRoute: (route: { id: string; planets: string[]; color: string } | null) => void
}

const WH_COLORS = [
  'rgba(140,100,60,0.3)',
  'rgba(100,120,140,0.3)',
  'rgba(120,90,130,0.3)',
  'rgba(90,130,100,0.3)',
  'rgba(140,110,70,0.3)',
  'rgba(100,80,120,0.3)',
]

function formatMovements(movements: WorldhopperMovement['movements']): string {
  const count = movements.length
  const planets = [...new Set(movements.map((m) => m.planet))]
  return `${count} stop${count !== 1 ? 's' : ''} · ${planets.join(' → ')}`
}

export default function WorldhopperLog({ selectedWorldhopper, onSelectWorldhopper, onInkRoute }: Props) {
  const [expanded, setExpanded] = useState(true)

  const sortedWorldhoppers = useMemo(
    () => [...WORLDHOPPER_MOVEMENTS].sort((a, b) => b.movements.length - a.movements.length),
    [],
  )

  return (
    <div>
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((e) => !e)
          }
        }}
      >
        <h3
          className="font-serif text-[13px] uppercase tracking-[0.18em] font-bold"
          style={{ color: 'rgba(60,45,30,0.35)' }}
        >
          Expedition Log
        </h3>
        <span className="font-serif text-[9px] select-none" style={{ color: 'rgba(80,60,40,0.15)' }}>
          {expanded ? '△' : '▽'}
        </span>
      </div>

      {expanded && (
        <div className="space-y-[2px]">
          {sortedWorldhoppers.slice(0, 8).map((wh, idx) => {
            const isActive = wh.id === selectedWorldhopper
            const color = WH_COLORS[idx % WH_COLORS.length]!
            return (
              <div
                key={wh.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isActive) {
                    onSelectWorldhopper(null)
                    onInkRoute(null)
                  } else {
                    onSelectWorldhopper(wh.id)
                    onInkRoute({
                      id: wh.id,
                      planets: [...new Set(wh.movements.map((m) => m.planet))],
                      color,
                    })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (isActive) {
                      onSelectWorldhopper(null)
                      onInkRoute(null)
                    } else {
                      onSelectWorldhopper(wh.id)
                      onInkRoute({
                        id: wh.id,
                        planets: [...new Set(wh.movements.map((m) => m.planet))],
                        color,
                      })
                    }
                  }
                }}
                className="flex items-baseline gap-2 py-[2px] cursor-pointer group"
              >
                <span
                  className="font-serif text-[9px] min-w-[18px] text-right shrink-0"
                  style={{ color: isActive ? 'rgba(160,140,100,0.4)' : 'rgba(80,60,40,0.15)' }}
                >
                  {ROMAN[idx]}.
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-serif text-[12px] transition-colors group-hover:opacity-60"
                    style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.55)' }}
                  >
                    {wh.name}
                  </span>
                  <span className="font-serif text-[9px] italic ml-2" style={{ color: 'rgba(80,60,40,0.18)' }}>
                    {formatMovements(wh.movements)}
                  </span>
                </div>
                {/* Color indicator dot */}
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{ width: '5px', height: '5px', background: color, opacity: isActive ? 1 : 0.3 }}
                />
              </div>
            )
          })}
          {sortedWorldhoppers.length > 8 && (
            <p className="font-serif text-[9px] italic pt-1" style={{ color: 'rgba(80,60,40,0.12)' }}>
              + {sortedWorldhoppers.length - 8} further expeditions in the archives
            </p>
          )}
        </div>
      )}
    </div>
  )
}
