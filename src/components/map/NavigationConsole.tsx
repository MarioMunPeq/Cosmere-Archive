import { memo } from 'react'
import type { WorldhopperDisplay } from '@/data/static/timeline'
export interface MapLayers {
  labels: boolean
  routes: boolean
  shardIcons: boolean
  constellation: boolean
  heatmap: boolean
}

interface ShardEntry {
  name: string
  color: string
  planets: string[]
}

interface Props {
  show: boolean
  onToggle: () => void
  shardData: ShardEntry[]
  activeShards: string[]
  onToggleShard: (name: string) => void
  onClearShards: () => void
  worldhoppers: WorldhopperDisplay[]
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  onStartJourney?: (id: string) => void
  layers: MapLayers
  onToggleLayer: (layer: keyof MapLayers) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const SHARD_LABELS: Record<string, string> = {
  Honor: 'HON',
  Cultivation: 'CUL',
  Odium: 'ODI',
  Preservation: 'PRE',
  Ruin: 'RUI',
  Harmony: 'HAR',
  Dominion: 'DOM',
  Devotion: 'DEV',
  Endowment: 'END',
  Autonomy: 'AUT',
  Ambition: 'AMB',
  Mercy: 'MRC',
  'Survival Shard': 'SRV',
  Virtuosity: 'VRT',
  Invention: 'INV',
  Reason: 'RSN',
  Whimsy: 'WHM',
  Valor: 'VLR',
}

const NavigationConsole = memo(function NavigationConsole({
  show,
  onToggle,
  shardData,
  activeShards,
  onToggleShard,
  onClearShards,
  worldhoppers,
  activeWorldhoppers,
  onToggleWorldhopper,
  onStartJourney,
  layers,
  onToggleLayer,
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: Props) {
  return (
    <div className="absolute bottom-4 left-4 z-20">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-lg border border-amber-800/20 bg-stone-950/80 px-3 py-2 text-xs text-amber-600/70 backdrop-blur transition-colors hover:border-amber-700/30 hover:text-amber-400"
      >
        <svg
          width="12"
          height="14"
          viewBox="0 0 12 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 1h8v12H2z" />
          <path d="M2 1H1v12h1" />
          <line x1="4" y1="4" x2="8" y2="4" />
          <line x1="4" y1="6.5" x2="8" y2="6.5" />
          <line x1="4" y1="9" x2="6" y2="9" />
        </svg>
        {show ? 'Close Folio' : 'Folio'}
      </button>

      {show && (
        <div className="w-56 rounded-xl border border-amber-800/15 bg-gradient-to-b from-amber-950/85 to-stone-950/85 px-4 py-3 shadow-2xl backdrop-blur-lg">
          {shardData.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xxs font-semibold uppercase tracking-widest text-amber-500/80">Shards</span>
                {activeShards.length > 0 && (
                  <button onClick={onClearShards} className="text-xxs text-amber-700/60 hover:text-amber-500/80">
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {shardData.map((s) => {
                  const active = activeShards.includes(s.name)
                  return (
                    <button
                      key={s.name}
                      onClick={() => onToggleShard(s.name)}
                      className="rounded border px-2 py-0.5 text-xxs transition-all"
                      style={{
                        borderColor: active ? s.color + '80' : 'rgba(255,255,255,0.06)',
                        backgroundColor: active ? s.color + '20' : 'transparent',
                        color: active ? s.color : 'rgba(168, 162, 158, 0.5)',
                      }}
                    >
                      {SHARD_LABELS[s.name] ?? s.name.slice(0, 3).toUpperCase()}
                    </button>
                  )
                })}
              </div>
              <hr className="my-3 border-amber-800/10" />
            </>
          )}

          {worldhoppers.length > 0 && (
            <>
              <span className="text-xxs font-semibold uppercase tracking-widest text-amber-500/80">Worldhoppers</span>
              <div className="mt-2 space-y-1">
                {worldhoppers.map((wh) => {
                  const active = activeWorldhoppers.includes(wh.id)
                  return (
                    <div
                      key={wh.id}
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors hover:bg-amber-900/10"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: active ? wh.color : 'transparent',
                          border: `1px solid ${wh.color}`,
                          opacity: active ? 1 : 0.4,
                        }}
                      />
                      <span className={`flex-1 ${active ? 'text-stone-300' : 'text-stone-600'}`}>{wh.name}</span>
                      <button
                        onClick={() => onToggleWorldhopper(wh.id)}
                        className="rounded px-1.5 py-0.5 text-xxs transition-all"
                        style={{
                          backgroundColor: active ? wh.color + '25' : 'transparent',
                          color: active ? wh.color : 'rgba(168, 162, 158, 0.5)',
                        }}
                      >
                        {active ? 'ON' : 'OFF'}
                      </button>
                      {active && onStartJourney && (
                        <button
                          onClick={() => onStartJourney(wh.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-stone-600 transition-colors hover:bg-amber-900/20 hover:text-amber-400"
                          aria-label={`Animate ${wh.name}'s journey`}
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                            <polygon points="0,0 8,4 0,8" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <hr className="my-3 border-amber-800/10" />
            </>
          )}

          <span className="text-xxs font-semibold uppercase tracking-widest text-amber-500/80">Layers</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {(['labels', 'routes', 'shardIcons', 'constellation', 'heatmap'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => onToggleLayer(layer)}
                className="text-xs transition-colors"
                style={{
                  color: layers[layer] ? '#d97706' : 'rgba(168, 162, 158, 0.5)',
                }}
              >
                {layer === 'shardIcons' ? 'Icons' : layer.charAt(0).toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>
          <hr className="my-3 border-amber-800/10" />

          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className="flex h-6 w-6 items-center justify-center rounded border border-amber-800/20 text-stone-500 transition-colors hover:border-amber-700/30 hover:text-amber-400"
              aria-label="Zoom out"
            >
              <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
                <rect width="10" height="1.5" rx="0.75" />
              </svg>
            </button>
            <span className="w-10 text-center text-xxs text-stone-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={onZoomIn}
              className="flex h-6 w-6 items-center justify-center rounded border border-amber-800/20 text-stone-500 transition-colors hover:border-amber-700/30 hover:text-amber-400"
              aria-label="Zoom in"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="4" width="2" height="10" rx="0.75" />
                <rect y="4" width="10" height="2" rx="0.75" />
              </svg>
            </button>
            <button
              onClick={onReset}
              className="ml-auto rounded border border-amber-800/20 px-2 py-0.5 text-xxs text-stone-600 transition-colors hover:border-amber-700/30 hover:text-amber-400"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default NavigationConsole
