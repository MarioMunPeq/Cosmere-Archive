import { memo, useMemo } from 'react'
import { PLANETS } from '@/data/static'
import type { Planet } from '@/types/planet'

function buildSagaGroups(): Map<string, Planet[]> {
  const groups = new Map<string, Planet[]>()
  for (const p of PLANETS) {
    if (!p.sagas) continue
    for (const saga of p.sagas) {
      const list = groups.get(saga) ?? []
      list.push(p)
      groups.set(saga, list)
    }
  }
  return groups
}

function buildConnectionLines(): { x1: number; y1: number; x2: number; y2: number; saga: string }[] {
  const sagaGroups = buildSagaGroups()
  const seen = new Set<string>()
  const lines: { x1: number; y1: number; x2: number; y2: number; saga: string }[] = []

  for (const [saga, planets] of sagaGroups) {
    if (planets.length < 2) continue
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const a = planets[i]!
        const b = planets[j]!
        const key = [a.id, b.id].sort().join('-')
        if (seen.has(key)) continue
        seen.add(key)
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, saga })
      }
    }
  }

  return lines
}

const SAGA_CONSTELLATION_COLORS: Record<string, string> = {
  stormlight: '#fbbf24',
  'mistborn-era-1': '#f87171',
  'mistborn-era-2': '#2dd4bf',
  elantris: '#60a5fa',
  warbreaker: '#34d399',
  'white-sand': '#fb923c',
  'secret-projects': '#f472b6',
  'arcanum-unbounded': '#818cf8',
}

const ConstellationLines = memo(function ConstellationLines() {
  const lines = useMemo(() => buildConnectionLines(), [])

  return (
    <g>
      {lines.map((line, i) => {
        const color = SAGA_CONSTELLATION_COLORS[line.saga] ?? '#6b7280'
        const midX = (line.x1 + line.x2) / 2
        const midY = (line.y1 + line.y2) / 2
        const label = line.saga.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return (
          <g key={`const-${i}`}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={color}
              strokeWidth="0.5"
              opacity={0.15}
              strokeDasharray="3 4"
              className="animate-constellation-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <circle cx={midX} cy={midY} r={1.5} fill={color} opacity={0.3} className="animate-constellation-pulse" />
            <text
              x={midX + 4}
              y={midY + 2}
              fill={color}
              fontSize="5"
              fontFamily="ui-monospace, monospace"
              opacity={0.2}
              className="pointer-events-none select-none"
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
})

export default ConstellationLines
