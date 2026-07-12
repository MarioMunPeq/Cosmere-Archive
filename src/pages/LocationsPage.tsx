import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PLANETS, SHARD_COLORS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import PageLayout from '@/components/ui/PageLayout'
import { StarChartSystem, ManuscriptInfoPanel, ShardManuscriptPanel } from '@/components/star-chart'

interface ShardInfo {
  name: string
  color: string
  planets: string[]
  magicSystems: string[]
}

export default function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'shards' ? 'shards' : 'planets'
  const planetParam = searchParams.get('planet')
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(planetParam)
  const [selectedShard, setSelectedShard] = useState<string | null>(null)

  useSEOMeta({
    title: mode === 'shards' ? 'Shardic Studies — Cosmere Archive' : 'Astronomical Chart — Cosmere Archive',
    description:
      mode === 'shards'
        ? 'Shardic Studies — an analysis of the sixteen Shards of Adonalsium'
        : 'An astronomical chart of the Cosmere planetary systems — compiled by Khriss',
  })

  const setMode = useCallback(
    (m: 'planets' | 'shards') => {
      setSelectedPlanet(null)
      setSelectedShard(null)
      setSearchParams(m === 'shards' ? { mode: 'shards' } : {}, { replace: true })
    },
    [setSearchParams],
  )

  const handlePlanetClick = useCallback((id: string) => {
    setSelectedPlanet((prev) => (prev === id ? null : id))
  }, [])

  const handleShardClick = useCallback((name: string) => {
    setSelectedShard((prev) => (prev === name ? null : name))
  }, [])

  const handleConnectedClick = useCallback((id: string) => {
    setSelectedPlanet(id)
    setSelectedShard(null)
  }, [])

  const selectedPlanetData = selectedPlanet ? (PLANETS.find((p) => p.id === selectedPlanet) ?? null) : null

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
        if (sName === 'Adonalsium' || sName === '') continue
        if (!map.has(sName)) {
          map.set(sName, { name: sName, color: SHARD_COLORS[sName] ?? '#6b7280', planets: [], magicSystems: [] })
        }
        const entry = map.get(sName)!
        if (!entry.planets.includes(planet.name)) entry.planets.push(planet.name)
      }
    }
    for (const ms of MAGIC_SYSTEMS) {
      if (map.has(ms.shard) && !map.get(ms.shard)!.magicSystems.includes(ms.name)) {
        map.get(ms.shard)!.magicSystems.push(ms.name)
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const selectedShardData = selectedShard ? (shards.find((s) => s.name === selectedShard) ?? null) : null

  return (
    <PageLayout variant="none">
      {/* Parchment background layer */}
      <div className="fixed inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="bg-paper">
              <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.86  0 0 0 0 0.78  0 0 0 0.08 0" />
            </filter>
            <filter id="bg-edge-burn">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.6 0" />
            </filter>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="#ece0cc" />
          <rect x="0" y="0" width="100%" height="100%" fill="url(#bg-paper)" opacity="0.7" />
          {/* Darker edges (vignette) */}
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="rgba(60,40,30,0.2)" strokeWidth="40" />
          {/* Age spots */}
          <circle cx="8%" cy="12%" r="6%" fill="rgba(120,90,60,0.02)" />
          <circle cx="85%" cy="80%" r="8%" fill="rgba(100,80,50,0.015)" />
          <circle cx="75%" cy="15%" r="5%" fill="rgba(140,110,80,0.01)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Title area */}
        <div className="shrink-0 px-6 pt-5 pb-1 text-center">
          <div
            className="text-lg tracking-[0.25em]"
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              color: 'rgba(42,26,10,0.2)',
            }}
          >
            ASTRONOMICAL CHART
          </div>
          <div
            className="text-[10px] italic"
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              color: 'rgba(42,26,10,0.1)',
            }}
          >
            Cosmere Archive — Celestial Cartography by Khriss
          </div>

          {/* Mode toggle */}
          <div
            className="mx-auto mt-2.5 flex gap-0 rounded-sm"
            style={{
              border: '1px solid rgba(42,26,10,0.06)',
              background: 'rgba(42,26,10,0.02)',
              width: 'fit-content',
            }}
          >
            <button
              onClick={() => setMode('planets')}
              className="px-4 py-0.5 text-[10px] tracking-wider transition-all duration-400"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: mode === 'planets' ? 'rgba(42,26,10,0.45)' : 'rgba(42,26,10,0.15)',
                background: mode === 'planets' ? 'rgba(42,26,10,0.03)' : 'transparent',
              }}
            >
              Celestial Bodies
            </button>
            <button
              onClick={() => setMode('shards')}
              className="px-4 py-0.5 text-[10px] tracking-wider transition-all duration-400"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: mode === 'shards' ? 'rgba(42,26,10,0.45)' : 'rgba(42,26,10,0.15)',
                background: mode === 'shards' ? 'rgba(42,26,10,0.03)' : 'transparent',
              }}
            >
              Shardic Studies
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 flex items-center justify-center min-h-0 px-3 pb-3">
          {mode === 'planets' && (
            <div className="w-full h-full max-w-[900px] max-h-[780px]">
              <StarChartSystem planets={PLANETS} selectedPlanet={selectedPlanet} onPlanetClick={handlePlanetClick} />
            </div>
          )}

          {mode === 'shards' && (
            <div className="flex flex-wrap items-center justify-center gap-5 max-w-3xl">
              {shards.map((shard) => (
                <button
                  key={shard.name}
                  onClick={() => handleShardClick(shard.name)}
                  className="group flex flex-col items-center outline-none transition-all duration-500"
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="rounded-full transition-all duration-500 group-hover:scale-105"
                    style={{
                      width: 48,
                      height: 48,
                      background: `radial-gradient(circle at 35% 35%, ${shard.color}88, ${shard.color}33, ${shard.color}11)`,
                      boxShadow: selectedShard === shard.name ? `0 0 20px ${shard.color}40` : 'none',
                      transform: selectedShard === shard.name ? 'scale(1.06)' : 'scale(1)',
                    }}
                  />
                  <span
                    className="mt-1 text-[9px] tracking-wide font-serif transition-all duration-400"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: selectedShard === shard.name ? 'rgba(42,26,10,0.5)' : 'rgba(42,26,10,0.18)',
                    }}
                  >
                    {shard.name.toUpperCase()}
                  </span>
                  <span
                    className="text-[7px] italic"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(42,26,10,0.08)' }}
                  >
                    {shard.planets.length} world{shard.planets.length !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Planet info manuscript */}
      {selectedPlanetData && (
        <ManuscriptInfoPanel
          planet={selectedPlanetData}
          onClose={() => setSelectedPlanet(null)}
          onSelectPlanet={handleConnectedClick}
        />
      )}

      {/* Shard info manuscript */}
      {selectedShardData && <ShardManuscriptPanel shard={selectedShardData} onClose={() => setSelectedShard(null)} />}
    </PageLayout>
  )
}
