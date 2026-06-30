import { useMemo } from 'react'
import { PLANETS, ALL_CHARACTERS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'

interface PlanetHeat {
  id: string
  x: number
  y: number
  score: number
  worldhoppers: number
  characters: number
}

const MAX_R = 60
const MIN_R = 18

export default function WorldhopperHeatmap() {
  const planetData = useMemo(() => {
    const whPerPlanet = new Map<string, Set<string>>()
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      for (const pid of wh.planets) {
        if (!whPerPlanet.has(pid)) whPerPlanet.set(pid, new Set())
        whPerPlanet.get(pid)!.add(wh.id)
      }
    }

    const charCount = new Map<string, number>()
    for (const c of ALL_CHARACTERS) {
      charCount.set(c.planet, (charCount.get(c.planet) ?? 0) + 1)
    }

    const planets: PlanetHeat[] = PLANETS.map((p) => {
      const wh = whPerPlanet.get(p.id)?.size ?? 0
      const chars = charCount.get(p.id) ?? 0
      return {
        id: p.id,
        x: p.x,
        y: p.y,
        score: wh * 3 + chars,
        worldhoppers: wh,
        characters: chars,
      }
    })

    const maxScore = Math.max(...planets.map((p) => p.score), 1)
    return planets.map((p) => ({ ...p, score: p.score / maxScore }))
  }, [])

  return (
    <g pointerEvents="none">
      {planetData.map((p) => {
        const r = MIN_R + p.score * (MAX_R - MIN_R)
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={r} fill="url(#heat-gradient)" opacity={0.15 + p.score * 0.25} />
            {p.score > 0.3 && (
              <circle cx={p.x} cy={p.y} r={r * 0.6} fill="url(#heat-gradient)" opacity={0.12 + p.score * 0.15} />
            )}
          </g>
        )
      })}
    </g>
  )
}
