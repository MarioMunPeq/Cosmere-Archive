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

export default function ShardLegend({ show, onToggle, shardData, activeShards, onToggleShard, onClear }: Props) {
  return (
    <div className="flex flex-col items-start gap-2 sm:items-start">
      <button
        onClick={onToggle}
        className="rounded-lg border border-gray-700/60 bg-gray-900/80 px-2.5 py-1.5 text-xs text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400 sm:px-3"
        aria-label={show ? 'Close shard legend' : 'Open shard legend'}
      >
        {show ? '✕ Close' : '⚡ Shards'}
      </button>

      {show && (
        <div className="animate-fade-in-up rounded-xl border border-gray-700/60 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-lg sm:w-56 sm:p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Shards</h4>
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
                  <span className="text-[10px] text-gray-600">{sd.planets.length}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
