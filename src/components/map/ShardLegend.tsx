import { memo } from 'react'
import FloatingTogglePanel from '@/components/ui/FloatingTogglePanel'

interface ShardItem {
  name: string
  color: string
  planets: string[]
}

interface Props {
  show: boolean
  onToggle: () => void
  shardData: ShardItem[]
  activeShards: string[]
  onToggleShard: (name: string) => void
  onClear: () => void
}

function ShardLegendInner({ show, onToggle, shardData, activeShards, onToggleShard, onClear }: Props) {
  return (
    <FloatingTogglePanel show={show} onToggle={onToggle} buttonContent={show ? '✕ Close' : '⚡ Shards'} title="Shards">
      <div className="space-y-1.5">
        <button
          onClick={onClear}
          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
            activeShards.length === 0 ? 'bg-purple-900/30 text-purple-300' : 'text-gray-400 hover:bg-gray-800/50'
          }`}
        >
          <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-gray-600 text-[8px] text-gray-500">
            *
          </span>
          All shards
        </button>
        {shardData.map((sd) => {
          const active = activeShards.includes(sd.name)
          return (
            <button
              key={sd.name}
              onClick={() => onToggleShard(sd.name)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                active ? 'bg-gray-700/50 font-medium text-white' : 'text-gray-400 hover:bg-gray-800/50'
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: sd.color, opacity: active ? 1 : 0.5 }}
              />
              <span className="flex-1">{sd.name}</span>
              <span className="text-xxs text-gray-600">{sd.planets.length}</span>
            </button>
          )
        })}
      </div>
    </FloatingTogglePanel>
  )
}

const ShardLegend = memo(ShardLegendInner)
export default ShardLegend
