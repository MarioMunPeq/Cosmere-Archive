import { useMemo } from 'react'
import { PLANETS, SHARD_COLORS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'

interface ShardInfo {
  name: string
  color: string
  planets: string[]
}

export default function ShardsLegend() {
  const shards = useMemo(() => {
    const map = new Map<string, ShardInfo>()
    for (const planet of PLANETS) {
      if (!planet.shard) continue
      const names = planet.shard
        .replace(/\s*\(.*?\)\s*/g, '')
        .split(/[&,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      for (const sName of names) {
        if (sName === 'Adonalsium') continue
        if (!map.has(sName)) {
          map.set(sName, { name: sName, color: SHARD_COLORS[sName] ?? '#6b7280', planets: [] })
        }
        map.get(sName)!.planets.push(planet.name)
      }
    }
    for (const ms of MAGIC_SYSTEMS) {
      if (map.has(ms.shard) && !map.get(ms.shard)!.planets.includes(ms.planetId)) {
        map.get(ms.shard)!.planets.push(ms.planetId)
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  return (
    <div>
      <h3
        className="font-serif text-[13px] uppercase tracking-[0.18em] mb-4 font-bold"
        style={{ color: 'rgba(60,45,30,0.35)' }}
      >
        Shardic Influence
      </h3>
      <div className="space-y-[3px]">
        {shards.map((shard) => (
          <div key={shard.name} className="flex items-center gap-2 py-[2px]">
            <span
              className="inline-block rounded-full"
              style={{
                width: '7px',
                height: '7px',
                background: shard.color,
                opacity: 0.6,
                boxShadow: `0 0 4px ${shard.color}30`,
              }}
            />
            <span className="font-serif text-[11px]" style={{ color: 'rgba(60,40,25,0.55)' }}>
              {shard.name}
            </span>
            <span className="font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.2)' }}>
              {shard.planets.length} world{shard.planets.length !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
