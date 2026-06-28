import { memo, useMemo } from 'react'
import { PLANETS } from '@/data/static'
import { SHARD_COLORS } from '@/data/static/colors'
import { FALLBACK_COLOR } from '@/utils/constants'

function parseShards(shardStr: string): string[] {
  return shardStr
    .split(/, | & /)
    .map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim())
    .filter(Boolean)
}

const ShardIcons = memo(function ShardIcons() {
  const shardData = useMemo(() => {
    return PLANETS.filter((p) => p.shard).map((p) => {
      const names = parseShards(p.shard!)
      return { planetId: p.id, x: p.x, y: p.y, size: p.size, names }
    })
  }, [])

  return (
    <g>
      {shardData.map(({ planetId, x, y, size, names }) => {
        const labelX = x + size * 0.4 + 6
        const baseY = y + 12
        return (
          <g key={`shard-${planetId}`} className="pointer-events-none select-none animate-label-fade">
            {names.map((name, i) => {
              const color = SHARD_COLORS[name] ?? FALLBACK_COLOR
              return (
                <g key={`${planetId}-${name}`} transform={`translate(${labelX}, ${baseY + i * 11})`}>
                  <rect
                    x={0}
                    y={-3}
                    width={6}
                    height={6}
                    rx={1}
                    fill={color}
                    opacity={0.8}
                    transform="rotate(45 3 0)"
                  />
                  <text x={10} y={2} fill={color} fontSize="7" fontFamily="ui-monospace, monospace" opacity={0.7}>
                    {name}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </g>
  )
})

export default ShardIcons
