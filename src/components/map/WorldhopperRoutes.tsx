import { useMemo } from 'react'
import { WORLDHOPPERS } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'

function drawCurvedPath(p1: Planet, p2: Planet, offset: number): string {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const f = 0.2 + offset
  const cx = (p1.x + p2.x) / 2 + dy * f
  const cy = (p1.y + p2.y) / 2 - dx * f
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`
}

interface Props {
  planetMap: Map<string, Planet>
  activeWorldhoppers: string[]
  hasFilter: boolean
}

export default function WorldhopperRoutes({ planetMap, activeWorldhoppers, hasFilter }: Props) {
  const connections = useMemo(() => {
    const lines: { from: Planet; to: Planet; color: string; whId: string; offset: number }[] = []
    for (const wh of WORLDHOPPERS) {
      for (let i = 0; i < wh.planets.length; i++) {
        for (let j = i + 1; j < wh.planets.length; j++) {
          const a = planetMap.get(wh.planets[i]!)
          const b = planetMap.get(wh.planets[j]!)
          if (!a || !b) continue
          lines.push({ from: a, to: b, color: wh.color, whId: wh.id, offset: 0 })
        }
      }
    }
    const groups = new Map<string, typeof lines>()
    for (const l of lines) {
      const key = [l.from.id, l.to.id].sort().join('-')
      const g = groups.get(key) ?? []
      g.push(l)
      groups.set(key, g)
    }
    for (const g of groups.values()) {
      if (g.length > 1) {
        const step = 0.25 / g.length
        g.forEach((l, idx) => {
          l.offset = (idx - (g.length - 1) / 2) * step
        })
      }
    }
    return lines
  }, [planetMap])

  if (!hasFilter) return null

  return (
    <g>
      {connections.map((c, i) => {
        const isActive = activeWorldhoppers.includes(c.whId)
        const opacity = isActive ? 0.6 : 0.05
        return (
          <g key={`${c.whId}-${i}`}>
            {isActive && (
              <path
                d={drawCurvedPath(c.from, c.to, c.offset)}
                fill="none"
                stroke={c.color}
                strokeWidth="5"
                opacity={0.12}
                className="animate-line-pulse"
              />
            )}
            <path
              d={drawCurvedPath(c.from, c.to, c.offset)}
              fill="none"
              stroke={c.color}
              strokeWidth={isActive ? 2 : 0.5}
              strokeDasharray={isActive ? 'none' : '4 4'}
              opacity={opacity}
            />
            {isActive && (
              <path
                d={drawCurvedPath(c.from, c.to, c.offset)}
                fill="none"
                stroke={c.color}
                strokeWidth={2}
                strokeDasharray="6 20"
                opacity={0.7}
                className="animate-dash"
              />
            )}
          </g>
        )
      })}
    </g>
  )
}
