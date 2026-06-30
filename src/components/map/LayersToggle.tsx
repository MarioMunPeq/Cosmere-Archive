import { memo } from 'react'
import FloatingTogglePanel from '@/components/ui/FloatingTogglePanel'

export interface MapLayers {
  labels: boolean
  routes: boolean
  shardIcons: boolean
  constellation: boolean
  heatmap: boolean
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
  heatmap: 'Worldhopper Heatmap',
}

function LayersToggleInner({ show, layers, onToggle, onToggleLayer }: Props) {
  return (
    <FloatingTogglePanel
      show={show}
      onToggle={onToggle}
      buttonContent={show ? '✕ Close' : '📑 Layers'}
      title="Map Layers"
      panelWidth="sm:w-48"
    >
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
    </FloatingTogglePanel>
  )
}

const LayersToggle = memo(LayersToggleInner)
export default LayersToggle
