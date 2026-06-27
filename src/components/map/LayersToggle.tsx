import { memo } from 'react'

export interface MapLayers {
  labels: boolean
  routes: boolean
  shardIcons: boolean
  constellation: boolean
}

interface Props {
  show: boolean
  layers: MapLayers
  onToggle: () => void
  onToggleLayer: (layer: keyof MapLayers) => void
}

const LAYER_LABELS: Record<keyof MapLayers, string> = {
  labels: 'Planet Labels',
  routes: 'Worldhopper Routes',
  shardIcons: 'Shard Icons',
  constellation: 'Constellation',
}

function LayersToggleInner({ show, layers, onToggle, onToggleLayer }: Props) {
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={onToggle}
        className="rounded-lg border border-gray-700/60 bg-gray-900/80 px-2.5 py-1.5 text-xs text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400 sm:px-3"
        aria-label={show ? 'Close layers panel' : 'Open layers panel'}
      >
        {show ? '✕ Close' : '📑 Layers'}
      </button>

      {show && (
        <div className="animate-fade-in-up rounded-xl border border-gray-700/60 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-lg sm:w-48 sm:p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Map Layers</h4>
          <div className="space-y-2">
            {(Object.keys(LAYER_LABELS) as (keyof MapLayers)[]).map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800/50"
              >
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => onToggleLayer(key)}
                  className="h-3 w-3 rounded border-gray-600 bg-gray-800 text-purple-500 accent-purple-500"
                />
                {LAYER_LABELS[key]}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const LayersToggle = memo(LayersToggleInner)
export default LayersToggle
