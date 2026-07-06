import { memo, useMemo } from 'react'
import { WORLDHOPPERS } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'

function drawCurvedPath(a: Planet, b: Planet): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const f = Math.min(0.12 + dist * 0.002, 0.35)
  const cx = (a.x + b.x) / 2 + dy * f
  const cy = (a.y + b.y) / 2 - dx * f
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
}

interface Props {
  planetMap: Map<string, Planet>
  activeWorldhoppers: string[]
  hasFilter: boolean
}

const WorldhopperRoutes = memo(function WorldhopperRoutes({ planetMap, activeWorldhoppers, hasFilter }: Props) {
  const segments = useMemo(() => {
    const map = new Map<string, { a: Planet; b: Planet; path: string; whIds: string[] }>()

    for (const wh of WORLDHOPPERS) {
      for (let i = 0; i < wh.planets.length - 1; i++) {
        const pa = planetMap.get(wh.planets[i]!)
        const pb = planetMap.get(wh.planets[i + 1]!)
        if (!pa || !pb) continue

        const key = [pa.id, pb.id].sort().join('-')
        let seg = map.get(key)
        if (!seg) {
          seg = { a: pa, b: pb, path: drawCurvedPath(pa, pb), whIds: [] }
          map.set(key, seg)
        }
        if (!seg.whIds.includes(wh.id)) seg.whIds.push(wh.id)
      }
    }
    return Array.from(map.values())
  }, [planetMap])

  const whColorMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const wh of WORLDHOPPERS) m.set(wh.id, wh.color)
    return m
  }, [])

  if (!hasFilter) return null

  const hasSelection = activeWorldhoppers.length > 0
  const selectedSet = new Set(activeWorldhoppers)

  return (
    <g>
      {segments.map((seg) => {
        const isSelected = seg.whIds.some((id) => selectedSet.has(id))
        if (hasSelection && !isSelected) return null

        const matchedWh = seg.whIds.find((id) => selectedSet.has(id))
        const stroke = matchedWh ? (whColorMap.get(matchedWh) ?? 'rgba(212, 175, 55, 0.2)') : 'rgba(212, 175, 55, 0.2)'
        const opacity = hasSelection ? 0.7 : 0.2
        const strokeWidth = hasSelection ? 1 : 0.4

        return (
          <path
            key={`${seg.a.id}-${seg.b.id}`}
            d={seg.path}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={hasSelection ? 'none' : '3 6'}
            opacity={opacity}
            style={{ transition: 'all 0.5s ease' }}
          />
        )
      })}
    </g>
  )
})

export default WorldhopperRoutes
